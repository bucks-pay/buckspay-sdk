import { describe, it, expect } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { spendLimit, allowlist } from "@buckspay/accounts/policy";
import { buildMainnetClient } from "./harness.js";
import { MAINNET_ENABLED, e2eEnv } from "./env.js";
import { softwarePasskeySigner } from "./software-passkey.js";

// Serial + tolerant: pubnet RPC is eventually-consistent; vitest.config has fileParallelism:false.
// NOTE for the pubnet runner: the session leg (grantSession) settles only on the policy-account
// contract (which implements add_signer/__check_auth policy enforcement) — the OZ passkey account
// has no add_signer. Wire the policy-account model + an ed25519 root when running this for real; the
// batch + gas-in-token legs are model-agnostic. The flow below is the composition under test.
describe.skipIf(!MAINNET_ENABLED)("cross-feature (MAINNET smoke): session + batch + gas-in-token", () => {
  it("grants a session, then pays an atomic batch with gas in USDC — tiny amounts", async () => {
    const usdc = e2eEnv.E2E_USDC_PUBNET_SAC!;
    const merchant = e2eEnv.E2E_MERCHANT_G_PUBNET!;
    const sessionKp = Keypair.fromSecret(e2eEnv.E2E_SESSION_SECRET_PUBNET!);

    // Contract model (sessions + Multicall are contract-only). Gas paid in USDC (token mode).
    const rootSigner = await softwarePasskeySigner(e2eEnv.RP_ID);
    const { client } = buildMainnetClient("contract", rootSigner, { mode: "token", token: usdc });

    const wallet = await client.connect();
    expect(wallet.model).toBe("contract");

    // 1) SESSION — spend-limit + allowlist, installed via the gated relay (root authorizes once).
    const { session, receipt: grantReceipt } = await client.grantSession({
      sessionKey: { type: "ed25519", publicKey: sessionKp.publicKey() },
      policies: [
        spendLimit({ token: usdc, max: "0.001", period: "day" }), // 10000 stroops/day ceiling
        allowlist([usdc])
      ],
      expiresAt: Date.now() + 3_600_000
    });
    expect(grantReceipt.ok).toBe(true);
    expect(session.account).toBe(wallet.address);

    // 2) ATOMIC BATCH paying GAS IN USDC — two tiny transfers, all-or-nothing.
    const a = client.transfer({ token: usdc, to: merchant, amount: "0.0001" }); // 1000 stroops
    const b = client.transfer({ token: usdc, to: merchant, amount: "0.0001" });
    const receipt = await client.sendCalls([a, b]);

    expect(receipt.ok).toBe(true);
    expect(receipt.chain).toBe("stellar-pubnet");
    expect(receipt.transferTx).toMatch(/^[0-9a-f]{64}$/);
    expect(["success", "pending"]).toContain(receipt.status);
  });
});
