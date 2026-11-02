import { UnexpectedDefect } from '@arki/failure';
import { createRetryPolicy, createTimeoutPolicy } from './policies.js';
/** Own synchronous and asynchronous defects from foreign execution-only policies too. */
function run(policy, fn) {
    try {
        return policy.execute(fn).catch(error => UnexpectedDefect({ cause: error }));
    }
    catch (error) {
        return Promise.resolve(UnexpectedDefect({ cause: error }));
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
//# sourceMappingURL=execute.js.map