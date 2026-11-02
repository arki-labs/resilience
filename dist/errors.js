import { SLEEP_FAILURES } from '@arki/clock';
import { defineFailure, UnexpectedDefect } from '@arki/failure';
/** Stable error codes of `@arki/resilience`. Match on the code, never on the message. */
export const RESILIENCE_ERROR_CODES = {
    /**
     * A `backoff` builder got an option or an attempt number it cannot use.
     *
     * @fix Pass finite, non-negative numbers: `jitter` from 0 to 1, a whole number to `upTo`, attempts from 1.
     * @verify cd packages/resilience && bun run test
     */
    invalidBackoff: 'ARKI_RESILIENCE_E006',
};
/** Base class for static policy configuration misuse. Operational failures are returned. */
export class ResilienceError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = new.target.name;
    }
}
/** A `backoff` builder got an option or an attempt number it cannot use. Raised where the backoff is built. */
export class InvalidBackoffError extends ResilienceError {
    code = RESILIENCE_ERROR_CODES.invalidBackoff;
    remediation = 'Pass finite, non-negative numbers: jitter from 0 to 1, a whole number to upTo, attempts from 1.';
    constructor(message) {
        super(message);
        this.name = 'InvalidBackoffError';
    }
}
/** Execution was cancelled before work could continue.
 * @fix Stop retrying; begin new work only under a new owning signal.
 * @verify bun run test
 */
export const Cancelled = defineFailure('resilience.cancelled', {
    status: 499,
    message: 'Execution was cancelled.',
    remediation: 'Stop retrying; begin new work only under a new owning signal.',
});
/** Original definitions for retry execution and its clock waits. */
export const RETRY_FAILURES = [...SLEEP_FAILURES, Cancelled];
/** The circuit is open; no callback ran.
 * @fix Wait for a half-open attempt or explicitly handle the refusal.
 * @verify bun run test
 */
export const CircuitOpen = defineFailure('resilience.circuit_open', {
    status: 503,
    message: 'Circuit breaker is open.',
    remediation: 'Wait for a half-open attempt or explicitly handle the refusal.',
});
/** The owned deadline expired; the callback may still need to finish cancellation.
 * @fix Pass the attempt signal to work and reconcile effects before retrying.
 * @verify bun run test
 */
export const Timeout = defineFailure('resilience.timeout', {
    status: 504,
    message: 'Operation timed out.',
    remediation: 'Pass the attempt signal to work and reconcile effects before retrying.',
});
/** No execution or queue slot was available; no callback ran.
 * @fix Shed load or explicitly retry after capacity becomes available.
 * @verify bun run test
 */
export const BulkheadRejected = defineFailure('resilience.bulkhead_rejected', {
    status: 429,
    message: 'Bulkhead capacity exceeded.',
    remediation: 'Shed load or explicitly retry after capacity becomes available.',
});
/** Outcomes shared by every owned public execution boundary. */
export const EXECUTION_FAILURES = [Cancelled, UnexpectedDefect];
export const CIRCUIT_FAILURES = [...EXECUTION_FAILURES, CircuitOpen];
export const TIMEOUT_FAILURES = [...EXECUTION_FAILURES, Timeout];
export const BULKHEAD_FAILURES = [...EXECUTION_FAILURES, BulkheadRejected];
/** Complete admission for composed policies, from the original definitions. */
export const RESILIENCE_FAILURES = [...RETRY_FAILURES, CircuitOpen, Timeout, BulkheadRejected];
//# sourceMappingURL=errors.js.map