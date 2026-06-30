import { Networks, StrKey, hash, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { BuckspayError } from "@buckspay/core";
import type { AssembleInput, Network } from "@buckspay/core";

/**
 * Sign and assemble a policy-account auth entry. Builds the network-scoped HashIDPreimage over the
 * entry, has the root ed25519 signer sign it, then injects a `SigData` scval map ({ signature: 64
 * bytes, signer: 32-byte public key }, sorted keys) into the Address credentials. The signature is
 * verified ON-CHAIN by `__check_auth` — never here.
 */
export async function assemblePolicyEntry(input: AssembleInput): Promise<string> {
  const { unsigned, signer, signatureExpirationLedger, network } = input;
  const creds = unsigned.credentials();
  if (creds.switch().name !== "sorobanCredentialsAddress") {
    throw new BuckspayError("INVALID_CONFIG", "policy-account: unsigned entry must carry Address credentials");
  }

  // Build the preimage BEFORE mutating the credentials (it reads nonce + invocation).
  const preimageXdr = buildPreimage(unsigned, signatureExpirationLedger, network);

  const sig = await signer.signAuthEntry({ preimageXdr, network, signatureExpirationLedger });
  if (sig.signature.length !== 64) {
    throw new BuckspayError(
      "SIGNATURE_REJECTED",
      `policy-account: expected a 64-byte ed25519 signature, got ${String(sig.signature.length)}`
    );
  }
  let signerRaw: Buffer;
  try {
    signerRaw = Buffer.from(StrKey.decodeEd25519PublicKey(sig.publicKey));
  } catch (cause) {
    throw new BuckspayError("SIGNATURE_REJECTED", "policy-account: signer publicKey is not an ed25519 G-address", {
      cause
    });
  }

  // SigData struct → ScMap with canonical sorted symbol keys (signature < signer).
  const sigData = xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: nativeToScVal("signature", { type: "symbol" }),
      val: xdr.ScVal.scvBytes(Buffer.from(sig.signature))
    }),
    new xdr.ScMapEntry({ key: nativeToScVal("signer", { type: "symbol" }), val: xdr.ScVal.scvBytes(signerRaw) })
  ]);

  const addrCreds = creds.address();
  addrCreds.signatureExpirationLedger(signatureExpirationLedger);
  addrCreds.signature(sigData);
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
