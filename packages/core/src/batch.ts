import type { Call } from "./types";
import { BuckspayError } from "./errors";

/**
 * Atomic-batch ceiling. Pinned by the sprint-0/03 multicall spike (classic op-limit /
 * contract Multicall resource budget). `build()` refuses to exceed it — fail closed.
 */
export const MAX_BATCH_CALLS = 16;

export interface BatchBuilder {
  add(call: Call): this;
  size(): number;
  build(): Call[];
}

/**
 * Pure, framework-agnostic call collector. The account adapter turns the returned calls
 * into one atomic entry (classic multi-op / contract Multicall) in SP-2 sprint-2.
 */
export function batch(...calls: Call[]): BatchBuilder {
  const items: Call[] = [...calls];
  const builder: BatchBuilder = {
    add(call: Call): BatchBuilder {
      items.push(call);
      return builder;
    },
    size(): number {
      return items.length;
    },
    build(): Call[] {
      if (items.length > MAX_BATCH_CALLS) {
        throw new BuckspayError(
          "BATCH_TOO_LARGE",
          `batch has ${String(items.length)} calls; the per-tx limit is ${String(MAX_BATCH_CALLS)}`
        );
      }
      return [...items];
    }
  };
  return builder;
}
