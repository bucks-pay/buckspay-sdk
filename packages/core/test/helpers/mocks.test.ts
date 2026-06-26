import { describe, expect, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { makeMockAccount, makeMockConfig, makeMockRelayer, makeMockSigner } from "./mocks";

describe("test mock ports", () => {
  it("mock signer reports an ed25519 key", async () => {
    const signer = makeMockSigner();
    const key = await signer.getPublicKey();
    expect(key.type).toBe("ed25519");
    expect(key.publicKey).toMatch(/^G/);
  });

  it("mock account builds a real unsigned entry and assembles a signed b64", async () => {
    const account = makeMockAccount();
    const signer = makeMockSigner();
    const from = await account.resolveAddress(signer);
    const entry = account.buildUnsignedEntry({
      from,
      call: { contract: account.sac, fn: "transfer", args: [] },
      nonce: 1n
    });
    expect(entry).toBeInstanceOf(xdr.SorobanAuthorizationEntry);
    const signed = await account.assembleSignedEntry({
      unsigned: entry,
      signer,
      signatureExpirationLedger: 100,
      network: "testnet"
    });
    expect(typeof signed).toBe("string");
  });

  it("mock relayer returns a success receipt and records calls", async () => {
    const relayer = makeMockRelayer();
    const receipt = await relayer.relay({
      token: "C",
      from: "G",
      to: "G2",
      value: "1",
      authorizationEntryXdr: "x",
      nonce: "1",
      signatureExpirationLedger: 1
    });
    expect(receipt.ok).toBe(true);
    expect(relayer.relayCalls).toHaveLength(1);
  });

  it("makeMockConfig assembles a valid BuckspayConfig", () => {
    const { config } = makeMockConfig();
    expect(config.network).toBe("testnet");
    expect(config.gas).toEqual({ mode: "sponsored" });
  });
});
