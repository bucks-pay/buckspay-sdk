// Quickstart - classic gasless USDC transfer (browser; NO apiKey).
import { createBuckspayClient, createRpcSimContext } from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { walletsKit } from "@buckspay/signers/wallets-kit";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

const USDC_SAC: string = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const MERCHANT: string = "GA6HCMBLTZS5VYYBCATRBR5VBZJEH5C2OON6XQGB3RNYDDAQ7JZ65YQH";

export async function quickstart(): Promise<void> {
  const buckspay = createBuckspayClient(
    {
      network: "testnet",
      account: classicAccount(),
      signer: walletsKit({ network: "testnet" }),
      // url points at YOUR backend, which forwards to the facilitator with the key server-side.
      relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
      gas: { mode: "sponsored" }
    },
    // prepare() simulates against the Soroban RPC.
    createRpcSimContext("https://soroban-testnet.stellar.org")
  );

  await buckspay.connect(); // wallet + ensureReady
  const call = buckspay.transfer({ token: USDC_SAC, to: MERCHANT, amount: "1.50" });
  const receipt = await buckspay.pay([call]); // prepare -> sign -> send
  console.log(receipt.transferTx); // settled on testnet
}
