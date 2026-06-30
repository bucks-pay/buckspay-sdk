import { Networks, StrKey } from "@stellar/stellar-sdk";
import { BuckspayError } from "@buckspay/core";
import type { BuckspaySigner, Network } from "@buckspay/core";
import { deriveContractAddress } from "../oz-contract/resolveAddress.js";

export interface PolicyAccountOptions {
  /** Sponsor (deployer) address - the facilitator's public sponsor account. Required to derive the
   *  C-address offline (the SDK never holds the sponsor secret). */
  sponsorAddress?: string;
  /** Network whose passphrase folds into the derivation. Defaults to testnet. */
  network?: Network;
  /** Multicall router C-address for atomic batches; defaults to the network's pinned router. */
  multicallContract?: string;
}

/**
 * Resolve the policy account's deterministic C-address. The account is deployed by the sponsor with a
 * salt over the ed25519 root public key - the contract id depends only on (deployer, salt, network), so
 * this reuses the same derivation as the contract/passkey model, keyed by the root raw public key.
 */
export async function resolvePolicyAccountAddress(signer: BuckspaySigner, opts: PolicyAccountOptions): Promise<string> {
  const key = await signer.getPublicKey();
  if (key.type !== "ed25519") {
    throw new BuckspayError("INVALID_CONFIG", "policy-account: requires an ed25519 root signer");
  }
  if (!opts.sponsorAddress) {
    throw new BuckspayError(
      "INVALID_CONFIG",
      "policy-account: resolveAddress needs sponsorAddress for offline derivation; pass policyAccount({ sponsorAddress })"
    );
  }
  const rootRawHex = Buffer.from(StrKey.decodeEd25519PublicKey(key.publicKey)).toString("hex");
  const passphrase = opts.network === "pubnet" ? Networks.PUBLIC : Networks.TESTNET;
  return deriveContractAddress(rootRawHex, opts.sponsorAddress, passphrase);
}
