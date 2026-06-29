import { describe, it, expect } from "vitest";
import { Keypair, hash, xdr } from "@stellar/stellar-sdk";
import type { AuthEntryPayload, BuckspaySigner, Signature, SignerKey } from "@buckspay/core";
import { buildMainnetClient } from "./harness.js";
import { MAINNET_ENABLED, e2eEnv } from "./env.js";

/**
 * Deterministic Ed25519 signer over a pre-funded PUBNET keypair (test-runner only).
 * Identical contract to the testnet classic signer: signs sha256(HashIDPreimage XDR),
 * exactly as Soroban auth verifies. The pubnet passphrase is bound inside the preimage,
 * so no network-specific signer code is needed.
 */
function ed25519Signer(secret: string): BuckspaySigner {
  const kp = Keypair.fromSecret(secret);
  return {
    type: "wallets-kit",
    async getPublicKey(): Promise<SignerKey> {
      return { type: "ed25519", publicKey: kp.publicKey() };
    },
    async signAuthEntry(p: AuthEntryPayload): Promise<Signature> {
      const preimage = xdr.HashIdPreimage.fromXDR(p.preimageXdr, "base64");
      const sig = kp.sign(hash(preimage.toXDR()));
      return { signature: new Uint8Array(sig), publicKey: kp.publicKey() };
    }
  };
}

// Serial + tolerant: pubnet RPC is eventually-consistent; vitest.config has
// fileParallelism:false so this never races the contract-mainnet smoke.
describe.skipIf(!MAINNET_ENABLED)("classic transfer (MAINNET smoke)", () => {
  it("connects, transfers 0.0001 USDC gasless on pubnet, settles", async () => {
    const payer = Keypair.fromSecret(e2eEnv.E2E_PAYER_SECRET_PUBNET!).publicKey();
    const { client } = buildMainnetClient("classic", ed25519Signer(e2eEnv.E2E_PAYER_SECRET_PUBNET!));

    const wallet = await client.connect();
    expect(wallet.address).toBe(payer);

    const call = client.transfer({
      token: e2eEnv.E2E_USDC_PUBNET_SAC!,
      to: e2eEnv.E2E_MERCHANT_G_PUBNET!,
      amount: "0.0001" // TINY — 1000 stroops at 7 decimals
    });
    const receipt = await client.pay([call]);

    expect(receipt.ok).toBe(true);
    expect(receipt.via).toBe("buckspay_self");
    expect(receipt.chain).toBe("stellar-pubnet");
    expect(receipt.transferTx).toMatch(/^[0-9a-f]{64}$/);
    expect(["success", "pending"]).toContain(receipt.status);
  });
});
