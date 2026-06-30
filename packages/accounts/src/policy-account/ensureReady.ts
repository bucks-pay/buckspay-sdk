import { BuckspayError } from "@buckspay/core";
import type { EnsureReadyInput } from "@buckspay/core";

/**
 * Ensure the policy account exists on-chain. If the relayer reports it deployed, no-op; otherwise
 * deploy it (sponsored) via the relayer, binding the ed25519 root public key, and verify the deployed
 * address matches the offline-derived one. The relayer must support session-account deploys.
 */
export async function ensurePolicyAccountReady(input: EnsureReadyInput): Promise<void> {
  const { address, relayer, signer } = input;
  const state = await relayer.getAccountState(address);
  if (state.exists) return;

  if (!relayer.deploySessionAccount) {
    throw new BuckspayError(
      "ACCOUNT_NOT_READY",
      "policy-account: the relayer cannot deploy a session account (deploySessionAccount is not implemented)"
    );
  }
  const key = await signer.getPublicKey();
  const { address: deployed } = await relayer.deploySessionAccount({ rootPublicKey: key.publicKey });
  if (deployed !== address) {
    throw new BuckspayError(
      "ACCOUNT_NOT_READY",
      `policy-account: deployed address ${deployed} != derived ${address} (salt/derivation mismatch)`
    );
  }
}
