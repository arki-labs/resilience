import type { CircuitBreakerPolicyOptions, RetryPolicyOptions, TimeoutPolicyOptions } from './policies.js';
import type { Policy, PolicyCallback } from './policy.js';
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
export declare function withResilience<T>(fn: PolicyCallback<T>, policy: Policy): Promise<T>;
/**
 * Execute a function with a retry policy (no circuit breaker or timeout).
 *
 * Convenience wrapper that creates an ephemeral retry policy from the provided
 * options and executes immediately.
 */
export declare function withRetry<T>(fn: PolicyCallback<T>, options?: RetryPolicyOptions): Promise<T>;
/**
 * Execute a function with a timeout policy.
 */
export declare function withTimeout<T>(fn: PolicyCallback<T>, options?: TimeoutPolicyOptions): Promise<T>;
/**
 * @deprecated Builds a new circuit breaker on every call, so it never
 * remembers a failure and never opens. Build one policy with
 * `createCircuitBreakerPolicy()` and pass it to `withResilience()` on each call.
 */
export declare function withCircuitBreaker<T>(fn: PolicyCallback<T>, options?: CircuitBreakerPolicyOptions): Promise<T>;
//# sourceMappingURL=execute.d.ts.map