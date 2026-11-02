import { UnexpectedDefect } from '@arki/failure';
import { is } from '@arki/schema';
import { z } from 'zod';
import { Cancelled } from './errors.js';
import { observeEvent } from './observers.js';
import { withPolicySpan } from './telemetry.js';
const attemptSchema = z.object({ attempt: z.number() });
function contextOf(context) {
    return { signal: context.signal, attempt: is(context, attemptSchema) ? context.attempt : 0 };
}
// A private nominal carrier distinguishes a callback throw from an SDK refusal, even
// when the callback throws an actual SDK error. It never leaves the engine adapter.
class CallbackThrow extends Error {
    original;
    constructor(original) {
        super('Callback threw');
        this.original = original;
    }
}
const callbackThrowSchema = z.instanceof(CallbackThrow);
function originalError(error) {
    return is(error, callbackThrowSchema) ? error.original : error;
}
/** @internal Keep public observations about the original callback, never the carrier. */
export function originalReason(reason) {
    return 'error' in reason ? { error: originalError(reason.error) } : reason;
}
/** One adapter owns the source of each SDK refusal. */
class OwnedEngine {
    engine;
    refuse;
    spanName;
    onSuccess;
    onFailure;
    constructor(engine, refuse, spanName) {
        this.engine = engine;
        this.refuse = refuse;
        this.spanName = spanName;
        this.onSuccess = observeEvent(engine.onSuccess, engine);
        this.onFailure = listener => observeEvent(engine.onFailure, engine)(event => listener({ ...event, reason: originalReason(event.reason) }));
    }
    async execute(fn, signal) {
        return this.spanName === undefined ? this.run(fn, signal) : withPolicySpan(this.spanName, () => this.run(fn, signal));
    }
    async run(fn, signal) {
        if (signal?.aborted)
            return Cancelled({ cause: signal.reason });
        try {
            return await this.engine.execute(async (context) => {
                try {
                    return await fn(context);
                }
                catch (error) {
                    throw new CallbackThrow(error);
                }
            }, signal);
        }
        catch (error) {
            if (is(error, callbackThrowSchema))
                throw error.original;
            try {
                return this.refuse(error);
            }
            catch (error_) {
                return UnexpectedDefect({ cause: error_ });
            }
        }
    }
}
/** @internal Protect callback provenance inside one engine, classify only its own refusal. */
export function ownedEngine(engine, refuse, spanName) {
    return new OwnedEngine(engine, refuse, spanName);
}
/** Public outcome supervision is separate from raw retry/fallback execution. */
class OwnedExecution {
    raw;
    constructor(raw) {
        this.raw = raw;
    }
    execute = async (fn, signal) => {
        return withPolicySpan('resilience.execute', async () => {
            try {
                return await executeRaw(this, fn, signal);
            }
            catch (error) {
                return UnexpectedDefect({ cause: error });
            }
        });
    };
}
function isOwnedExecution(policy) {
    return policy instanceof OwnedExecution;
}
/** @internal */
export function ownPolicy(policy) {
    return Object.assign(new OwnedExecution(policy), { onSuccess: policy.onSuccess, onFailure: policy.onFailure });
}
/** @internal Own an execution-only adapter, preserving raw fallback composition. */
export function ownExecution(execution) {
    return new OwnedExecution(execution);
}
/** @internal Raw fallback/retry composition; preflight never invokes cancelled work. */
export function executeRaw(policy, fn, signal) {
    if (signal?.aborted)
        return Promise.resolve(Cancelled({ cause: signal.reason }));
    return (isOwnedExecution(policy) ? policy.raw : policy).execute(fn, signal);
}
class EnginePolicy extends OwnedExecution {
    engine;
    onSuccess;
    onFailure;
    constructor(engine) {
        super({
            execute: (fn, signal) => engine.execute(context => fn(contextOf(context)), signal),
        });
        this.engine = engine;
        this.onSuccess = engine.onSuccess;
        this.onFailure = engine.onFailure;
    }
}
function isEnginePolicy(policy) {
    return policy instanceof EnginePolicy;
}
/** @internal */
export function fromEngine(engine, extra) {
    return Object.assign(new EnginePolicy(engine), extra);
}
class ForeignEngine {
    policy;
    onSuccess;
    onFailure;
    constructor(policy) {
        this.policy = policy;
        this.onSuccess = observeEvent(policy.onSuccess, policy);
        this.onFailure = observeEvent(policy.onFailure, policy);
    }
    execute(fn, signal) {
        return executeRaw(this.policy, fn, signal);
    }
}
/** @internal Composition retains raw callback throws without bypassing owned refusal classification. */
export function engineOf(policy) {
    return isEnginePolicy(policy) ? policy.engine : new ForeignEngine(policy);
}
//# sourceMappingURL=engine.js.map