import { Address, Networks, StrKey, hash, xdr } from "@stellar/stellar-sdk";
import { BuckspayError } from "@buckspay/core";
import type { BuckspaySigner, Network } from "@buckspay/core";

export interface OzContractOptions {
  /** Advisory: pinned OZ Wasm hash (the facilitator enforces the real pin). */
  wasmHash?: string;
  /**
   * Sponsor (deployer) address — the facilitator's public sponsor account. Required to
   * derive the C-address offline (the SDK never holds the sponsor secret). The contract
   * model needs this for `BuckspayClient.connect()` (which calls resolveAddress first).
   */
  sponsorAddress?: string;
  /** Network whose passphrase folds into the derivation. Defaults to testnet. */
  network?: Network;
  /** Multicall router C-address for atomic contract batches. Defaults to the network's
   *  pinned MULTICALL_CONTRACT_ID. Only consulted for calls.length > 1. */
  multicallContract?: string;
}

/**
 * MUST match facilitator `contractSalt`: sha256(pubkeyBytes). Uses the
 * stellar-sdk's isomorphic `hash` (NOT node:crypto) so the SDK runs in the browser —
 * same SHA-256 as the facilitator, so the derivation stays byte-identical.
 */
export function contractSalt(passkeyPublicKey: string): Buffer {
  return Buffer.from(hash(Buffer.from(passkeyPublicKey, "hex")));
}

/**
 * Deterministic C-address from (deployer=sponsor, salt=sha256(pubkey), networkId).
 * BYTE-IDENTICAL to the facilitator's `derivedContractAddress` (validated
 * on-chain): same `ContractIdPreimage::Address` preimage. The contract id depends only
 * on deployer + salt + network — NOT on the Wasm hash or constructor args.
 */
export function deriveContractAddress(
  passkeyPublicKey: string,
  sponsorAddress: string,
  networkPassphrase: string = Networks.TESTNET
): string {
  const networkId = hash(Buffer.from(networkPassphrase));
  const preimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId,
      contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(
        new xdr.ContractIdPreimageFromAddress({
          address: new Address(sponsorAddress).toScAddress(),
          salt: contractSalt(passkeyPublicKey)
        })
      )
    })
  );
  return StrKey.encodeContract(hash(preimage.toXDR()));
}

/**
 * Resolve the passkey contract account's C-address. The SDK holds no sponsor key, so
 * offline derivation needs the (public) sponsor address; the relayer remains
 * authoritative and `ensureReady` re-checks parity against the deployed address.
 */
export async function resolveContractAddress(
  signer: BuckspaySigner,
  opts: OzContractOptions
): Promise<string> {
  const key = await signer.getPublicKey();
  if (key.type !== "secp256r1") {
    throw new BuckspayError("INVALID_CONFIG", "oz-contract: requires a secp256r1 (passkey) signer");
  }
  if (!opts.sponsorAddress) {
    throw new BuckspayError(
      "INVALID_CONFIG",
      "oz-contract: resolveAddress needs sponsorAddress for offline derivation; pass it via ozContractAccount({ sponsorAddress })"
    );
  }
  const passphrase = opts.network === "pubnet" ? Networks.PUBLIC : Networks.TESTNET;
  return deriveContractAddress(key.publicKey, opts.sponsorAddress, passphrase);
}
