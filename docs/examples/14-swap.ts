// Recipe 14 - SWAP (STRETCH, optional). Gasless token swap via the facilitator's existing
// /swap rail. NOTE: this is the first feature cut if the cycle tightens - the core surface does
// NOT depend on it. The submit leg uses the EVM wallet typed-data signature through your BFF.
import { createBuckspayClient, createRpcSimContext, type SwapQuote } from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { walletsKit } from "@buckspay/signers/wallets-kit";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

const client = createBuckspayClient(
  {
    network: "testnet",
    account: classicAccount(),
    signer: walletsKit({ network: "testnet" }),
    // `swapChain` enables quoteSwap/swap; without it the relayer omits them (fails closed).
    relayer: buckspayFacilitator({
      url: "/api/gasless", // your BFF - the facilitator API key stays server-side
      network: "testnet",
      swapChain: "base-sepolia"
    }),
    gas: { mode: "sponsored" }
  },
  createRpcSimContext("https://soroban-testnet.stellar.org")
);

export async function quoteOnly(): Promise<SwapQuote> {
  await client.connect();
  // quoteSwap is signer-agnostic and works end-to-end today.
  return client.quoteSwap({
    tokenIn: "0xSellTokenAddress",
    tokenOut: "0xBuyTokenAddress",
    amount: "1000000"
  });
}

export async function swapWithFloor(): Promise<void> {
  await client.connect();
  // minOut is enforced BEFORE any submit; a below-floor quote throws SWAP_FAILED.
  const receipt = await client.swap({
    tokenIn: "0xSellTokenAddress",
    tokenOut: "0xBuyTokenAddress",
    amount: "1000000",
    minOut: "985000"
  });
  console.log(receipt.transferTx);
}
