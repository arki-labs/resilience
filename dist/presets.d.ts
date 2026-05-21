import type { IPolicy } from 'cockatiel';
/**
 * Resilience policy tuned for external API calls (geocoding, AI providers, etc.).
 *
 * - Retry: 3 attempts, 200 ms initial, 5 s max
 * - Circuit breaker: 5 consecutive failures, 30 s half-open
 * - Timeout: 10 s per attempt
 */
export declare const externalApiPolicy: IPolicy;
/**
 * Resilience policy tuned for database operations.
 *
 * Skips the circuit breaker because database connection pools already handle
 * connection-level health checks.
 *
 * - Retry: 2 attempts, 50 ms initial, 1 s max
 * - Timeout: 5 s per attempt
 */
export declare const databasePolicy: IPolicy;
/**
 * Resilience policy tuned for background job processing where higher latency
 * and more retries are acceptable.
 *
 * - Retry: 5 attempts, 500 ms initial, 30 s max
 * - Circuit breaker: 10 consecutive failures, 60 s half-open
 * - Timeout: 60 s per attempt
 */
export declare const backgroundJobPolicy: IPolicy;
//# sourceMappingURL=presets.d.ts.map