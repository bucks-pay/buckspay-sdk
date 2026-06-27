import { BuckspayError } from "@buckspay/core";
import type { EnsureReadyInput } from "@buckspay/core";

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
}
