import assert from "node:assert/strict";
import { Horizon, Keypair, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import { loadSpikeConfig, TESTNET } from "./config.js";
import { getLatestLedger, randomNonce, toStroops } from "./auth-entry.js";
import { signTransferAuthLocal } from "./sign-local.js";
import { FacilitatorClient } from "./facilitator.js";

function log(step: string, detail?: Record<string, unknown>): void {
  // Never log raw secrets; addresses are truncated to avoid PII-in-logs (README §3).
  const safe = detail
    ? Object.fromEntries(
        Object.entries(detail).map(([k, v]) =>
          typeof v === "string" && /^[GC][A-Z2-7]{55}$/.test(v) ? [k, `${v.slice(0, 4)}…${v.slice(-4)}`] : [k, v]
        )
      )
    : undefined;
  console.log(`[spike] ${step}`, safe ?? "");
}

async function main(): Promise<void> {
  const cfg = loadSpikeConfig();
  const payer = Keypair.fromSecret(cfg.PAYER_SECRET);
  const from = payer.publicKey();
  const to = cfg.RECIPIENT_PUBLIC_KEY;

  const client = new FacilitatorClient({
    baseUrl: cfg.FACILITATOR_URL,
    apiKey: cfg.FACILITATOR_API_KEY,
    chain: TESTNET.facilitatorChain
  });
  const horizon = new Horizon.Server(cfg.HORIZON_URL);

  // 1. Account readiness: ensure payer exists + has a USDC trustline (sponsored onboarding).
  log("checking payer account state", { from });
  let state = await client.getAccountState(from);
  assert.ok(state.exists, "payer account must exist on testnet — fund PAYER via Friendbot first");
  if (!state.hasUsdcTrustline) {
    log("payer lacks USDC trustline → onboarding (sponsored)", { from });
    const built = await client.onboardBuild(from);
    if (!built.nothingToDo) {
      assert.ok(built.unsignedTxXdr, "onboard build must return an unsigned tx");
      const tx = signOnboardTx(built.unsignedTxXdr, payer);
      const submitted = await client.onboardSubmit(from, tx);
      assert.ok(submitted.ok, "onboard submit must succeed");
      log("onboarding submitted", { txHash: submitted.txHash });
    }
    state = await client.getAccountState(from);
  }
  assert.ok(state.hasUsdcTrustline, "payer must have a USDC trustline after onboarding");

  // 2. Build + sign the transfer auth entry (local ed25519 stand-in for the wallet).
  const stroops = toStroops("0.1", TESTNET.usdcDecimals);
  const nonce = randomNonce();
  const currentLedger = await getLatestLedger(cfg.SOROBAN_RPC_URL);
  const signatureExpirationLedger = currentLedger + TESTNET.expirationLedgerWindow;
  log("building + signing transfer auth", { value: stroops.toString(), signatureExpirationLedger });

  const payload = await signTransferAuthLocal({
    payer,
    networkPassphrase: TESTNET.networkPassphrase,
    sac: cfg.USDC_SAC,
    to,
    stroops,
    nonce,
    signatureExpirationLedger
  });
  assert.equal(payload.from, from);
  assert.equal(payload.token, cfg.USDC_SAC);

  // 3. Relay through the facilitator.
  log("relaying", { token: payload.token, to });
  const receipt = await client.relay(payload);

  // 4. Assert the Receipt shape + on-chain success.
  assert.equal(receipt.ok, true, `relay not ok: ${JSON.stringify(receipt)}`);
  assert.ok(["success", "pending"].includes(receipt.status), `unexpected status ${receipt.status}`);
  assert.ok(receipt.transferTx.length > 0, "receipt must carry a transferTx hash");
  log("receipt received", { via: receipt.via, status: receipt.status, transferTx: receipt.transferTx });

  // 5. Confirm on-chain via Horizon (independent of the facilitator's own poll).
  const confirmed = await confirmOnChain(horizon, receipt.transferTx);
  assert.ok(confirmed, `transfer ${receipt.transferTx} not confirmed successful on Horizon`);

  log("SPIKE GREEN — classic relay confirmed on-chain", { transferTx: receipt.transferTx });
  console.log(
    `\nExplorer: https://stellar.expert/explorer/testnet/tx/${receipt.transferTx}\n` +
      "→ Fill OBSERVATIONS.md and proceed to Sprint 1."
  );
}

/** Sign the sponsor-authored onboarding tx with the payer (the user side of the sandwich). */
function signOnboardTx(unsignedTxXdr: string, payer: Keypair): string {
  const tx = TransactionBuilder.fromXDR(unsignedTxXdr, Networks.TESTNET);
  tx.sign(payer);
  return tx.toXDR();
}

async function confirmOnChain(horizon: Horizon.Server, hash: string, attempts = 20): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const tx = (await horizon.transactions().transaction(hash).call()) as unknown as {
        successful: boolean;
      };
      return tx.successful;
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      throw err;
    }
  }
  return false;
}

main().catch((err: unknown) => {
  console.error("[spike] FAILED:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
