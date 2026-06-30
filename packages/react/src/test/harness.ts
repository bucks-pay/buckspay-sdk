import { createStore, type StoreApi } from "zustand/vanilla";
import { vi } from "vitest";
import type { BuckspayClient, BuckspayState, BuckspayWallet } from "@buckspay/core";

export const INITIAL_STATE: BuckspayState = {
  status: "idle",
  address: null,
  receipt: null,
  error: null
};

/**
 * A REAL `zustand/vanilla` store (so `useSyncExternalStore` is exercised
 * authentically) plus a MOCK client whose methods you can resolve/reject. The
 * client is cast to `BuckspayClient` - individual `vi.fn()`s stay controllable
 * in tests via `(client.method as ReturnType<typeof vi.fn>).mockImplementation`.
 */
export function makeHarness(overrides?: Partial<BuckspayState>) {
  const store: StoreApi<BuckspayState> = createStore<BuckspayState>(() => ({
    ...INITIAL_STATE,
    ...overrides
  }));

  const wallet: BuckspayWallet = {
    address: "GTEST",
    model: "classic",
    getState: vi.fn(async () => ({ exists: true, hasUsdcTrustline: true }))
  };

  const client = {
    connect: vi.fn(async () => {
      store.setState({ status: "ready", address: wallet.address });
      return wallet;
    }),
    transfer: vi.fn(() => ({ contract: "CUSDC", fn: "transfer", args: [] })),
    prepare: vi.fn(),
    sign: vi.fn(),
    send: vi.fn(),
    pay: vi.fn(),
    getAccountState: vi.fn(async () => ({ exists: true, hasUsdcTrustline: true }))
  } as unknown as BuckspayClient;

  return { store, client, wallet };
}

export type Harness = ReturnType<typeof makeHarness>;
