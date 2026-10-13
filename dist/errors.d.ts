/** Base class of every error the policies raise themselves. Errors thrown by your function pass through untouched. */
export declare class ResilienceError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
/** The circuit breaker is open: the call was rejected without running the function. */
export declare class CircuitOpenError extends ResilienceError {
    constructor(message?: string, options?: ErrorOptions);
}
/** A timeout policy reached its deadline before the function returned. */
export declare class TimeoutError extends ResilienceError {
    constructor(message?: string, options?: ErrorOptions);
}
/** The caller's own signal aborted while the call was in flight. `cause` is the signal's reason. */
export declare class CancelledError extends ResilienceError {
    constructor(message?: string, options?: ErrorOptions);
}
/** A bulkhead turned the call away: every execution slot and queue slot was taken. */
export declare class BulkheadRejectedError extends ResilienceError {
    constructor(message?: string, options?: ErrorOptions);
}
/**
 * Thrown when all retry attempts have been exhausted without a successful result.
 */
export declare class RetriesExhaustedError extends ResilienceError {
    readonly attempts: number;
    readonly lastError: Error | undefined;
    constructor(attempts: number, lastError?: Error);
}
/** True for every error raised by the resilience layer itself. */
export declare function isResilienceError(error: unknown): error is ResilienceError;
export declare function isBrokenCircuitError(error: unknown): error is CircuitOpenError;
export declare function isBulkheadRejectedError(error: unknown): error is BulkheadRejectedError;
//# sourceMappingURL=errors.d.ts.map