import { describe, it, expect, vi } from "vitest";
import { Address, Keypair, nativeToScVal, Networks, StrKey, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { createSorobanSimulator, createRpcSimContext } from "../src/soroban-rpc";
import type { RpcFetch } from "../src/auth-entry-builder";
import type { Call } from "../src/types";

const FROM = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 5)).publicKey();
const TO = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 6)).publicKey();
const SAC = StrKey.encodeContract(Buffer.alloc(32, 33));

const call: Call = {
  contract: SAC,
  fn: "transfer",
  args: [
    new Address(FROM).toScVal(),
    new Address(TO).toScVal(),
    nativeToScVal(15_000_000n, { type: "i128" })
  ]
};

// Contract/passkey model: `from` is a C-address (which can't source a transaction).
const C_FROM = StrKey.encodeContract(Buffer.alloc(32, 9));
const SPONSOR = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 7)).publicKey();
const contractCall: Call = {
  contract: SAC,
  fn: "transfer",
  args: [
    new Address(C_FROM).toScVal(),
    new Address(TO).toScVal(),
    nativeToScVal(15_000_000n, { type: "i128" })
  ]
};

function jsonRpc(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

describe("createSorobanSimulator", () => {
  it("POSTs simulateTransaction and returns the recorded auth + minResourceFee", async () => {
    const fetchMock = vi
      .fn<RpcFetch>()
      .mockResolvedValue(
        jsonRpc({ jsonrpc: "2.0", id: 1, result: { minResourceFee: "1234", results: [{ auth: ["AAAAauth"] }] } })
      );
    const sim = createSorobanSimulator("https://rpc.test", fetchMock);
    const out = await sim.simulate({ from: FROM, call, network: "testnet" });
    expect(out).toEqual({ auth: ["AAAAauth"], minResourceFee: "1234" });

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    const [url, init] = firstCall!;
    expect(url).toBe("https://rpc.test");
    const sent = JSON.parse(init.body as string) as {
      method: string;
      params: { transaction: string };
    };
    expect(sent.method).toBe("simulateTransaction");
    expect(typeof sent.params.transaction).toBe("string"); // base64 tx envelope XDR
    expect(sent.params.transaction.length).toBeGreaterThan(0);
  });

  it("maps a reverting simulation (result.error) to SIMULATION_FAILED", async () => {
    const fetchMock = vi
      .fn<RpcFetch>()
      .mockResolvedValue(jsonRpc({ jsonrpc: "2.0", id: 1, result: { error: "HostError: balance too low" } }));
    const sim = createSorobanSimulator("https://rpc.test", fetchMock);
    await expect(sim.simulate({ from: FROM, call, network: "testnet" })).rejects.toMatchObject({
      code: "SIMULATION_FAILED"
    });
  });

  it("maps a transport failure to RELAYER_UNREACHABLE", async () => {
    const fetchMock = vi.fn<RpcFetch>().mockRejectedValue(new TypeError("fetch failed"));
    const sim = createSorobanSimulator("https://rpc.test", fetchMock);
    await expect(sim.simulate({ from: FROM, call, network: "testnet" })).rejects.toMatchObject({
      code: "RELAYER_UNREACHABLE"
    });
  });

  it("defaults minResourceFee to '0' and auth to [] when absent", async () => {
    const fetchMock = vi.fn<RpcFetch>().mockResolvedValue(jsonRpc({ jsonrpc: "2.0", id: 1, result: {} }));
    const sim = createSorobanSimulator("https://rpc.test", fetchMock);
    expect(await sim.simulate({ from: FROM, call, network: "testnet" })).toEqual({
      auth: [],
      minResourceFee: "0"
    });
  });

  it("frames a contract-model (C-address) sim with the funded simSource G-address", async () => {
    const fetchMock = vi
      .fn<RpcFetch>()
      .mockResolvedValue(jsonRpc({ jsonrpc: "2.0", id: 1, result: { minResourceFee: "1", results: [{ auth: [] }] } }));
    const sim = createSorobanSimulator("https://rpc.test", fetchMock, SPONSOR);
    await sim.simulate({ from: C_FROM, call: contractCall, network: "testnet" });

    // A C-address can't source a tx; the recording sim must be framed by the sponsor G.
    const [, init] = fetchMock.mock.calls[0]!;
    const sent = JSON.parse(init.body as string) as { params: { transaction: string } };
    const tx = TransactionBuilder.fromXDR(sent.params.transaction, Networks.TESTNET);
    expect(tx).toBeInstanceOf(Transaction);
    expect((tx as Transaction).source).toBe(SPONSOR);
  });

  it("throws INVALID_CONFIG for a contract-model sim when simSource is missing", async () => {
    const fetchMock = vi.fn<RpcFetch>();
    const sim = createSorobanSimulator("https://rpc.test", fetchMock);
    await expect(sim.simulate({ from: C_FROM, call: contractCall, network: "testnet" })).rejects.toMatchObject({
      code: "INVALID_CONFIG"
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("createRpcSimContext", () => {
  it("wires the simulator + getLatestLedger + randomNonce at one rpc url", async () => {
    const fetchMock = vi
      .fn<RpcFetch>()
      .mockResolvedValue(jsonRpc({ jsonrpc: "2.0", id: 1, result: { sequence: 555 } }));
    const ctx = createRpcSimContext("https://rpc.test", { fetchImpl: fetchMock, randomNonce: () => 42n });
    expect(typeof ctx.simulator.simulate).toBe("function");
    expect(ctx.randomNonce?.()).toBe(42n);
    expect(await ctx.getLatestLedger()).toBe(555);
  });
});
