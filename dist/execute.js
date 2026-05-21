import { createCircuitBreakerPolicy, createRetryPolicy, createTimeoutPolicy } from './policies.js';
/**
 * Execute a function with an already-constructed resilience policy.
 *
 * @example
 * ```ts
 * const result = await withResilience(
 *   () => fetch('https://api.example.com'),
 *   externalApiPolicy,
 * );
 * ```
 */
export async function withResilience(fn, policy) {
    return policy.execute(fn);
}
/**
 * Execute a function with a retry policy (no circuit breaker or timeout).
 *
 * Convenience wrapper that creates an ephemeral retry policy from the provided
 * options and executes immediately.
 */
export async function withRetry(fn, options) {
    const policy = createRetryPolicy(options);
    return policy.execute(fn);
}
/**
 * Execute a function with a timeout policy.
 */
export async function withTimeout(fn, options) {
    const policy = createTimeoutPolicy(options);
    return policy.execute(fn);
}
/**
 * Execute a function with a circuit breaker policy.
 *
 * Note: for the circuit breaker to be effective across multiple calls, you
 * should create the policy once and reuse it rather than calling this helper
 * repeatedly (each call creates a fresh breaker with no history).
 */
export async function withCircuitBreaker(fn, options) {
    const policy = createCircuitBreakerPolicy(options);
    return policy.execute(fn);
}
//# sourceMappingURL=execute.js.map