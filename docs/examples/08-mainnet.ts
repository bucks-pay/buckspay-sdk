// Recipe 08 — MAINNET (pubnet) gasless USDC, contract/passkey account. Browser only.
//
// Mainnet is gated: it runs ONLY because `allowMainnet: true` is set in config (the
// browser opt-in, equivalent to Node `BUCKSPAY_ALLOW_MAINNET=1`). Without it,
// constructing the client on "pubnet" throws BuckspayError("INVALID_CONFIG").
import {
  createBuckspayClient,
  mainnetSimContext,
  type BuckspayConfig
} from "@buckspay/core";
import { ozContractAccount } from "@buckspay/accounts/oz-contract";
import { passkey } from "@buckspay/signers/passkey";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

// The facilitator sponsor's PUBLIC G-address (used to derive the C-address AND to frame
// the recording sim on pubnet). PUBLIC only — the sponsor secret lives in the facilitator.
const SPONSOR_G: string = "GDVEU3DD4KOFECV66VIHWEZOYX4ZKR3WV27L464SIIPOU2IUI3JCZA57";
// Mainnet USDC SAC (C-address). Differs per network — the caller passes it; the SDK is asset-agnostic.
const USDC_SAC_PUBNET: string = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7EQI5VS577FRESC2GUDOAAEZ3";
const MERCHANT: string = "GAMX62ZD4FWIKMWGVPEDR6WNL2TYTPQMO2ZJEAZUAON7VCZ5G2GWDF7W";
const SOROBAN_RPC_PUBNET = "https://mainnet.sorobanrpc.com";

export const mainnetConfig: BuckspayConfig = {
  network: "pubnet",
  // Explicit browser opt-in — without this, the client refuses to construct on pubnet.
  allowMainnet: true,
  account: ozContractAccount({ network: "pubnet", sponsorAddress: SPONSOR_G }),
  signer: passkey({ rpId: window.location.hostname, rpName: "buckspay" }),
  // url points at YOUR backend, which forwards to the facilitator with the key server-side.
  relayer: buckspayFacilitator({ url: "/api/gasless", network: "pubnet" }),
  gas: { mode: "sponsored" }
};

export const mainnetClient = createBuckspayClient(
  mainnetConfig,
  // Contract model on pubnet MUST carry the funded sponsor G as `simSource`; this preset forces it.
  mainnetSimContext(SOROBAN_RPC_PUBNET, { sponsorAddress: SPONSOR_G })
);

export async function payOnMainnet(): Promise<void> {
  await mainnetClient.connect(); // derive C-address + ensureReady (sponsored deploy if needed)
  const call = mainnetClient.transfer({ token: USDC_SAC_PUBNET, to: MERCHANT, amount: "1.50" });
  const receipt = await mainnetClient.pay([call]); // prepare → sign → send
  console.log(receipt.transferTx); // settled on pubnet
}
