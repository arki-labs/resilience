/**
 * `@arki/resilience`: retry, circuit breaker, timeout, bulkhead and curated presets, with typed errors
 * and a `backoff` schedule shared with `@arki/queue` and `@arki/journal`.
 */
export { Cancelled, RETRY_FAILURES, type RetryFailure, ResilienceError, RESILIENCE_ERROR_CODES, type ResilienceErrorCode, InvalidBackoffError, CircuitOpen, Timeout, BulkheadRejected, EXECUTION_FAILURES, CIRCUIT_FAILURES, TIMEOUT_FAILURES, BULKHEAD_FAILURES, RESILIENCE_FAILURES, type ExecutionFailure, type CircuitFailure, type TimeoutFailure, type BulkheadFailure, type ResilienceFailure, } from './errors.js';
export type { Policy, PolicyExecution, PolicyContext, PolicyCallback, RetryPolicy, CircuitBreakerPolicy, TimeoutPolicy, BulkheadPolicy, PolicyEvent, Subscription, FailureReason, SuccessEvent, FailureEvent, RetryEvent, BreakEvent, } from './policy.js';
export { backoff } from './backoff.js';
export type { Backoff, ExponentialBackoffOptions } from './backoff.js';
export { createRetryPolicy, createCircuitBreakerPolicy, createTimeoutPolicy, createBulkheadPolicy, createResiliencePolicy, wrap, noop, } from './policies.js';
export { withFallback } from './fallback.js';
export type { RetryPolicyOptions, OnThrow, CircuitBreakerPolicyOptions, TimeoutPolicyOptions, BulkheadPolicyOptions, ResiliencePolicyOptions, ResiliencePolicy, ResilienceComponents, } from './policies.js';
export { externalApiPolicy, databasePolicy, backgroundJobPolicy, definePresets } from './presets.js';
export type { Presets } from './presets.js';
export { attachPolicyLogger } from './events.js';
export type { PolicyLogger } from './events.js';
export { withResilience, withRetry, withTimeout } from './execute.js';
/** Exact operational outcomes from waiting between retry attempts. */
export type { SleepFailure as RetryWaitFailure } from '@arki/clock';
export { SLEEP_FAILURES as RETRY_WAIT_FAILURES } from '@arki/clock';
//# sourceMappingURL=index.d.ts.map