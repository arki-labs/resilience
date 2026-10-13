/** Base class of every error the policies raise themselves. Errors thrown by your function pass through untouched. */
export class ResilienceError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'ResilienceError';
    }
}
/** The circuit breaker is open: the call was rejected without running the function. */
export class CircuitOpenError extends ResilienceError {
    constructor(message = 'Circuit breaker is open', options) {
        super(message, options);
        this.name = 'CircuitOpenError';
    }
}
/** A timeout policy reached its deadline before the function returned. */
export class TimeoutError extends ResilienceError {
    constructor(message = 'Operation timed out', options) {
        super(message, options);
        this.name = 'TimeoutError';
    }
}
/** The caller's own signal aborted while the call was in flight. `cause` is the signal's reason. */
export class CancelledError extends ResilienceError {
    constructor(message = 'Operation cancelled', options) {
        super(message, options);
        this.name = 'CancelledError';
    }
}
/** A bulkhead turned the call away: every execution slot and queue slot was taken. */
export class BulkheadRejectedError extends ResilienceError {
    constructor(message = 'Bulkhead capacity exceeded', options) {
        super(message, options);
        this.name = 'BulkheadRejectedError';
    }
}
/**
 * Thrown when all retry attempts have been exhausted without a successful result.
 */
export class RetriesExhaustedError extends ResilienceError {
    attempts;
    lastError;
    constructor(attempts, lastError) {
        super(`All ${attempts} retry attempts exhausted${lastError ? `: ${lastError.message}` : ''}`, {
            cause: lastError,
        });
        this.name = 'RetriesExhaustedError';
        this.attempts = attempts;
        this.lastError = lastError;
    }
}
/** True for every error raised by the resilience layer itself. */
export function isResilienceError(error) {
    return error instanceof ResilienceError;
}
export function isBrokenCircuitError(error) {
    return error instanceof CircuitOpenError;
}
export function isBulkheadRejectedError(error) {
    return error instanceof BulkheadRejectedError;
}
//# sourceMappingURL=errors.js.map