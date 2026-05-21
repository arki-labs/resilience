import { ExponentialBackoff, retry, handleAll, circuitBreaker, ConsecutiveBreaker, timeout, TimeoutStrategy, bulkhead, wrap, } from 'cockatiel';
// ---------------------------------------------------------------------------
// Policy factories
// ---------------------------------------------------------------------------
/**
 * Create a retry policy with configurable exponential backoff.
 *
 * Defaults: 3 attempts, 100 ms initial delay, 10 s max delay, exponent 2.
 */
export function createRetryPolicy(options = {}) {
    const { maxAttempts = 3, initialDelay = 100, maxDelay = 10_000, exponent = 2, } = options;
    return retry(handleAll, {
        maxAttempts,
        backoff: new ExponentialBackoff({
            initialDelay,
            maxDelay,
            exponent,
        }),
    });
}
/**
 * Create a circuit breaker policy using consecutive-failure detection.
 *
 * Defaults: 5 consecutive failures, 30 s half-open window.
 */
export function createCircuitBreakerPolicy(options = {}) {
    const { halfOpenAfter = 30_000, consecutiveFailures = 5 } = options;
    return circuitBreaker(handleAll, {
        halfOpenAfter,
        breaker: new ConsecutiveBreaker(consecutiveFailures),
    });
}
/**
 * Create a timeout policy that aggressively cancels the operation when the
 * deadline is exceeded.
 *
 * Default: 30 s.
 */
export function createTimeoutPolicy(options = {}) {
    const { timeoutMs = 30_000 } = options;
    return timeout(timeoutMs, TimeoutStrategy.Aggressive);
}
/**
 * Create a bulkhead (concurrency-limiter) policy.
 *
 * Defaults: 10 concurrent, 100 queued.
 */
export function createBulkheadPolicy(options = {}) {
    const { maxConcurrent = 10, maxQueue = 100 } = options;
    return bulkhead(maxConcurrent, maxQueue);
}
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