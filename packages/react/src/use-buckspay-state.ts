"use client";

import { useSyncExternalStore } from "react";
import type { BuckspayState } from "@buckspay/core";
import { useBuckspayContext } from "./context";

/**
 * Subscribe to the vanilla zustand store with a selector. `useSyncExternalStore`
 * is the tearing-free, concurrent-safe primitive for external stores; the selector
 * runs on every store emission and React bails out of re-render when the returned
 * reference is `Object.is`-equal to the previous one. Public hooks therefore select
 * primitive fields one-by-one (not a fresh object) to keep that bailout working.
 */
export function useBuckspayState<T>(selector: (state: BuckspayState) => T): T {
  const { store } = useBuckspayContext();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
}
