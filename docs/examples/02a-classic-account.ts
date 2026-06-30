// Recipe A - classic wallet account (G...), for users who already have a Stellar wallet.
import { createBuckspayClient, createRpcSimContext, type BuckspayConfig } from "@buckspay/core";
import { classicAccount } from "@buckspay/accounts/classic";
import { walletsKit } from "@buckspay/signers/wallets-kit";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

export const classicConfig: BuckspayConfig = {
  network: "testnet",
  account: classicAccount(),
  signer: walletsKit({ network: "testnet" }),
  relayer: buckspayFacilitator({ url: "/api/gasless", network: "testnet" }),
  gas: { mode: "sponsored" }
};

// connect() resolves the G... address and runs sponsored onboarding (account + USDC trustline) if missing.
export const classicClient = createBuckspayClient(
  classicConfig,
  createRpcSimContext("https://soroban-testnet.stellar.org")
);
