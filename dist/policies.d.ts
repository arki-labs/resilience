import type { IPolicy } from 'cockatiel';
export type RetryPolicyOptions = {
    /** Maximum number of retry attempts (default: 3) */
    maxAttempts?: number;
    /** Initial delay in milliseconds before the first retry (default: 100) */
    initialDelay?: number;
    /** Maximum delay in milliseconds between retries (default: 10_000) */
    maxDelay?: number;
    /** Exponent applied to the backoff calculation (default: 2) */
    exponent?: number;
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
export type ResiliencePolicyOptions = {
    retry?: RetryPolicyOptions;
    circuitBreaker?: CircuitBreakerPolicyOptions;
    timeout?: TimeoutPolicyOptions;
};
/**
 * Create a retry policy with configurable exponential backoff.
 *
 * Defaults: 3 attempts, 100 ms initial delay, 10 s max delay, exponent 2.
 */
export declare function createRetryPolicy(options?: RetryPolicyOptions): import("cockatiel").RetryPolicy;
/**
 * Create a circuit breaker policy using consecutive-failure detection.
 *
 * Defaults: 5 consecutive failures, 30 s half-open window.
 */
export declare function createCircuitBreakerPolicy(options?: CircuitBreakerPolicyOptions): import("cockatiel").CircuitBreakerPolicy;
/**
 * Create a timeout policy that aggressively cancels the operation when the
 * deadline is exceeded.
 *
 * Default: 30 s.
 */
export declare function createTimeoutPolicy(options?: TimeoutPolicyOptions): import("cockatiel").TimeoutPolicy;
/**
 * Create a bulkhead (concurrency-limiter) policy.
 *
 * Defaults: 10 concurrent, 100 queued.
 */
export declare function createBulkheadPolicy(options?: BulkheadPolicyOptions): import("cockatiel").BulkheadPolicy;
/**
 * Create a composed resilience policy: retry -> circuit breaker -> timeout.
 *
 * The outermost policy (retry) wraps the circuit breaker which wraps the
 * timeout, so a single logical call may be retried while individual attempts
 * are protected by the breaker and the timeout.
 */
export declare function createResiliencePolicy(options?: ResiliencePolicyOptions): IPolicy;
//# sourceMappingURL=policies.d.ts.map