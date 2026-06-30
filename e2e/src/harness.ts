import {
  createBuckspayClient,
  createRpcSimContext,
  type AccountModel,
  type BuckspaySigner,
  type GasConfig
} from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { ozContractAccount } from "@buckspay/accounts/oz-contract";
import { policyAccount } from "@buckspay/accounts/policy-account";
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
export function buildClient(model: AccountModel, signerOverride?: BuckspaySigner, gasOverride?: GasConfig) {
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
  // The contract model frames its recording sim with the sponsor's public G-address
  // (must exist on-chain); the classic model ignores simSource (its `from` is a real G).
  const sim = createRpcSimContext(e2eEnv.SOROBAN_RPC_URL, {
    ...(e2eEnv.E2E_SPONSOR_G ? { simSource: e2eEnv.E2E_SPONSOR_G } : {})
  });
  const client = createBuckspayClient(
    {
      network: "testnet",
      account,
      signer,
      relayer,
      // Default sponsored (every SP-1 e2e call site is unchanged); SP-2 gas-in-token passes
      // `{ mode: "token", token }`. `?? ` keeps the key always present (exactOptionalPropertyTypes).
      gas: gasOverride ?? { mode: "sponsored" }
    },
    sim
  );
  return { client, relayer };
}

/**
 * Build a real `BuckspayClient` for the policy session-account model, wired with an ed25519 ROOT
 * signer. `connect()` deploys the sponsored policy account (its `__check_auth` enforces session-key
 * spend/allow-list/expiry policies); `grantSession`/`revokeSession` are root-signed. The `account`
 * adapter is returned so the caller can build a session-key payment directly: the client derives
 * `from` from its signer, but a session pays FROM the account address while signing with the session
 * key, so the payment entry is assembled against the adapter and relayed straight through.
 */
export function buildSessionClient(rootSigner: BuckspaySigner) {
  const relayer = buckspayFacilitator({
    url: e2eEnv.FACILITATOR_URL,
    ...(e2eEnv.FACILITATOR_API_KEY ? { apiKey: e2eEnv.FACILITATOR_API_KEY } : {}),
    network: "testnet"
  });
  const account = policyAccount({
    network: "testnet",
    ...(e2eEnv.E2E_SPONSOR_G ? { sponsorAddress: e2eEnv.E2E_SPONSOR_G } : {})
  });
  const sim = createRpcSimContext(e2eEnv.SOROBAN_RPC_URL, {
    ...(e2eEnv.E2E_SPONSOR_G ? { simSource: e2eEnv.E2E_SPONSOR_G } : {})
  });
  const client = createBuckspayClient(
    { network: "testnet", account, signer: rootSigner, relayer, gas: { mode: "sponsored" } },
    sim
  );
  return { client, relayer, account };
}

/**
 * Build a real pubnet `BuckspayClient` for the guarded mainnet smoke. Distinct from
 * `buildClient` so a testnet run can never accidentally pick up pubnet config. Mainnet
 * is opt-in at three layers: the env gate (MAINNET_ENABLED), `allowMainnet: true` here,
 * and the contract model's pubnet `simSource`. The pubnet RPC is dedicated/consistent.
 */
export function buildMainnetClient(model: AccountModel, signerOverride?: BuckspaySigner, gasOverride?: GasConfig) {
  const relayer = buckspayFacilitator({
    url: e2eEnv.FACILITATOR_URL,
    ...(e2eEnv.FACILITATOR_API_KEY ? { apiKey: e2eEnv.FACILITATOR_API_KEY } : {}),
    network: "pubnet"
  });
  const account =
    model === "classic"
      ? classicAccount()
      : ozContractAccount({
          network: "pubnet",
          ...(e2eEnv.E2E_SPONSOR_G_PUBNET ? { sponsorAddress: e2eEnv.E2E_SPONSOR_G_PUBNET } : {})
        });
  const signer =
    signerOverride ?? (model === "classic" ? walletsKit({ network: "pubnet" }) : passkey({ rpId: e2eEnv.RP_ID }));
  // The contract model frames its recording sim with the sponsor's pubnet G-address.
  const sim = createRpcSimContext(e2eEnv.SOROBAN_RPC_URL_PUBNET ?? "https://mainnet.sorobanrpc.com", {
    ...(e2eEnv.E2E_SPONSOR_G_PUBNET ? { simSource: e2eEnv.E2E_SPONSOR_G_PUBNET } : {})
  });
  const client = createBuckspayClient(
    {
      network: "pubnet",
      account,
      signer,
      relayer,
      gas: gasOverride ?? { mode: "sponsored" },
      // Deliberate, audited mainnet opt-in — without this resolveNetwork() throws.
      allowMainnet: true
    },
    sim
  );
  return { client, relayer };
}
