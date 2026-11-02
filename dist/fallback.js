import { observeEvent } from './observers.js';
import { Cancelled } from './errors.js';
import { executeRaw, ownExecution } from './engine.js';
export function withFallback(policy, fallback) {
    const execution = {
        async execute(fn, signal) {
            try {
                return await executeRaw(policy, fn, signal);
            }
            catch (error) {
                if (signal?.aborted)
                    return Cancelled({ cause: signal.reason });
                return await fallback(error);
            }
        },
    };
    return Object.assign(ownExecution(execution), {
        onSuccess: policy.onSuccess === undefined ? undefined : observeEvent(policy.onSuccess, policy),
        onFailure: policy.onFailure === undefined ? undefined : observeEvent(policy.onFailure, policy),
    });
}
//# sourceMappingURL=fallback.js.map