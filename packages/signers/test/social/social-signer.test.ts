import { describe, it, expect } from "vitest";
import { socialSigner } from "../../src/social/index.js";
import { runBuckspaySignerConformance, conformancePreimageXdr } from "../helpers/buckspay-signer-conformance.js";
import { fakeSocialProvider, failingSocialProvider, FAKE_SOCIAL_G } from "../helpers/fake-social-provider.js";

function make() {
  return socialSigner({
    provider: "web3auth",
    clientId: "web3auth-client-id",
    network: "testnet",
    providerImpl: fakeSocialProvider()
  });
}

// Conformance suite (shared with email, sprint-4/02).
runBuckspaySignerConformance({
  label: "socialSigner(web3auth)",
  makeSigner: make,
  expectedType: "social",
  expectedKeyType: "ed25519",
  expectedProvider: "web3auth",
  authenticateParams: { loginProvider: "google" },
  expectedPublicKey: FAKE_SOCIAL_G
});

describe("socialSigner specifics", () => {
  it("rejects an unsupported provider with INVALID_CONFIG", () => {
    // @ts-expect-error — only "web3auth" is valid in v1
    expect(() => socialSigner({ provider: "privy", clientId: "x", network: "testnet" })).toThrowError(
      /unsupported provider/i
    );
  });

  it("rejects a missing clientId with INVALID_CONFIG", () => {
    expect(() =>
      socialSigner({ provider: "web3auth", clientId: "", network: "testnet", providerImpl: fakeSocialProvider() })
    ).toThrowError(/clientId/i);
  });

  it("authenticate() threads through provider params and returns provider expiresAt", async () => {
    const signer = make();
    const details = await signer.authenticate?.({ loginProvider: "apple" });
    expect(details).toEqual({ publicKey: FAKE_SOCIAL_G, provider: "web3auth", expiresAt: 1_900_000_000_000 });
  });

  it("maps a provider/OAuth failure to AUTH_PROVIDER_ERROR", async () => {
    const signer = socialSigner({
      provider: "web3auth",
      clientId: "id",
      network: "testnet",
      providerImpl: failingSocialProvider()
    });
    await expect(signer.authenticate?.({})).rejects.toMatchObject({ code: "AUTH_PROVIDER_ERROR" });
  });

  it("rejects a non-G provider key with AUTH_PROVIDER_ERROR", async () => {
    const signer = socialSigner({
      provider: "web3auth",
      clientId: "id",
      network: "testnet",
      providerImpl: fakeSocialProvider({ connect: async () => ({ publicKey: "0xdead" }) })
    });
    await expect(signer.authenticate?.({})).rejects.toMatchObject({ code: "AUTH_PROVIDER_ERROR" });
  });

  it("rejects a non-64-byte provider signature with AUTH_PROVIDER_ERROR", async () => {
    const signer = socialSigner({
      provider: "web3auth",
      clientId: "id",
      network: "testnet",
      providerImpl: fakeSocialProvider({ signDigest: async () => new Uint8Array(32) })
    });
    await signer.authenticate?.({});
    await expect(
      signer.signAuthEntry({ preimageXdr: conformancePreimageXdr(), network: "testnet", signatureExpirationLedger: 1 })
    ).rejects.toMatchObject({ code: "AUTH_PROVIDER_ERROR" });
  });

  it("signAuthEntry() rejects a malformed preimage with INVALID_CONFIG", async () => {
    const signer = make();
    await signer.authenticate?.({});
    await expect(
      signer.signAuthEntry({ preimageXdr: "!!!not-base64-xdr!!!", network: "testnet", signatureExpirationLedger: 1 })
    ).rejects.toMatchObject({ code: "INVALID_CONFIG" });
  });
});
