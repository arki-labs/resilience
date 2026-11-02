import type { Clock } from '@arki/clock';
import type { ResilienceFailure } from './errors.js';
import type { Backoff } from './backoff.js';
import type { BulkheadPolicy, CircuitBreakerPolicy, Policy, RetryPolicy, TimeoutPolicy } from './policy.js';
/**
 * Turns a thrown error that reaches the caller into a value, usually a failure from
 * `@arki/failure`. Rethrow unrecognized errors so the public boundary returns UnexpectedDefect.
 */
export type OnThrow<Mapped> = (error: unknown) => Mapped | PromiseLike<Mapped>;
export type RetryPolicyOptions<Mapped = never> = {
    /**
     * When to retry and how long to wait first. Default:
     * `backoff.exponential({ base: 100, max: 10_000, jitter: 0.25 }).upTo(3)`.
     */
    backoff?: Backoff;
    /** Whose timer the retry delay waits on. Default: the system clock. Pass a `MockClock` to make tests instant. */
    clock?: Clock;
    /**
     * Map an error that outlasts the retries, or one that is not retried, to a value. The call then
     * resolves to `T | Mapped` instead of throwing. A cancel by the caller's signal is never mapped.
     */
    onThrow?: OnThrow<Mapped>;
};
export type CircuitBreakerPolicyOptions = {
    /** Duration in milliseconds before the breaker transitions from open to half-open (default: 30_000) */
    halfOpenAfter?: number;
    /** Number of consecutive failures before the breaker opens (default: 5) */
    consecutiveFailures?: number;
};
export type TimeoutPolicyOptions = {
    /** Timeout duration in milliseconds (default: 30_000) */
    timeoutMs?: number;
};
export type BulkheadPolicyOptions = {
    /** Maximum concurrent executions (default: 10) */
    maxConcurrent?: number;
    /** Maximum queue size for pending executions (default: 100) */
    maxQueue?: number;
};
export type ResiliencePolicyOptions<Mapped = never> = {
    /** When to retry and how long to wait first. Default: the `createRetryPolicy` default. */
    retry?: Backoff;
    /** Whose timer the retry delay waits on. Default: the system clock. */
    clock?: Clock;
    circuitBreaker?: CircuitBreakerPolicyOptions;
    timeout?: TimeoutPolicyOptions;
    /**
     * Limit concurrent calls. Off unless given, so existing callers keep unlimited
     * concurrency. It wraps everything else: one logical call, retries included,
     * holds one slot.
     */
    bulkhead?: BulkheadPolicyOptions;
    /**
     * Map a thrown error that reaches the caller to a value, usually a failure from `@arki/failure`.
     * Explicit fallback sees exhausted callback throws before public defect normalization.
     * Returned engine refusals and cancellation bypass it. Unmapped throws become UnexpectedDefect.
     */
    onThrow?: OnThrow<Mapped>;
};
/**
 * Create a retry policy. It calls the function, and after each failure asks `backoff`
 * how long to wait before the next try, or whether to stop and rethrow the error.
 *
 * Default backoff: 3 retries, 100 ms doubling to at most 10 s, with 25% jitter.
 */
export declare function createRetryPolicy<Mapped = never>(options?: RetryPolicyOptions<Mapped>): RetryPolicy<Mapped>;
/**
 * Create a circuit breaker policy using consecutive-failure detection.
 *
 * Defaults: 5 consecutive failures, 30 s half-open window.
 */
export declare function createCircuitBreakerPolicy(options?: CircuitBreakerPolicyOptions): CircuitBreakerPolicy;
/**
 * Create a timeout policy that aggressively cancels the operation when the
 * deadline is exceeded.
 *
 * Default: 30 s.
 */
export declare function createTimeoutPolicy(options?: TimeoutPolicyOptions): TimeoutPolicy;
/**
 * Create a bulkhead (concurrency-limiter) policy.
 *
 * Defaults: 10 concurrent, 100 queued.
 */
export declare function createBulkheadPolicy(options?: BulkheadPolicyOptions): BulkheadPolicy;
/**
 * Compose policies from the outside in: `wrap(retry, breaker, timeout)` retries a call whose
 * every attempt goes through the breaker and then the timeout. Events on the result are
 * those of the outermost policy.
 */
export declare function wrap<E, R extends readonly unknown[]>(first: Policy<never, E>, ...rest: {
    [K in keyof R]: Policy<never, R[K]>;
}): Policy<never, E | R[number]>;
/** A policy that only runs the function. Useful as a default or in tests. */
export declare const noop: Policy;
/** The parts a composed resilience policy runs. Their events fire on every composed call. */
export type ResilienceComponents = {
    readonly retry: RetryPolicy;
    readonly circuitBreaker: CircuitBreakerPolicy;
    readonly timeout: TimeoutPolicy;
    /** Set only when the `bulkhead` option was given. */
    readonly bulkhead?: BulkheadPolicy;
};
/**
 * What `createResiliencePolicy` returns: the composed policy plus the parts it runs. `F` is what
 * its `onThrow` may answer instead of the function's own `T`; `never` without one.
 */
export type ResiliencePolicy<F = never> = Policy<F, ResilienceFailure> & {
    readonly components: ResilienceComponents;
};
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
export declare function createResiliencePolicy<Mapped = never>(options?: ResiliencePolicyOptions<Mapped>): ResiliencePolicy<Mapped>;
//# sourceMappingURL=policies.d.ts.map