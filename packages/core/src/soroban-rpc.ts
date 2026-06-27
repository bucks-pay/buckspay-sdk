import { Account, Contract, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import { z } from "zod";
import { BuckspayError } from "./errors";
import {
  getLatestLedger,
  randomNonce as defaultRandomNonce,
  type RpcFetch,
  type SorobanSimulator
} from "./auth-entry-builder";
import type { AccountSimContext } from "./client";
import type { Network } from "./types";

const PASSPHRASE: Record<Network, string> = {
  testnet: Networks.TESTNET,
  pubnet: Networks.PUBLIC
};

/** Shape of a Soroban JSON-RPC `simulateTransaction` response (the fields we use). */
const simulateResponseSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.number(), z.string()]),
  // transport/protocol error
  error: z.object({ code: z.number(), message: z.string() }).optional(),
  result: z
    .object({
      // host error (the simulation itself reverted)
      error: z.string().optional(),
      minResourceFee: z.string().optional(),
      // recording auth entries are returned as base64 XDR strings, already in
      // the exact form SorobanSimulateRaw.auth expects.
      results: z.array(z.object({ auth: z.array(z.string()).optional() })).optional()
    })
    .optional()
});

/**
 * Concrete `SorobanSimulator` backed by a Soroban RPC `simulateTransaction` call.
 *
 * Builds the contract invocation, runs a **recording** simulation, and returns the
 * recorded auth entries (base64) + the min resource fee. Raw `fetch` + zod (no
 * `rpc.Server`/axios) keeps the browser bundle light and mirrors `getLatestLedger`.
 * A reverting simulation maps to `SIMULATION_FAILED`; transport failure to
 * `RELAYER_UNREACHABLE`. `fetchImpl` is injectable for tests.
 */
export function createSorobanSimulator(rpcUrl: string, fetchImpl: RpcFetch = fetch): SorobanSimulator {
  return {
    async simulate({ from, call, network }) {
      const op = new Contract(call.contract).call(call.fn, ...call.args);
      // Recording sim: the source account's sequence is irrelevant.
      const tx = new TransactionBuilder(new Account(from, "0"), {
        fee: "100",
        networkPassphrase: PASSPHRASE[network]
      })
        .addOperation(op)
        .setTimeout(30)
        .build();

      let raw: unknown;
      try {
        const res = await fetchImpl(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "simulateTransaction",
            params: { transaction: tx.toXDR() }
          })
        });
        raw = await res.json();
      } catch (cause) {
        throw new BuckspayError("RELAYER_UNREACHABLE", "Soroban simulate RPC unreachable", { cause });
      }

      const parsed = simulateResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new BuckspayError("SIMULATION_FAILED", "malformed simulateTransaction response", {
          cause: parsed.error
        });
      }
      if (parsed.data.error) {
        throw new BuckspayError("RELAYER_UNREACHABLE", `Soroban RPC: ${parsed.data.error.message}`);
      }
      const result = parsed.data.result;
      if (!result || result.error !== undefined) {
        throw new BuckspayError("SIMULATION_FAILED", result?.error ?? "simulation returned no result");
      }
      return {
        auth: result.results?.[0]?.auth ?? [],
        minResourceFee: result.minResourceFee ?? "0"
      };
    }
  };
}

/**
 * Build the `AccountSimContext` the `BuckspayClient` needs to `prepare`: an
 * RPC-backed recording simulator + a current-ledger source, both pointed at the
 * same Soroban RPC. Pass it as the second argument to `createBuckspayClient` /
 * `createBuckspayConfig`.
 */
export function createRpcSimContext(
  rpcUrl: string,
  deps?: { fetchImpl?: RpcFetch; randomNonce?: () => bigint }
): AccountSimContext {
  return {
    simulator: createSorobanSimulator(rpcUrl, deps?.fetchImpl),
    getLatestLedger: () => getLatestLedger(rpcUrl, deps?.fetchImpl),
    randomNonce: deps?.randomNonce ?? defaultRandomNonce
  };
}
