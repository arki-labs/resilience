/** Stable error codes of `@arki/resilience`. Match on the code, never on the message. */
export declare const RESILIENCE_ERROR_CODES: {
    /**
     * A `backoff` builder got an option or an attempt number it cannot use.
     *
     * @fix Pass finite, non-negative numbers: `jitter` from 0 to 1, a whole number to `upTo`, attempts from 1.
     * @verify cd packages/resilience && bun run test
     */
    readonly invalidBackoff: 'ARKI_RESILIENCE_E006';
};
/** The code of a {@link ResilienceError}. */
export type ResilienceErrorCode = (typeof RESILIENCE_ERROR_CODES)[keyof typeof RESILIENCE_ERROR_CODES];
/** Base class for static policy configuration misuse. Operational failures are returned. */
export declare abstract class ResilienceError extends Error {
    /** Stable machine-readable code, `ARKI_RESILIENCE_E<nnn>`. */
    abstract readonly code: ResilienceErrorCode;
    /** What to do about it, in one sentence. */
    abstract readonly remediation: string;
    constructor(message: string, options?: ErrorOptions);
}
/** A `backoff` builder got an option or an attempt number it cannot use. Raised where the backoff is built. */
export declare class InvalidBackoffError extends ResilienceError {
    readonly code: "ARKI_RESILIENCE_E006";
    readonly remediation = "Pass finite, non-negative numbers: jitter from 0 to 1, a whole number to upTo, attempts from 1.";
    constructor(message: string);
}
/** Execution was cancelled before work could continue.
 * @fix Stop retrying; begin new work only under a new owning signal.
 * @verify bun run test
 */
export declare const Cancelled: import("@arki/failure").FailureDefinition<"resilience.cancelled", undefined>;
/** Original definitions for retry execution and its clock waits. */
export declare const RETRY_FAILURES: readonly [import("@arki/failure").FailureDefinition<"clock.sleep_cancelled", undefined>, import("@arki/failure").FailureDefinition<"failure.unexpected_defect", undefined>, import("@arki/failure").FailureDefinition<"resilience.cancelled", undefined>];
/** Exact owned retry outcomes, inferred from their definitions. */
export type RetryFailure = ReturnType<(typeof RETRY_FAILURES)[number]>;
/** The circuit is open; no callback ran.
 * @fix Wait for a half-open attempt or explicitly handle the refusal.
 * @verify bun run test
 */
export declare const CircuitOpen: import("@arki/failure").FailureDefinition<"resilience.circuit_open", undefined>;
/** The owned deadline expired; the callback may still need to finish cancellation.
 * @fix Pass the attempt signal to work and reconcile effects before retrying.
 * @verify bun run test
 */
export declare const Timeout: import("@arki/failure").FailureDefinition<"resilience.timeout", undefined>;
/** No execution or queue slot was available; no callback ran.
 * @fix Shed load or explicitly retry after capacity becomes available.
 * @verify bun run test
 */
export declare const BulkheadRejected: import("@arki/failure").FailureDefinition<"resilience.bulkhead_rejected", undefined>;
/** Outcomes shared by every owned public execution boundary. */
export declare const EXECUTION_FAILURES: readonly [import("@arki/failure").FailureDefinition<"resilience.cancelled", undefined>, import("@arki/failure").FailureDefinition<"failure.unexpected_defect", undefined>];
export type ExecutionFailure = ReturnType<(typeof EXECUTION_FAILURES)[number]>;
export declare const CIRCUIT_FAILURES: readonly [import("@arki/failure").FailureDefinition<"resilience.cancelled", undefined>, import("@arki/failure").FailureDefinition<"failure.unexpected_defect", undefined>, import("@arki/failure").FailureDefinition<"resilience.circuit_open", undefined>];
export type CircuitFailure = ReturnType<(typeof CIRCUIT_FAILURES)[number]>;
export declare const TIMEOUT_FAILURES: readonly [import("@arki/failure").FailureDefinition<"resilience.cancelled", undefined>, import("@arki/failure").FailureDefinition<"failure.unexpected_defect", undefined>, import("@arki/failure").FailureDefinition<"resilience.timeout", undefined>];
export type TimeoutFailure = ReturnType<(typeof TIMEOUT_FAILURES)[number]>;
export declare const BULKHEAD_FAILURES: readonly [import("@arki/failure").FailureDefinition<"resilience.cancelled", undefined>, import("@arki/failure").FailureDefinition<"failure.unexpected_defect", undefined>, import("@arki/failure").FailureDefinition<"resilience.bulkhead_rejected", undefined>];
export type BulkheadFailure = ReturnType<(typeof BULKHEAD_FAILURES)[number]>;
/** Complete admission for composed policies, from the original definitions. */
export declare const RESILIENCE_FAILURES: readonly [import("@arki/failure").FailureDefinition<"clock.sleep_cancelled", undefined>, import("@arki/failure").FailureDefinition<"failure.unexpected_defect", undefined>, import("@arki/failure").FailureDefinition<"resilience.cancelled", undefined>, import("@arki/failure").FailureDefinition<"resilience.circuit_open", undefined>, import("@arki/failure").FailureDefinition<"resilience.timeout", undefined>, import("@arki/failure").FailureDefinition<"resilience.bulkhead_rejected", undefined>];
export type ResilienceFailure = ReturnType<(typeof RESILIENCE_FAILURES)[number]>;
//# sourceMappingURL=errors.d.ts.map