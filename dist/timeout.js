import { timeout, TimeoutStrategy } from 'cockatiel';
import { is } from '@arki/schema';
import { z } from 'zod';
import { Timeout, Cancelled } from './errors.js';
import { fromEngine, ownedEngine } from './engine.js';
import { createEvent } from './event.js';
import { withPolicySpan } from './telemetry.js';
const cancelledErrorSchema = z.object({ isTaskCancelledError: z.literal(true) });
class TimeoutEngine {
    timeoutMs;
    success = createEvent();
    failure = createEvent();
    deadline = createEvent();
    onSuccess = this.success.on;
    onFailure = this.failure.on;
    onTimeout = this.deadline.on;
    constructor(timeoutMs) {
        this.timeoutMs = timeoutMs;
    }
    async execute(fn, signal) {
        return withPolicySpan('resilience.timeout', () => this.run(fn, signal));
    }
    async run(fn, signal) {
        // A per-call engine has no persistent state. Its first observer captures origin
        // before subscribers can synchronously abort the caller.
        const engine = timeout(this.timeoutMs, TimeoutStrategy.Aggressive);
        let cancellation;
        engine.onTimeout(() => {
            cancellation = signal?.aborted ? Cancelled({ cause: signal.reason }) : Timeout();
            this.deadline.emit();
        });
        const owned = ownedEngine(engine, error => {
            if (is(error, cancelledErrorSchema) && cancellation !== undefined)
                return cancellation;
            throw error;
        });
        owned.onSuccess(this.success.emit);
        owned.onFailure(this.failure.emit);
        try {
            return await owned.execute(fn, signal);
        }
        catch (error) {
            // Cooperative work may reject on abort before the SDK race rejects. The
            // already-captured cancellation owns that refusal, not its AbortError.
            if (cancellation !== undefined)
                return cancellation;
            throw error;
        }
    }
}
/** @internal Each deadline owns cancellation origin, independently of concurrent calls. */
export function timeoutPolicy(timeoutMs) {
    const engine = new TimeoutEngine(timeoutMs);
    return fromEngine(engine, { onTimeout: engine.onTimeout });
}
//# sourceMappingURL=timeout.js.map