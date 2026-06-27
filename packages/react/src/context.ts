"use client";

import { createContext, useContext } from "react";
import type { BuckspayClient, BuckspayState } from "@buckspay/core";
import type { StoreApi } from "zustand/vanilla";

export interface BuckspayContextValue {
  client: BuckspayClient;
  store: StoreApi<BuckspayState>;
}

export const BuckspayContext = createContext<BuckspayContextValue | null>(null);

export function useBuckspayContext(): BuckspayContextValue {
  const ctx = useContext(BuckspayContext);
  if (ctx === null) {
    throw new Error(
      "[@buckspay/react] hook used outside <BuckspayProvider>. Wrap your app in <BuckspayProvider config={...}>."
    );
  }
  return ctx;
}
