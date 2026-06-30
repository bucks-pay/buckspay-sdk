// Recipe B - passkey smart account (C...), the hero flow. Browser only (uses window).
import { createBuckspayClient, createRpcSimContext, type BuckspayConfig } from "@buckspay/core";
import { ozContractAccount } from "@buckspay/accounts/oz-contract";
import { passkey } from "@buckspay/signers/passkey";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

// Public facilitator sponsor/deployer G-address (derives the deterministic C-address).
const SPONSOR_G: string = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

export const passkeyConfig: BuckspayConfig = {
  network: "testnet",
  account: ozContractAccount({ network: "testnet", sponsorAddress: SPONSOR_G }),
  // create()s a passkey, derives the C-address, deploys the OZ Smart Account sponsored.
  signer: passkey({ rpId: window.location.hostname, rpName: "buckspay" }),
  relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
  gas: { mode: "sponsored" }
};

export const passkeyClient = createBuckspayClient(
  passkeyConfig,
  createRpcSimContext("https://soroban-testnet.stellar.org")
);
