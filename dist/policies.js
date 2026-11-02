import { bulkhead, circuitBreaker, noop as cockatielNoop, wrap as cockatielWrap, ConsecutiveBreaker, CircuitState, handleAll, } from 'cockatiel';
import { MAX_TIMER_MS, SystemClock } from '@arki/clock';
import { ensure, is } from '@arki/schema';
import { z } from 'zod';
import { CircuitOpen, BulkheadRejected, Cancelled } from './errors.js';
import { timeoutPolicy } from './timeout.js';
import { backoff } from './backoff.js';
import { engineOf, fromEngine, ownedEngine, originalReason } from './engine.js';
import { withFallback } from './fallback.js';
import { observeEvent } from './observers.js';
import { recordCircuitTransition } from './telemetry.js';
import { buildRetryPolicy } from './retry.js';
// ---------------------------------------------------------------------------
// Policy factories
// ---------------------------------------------------------------------------
/** @internal Static options keep their source TS contracts; exact type tests bind these schemas. */
export const circuitBreakerOptionsSchema = z.object({
    halfOpenAfter: z.number().finite().nonnegative().optional(),
    consecutiveFailures: z.number().int().positive().optional(),
});
/** @internal Web timers cannot honor delays above MAX_TIMER_MS. */
export const timeoutOptionsSchema = z.object({ timeoutMs: z.number().min(0).max(MAX_TIMER_MS).optional() });
/** @internal Zero capacity with queued work can never make progress. */
export const bulkheadOptionsSchema = z.object({
    maxConcurrent: z.number().int().positive().optional(),
    maxQueue: z.number().int().nonnegative().optional(),
});
const circuitErrorSchema = z.object({ isBrokenCircuitError: z.literal(true) });
const bulkheadErrorSchema = z.object({ isBulkheadRejectedError: z.literal(true) });
const cancelledErrorSchema = z.object({ isTaskCancelledError: z.literal(true) });
const circuitStateNames = {
    [CircuitState.Closed]: 'closed',
    [CircuitState.Open]: 'open',
    [CircuitState.HalfOpen]: 'half_open',
    [CircuitState.Isolated]: 'isolated',
};
const systemClock = new SystemClock();
const defaultRetry = backoff.exponential({ base: 100, max: 10_000, jitter: 0.25 }).upTo(3);
/**
 * Create a retry policy. It calls the function, and after each failure asks `backoff`
 * how long to wait before the next try, or whether to stop and rethrow the error.
 *
 * Default backoff: 3 retries, 100 ms doubling to at most 10 s, with 25% jitter.
 */
export function createRetryPolicy(options = {}) {
    const retry = buildRetryPolicy(options.backoff ?? defaultRetry, options.clock ?? systemClock);
    if (options.onThrow === undefined)
        return retry;
    return Object.assign(withFallback(retry, options.onThrow), { onRetry: retry.onRetry, onGiveUp: retry.onGiveUp });
}
/**
 * Create a circuit breaker policy using consecutive-failure detection.
 *
 * Defaults: 5 consecutive failures, 30 s half-open window.
 */
export function createCircuitBreakerPolicy(options = {}) {
    const { halfOpenAfter = 30_000, consecutiveFailures = 5 } = ensure(options, circuitBreakerOptionsSchema, { at: 'circuit breaker options' });
    const engine = circuitBreaker(handleAll, {
        halfOpenAfter,
        breaker: new ConsecutiveBreaker(consecutiveFailures),
    });
    engine.onStateChange(state => recordCircuitTransition(circuitStateNames[state]));
    const policy = fromEngine(ownedEngine(engine, error => {
        if (is(error, circuitErrorSchema))
            return CircuitOpen({ cause: error });
        throw error;
    }, 'resilience.circuit_breaker'), {
        onBreak: (listener) => observeEvent(engine.onBreak, engine)(event => listener('isolated' in event ? event : originalReason(event))),
        onHalfOpen: observeEvent(engine.onHalfOpen, engine),
        onReset: observeEvent(engine.onReset, engine),
    });
    return policy;
}
/**
 * Create a timeout policy that aggressively cancels the operation when the
 * deadline is exceeded.
 *
 * Default: 30 s.
 */
export function createTimeoutPolicy(options = {}) {
    const { timeoutMs = 30_000 } = ensure(options, timeoutOptionsSchema, { at: 'timeout options' });
    return timeoutPolicy(timeoutMs);
}
/**
 * Create a bulkhead (concurrency-limiter) policy.
 *
 * Defaults: 10 concurrent, 100 queued.
 */
export function createBulkheadPolicy(options = {}) {
    const { maxConcurrent = 10, maxQueue = 100 } = ensure(options, bulkheadOptionsSchema, { at: 'bulkhead options' });
    const engine = bulkhead(maxConcurrent, maxQueue);
    const policy = fromEngine(ownedEngine(engine, error => {
        if (is(error, bulkheadErrorSchema))
            return BulkheadRejected({ cause: error });
        if (is(error, cancelledErrorSchema))
            return Cancelled({ cause: error });
        throw error;
    }, 'resilience.bulkhead'), { onReject: observeEvent(engine.onReject, engine) });
    return policy;
}
/**
 * Compose policies from the outside in: `wrap(retry, breaker, timeout)` retries a call whose
 * every attempt goes through the breaker and then the timeout. Events on the result are
 * those of the outermost policy.
 */
export function wrap(first, ...rest) {
    const engines = [engineOf(first), ...rest.map(policy => engineOf(policy))];
    return fromEngine(cockatielWrap(...engines), {});
}
/** A policy that only runs the function. Useful as a default or in tests. */
export const noop = fromEngine(cockatielNoop, {});
/**
 * Create a composed resilience policy: [bulkhead ->] retry -> circuit breaker -> timeout.
 *
 * Retry wraps the circuit breaker which wraps the timeout, so a single logical
 * call may be retried while individual attempts are protected by the breaker
 * and the timeout. With `bulkhead`, the bulkhead wraps all of it, so one
 * logical call holds one slot for all its attempts.
 *
 * `components` holds the parts it runs, so you can listen to their events.
 */
export function createResiliencePolicy(options = {}) {
    const policy = composeResiliencePolicy(options);
    if (options.onThrow === undefined)
        return policy;
    // Outermost, before the public defect boundary; returned refusals bypass it.
    return Object.assign(withFallback(policy, options.onThrow), { components: policy.components });
}
/** [bulkhead ->] retry -> circuit breaker -> timeout, without `onThrow`. */
function composeResiliencePolicy(options) {
    const retry = createRetryPolicy({ backoff: options.retry, clock: options.clock });
    const circuitBreaker = createCircuitBreakerPolicy(options.circuitBreaker);
    const timeoutPolicy = createTimeoutPolicy(options.timeout);
    if (options.bulkhead === undefined) {
        return fromEngine(cockatielWrap(engineOf(retry), engineOf(circuitBreaker), engineOf(timeoutPolicy)), {
            components: { retry, circuitBreaker, timeout: timeoutPolicy },
        });
    }
    const bulkhead = createBulkheadPolicy(options.bulkhead);
    return fromEngine(cockatielWrap(engineOf(bulkhead), engineOf(retry), engineOf(circuitBreaker), engineOf(timeoutPolicy)), { components: { retry, circuitBreaker, timeout: timeoutPolicy, bulkhead } });
}
//# sourceMappingURL=policies.js.map