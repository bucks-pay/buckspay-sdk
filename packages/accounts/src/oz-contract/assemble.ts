import { Networks, hash, xdr } from "@stellar/stellar-sdk";
import { BuckspayError } from "@buckspay/core";
import type { AssembleInput, Network } from "@buckspay/core";

/**
 * Sign and assemble the contract auth entry. Builds the network-scoped HashIDPreimage
 * over the entry (IDENTICAL to `BuckspayClient.toPreimageXdr` and the on-chain-validated
 * `signContractAuthEntries`), hands it to the passkey signer, then injects the
 * returned `WebAuthnSigData` scval + expiration into the Address credentials. The
 * signature itself is verified ON-CHAIN by `__check_auth` — never here.
 */
export async function assembleContractEntry(input: AssembleInput): Promise<string> {
  const { unsigned, signer, signatureExpirationLedger } = input;
  if (signer.type !== "passkey") {
    throw new BuckspayError("INVALID_CONFIG", "oz-contract: assemble requires a passkey signer");
  }
  const creds = unsigned.credentials();
  if (creds.switch().name !== "sorobanCredentialsAddress") {
    throw new BuckspayError("INVALID_CONFIG", "oz-contract: unsigned entry must carry Address credentials");
  }

  // Build the preimage BEFORE mutating the credentials (it reads nonce + invocation).
  const preimageXdr = buildPreimage(unsigned, signatureExpirationLedger, input.network);

  const sig = await signer.signAuthEntry({
    preimageXdr,
    network: input.network,
    signatureExpirationLedger
  });

  // The passkey Signature.signature is the OZ __check_auth scval bytes. We
  // only decode it to confirm it's a valid ScVal before injecting; we never verify it.
  let sigScval: xdr.ScVal;
  try {
    sigScval = xdr.ScVal.fromXDR(Buffer.from(sig.signature));
  } catch (cause) {
    throw new BuckspayError("INVALID_CONFIG", "oz-contract: passkey signature is not a valid scval", { cause });
  }

  const addrCreds = creds.address();
  addrCreds.signatureExpirationLedger(signatureExpirationLedger);
  addrCreds.signature(sigScval);

  return unsigned.toXDR("base64");
}

function buildPreimage(
  entry: xdr.SorobanAuthorizationEntry,
  signatureExpirationLedger: number,
  network: Network
): string {
  const passphrase = network === "pubnet" ? Networks.PUBLIC : Networks.TESTNET;
  const addrCreds = entry.credentials().address();
  const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
    new xdr.HashIdPreimageSorobanAuthorization({
      networkId: hash(Buffer.from(passphrase)),
      nonce: addrCreds.nonce(),
      signatureExpirationLedger,
      invocation: entry.rootInvocation()
    })
  );
  return preimage.toXDR("base64");
}
