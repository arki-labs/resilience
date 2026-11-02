import type { BulkheadPolicy, CircuitBreakerPolicy, Policy, RetryPolicy, TimeoutPolicy } from './policy.js';
export type PolicyLogger = {
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
};
/** Optional event capabilities come from the original policy declarations. */
type ObservablePolicy = Policy<unknown, unknown> & Partial<Pick<RetryPolicy, 'onRetry' | 'onGiveUp'> & Pick<CircuitBreakerPolicy, 'onBreak' | 'onHalfOpen' | 'onReset'> & Pick<TimeoutPolicy, 'onTimeout'> & Pick<BulkheadPolicy, 'onReject'>>;
/**
 * Attach structured logging to a resilience policy. Subscribes to retry,
 * circuit breaker, timeout, success, and failure events when available.
 *
 * Returns a cleanup function that disposes all subscriptions.
 */
export declare function attachPolicyLogger(policy: ObservablePolicy, logger: PolicyLogger, policyName?: string): () => void;
export {};
//# sourceMappingURL=events.d.ts.map