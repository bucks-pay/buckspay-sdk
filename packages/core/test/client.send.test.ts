import { describe, expect, it, vi } from "vitest";
import { BuckspayClient } from "../src/client";
import { buildUnsignedEntry } from "../src/auth-entry-builder";
import { makeMockConfig, MOCK_FROM, MOCK_SAC, MOCK_TO } from "./helpers/mocks";

function simContext() {
  const recorded = buildUnsignedEntry({
    sac: MOCK_SAC,
    from: MOCK_FROM,
    to: MOCK_TO,
    stroops: 15_000_000n,
    nonce: 9n
  });
  return {
    simulator: { simulate: vi.fn(async () => ({ auth: [recorded.toXDR("base64")], minResourceFee: "1" })) },
    getLatestLedger: vi.fn(async () => 1_000_000),
    randomNonce: () => 9n
  };
}

describe("BuckspayClient.send / pay", () => {
  it("send projects the engine payload and relays it, returning the receipt", async () => {
    const { config, relayer } = makeMockConfig();
    const client = new BuckspayClient(config, simContext());
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "1.5" });
    const intent = await client.prepare([call]);
    const signed = await client.sign(intent);
    const receipt = await client.send(signed);

    expect(receipt.ok).toBe(true);
    expect(receipt.transferTx).toBe("abc123");
    expect(relayer.relayCalls).toHaveLength(1);
    const payload = relayer.relayCalls[0]!;
    expect(payload).toEqual({
      token: signed.token,
      from: signed.from,
      to: signed.to,
      value: signed.value,
      authorizationEntryXdr: signed.authorizationEntryXdr,
      nonce: signed.nonce,
      signatureExpirationLedger: signed.signatureExpirationLedger
    });
    expect(payload).not.toHaveProperty("network");
  });

  it("pay runs prepare -> sign -> send end to end", async () => {
    const { config, relayer, signer } = makeMockConfig();
    const client = new BuckspayClient(config, simContext());
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "2" });
    const receipt = await client.pay([call]);

    expect(receipt.ok).toBe(true);
    expect(relayer.relayCalls).toHaveLength(1);
    expect(signer.signCalls).toBe(1);
  });

  it("maps a relayer failure to RELAYER_REJECTED", async () => {
    const { config, relayer } = makeMockConfig();
    relayer.relay = vi.fn(async () => {
      throw new Error("value_exceeds_max");
    });
    const client = new BuckspayClient(config, simContext());
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "1" });
    await expect(client.pay([call])).rejects.toMatchObject({ code: "RELAYER_REJECTED" });
  });
});
