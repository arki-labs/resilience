import type { BulkheadRejectedError, BrokenCircuitError } from 'cockatiel';
import { TaskCancelledError } from 'cockatiel';
/**
 * Thrown when a circuit breaker is in the open state and rejects execution.
 * Re-exported from cockatiel for semantic clarity.
 */
/**
 * Thrown when an operation exceeds its configured timeout duration.
 * Re-exported from cockatiel.
 */
/**
 * Thrown when all retry attempts have been exhausted without a successful result.
 */
export declare class RetriesExhaustedError extends Error {
    readonly attempts: number;
    readonly lastError: Error | undefined;
    constructor(attempts: number, lastError?: Error);
}
/**
 * Type guard that checks whether a given error originates from the resilience layer.
 */
export declare function isResilienceError(error: unknown): error is BrokenCircuitError | TaskCancelledError | RetriesExhaustedError | BulkheadRejectedError;
export { BrokenCircuitError as CircuitOpenError, TaskCancelledError as TimeoutError, isBrokenCircuitError, isBulkheadRejectedError } from 'cockatiel';
//# sourceMappingURL=errors.d.ts.map