import type { Attributes } from '@opentelemetry/api';
/** Keep raw throws for retry/fallback; only the public execution boundary normalizes them. */
export declare function withPolicySpan<Value>(name: string, run: () => Value | PromiseLike<Value>, attributes?: Attributes): Promise<Value>;
//# sourceMappingURL=telemetry.d.ts.map