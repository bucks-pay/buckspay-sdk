"use client";

import { useState, type ReactNode } from "react";
import { createBuckspayConfig, type AccountSimContext, type BuckspayConfig } from "@buckspay/core";
import { BuckspayContext } from "./context";

export interface BuckspayProviderProps {
  config: BuckspayConfig;
  /**
   * Recording-simulation context for `prepare()` (a Soroban RPC sim). REQUIRED for
   * `useStellarPay().pay()` - build it with `createRpcSimContext(sorobanRpcUrl)`.
   * Omit only if the app never calls `pay()` (connect-only).
   */
  sim?: AccountSimContext;
  children: ReactNode;
}

/**
 * Builds the core client+store exactly once (lazy state initializer), then shares
 * them via context. Re-renders of the provider never rebuild the client/store.
 * React 19: plain function component, children via props, no forwardRef.
 */
export function BuckspayProvider({ config, sim, children }: BuckspayProviderProps) {
  const [value] = useState(() => createBuckspayConfig(config, sim));
  return <BuckspayContext.Provider value={value}>{children}</BuckspayContext.Provider>;
}
