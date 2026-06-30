// Onboarding - read account state first, then connect() materializes it (sponsored).
import type { AccountState } from "@buckspay/core";
import { classicClient } from "./02a-classic-account.js";

export async function ensureOnboarded(address: string): Promise<void> {
  const state: AccountState = await classicClient.getAccountState(address);
  // For classic: missing account or no USDC trustline -> connect() runs the sponsored
  // sandwich (createAccount + changeTrust), the sponsor covers the XLM reserves (CAP-0033).
  if (!state.exists || !state.hasUsdcTrustline) {
    await classicClient.connect();
  }
  // For the contract model, connect() deploys the OZ Smart Account sponsored instead.
}

export function describeState(state: AccountState): string {
  const xlm = state.xlmBalance ?? "0";
  const usdc = state.usdcBalance ?? "0";
  return `exists=${String(state.exists)} trustline=${String(state.hasUsdcTrustline)} xlm=${xlm} usdc=${usdc}`;
}
