import { describe, expect, it, vi } from "vitest";
import { createSorobanSimulator } from "../src/soroban-rpc";
import { mainnetSimContext } from "../src/soroban-rpc";
import { StrKey, Keypair } from "@stellar/stellar-sdk";
import type { Call } from "../src/types";

// A contract-model `from` is a C-address; the recording sim cannot frame a tx with it
// and must fall back to a funded G-address `simSource` (the sponsor's public key).
const CONTRACT_FROM = StrKey.encodeContract(Buffer.alloc(32, 33));
const SPONSOR_G = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 99)).publicKey();
const USDC_SAC = StrKey.encodeContract(Buffer.alloc(32, 44));

const transferCall: Call = { contract: USDC_SAC, fn: "transfer", args: [] };

describe("mainnet contract-model simSource enforcement", () => {
  it("without simSource the contract-model sim throws INVALID_CONFIG", async () => {
    // fetch must never be reached — the guard trips before any RPC call.
    const fetchImpl = vi.fn();
    const sim = createSorobanSimulator("https://soroban.example", fetchImpl as never);
    await expect(
      sim.simulate({ from: CONTRACT_FROM, call: transferCall, network: "pubnet" })
    ).rejects.toMatchObject({ code: "INVALID_CONFIG" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("mainnetSimContext threads sponsorAddress through as simSource (no INVALID_CONFIG)", async () => {
    // A fetch double that returns a minimal valid simulateTransaction result.
    const fetchImpl = vi.fn(async () => ({
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        result: { minResourceFee: "100", results: [{ auth: [] }] }
      })
    }));
    const ctx = mainnetSimContext("https://soroban.example", {
      sponsorAddress: SPONSOR_G,
      fetchImpl: fetchImpl as never
    });
    const out = await ctx.simulator.simulate({
      from: CONTRACT_FROM,
      call: transferCall,
      network: "pubnet"
    });
    expect(out.minResourceFee).toBe("100");
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("mainnetSimContext is just createRpcSimContext with simSource set", () => {
    const ctx = mainnetSimContext("https://soroban.example", { sponsorAddress: SPONSOR_G });
    expect(typeof ctx.simulator.simulate).toBe("function");
    expect(typeof ctx.getLatestLedger).toBe("function");
    expect(typeof ctx.randomNonce).toBe("function");
  });
});
