import { bulkhead, circuitBreaker, noop as cockatielNoop, wrap as cockatielWrap, ConsecutiveBreaker, ExponentialBackoff, handleAll, retry, timeout, TimeoutStrategy, } from 'cockatiel';
import { engineOf, fromEngine } from './engine.js';
// ---------------------------------------------------------------------------
// Policy factories
// ---------------------------------------------------------------------------
/**
 * Create a retry policy with configurable exponential backoff.
 *
 * Defaults: 3 attempts, 100 ms initial delay, 10 s max delay, exponent 2.
 */
export function createRetryPolicy(options = {}) {
    const { maxAttempts = 3, initialDelay = 100, maxDelay = 10_000, exponent = 2 } = options;
    const engine = retry(handleAll, {
        maxAttempts,
        backoff: new ExponentialBackoff({
            initialDelay,
            maxDelay,
            exponent,
        }),
    });
    return fromEngine(engine, { onRetry: engine.onRetry, onGiveUp: engine.onGiveUp });
}
/**
 * Create a circuit breaker policy using consecutive-failure detection.
 *
 * Defaults: 5 consecutive failures, 30 s half-open window.
 */
export function createCircuitBreakerPolicy(options = {}) {
    const { halfOpenAfter = 30_000, consecutiveFailures = 5 } = options;
    const engine = circuitBreaker(handleAll, {
        halfOpenAfter,
        breaker: new ConsecutiveBreaker(consecutiveFailures),
    });
    return fromEngine(engine, { onBreak: engine.onBreak, onHalfOpen: engine.onHalfOpen, onReset: engine.onReset });
}
/**
 * Create a timeout policy that aggressively cancels the operation when the
 * deadline is exceeded.
 *
 * Default: 30 s.
 */
export function createTimeoutPolicy(options = {}) {
    const { timeoutMs = 30_000 } = options;
    const engine = timeout(timeoutMs, TimeoutStrategy.Aggressive);
    return fromEngine(engine, { onTimeout: engine.onTimeout });
}
/**
 * Create a bulkhead (concurrency-limiter) policy.
 *
 * Defaults: 10 concurrent, 100 queued.
 */
export function createBulkheadPolicy(options = {}) {
    const { maxConcurrent = 10, maxQueue = 100 } = options;
    const engine = bulkhead(maxConcurrent, maxQueue);
    return fromEngine(engine, { onReject: engine.onReject });
}
/**
 * Compose policies from the outside in: `wrap(retry, breaker, timeout)` retries a call whose
 * every attempt goes through the breaker and then the timeout. Events on the result are
 * those of the outermost policy.
 */
export function wrap(first, ...rest) {
    return fromEngine(cockatielWrap(engineOf(first), ...rest.map(policy => engineOf(policy))), {});
}
/** A policy that only runs the function. Useful as a default or in tests. */
export const noop = fromEngine(cockatielNoop, {});
/**
 * Create a composed resilience policy: retry -> circuit breaker -> timeout.
 *
 * The outermost policy (retry) wraps the circuit breaker which wraps the
 * timeout, so a single logical call may be retried while individual attempts
 * are protected by the breaker and the timeout.
 */
export function createResiliencePolicy(options = {}) {
    const retryPolicy = createRetryPolicy(options.retry);
    const breakerPolicy = createCircuitBreakerPolicy(options.circuitBreaker);
    const timeoutPolicy = createTimeoutPolicy(options.timeout);
    return wrap(retryPolicy, breakerPolicy, timeoutPolicy);
}
//# sourceMappingURL=policies.js.map