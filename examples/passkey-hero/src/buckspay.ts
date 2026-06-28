import { ozContractAccount } from "@buckspay/accounts/oz-contract";
import { passkey } from "@buckspay/signers/passkey";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";
import { createRpcSimContext, type AccountSimContext, type BuckspayConfig } from "@buckspay/core";

// Public facilitator sponsor/deployer G-address (needed to derive the C-address offline).
const SPONSOR = import.meta.env.VITE_SPONSOR_G as string;
const SOROBAN_RPC = (import.meta.env.VITE_SOROBAN_RPC as string | undefined) ?? "https://soroban-testnet.stellar.org";

/**
 * Browser build: NO apiKey on the relayer. Authenticated onboard/deploy/relay go to
 * the same-origin `/facilitator` path, which the Vite dev proxy forwards with the
 * server-side `x-api-key` — the key never enters the bundle.
 */
export const config: BuckspayConfig = {
  network: "testnet",
  account: ozContractAccount({ network: "testnet", sponsorAddress: SPONSOR }),
  signer: passkey({ rpId: window.location.hostname, rpName: "buckspay hero demo" }),
  relayer: buckspayFacilitator({ url: "/facilitator", network: "testnet" }),
  gas: { mode: "sponsored" }
};

// prepare() needs a recording simulator over the Soroban RPC.
export const sim: AccountSimContext = createRpcSimContext(SOROBAN_RPC);
