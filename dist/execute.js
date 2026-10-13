import { createCircuitBreakerPolicy, createRetryPolicy, createTimeoutPolicy } from './policies.js';
/**
 * Return the policy's own promise instead of awaiting it inside an `async` function, which would
 * wrap it in a second promise and add microtask hops to every call. A policy that throws instead of
 * rejecting still yields a rejected promise, as an `async` function would.
 */
function run(policy, fn) {
    try {
        return policy.execute(fn);
    }
    catch (error) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- passes the thrown value through unchanged, as an `async` function would
        return Promise.reject(error);
    }
}
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
export function withResilience(fn, policy) {
    return run(policy, fn);
}
/**
 * Execute a function with a retry policy (no circuit breaker or timeout).
 *
 * Convenience wrapper that creates an ephemeral retry policy from the provided
 * options and executes immediately.
 */
export function withRetry(fn, options) {
    return run(createRetryPolicy(options), fn);
}
/**
 * Execute a function with a timeout policy.
 */
export function withTimeout(fn, options) {
    return run(createTimeoutPolicy(options), fn);
}
/**
 * @deprecated Builds a new circuit breaker on every call, so it never
 * remembers a failure and never opens. Build one policy with
 * `createCircuitBreakerPolicy()` and pass it to `withResilience()` on each call.
 */
export function withCircuitBreaker(fn, options) {
    return run(createCircuitBreakerPolicy(options), fn);
}
//# sourceMappingURL=execute.js.map