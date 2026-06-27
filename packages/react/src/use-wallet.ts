"use client";

import { useCallback } from "react";
import type { BuckspayWallet, BuckspayState, BuckspayError } from "@buckspay/core";
import { useBuckspayContext } from "./context";
import { useBuckspayState } from "./use-buckspay-state";

export interface UseWalletResult {
  wallet: BuckspayWallet | null;
  address: string | null;
  connect: () => Promise<void>;
  status: BuckspayState["status"];
  error: BuckspayError | null;
}

/**
 * Wallet connection surface (README §4.6). `connect()` delegates to the core
 * client, which resolves the address + runs `ensureReady` and drives the store
 * status. `wallet` is derived from the store address: a minimal view backed by the
 * live client (model is `classic` in SP-1; `getState` proxies the client).
 */
export function useWallet(): UseWalletResult {
  const { client } = useBuckspayContext();
  const status = useBuckspayState((s) => s.status);
  const address = useBuckspayState((s) => s.address);
  const error = useBuckspayState((s) => s.error);

  const connect = useCallback(async () => {
    await client.connect();
  }, [client]);

  const wallet: BuckspayWallet | null =
    address === null
      ? null
      : { address, model: "classic", getState: () => client.getAccountState(address) };

  return { wallet, address, connect, status, error };
}
