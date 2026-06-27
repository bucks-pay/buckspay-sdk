"use client";

import { useCallback } from "react";
import type {
  Call,
  PreparedIntent,
  SignedIntent,
  Receipt,
  BuckspayState,
  BuckspayError
} from "@buckspay/core";
import { useBuckspayContext } from "./context";
import { useBuckspayState } from "./use-buckspay-state";

export interface UseStellarPayResult {
  status: BuckspayState["status"];
  receipt: Receipt | null;
  error: BuckspayError | null;
  prepare: (calls: Call[]) => Promise<PreparedIntent>;
  sign: (intent: PreparedIntent) => Promise<SignedIntent>;
  pay: (calls: Call[]) => Promise<Receipt>;
  reset: () => void;
}

/**
 * The split prepare/sign/(pay) surface from the core client, made reactive
 * (README §4.6). `prepare`/`sign` are exposed separately so the dashboard can sign
 * in the browser and relay through its own BFF instead of calling `send`. `reset`
 * returns the store to `idle`.
 */
export function useStellarPay(): UseStellarPayResult {
  const { client, store } = useBuckspayContext();
  const status = useBuckspayState((s) => s.status);
  const receipt = useBuckspayState((s) => s.receipt);
  const error = useBuckspayState((s) => s.error);

  const prepare = useCallback((calls: Call[]) => client.prepare(calls), [client]);
  const sign = useCallback((intent: PreparedIntent) => client.sign(intent), [client]);
  const pay = useCallback((calls: Call[]) => client.pay(calls), [client]);
  const reset = useCallback(() => {
    store.setState({ status: "idle", receipt: null, error: null });
  }, [store]);

  return { status, receipt, error, prepare, sign, pay, reset };
}
