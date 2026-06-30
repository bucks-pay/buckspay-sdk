import { describe, it, expect } from "vitest";
import { Keypair, hash, xdr } from "@stellar/stellar-sdk";
import type { AuthEntryPayload, BuckspaySigner, Signature, SignerKey } from "@buckspay/core";
import { buildMainnetClient } from "./harness.js";
import { MAINNET_ENABLED, e2eEnv } from "./env.js";

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
// fileParallelism:false so this never races the other mainnet smokes.
describe.skipIf(!MAINNET_ENABLED)("gas-in-token transfer (MAINNET smoke)", () => {
  it("pays 0.0001 USDC with gas ALSO paid in USDC on pubnet, settles", async () => {
    const usdc = e2eEnv.E2E_USDC_PUBNET_SAC!;
    const payer = Keypair.fromSecret(e2eEnv.E2E_PAYER_SECRET_PUBNET!).publicKey();
    const { client } = buildMainnetClient("classic", ed25519Signer(e2eEnv.E2E_PAYER_SECRET_PUBNET!), {
      mode: "token",
      token: usdc
    });

    const wallet = await client.connect();
    expect(wallet.address).toBe(payer);

    const call = client.transfer({
      token: usdc,
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
