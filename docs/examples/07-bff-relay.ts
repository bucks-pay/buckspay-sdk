// SERVER-ONLY — this file holds the facilitator API key. NEVER import it in a browser
// bundle. It is the BFF boundary: the browser POSTs a SignedIntent here; this validates
// and forwards to the facilitator with the secret key server-side.
import { createBuckspayClient, createRpcSimContext, type Receipt, type SignedIntent } from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { walletsKit } from "@buckspay/signers/wallets-kit";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

// account/signer are unused by send() (the intent is already signed); only the relayer
// (with the server-side key) and gas engine matter here.
const server = createBuckspayClient(
  {
    network: "testnet",
    account: classicAccount(),
    signer: walletsKit({ network: "testnet" }),
    relayer: buckspayFacilitator({
      url: process.env.FACILITATOR_URL ?? "http://localhost:3000",
      // server-side secret — never shipped to the browser
      ...(process.env.FACILITATOR_API_KEY ? { apiKey: process.env.FACILITATOR_API_KEY } : {}),
      network: "testnet"
    }),
    gas: { mode: "sponsored" }
  },
  createRpcSimContext(process.env.SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org")
);

/** BFF handler: validate business rules, then relay. `RelayPayload` is byte-identical to the legacy body. */
export async function bffRelay(signed: SignedIntent): Promise<Receipt> {
  // ... your business validation: intent exists / not expired / amount tolerance / sponsorship budget ...
  return server.send(signed);
}
