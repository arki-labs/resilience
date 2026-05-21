import { TaskCancelledError, isBrokenCircuitError, isBulkheadRejectedError, } from 'cockatiel';
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
export class RetriesExhaustedError extends Error {
    attempts;
    lastError;
    constructor(attempts, lastError) {
        super(`All ${attempts} retry attempts exhausted${lastError ? `: ${lastError.message}` : ''}`);
        this.name = 'RetriesExhaustedError';
        this.attempts = attempts;
        this.lastError = lastError;
    }
}
/**
 * Type guard that checks whether a given error originates from the resilience layer.
 */
export function isResilienceError(error) {
    if (error instanceof RetriesExhaustedError)
        return true;
    if (isBrokenCircuitError(error))
        return true;
    if (isBulkheadRejectedError(error))
        return true;
    if (error instanceof TaskCancelledError)
        return true;
    return false;
}
export { BrokenCircuitError as CircuitOpenError, TaskCancelledError as TimeoutError, isBrokenCircuitError, isBulkheadRejectedError } from 'cockatiel';
//# sourceMappingURL=errors.js.map