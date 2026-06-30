// Importing @buckspay/react-native first runs its polyfill side effect (Hermes Buffer /
// getRandomValues / TextEncoder) before @stellar/stellar-sdk is touched below.
import { nativePasskey, expoSecureStore } from "@buckspay/react-native";
import { createRpcSimContext, type BuckspayConfig } from "@buckspay/core";
import { ozContractAccount } from "@buckspay/accounts/oz-contract";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

// The facilitator sponsor's PUBLIC G-address (derives the C-address; frames the recording sim).
const SPONSOR_G = "GDKACWHUTPRUFHENFT56SL7XPM5FJU25DARE76OG43Q73XCATTUX4RPI";
// Testnet USDC SAC (C…), caller-supplied — the SDK is asset-agnostic.
export const USDC_SAC = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
export const MERCHANT = "GBPYQYRH62E6NLRGXHBT4I3ZPTEHVBQMYTSH44YLOAPTCDYNAXDOLJRY";
// The app's OWN backend (BFF) — it forwards to the facilitator with the API key server-side.
const BFF_RELAY_URL = "https://your-app.example/api/gasless";
const SOROBAN_RPC = "https://soroban-testnet.stellar.org";
// rpId MUST equal the Associated Domain (iOS) / Digital Asset Links host (Android) of the app.
const RP_ID = "your-app.example";

// Secure storage for the scoped session blob (serializeSession), never the root key.
export const sessionStore = expoSecureStore();

export const config: BuckspayConfig = {
  network: "testnet",
  account: ozContractAccount({ network: "testnet", sponsorAddress: SPONSOR_G }),
  signer: nativePasskey({ rpId: RP_ID, rpName: "Buckspay Demo" }),
  relayer: buckspayFacilitator({ url: BFF_RELAY_URL, network: "testnet" }),
  gas: { mode: "sponsored" }
};

export const sim = createRpcSimContext(SOROBAN_RPC, { simSource: SPONSOR_G });
