import type { ResilienceFailure } from './errors.js';
import type { ResiliencePolicy } from './policies.js';
import type { PolicyCallback } from './policy.js';
import type { Presets } from './presets.js';
/**
 * Stable error codes thrown by the resilience plugin. Match on these, never on the message.
 */
export declare const RESILIENCE_PLUGIN_ERROR_CODES: {
    /**
     * `for` or `run` got a name that is not in the presets (only reachable from untyped JS).
     *
     * @fix Use a name you passed to `definePresets(...)`. Types catch this in TypeScript.
     * @verify cd packages/resilience && bun run test
     */
    readonly unknownPreset: 'ARKI_RESILIENCE_PLUGIN_E001';
};
/** Services published by the resilience adapter. */
export type ResilienceService<N extends string> = {
    /** The preset called `name`. The same object as `presets[name]`, so breaker state is shared. */
    for(name: N): ResiliencePolicy;
    /** Run `fn` through the preset called `name`. */
    run<T>(name: N, fn: PolicyCallback<T>, signal?: AbortSignal): Promise<T | ResilienceFailure>;
};
/**
 * Build a DOT plugin that publishes the presets as `services.resilience` and logs their policy
 * events at `debug` under `arki:resilience`.
 *
 * @param presets - The result of `definePresets(...)`. Its names type `for` and `run`.
 */
export declare function resilience<N extends string>(presets: Presets<N>): Omit<import("@arki/dot/unit").Unit<import("@arki/dot/unit").WireNeeds<import("@arki/dot/unit").EmptyShape>, import("@arki/dot/unit").ProvidedValues<{
    resilience: ResilienceService<N>;
}>, import("@arki/dot/unit").EmptyShape, "resilience", import("@arki/dot/unit").EmptyOwnership, import("@arki/dot/unit").EmptyPhases>, "factories" | "hooks" | "logging"> & import("@arki/dot/unit").LoggingSlot<import("@arki/dot/unit").DotLoggingHandle<undefined>> & import("@arki/dot/unit").FactoryContract<import("@arki/dot/unit").ProvidedValues<{
    resilience: ResilienceService<N>;
}>> & {
    readonly factories: {
        readonly resilience: (ctx: never) => ResilienceService<N>;
    };
    readonly hooks: import("@arki/dot/unit").PhaseHooks<never, {
        readonly configure: undefined;
        readonly start: undefined;
        readonly stop: undefined;
        readonly dispose: undefined;
    }, import("@arki/dot/unit").DotConfigureContext> & import("@arki/dot/unit").BootSlot<import("@arki/dot/unit").CtxOf<import("@arki/dot/unit").EmptyShape> & import("@arki/dot/unit").ProvidedValues<{
        resilience: ResilienceService<N>;
    }> & import("@arki/dot/unit").KernelCtx, undefined>;
} & import("@arki/dot/unit").InfraRole;
//# sourceMappingURL=dot.d.ts.map