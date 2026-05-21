import type { IPolicy } from 'cockatiel';
import type { CircuitBreakerPolicyOptions, RetryPolicyOptions, TimeoutPolicyOptions } from './policies.js';
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
export declare function withResilience<T>(fn: (context: {
    signal: AbortSignal;
}) => T | Promise<T>, policy: IPolicy): Promise<T>;
/**
 * Execute a function with a retry policy (no circuit breaker or timeout).
 *
 * Convenience wrapper that creates an ephemeral retry policy from the provided
 * options and executes immediately.
 */
export declare function withRetry<T>(fn: (context: {
    signal: AbortSignal;
}) => T | Promise<T>, options?: RetryPolicyOptions): Promise<T>;
/**
 * Execute a function with a timeout policy.
 */
export declare function withTimeout<T>(fn: (context: {
    signal: AbortSignal;
}) => T | Promise<T>, options?: TimeoutPolicyOptions): Promise<T>;
/**
 * Execute a function with a circuit breaker policy.
 *
 * Note: for the circuit breaker to be effective across multiple calls, you
 * should create the policy once and reuse it rather than calling this helper
 * repeatedly (each call creates a fresh breaker with no history).
 */
export declare function withCircuitBreaker<T>(fn: (context: {
    signal: AbortSignal;
}) => T | Promise<T>, options?: CircuitBreakerPolicyOptions): Promise<T>;
//# sourceMappingURL=execute.d.ts.map