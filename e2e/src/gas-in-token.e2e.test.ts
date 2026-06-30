import { describe, it, expect } from "vitest";
import { Keypair, hash, xdr } from "@stellar/stellar-sdk";
import type { AuthEntryPayload, BuckspaySigner, Signature, SignerKey } from "@buckspay/core";
import { buildClient } from "./harness.js";
import { E2E_ENABLED, e2eEnv } from "./env.js";

/** Deterministic Ed25519 signer over a pre-funded testnet payer (test-runner only). */
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
  E2E_ENABLED &&
  !!e2eEnv.FACILITATOR_API_KEY &&
  !!e2eEnv.E2E_USDC_TESTNET_SAC &&
  !!e2eEnv.E2E_MERCHANT_G &&
  !!e2eEnv.E2E_PAYER_SECRET;

describe.skipIf(!READY)("gas-in-token transfer (testnet)", () => {
  it("pays 0.01 USDC with gas ALSO paid in USDC (single forward() entry)", async () => {
    const usdc = e2eEnv.E2E_USDC_TESTNET_SAC!;
    const { client } = buildClient("classic", ed25519Signer(e2eEnv.E2E_PAYER_SECRET!), {
      mode: "token",
      token: usdc
    });

    const wallet = await client.connect();
    expect(wallet.model).toBe("classic");

    const call = client.transfer({ token: usdc, to: e2eEnv.E2E_MERCHANT_G!, amount: "0.01" });
    // pay() = prepare (feeQuote → ONE FeeForwarder forward(payer,token,merchant,payment,collector,fee)
    // entry, payment + gas-fee in one invocation) → sign the single entry (+feeToken) → relay.
    const receipt = await client.pay([call]);

    expect(receipt.ok).toBe(true);
    expect(receipt.via).toBe("buckspay_self");
    expect(receipt.chain).toBe("stellar-testnet");
    expect(receipt.transferTx).toMatch(/^[0-9a-f]{64}$/);
    expect(["success", "pending"]).toContain(receipt.status);
  });
});
