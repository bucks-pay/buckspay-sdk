import { createStore, type StoreApi } from "zustand/vanilla";
import { BuckspayClient, type AccountSimContext } from "./client";
import { BuckspayError } from "./errors";
import type {
  BuckspayConfig,
  BuckspayState,
  BuckspayWallet,
  Call,
  PreparedIntent,
  Receipt,
  SignedIntent
} from "./types";

export function createBuckspayClient(
  config: BuckspayConfig,
  sim?: AccountSimContext,
  opts?: { now?: () => number }
): BuckspayClient {
  return new BuckspayClient(config, sim, opts);
}

function toBuckspayError(err: unknown): BuckspayError {
  return err instanceof BuckspayError
    ? err
    : new BuckspayError("UNKNOWN", "unexpected error", { cause: err });
}

/**
 * Wrap a client so each method drives a vanilla store status machine. The
 * wrapper re-throws after recording the error, so callers still `try/catch`.
 */
export function createBuckspayConfig(
  config: BuckspayConfig,
  sim?: AccountSimContext
): { client: BuckspayClient; store: StoreApi<BuckspayState> } {
  const inner = new BuckspayClient(config, sim);
  const store = createStore<BuckspayState>(() => ({
    status: "idle",
    address: null,
    receipt: null,
    error: null
  }));

  const wrapped = {
    async connect(): Promise<BuckspayWallet> {
      store.setState({ status: "connecting", error: null });
      try {
        const wallet = await inner.connect();
        store.setState({ status: "ready", address: wallet.address });
        return wallet;
      } catch (err) {
        store.setState({ status: "error", error: toBuckspayError(err) });
        throw toBuckspayError(err);
      }
    },
    transfer: inner.transfer.bind(inner),
    getAccountState: inner.getAccountState.bind(inner),
    prepare: inner.prepare.bind(inner),
    async sign(intent: PreparedIntent): Promise<SignedIntent> {
      store.setState({ status: "signing", error: null });
      try {
        return await inner.sign(intent);
      } catch (err) {
        store.setState({ status: "error", error: toBuckspayError(err) });
        throw toBuckspayError(err);
      }
    },
    async send(signed: SignedIntent): Promise<Receipt> {
      store.setState({ status: "relaying", error: null });
      try {
        const receipt = await inner.send(signed);
        store.setState({ status: "success", receipt });
        return receipt;
      } catch (err) {
        store.setState({ status: "error", error: toBuckspayError(err) });
        throw toBuckspayError(err);
      }
    },
    async pay(calls: Call[]): Promise<Receipt> {
      const intent = await wrapped.prepare(calls);
      const signed = await wrapped.sign(intent);
      return wrapped.send(signed);
    }
  };

  // Present the wrapper as a BuckspayClient (same public surface).
  const client = Object.assign(Object.create(BuckspayClient.prototype) as BuckspayClient, wrapped);
  return { client, store };
}
