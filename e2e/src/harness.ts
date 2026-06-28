import { createBuckspayClient, createRpcSimContext, type AccountModel, type BuckspaySigner } from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { ozContractAccount } from "@buckspay/accounts/oz-contract";
import { walletsKit } from "@buckspay/signers/wallets-kit";
import { passkey } from "@buckspay/signers/passkey";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";
import { e2eEnv } from "./env.js";

/**
 * Build a real `BuckspayClient` wired to the live testnet facilitator, exactly as a
 * third-party dev would. `prepare()` needs a recording simulator, so we wire the RPC
 * sim context (the plan omits it → pay() would throw "no simulation context wired").
 *
 * For unattended node e2e the caller injects a deterministic signer (Tasks 3-4); for
 * config tests the default wallets-kit/passkey signers are enough to assert assembly.
 */
export function buildClient(model: AccountModel, signerOverride?: BuckspaySigner) {
  const relayer = buckspayFacilitator({
    url: e2eEnv.FACILITATOR_URL,
    // The server-side test runner may supply the key; the browser demo never does.
    ...(e2eEnv.FACILITATOR_API_KEY ? { apiKey: e2eEnv.FACILITATOR_API_KEY } : {}),
    network: "testnet"
  });
  const account =
    model === "classic"
      ? classicAccount()
      : ozContractAccount({
          network: "testnet",
          ...(e2eEnv.E2E_SPONSOR_G ? { sponsorAddress: e2eEnv.E2E_SPONSOR_G } : {})
        });
  const signer =
    signerOverride ?? (model === "classic" ? walletsKit({ network: "testnet" }) : passkey({ rpId: e2eEnv.RP_ID }));
  const sim = createRpcSimContext(e2eEnv.SOROBAN_RPC_URL);
  const client = createBuckspayClient(
    {
      network: "testnet",
      account,
      signer,
      relayer,
      gas: { mode: "sponsored" }
    },
    sim
  );
  return { client, relayer };
}
