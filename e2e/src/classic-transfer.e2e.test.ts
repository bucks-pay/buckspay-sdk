import { describe, it, expect } from "vitest";
import { Keypair, hash, xdr } from "@stellar/stellar-sdk";
import type { AuthEntryPayload, BuckspaySigner, Signature, SignerKey } from "@buckspay/core";
import { buildClient } from "./harness.js";
import { E2E_ENABLED, e2eEnv } from "./env.js";

/**
 * Deterministic Ed25519 signer over a pre-funded testnet keypair. The classic path
 * normally signs in a browser wallet (Wallets Kit); this test double implements the
 * same `BuckspaySigner` contract so node CI can drive prepare → sign → send unattended.
 * It signs sha256(HashIDPreimage XDR), exactly as Soroban auth verifies.
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

const READY =
  E2E_ENABLED && !!e2eEnv.E2E_PAYER_SECRET && !!e2eEnv.E2E_USDC_TESTNET_SAC && !!e2eEnv.E2E_MERCHANT_G;

describe.skipIf(!READY)("classic transfer (testnet)", () => {
  it("connects, transfers 0.01 USDC gasless, settles", async () => {
    const payer = Keypair.fromSecret(e2eEnv.E2E_PAYER_SECRET!).publicKey();
    const { client } = buildClient("classic", ed25519Signer(e2eEnv.E2E_PAYER_SECRET!));

    const wallet = await client.connect();
    expect(wallet.address).toBe(payer);

    const call = client.transfer({
      token: e2eEnv.E2E_USDC_TESTNET_SAC!,
      to: e2eEnv.E2E_MERCHANT_G!,
      amount: "0.01"
    });
    const receipt = await client.pay([call]);

    expect(receipt.ok).toBe(true);
    expect(receipt.via).toBe("buckspay_self");
    expect(receipt.chain).toBe("stellar-testnet");
    expect(receipt.transferTx).toMatch(/^[0-9a-f]{64}$/);
    expect(["success", "pending"]).toContain(receipt.status);
  });
});
