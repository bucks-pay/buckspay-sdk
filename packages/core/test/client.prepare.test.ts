import { describe, expect, it, vi } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { BuckspayClient } from "../src/client";
import { buildUnsignedEntry } from "../src/auth-entry-builder";
import { makeMockConfig, MOCK_FROM, MOCK_SAC, MOCK_TO } from "./helpers/mocks";

function simContext(recordedNonce: bigint) {
  const recorded = buildUnsignedEntry({
    sac: MOCK_SAC,
    from: MOCK_FROM,
    to: MOCK_TO,
    stroops: 15_000_000n,
    nonce: recordedNonce
  });
  return {
    simulator: { simulate: vi.fn(async () => ({ auth: [recorded.toXDR("base64")], minResourceFee: "100" })) },
    getLatestLedger: vi.fn(async () => 1_000_000),
    randomNonce: () => recordedNonce
  };
}

describe("BuckspayClient.prepare", () => {
  it("builds a PreparedIntent with unsigned entry, preimage, and +60 expiry", async () => {
    const { config } = makeMockConfig();
    const ctx = simContext(7n);
    const client = new BuckspayClient(config, ctx);
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "1.5" });
    const intent = await client.prepare([call]);

    expect(intent.from).toBe(MOCK_FROM);
    expect(intent.token).toBe(MOCK_SAC);
    expect(intent.value).toBe("15000000");
    expect(intent.nonce).toBe("7");
    expect(intent.network).toBe("testnet");
    expect(intent.signatureExpirationLedger).toBe(1_000_060); // latest + 60
    expect(intent.unsignedEntry).toBeInstanceOf(xdr.SorobanAuthorizationEntry);
    expect(typeof intent.preimageXdr).toBe("string");
    expect(ctx.simulator.simulate).toHaveBeenCalledOnce();
  });

  it("rejects an empty calls array with INVALID_CONFIG", async () => {
    const { config } = makeMockConfig();
    const client = new BuckspayClient(config, simContext(1n));
    await client.connect();
    await expect(client.prepare([])).rejects.toMatchObject({ code: "INVALID_CONFIG" });
  });

  it("propagates SIMULATION_FAILED when the simulator throws", async () => {
    const { config } = makeMockConfig();
    const ctx = simContext(1n);
    ctx.simulator.simulate = vi.fn(async () => {
      throw new Error("revert");
    });
    const client = new BuckspayClient(config, ctx);
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "1" });
    await expect(client.prepare([call])).rejects.toMatchObject({ code: "SIMULATION_FAILED" });
  });
});
