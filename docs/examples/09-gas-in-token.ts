// Recipe 09 - GAS IN TOKEN. The payer pays Soroban gas in USDC instead of XLM. The SDK does NOT relay
// the direct transfer - it relays a SINGLE FeeForwarder `forward(payer, token, merchant, payment,
// collector, fee)` invocation that pays the merchant AND the relayer's gas in one auth entry, so the
// user signs ONCE. Sponsored mode (recipe 03) needs none of this; this is the opt-in for "the user holds
// USDC but no XLM".
import { createBuckspayClient, createRpcSimContext, type BuckspayConfig } from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { walletsKit } from "@buckspay/signers/wallets-kit";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

// Testnet USDC SAC (C-address). The caller passes it; the SDK is asset-agnostic. The fee token here is the
// SAME USDC the user transfers - they pay both the value and the gas in it.
const USDC_SAC_TESTNET: string = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const MERCHANT: string = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

export const tokenGasConfig: BuckspayConfig = {
  network: "testnet",
  account: classicAccount(),
  signer: walletsKit({ network: "testnet" }),
  // url points at YOUR backend, which forwards to the facilitator with the key server-side.
  relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
  // Pay gas in USDC. prepare() quotes the fee + forwarder + collector, builds ONE forward() entry, and
  // refuses a quote above `maxFee` (stroops) with BuckspayError("TOKEN_GAS_REJECTED").
  gas: { mode: "token", token: USDC_SAC_TESTNET, maxFee: "2000000" } // 0.2 USDC ceiling
};

export const tokenGasClient = createBuckspayClient(
  tokenGasConfig,
  createRpcSimContext("https://soroban-testnet.stellar.org")
);

export async function payGasInUsdc(): Promise<void> {
  await tokenGasClient.connect();
  const call = tokenGasClient.transfer({ token: USDC_SAC_TESTNET, to: MERCHANT, amount: "1.50" });
  // prepare -> feeQuote -> build the single forward() entry -> sign once -> relay. Settles on testnet.
  const receipt = await tokenGasClient.pay([call]);
  console.log(receipt.transferTx);
}
