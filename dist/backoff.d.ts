import type { FailureDefinition } from '@arki/failure';
/** Says whether a thrown error or a returned failure is worth another try. */
type RetryPredicate = (reason: unknown) => boolean;
/** The parts of a `FailureDefinition` that `while` needs to recognise its failures. */
type RetryableFailure = Pick<FailureDefinition, 'code' | 'is'>;
/** One or more failure definitions, for `while(...definitions)`. */
type RetryableFailures = readonly [RetryableFailure, ...RetryableFailure[]];
/**
 * How long to wait before each retry, and when to stop. Immutable: `upTo` and `while`
 * return a new backoff. Each call narrows the backoff, except that the first `while`
 * decides alone whether a returned failure is retried.
 *
 * A try fails in one of two ways: it throws an error, or it returns a failure from
 * `@arki/failure` (an expected outcome, such as "card declined"). Without `while`, a
 * backoff retries every thrown error and no returned failure.
 */
export type Backoff = {
    /**
     * The wait in milliseconds before retry number `attempt` (1 for the first retry) after
     * `reason` failed the previous try: the error it threw, or the failure it returned.
     * `undefined` means stop: do not retry. Throws `InvalidBackoffError` when `attempt` is
     * not a whole number from 1.
     */
    delay(attempt: number, reason: unknown): number | undefined;
    /** The most retries this backoff allows: what `upTo` set, or `Infinity`. */
    readonly maxRetries: number;
    /** The same backoff, stopping after at most `retries` retries. `upTo(0)` never retries. */
    upTo(retries: number): Backoff;
    /**
     * The same backoff, also retrying returned failures of these `@arki/failure`
     * definitions. Thrown errors keep retrying as without `while`; other returned
     * failures are not retried. Short for
     * `while(reason => !isFailure(reason) || definitions.some(d => d.is(reason)))`.
     *
     * @example backoff.exponential({ base: 100 }).while(DbTimeout, ExportUnavailable)
     */
    while(...definitions: RetryableFailures): Backoff;
    /**
     * The same backoff, retrying only the reasons for which `predicate` returns true. A
     * reason is a thrown error or a returned failure, so the predicate sees both: a
     * returned failure is retried only when a predicate says yes to it. A negative
     * predicate such as `reason => !(reason instanceof BadInput)` says yes to failures too.
     *
     * @example backoff.exponential({ base: 100 }).while(reason => reason instanceof NetworkError)
     */
    while(predicate: RetryPredicate): Backoff;
};
/** Options of {@link backoff.exponential}. */
export type ExponentialBackoffOptions = {
    /** The wait before the first retry, in milliseconds. Each later wait doubles. */
    readonly base: number;
    /** The longest wait, in milliseconds. Default and upper bound: `MAX_TIMER_MS` (about 24.8 days). */
    readonly max?: number;
    /**
     * How much each wait may vary, from 0 (the default: exact) to 1. With `0.25` a wait is
     * picked at random from 75% to 125% of its exact value, then capped at `max`. Spreads
     * the retries of many clients so they do not hit a recovering service at once.
     */
    readonly jitter?: number;
    /**
     * Where jitter gets its randomness: a function returning a number in [0, 1), like the
     * default `Math.random`. Pass a fixed one to make jittered waits deterministic in tests.
     */
    readonly random?: () => number;
};
/** Builders of a {@link Backoff}. Every builder retries forever until `upTo` limits it. */
export declare const backoff: {
    /**
     * Waits `base`, then twice as long before each later retry: `base * 2^(attempt - 1)`,
     * capped at `max`, varied by `jitter`.
     *
     * @example backoff.exponential({ base: 200, max: 5000, jitter: 0.25 }).upTo(3)
     */
    exponential(options: ExponentialBackoffOptions): Backoff;
    /**
     * Waits the same `ms` before every retry.
     *
     * @example backoff.constant(60_000).upTo(1)
     */
    constant(ms: number): Backoff;
};
export {};
//# sourceMappingURL=backoff.d.ts.map