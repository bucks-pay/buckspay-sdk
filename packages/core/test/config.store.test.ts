import { describe, expect, it, vi } from "vitest";
import { createBuckspayClient, createBuckspayConfig } from "../src/config";
import { BuckspayClient } from "../src/client";
import { buildUnsignedEntry } from "../src/auth-entry-builder";
import { BuckspayError } from "../src/errors";
import { makeMockConfig, MOCK_FROM, MOCK_SAC, MOCK_TO } from "./helpers/mocks";

function simContext() {
  const recorded = buildUnsignedEntry({
    sac: MOCK_SAC,
    from: MOCK_FROM,
    to: MOCK_TO,
    stroops: 15_000_000n,
    nonce: 3n
  });
  return {
    simulator: { simulate: vi.fn(async () => ({ auth: [recorded.toXDR("base64")], minResourceFee: "1" })) },
    getLatestLedger: vi.fn(async () => 1_000_000),
    randomNonce: () => 3n
  };
}

describe("createBuckspayClient / createBuckspayConfig", () => {
  it("createBuckspayClient returns a BuckspayClient", () => {
    const { config } = makeMockConfig();
    expect(createBuckspayClient(config)).toBeInstanceOf(BuckspayClient);
  });

  it("store starts idle with null fields", () => {
    const { config } = makeMockConfig();
    const { store } = createBuckspayConfig(config);
    expect(store.getState()).toEqual({ status: "idle", address: null, receipt: null, error: null });
  });

  it("connect drives connecting -> ready and records the address", async () => {
    const { config } = makeMockConfig();
    const { client, store } = createBuckspayConfig(config, simContext());
    const seen: string[] = [];
    store.subscribe((s) => seen.push(s.status));
    await client.connect();
    expect(seen).toContain("connecting");
    expect(store.getState().status).toBe("ready");
    expect(store.getState().address).toBe(MOCK_FROM);
  });

  it("pay drives signing -> relaying -> success and stores the receipt", async () => {
    const { config } = makeMockConfig();
    const { client, store } = createBuckspayConfig(config, simContext());
    const seen: string[] = [];
    store.subscribe((s) => seen.push(s.status));
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "1.5" });
    const receipt = await client.pay([call]);
    expect(receipt.ok).toBe(true);
    expect(seen).toEqual(expect.arrayContaining(["signing", "relaying", "success"]));
    expect(store.getState().status).toBe("success");
    expect(store.getState().receipt?.transferTx).toBe("abc123");
  });

  it("a failure sets status=error and stores a BuckspayError, then re-throws", async () => {
    const { config, relayer } = makeMockConfig();
    relayer.relay = vi.fn(async () => {
      throw new Error("value_exceeds_max");
    });
    const { client, store } = createBuckspayConfig(config, simContext());
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "1" });
    await expect(client.pay([call])).rejects.toBeInstanceOf(BuckspayError);
    expect(store.getState().status).toBe("error");
    expect(store.getState().error).toBeInstanceOf(BuckspayError);
    expect(store.getState().error?.code).toBe("RELAYER_REJECTED");
  });
});
