import type { RetryFailure, ExecutionFailure } from './errors.js';
import type { RetryPolicyOptions, TimeoutPolicyOptions } from './policies.js';
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
export declare function withResilience<T, F = never, E = never>(fn: PolicyCallback<T>, policy: Policy<F, E>): Promise<T | F | E | ExecutionFailure>;
/**
 * Execute a function with a retry policy (no circuit breaker or timeout).
 *
 * Convenience wrapper that creates an ephemeral retry policy from the provided
 * options and executes immediately.
 */
export declare function withRetry<T, Mapped = never>(fn: PolicyCallback<T>, options?: RetryPolicyOptions<Mapped>): Promise<T | Mapped | RetryFailure>;
/**
 * Execute a function with a timeout policy.
 */
export declare function withTimeout<T>(fn: PolicyCallback<T>, options?: TimeoutPolicyOptions): Promise<T | import("@arki/failure").Failure<"failure.unexpected_defect", undefined> | import("@arki/failure").Failure<"resilience.cancelled", undefined> | import("@arki/failure").Failure<"resilience.timeout", undefined>>;
//# sourceMappingURL=execute.d.ts.map