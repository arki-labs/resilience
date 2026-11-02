import { DotUnitError, infra } from '@arki/dot/unit';
import { getLogger } from '@arki/log';
import { describe } from './events.js';
/**
 * Stable error codes thrown by the resilience plugin. Match on these, never on the message.
 */
export const RESILIENCE_PLUGIN_ERROR_CODES = {
    /**
     * `for` or `run` got a name that is not in the presets (only reachable from untyped JS).
     *
     * @fix Use a name you passed to `definePresets(...)`. Types catch this in TypeScript.
     * @verify cd packages/resilience && bun run test
     */
    unknownPreset: 'ARKI_RESILIENCE_PLUGIN_E001',
};
const log = getLogger('arki:resilience');
/** Subscriptions of each booted service. Per service, so two apps never share them. */
const subscriptions = new WeakMap();
/** Log every event of every part of `policy`. Returns the subscriptions it made. */
function listen(preset, policy, into) {
    const { retry, circuitBreaker, timeout, bulkhead } = policy.components;
    into.push(retry.onRetry(event => {
        return log.debug('preset {preset}: retry {attempt} in {delay} ms ({error})', {
            preset,
            attempt: event.attempt,
            delay: event.delay,
            error: describe(event),
        });
    }), retry.onGiveUp(reason => {
        return log.debug('preset {preset}: gave up ({error})', { preset, error: describe(reason) });
    }), circuitBreaker.onBreak(event => {
        return log.debug('preset {preset}: circuit opened ({error})', {
            preset,
            error: 'isolated' in event ? 'isolated by hand' : describe(event),
        });
    }), circuitBreaker.onHalfOpen(() => {
        return log.debug('preset {preset}: circuit half-open', { preset });
    }), circuitBreaker.onReset(() => {
        return log.debug('preset {preset}: circuit closed', { preset });
    }), timeout.onTimeout(() => {
        return log.debug('preset {preset}: timed out', { preset });
    }));
    if (bulkhead !== undefined) {
        into.push(bulkhead.onReject(() => {
            return log.debug('preset {preset}: bulkhead full, call rejected', { preset });
        }));
    }
}
/**
 * Build a DOT plugin that publishes the presets as `services.resilience` and logs their policy
 * events at `debug` under `arki:resilience`.
 *
 * @param presets - The result of `definePresets(...)`. Its names type `for` and `run`.
 */
export function resilience(presets) {
    return infra({
        name: 'resilience',
        configure(ctx) {
            ctx.registerService('resilience', 'custom');
        },
        provides: {
            resilience: () => {
                const byName = new Map(Object.entries(presets));
                const lookup = (name) => {
                    const found = byName.get(name);
                    if (found === undefined) {
                        throw new DotUnitError({
                            code: RESILIENCE_PLUGIN_ERROR_CODES.unknownPreset,
                            message: `[resilience] No preset named "${name}". Known: ${[...byName.keys()].join(', ')}.`,
                            remediation: 'Use a name you passed to definePresets(...).',
                            docsUrl: 'https://arki.dev/dot/errors/arki-resilience-plugin-e001',
                        });
                    }
                    return found;
                };
                const service = {
                    for: lookup,
                    run: (name, fn, signal) => lookup(name).execute(fn, signal),
                };
                const made = [];
                try {
                    for (const [name, policy] of byName)
                        listen(name, policy, made);
                }
                catch (error) {
                    for (const subscription of made)
                        subscription.dispose();
                    throw error;
                }
                subscriptions.set(service, made);
                return service;
            },
        },
        dispose({ resilience: service }) {
            const made = subscriptions.get(service);
            if (made === undefined)
                return;
            subscriptions.delete(service);
            for (const subscription of made)
                subscription.dispose();
        },
    });
}
//# sourceMappingURL=dot.js.map