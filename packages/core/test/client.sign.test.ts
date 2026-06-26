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
    nonce: 5n
  });
  return {
    simulator: { simulate: vi.fn(async () => ({ auth: [recorded.toXDR("base64")], minResourceFee: "1" })) },
    getLatestLedger: vi.fn(async () => 1_000_000),
    randomNonce: () => 5n
  };
}

describe("BuckspayClient.sign", () => {
  it("assembles a SignedIntent carrying the account's signed entry b64", async () => {
    const { config, account, signer } = makeMockConfig();
    const client = new BuckspayClient(config, simContext());
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "1.5" });
    const intent = await client.prepare([call]);
    const signed = await client.sign(intent);

    expect(signed.authorizationEntryXdr.startsWith("signed:")).toBe(true);
    expect(signed.from).toBe(intent.from);
    expect(signed.to).toBe(intent.to);
    expect(signed.value).toBe(intent.value);
    expect(signed.nonce).toBe(intent.nonce);
    expect(signed.signatureExpirationLedger).toBe(intent.signatureExpirationLedger);
    expect(signed.network).toBe("testnet");
    // assemble passed the right expiry + signer to the account
    expect(account.assembleCalls[0]!.signatureExpirationLedger).toBe(intent.signatureExpirationLedger);
    expect(signer.signCalls).toBe(1); // the signer was actually invoked
    // no unsigned-only fields leak through
    expect(signed).not.toHaveProperty("unsignedEntry");
    expect(signed).not.toHaveProperty("preimageXdr");
  });

  it("maps a signer rejection to SIGNATURE_REJECTED", async () => {
    const { config, account } = makeMockConfig();
    account.assembleSignedEntry = vi.fn(async () => {
      throw new Error("User declined the signature request");
    });
    const client = new BuckspayClient(config, simContext());
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "1" });
    const intent = await client.prepare([call]);
    await expect(client.sign(intent)).rejects.toMatchObject({ code: "SIGNATURE_REJECTED" });
  });
});
