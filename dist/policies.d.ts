import type { BulkheadPolicy, CircuitBreakerPolicy, Policy, RetryPolicy, TimeoutPolicy } from './policy.js';
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
export declare function createRetryPolicy(options?: RetryPolicyOptions): RetryPolicy;
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
export declare function wrap(first: Policy, ...rest: Policy[]): Policy;
/** A policy that only runs the function. Useful as a default or in tests. */
export declare const noop: Policy;
/**
 * Create a composed resilience policy: retry -> circuit breaker -> timeout.
 *
 * The outermost policy (retry) wraps the circuit breaker which wraps the
 * timeout, so a single logical call may be retried while individual attempts
 * are protected by the breaker and the timeout.
 */
export declare function createResiliencePolicy(options?: ResiliencePolicyOptions): Policy;
//# sourceMappingURL=policies.d.ts.map