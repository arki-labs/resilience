import { superviseObserver } from './observers.js';
/** @internal Listeners of one event. Listening is rare and emitting is per call, so a plain array. */
export function createEvent() {
    const listeners = [];
    return {
        on(listener) {
            const supervised = superviseObserver(listener);
            listeners.push(supervised);
            return {
                dispose() {
                    const index = listeners.indexOf(supervised);
                    if (index !== -1)
                        listeners.splice(index, 1);
                },
            };
        },
        emit(event) {
            // Subscription changes apply to the next emission, not to an in-flight snapshot.
            const snapshot = [...listeners];
            for (const listener of snapshot)
                listener(event);
        },
        listening: () => listeners.length > 0,
    };
}
//# sourceMappingURL=event.js.map