import type { IPolicy } from 'cockatiel';
export type PolicyLogger = {
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
};
/**
 * Attach structured logging to a resilience policy. Subscribes to retry,
 * circuit breaker, timeout, success, and failure events when available.
 *
 * Returns a cleanup function that disposes all subscriptions.
 */
export declare function attachPolicyLogger(policy: IPolicy, logger: PolicyLogger, policyName?: string): () => void;
//# sourceMappingURL=events.d.ts.map