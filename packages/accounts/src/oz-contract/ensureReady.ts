import { BuckspayError } from "@buckspay/core";
import type { EnsureReadyInput, Relayer } from "@buckspay/core";

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Ensure the passkey contract account is deployed. If `getAccountState` reports it's
 * not on-chain, deploy it via the relayer (server-side sponsor pays). Enforces that
 * the relayer-deployed C-address equals the client-derived one — the SDK never signs
 * against an address it didn't derive itself.
 */
export async function ensureContractReady(input: EnsureReadyInput): Promise<void> {
  const { address, relayer, signer } = input;
  const state = await relayer.getAccountState(address);
  if (state.exists) return;

  const key = await signer.getPublicKey();
  if (key.type !== "secp256r1") {
    throw new BuckspayError("INVALID_CONFIG", "oz-contract: ensureReady requires a secp256r1 signer");
  }

  let deployed: { address: string };
  try {
    deployed = await relayer.deployContract({ passkeyPublicKey: key.publicKey });
  } catch (cause) {
    throw new BuckspayError("ACCOUNT_NOT_READY", "oz-contract: smart-account deploy failed", { cause });
  }

  if (deployed.address !== address) {
    throw new BuckspayError(
      "ACCOUNT_NOT_READY",
      `oz-contract: relayer deployed ${deployed.address} but client derived ${address} — salt/deployer mismatch`
    );
  }

  // The deploy confirmed on-chain, but Soroban RPC indexes the new contract-data entry
  // with a brief lag. Poll until the account is queryable so connect() guarantees a ready
  // account — otherwise a caller's immediate getState()/pay() would see exists:false.
  await waitForMaterialization(relayer, address);
}

async function waitForMaterialization(relayer: Relayer, address: string, attempts = 10): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    const s = await relayer.getAccountState(address);
    if (s.exists) return;
    await sleep(1000);
  }
  throw new BuckspayError(
    "ACCOUNT_NOT_READY",
    `oz-contract: deploy confirmed but ${address} not queryable after ${attempts}s (RPC indexing lag)`
  );
}
