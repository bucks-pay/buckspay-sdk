import { describe, it, expect } from "vitest";
import { buildClient } from "./harness.js";
import { E2E_ENABLED, e2eEnv } from "./env.js";
import { softwarePasskeySigner } from "./software-passkey.js";

const READY =
  E2E_ENABLED &&
  !!e2eEnv.FACILITATOR_API_KEY &&
  !!e2eEnv.E2E_SPONSOR_G &&
  !!e2eEnv.E2E_USDC_TESTNET_SAC &&
  !!e2eEnv.E2E_MERCHANT_G;

describe.skipIf(!READY)("contract+passkey transfer (testnet)", () => {
  it("creates passkey, deploys sponsored C-account, transfers 0.01 USDC gasless", async () => {
    const signer = await softwarePasskeySigner(e2eEnv.RP_ID);
    const { client } = buildClient("contract", signer);

    const wallet = await client.connect(); // deploys the OZ C-account (sponsored)
    expect(wallet.model).toBe("contract");
    expect(wallet.address).toMatch(/^C[A-Z2-7]{55}$/);

    const state = await wallet.getState();
    expect(state.exists).toBe(true);

    const call = client.transfer({
      token: e2eEnv.E2E_USDC_TESTNET_SAC!,
      to: e2eEnv.E2E_MERCHANT_G!,
      amount: "0.01"
    });
    const receipt = await client.pay([call]);
    expect(receipt.ok).toBe(true);
    expect(receipt.transferTx).toMatch(/^[0-9a-f]{64}$/);
  });
});
