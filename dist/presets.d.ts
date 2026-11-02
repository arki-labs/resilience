import type { ResiliencePolicy, ResiliencePolicyOptions } from './policies.js';
/**
 * Resilience policy tuned for external API calls (geocoding, AI providers, etc.).
 *
 * - Retry: 3 retries, 200 ms doubling to at most 5 s, 25% jitter
 * - Circuit breaker: 5 consecutive failures, 30 s half-open
 * - Timeout: 10 s per attempt
 */
export declare const externalApiPolicy: ResiliencePolicy;
/**
 * Resilience policy tuned for database operations.
 *
 * Skips the circuit breaker because database connection pools already handle
 * connection-level health checks.
 *
 * - Retry: 2 retries, 50 ms doubling to at most 1 s, 25% jitter
 * - Timeout: 5 s per attempt
 */
export declare const databasePolicy: import("./policy.js").Policy<never, import("@arki/failure").Failure<"clock.sleep_cancelled", undefined> | import("@arki/failure").Failure<"failure.unexpected_defect", undefined> | import("@arki/failure").Failure<"resilience.cancelled", undefined> | import("@arki/failure").Failure<"resilience.timeout", undefined>>;
/**
 * Resilience policy tuned for background job processing where higher latency
 * and more retries are acceptable.
 *
 * - Retry: 5 retries, 500 ms doubling to at most 30 s, 25% jitter
 * - Circuit breaker: 10 consecutive failures, 60 s half-open
 * - Timeout: 60 s per attempt
 */
export declare const backgroundJobPolicy: ResiliencePolicy;
/** A registry of named composed policies. `N` is the union of the names. */
export type Presets<N extends string = string> = Readonly<Record<N, ResiliencePolicy>>;
/**
 * Build one composed policy per name. Each name has its own breaker, so one failing downstream
 * does not open the circuit of another. A `Presets` object shared by two apps shares its
 * breakers too: same downstream, same health.
 *
 * @example
 * ```ts
 * const presets = definePresets({
 *   carrier: { retry: backoff.exponential({ base: 200, max: 5000 }).upTo(3), timeout: { timeoutMs: 10_000 } },
 *   search: { bulkhead: { maxConcurrent: 20 } },
 * });
 * await presets.carrier.execute(() => callCarrier());
 * ```
 */
export declare function definePresets<N extends string>(options: Record<N, ResiliencePolicyOptions>): Presets<N>;
//# sourceMappingURL=presets.d.ts.map