/**
 * `@arki/resilience`: retry, circuit breaker, timeout, bulkhead and curated presets, with typed errors
 * and a `backoff` schedule shared with `@arki/queue` and `@arki/journal`.
 */
// Errors
export { Cancelled, RETRY_FAILURES, ResilienceError, RESILIENCE_ERROR_CODES, InvalidBackoffError, CircuitOpen, Timeout, BulkheadRejected, EXECUTION_FAILURES, CIRCUIT_FAILURES, TIMEOUT_FAILURES, BULKHEAD_FAILURES, RESILIENCE_FAILURES, } from './errors.js';
// Retry schedules, shared with @arki/queue and @arki/journal
export { backoff } from './backoff.js';
// Policy factories and composition
export { createRetryPolicy, createCircuitBreakerPolicy, createTimeoutPolicy, createBulkheadPolicy, createResiliencePolicy, wrap, noop, } from './policies.js';
// A last answer when a policy gives up
export { withFallback } from './fallback.js';
// Pre-configured presets
export { externalApiPolicy, databasePolicy, backgroundJobPolicy, definePresets } from './presets.js';
// Event / observability helpers
export { attachPolicyLogger } from './events.js';
// Execution helpers
export { withResilience, withRetry, withTimeout } from './execute.js';
export { SLEEP_FAILURES as RETRY_WAIT_FAILURES } from '@arki/clock';
//# sourceMappingURL=index.js.map