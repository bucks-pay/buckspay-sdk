"use client";

import { useState, type ReactNode } from "react";
import { createBuckspayConfig, type BuckspayConfig } from "@buckspay/core";
import { BuckspayContext } from "./context";

export interface BuckspayProviderProps {
  config: BuckspayConfig;
  children: ReactNode;
}

/**
 * Builds the core client+store exactly once (lazy state initializer), then shares
 * them via context. Re-renders of the provider never rebuild the client/store.
 * React 19: plain function component, children via props, no forwardRef.
 */
export function BuckspayProvider({ config, children }: BuckspayProviderProps) {
  const [value] = useState(() => createBuckspayConfig(config));
  return <BuckspayContext.Provider value={value}>{children}</BuckspayContext.Provider>;
}
