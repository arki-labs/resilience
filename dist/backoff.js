// One retry schedule for every package that retries: the resilience policies, `@arki/queue`
// jobs and `@arki/journal` effects all take the same `Backoff` value.
import { MAX_TIMER_MS } from '@arki/clock';
import { isFailure } from '@arki/failure';
import { InvalidBackoffError } from './errors.js';
function invalid(message) {
    return new InvalidBackoffError(message);
}
function assertMs(name, value) {
    if (!(Number.isFinite(value) && value >= 0 && value <= MAX_TIMER_MS)) {
        throw invalid(`backoff: ${name} must be a number of milliseconds from 0 to ${String(MAX_TIMER_MS)}, got ${String(value)}`);
    }
}
function assertAttempt(attempt) {
    if (!(Number.isInteger(attempt) && attempt >= 1)) {
        throw invalid(`backoff: delay(attempt) needs a whole number from 1, got ${String(attempt)}`);
    }
}
/**
 * Builds a backoff from its exact wait per retry, its retry limit and its filter. Without
 * a filter, thrown errors are retried and returned failures are not.
 */
function create(wait, maxRetries, retryable) {
    return {
        maxRetries,
        delay(attempt, reason) {
            assertAttempt(attempt);
            if (attempt > maxRetries)
                return;
            if (retryable === undefined ? isFailure(reason) : !retryable(reason))
                return;
            return wait(attempt);
        },
        upTo(retries) {
            if (!(Number.isInteger(retries) && retries >= 0)) {
                throw invalid(`backoff: upTo(retries) needs a whole number from 0, got ${String(retries)}`);
            }
            return create(wait, Math.min(maxRetries, retries), retryable);
        },
        while(...args) {
            const predicate = toPredicate(args);
            return create(wait, maxRetries, retryable === undefined ? predicate : reason => retryable(reason) && predicate(reason));
        },
    };
}
/** The predicate a `while` call stands for: the one it got, or one built from definitions. */
function toPredicate(args) {
    if (args.length === 0)
        throw invalid('backoff: while() needs a predicate or at least one failure definition');
    const [first, ...rest] = args;
    if (!('code' in first))
        return first;
    const definitions = [first, ...rest];
    return reason => !isFailure(reason) || definitions.some(definition => definition.is(reason));
}
/** Builders of a {@link Backoff}. Every builder retries forever until `upTo` limits it. */
export const backoff = {
    /**
     * Waits `base`, then twice as long before each later retry: `base * 2^(attempt - 1)`,
     * capped at `max`, varied by `jitter`.
     *
     * @example backoff.exponential({ base: 200, max: 5000, jitter: 0.25 }).upTo(3)
     */
    exponential(options) {
        const { base, max = MAX_TIMER_MS, jitter = 0, random = Math.random } = options;
        assertMs('base', base);
        assertMs('max', max);
        if (!(jitter >= 0 && jitter <= 1))
            throw invalid(`backoff: jitter must be from 0 to 1, got ${String(jitter)}`);
        return create(attempt => {
            const exact = Math.min(max, base * 2 ** Math.min(attempt - 1, 1023));
            if (jitter === 0)
                return exact;
            return Math.min(max, Math.round(exact * (1 + jitter * (2 * random() - 1))));
        }, Infinity);
    },
    /**
     * Waits the same `ms` before every retry.
     *
     * @example backoff.constant(60_000).upTo(1)
     */
    constant(ms) {
        assertMs('ms', ms);
        return create(() => ms, Infinity);
    },
};
//# sourceMappingURL=backoff.js.map