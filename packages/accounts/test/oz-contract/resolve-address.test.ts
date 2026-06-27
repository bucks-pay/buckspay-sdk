import { describe, it, expect } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { resolveContractAddress, deriveContractAddress } from "../../src/oz-contract/resolveAddress.js";

const PUBKEY = "04" + "ab".repeat(64);
const SPONSOR = Keypair.random().publicKey(); // valid G-address (the public sponsor/deployer)

const fakeSigner = {
  type: "passkey" as const,
  async getPublicKey() {
    return { type: "secp256r1" as const, publicKey: PUBKEY };
  },
  async signAuthEntry() {
    throw new Error("not used");
  }
};

describe("resolveContractAddress", () => {
  it("derives offline when sponsorAddress is provided, deterministically", async () => {
    const addr = await resolveContractAddress(fakeSigner, { sponsorAddress: SPONSOR, wasmHash: "cd".repeat(32) });
    expect(addr).toMatch(/^C[A-Z2-7]{55}$/);
    expect(addr).toBe(deriveContractAddress(PUBKEY, SPONSOR));
  });

  it("derives a different C for a different sponsor (deployer-bound)", () => {
    const other = Keypair.random().publicKey();
    expect(deriveContractAddress(PUBKEY, SPONSOR)).not.toBe(deriveContractAddress(PUBKEY, other));
  });

  it("requires a secp256r1 signer", async () => {
    const bad = {
      ...fakeSigner,
      async getPublicKey() {
        return { type: "ed25519" as const, publicKey: Keypair.random().publicKey() };
      }
    };
    await expect(resolveContractAddress(bad, { sponsorAddress: SPONSOR })).rejects.toMatchObject({
      code: "INVALID_CONFIG"
    });
  });

  it("throws INVALID_CONFIG when no sponsorAddress is available for offline derivation", async () => {
    await expect(resolveContractAddress(fakeSigner, {})).rejects.toMatchObject({ code: "INVALID_CONFIG" });
  });
});
