import { describe, it, expect, vi, beforeEach } from "vitest";
import { p256 } from "@noble/curves/p256";
import { sha256 } from "@noble/hashes/sha256";
import { xdr, Address, StrKey } from "@stellar/stellar-sdk";
import { decodeCheckAuthSignature } from "@buckspay/signers/passkey";
import { BuckspayError } from "@buckspay/core";
import type { AuthEntryPayload } from "@buckspay/core";

// Hoisted vi.fn stubs so the vi.mock factory (hoisted above imports) can reference them safely.
// The real P-256 behaviour is wired in beforeEach (which runs after imports, so p256/sha256 exist).
const PasskeyMock = vi.hoisted(() => ({ create: vi.fn(), get: vi.fn() }));
vi.mock("react-native-passkey", () => ({ Passkey: PasskeyMock }));

import { nativePasskey } from "../src/native-passkey";

// ── A deterministic P-256 "authenticator" that mimics react-native-passkey's JSON ──
const PRIV = sha256(new Uint8Array([7]));
const PUB = p256.getPublicKey(PRIV, false); // 65-byte uncompressed 0x04‖X‖Y
const CRED_ID = sha256(PUB).slice(0, 16);
const RP_ID = "buckspay.app";
let derSignature = false;

const b64url = (b: Uint8Array) =>
  Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// COSE_Key EC2 P-256 CBOR map {1:2, 3:-7, -1:1, -2:X, -3:Y}.
function coseKey(): Uint8Array {
  const x = PUB.slice(1, 33),
    y = PUB.slice(33, 65);
  return Uint8Array.from([0xa5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01, 0x21, 0x58, 0x20, ...x, 0x22, 0x58, 0x20, ...y]);
}
function attestedAuthData(rpId: string): Uint8Array {
  const rpIdHash = sha256(new TextEncoder().encode(rpId));
  const fixed = new Uint8Array(37 + 16 + 2);
  fixed.set(rpIdHash, 0);
  fixed[32] = 0x45; // UP | UV | AT
  fixed[37 + 16] = (CRED_ID.length >> 8) & 0xff; // credIdLen hi
  fixed[37 + 16 + 1] = CRED_ID.length & 0xff; // credIdLen lo
  const cose = coseKey();
  const out = new Uint8Array(fixed.length + CRED_ID.length + cose.length);
  out.set(fixed, 0);
  out.set(CRED_ID, fixed.length);
  out.set(cose, fixed.length + CRED_ID.length);
  return out;
}
function assertionAuthData(rpId: string): Uint8Array {
  const ad = new Uint8Array(37);
  ad.set(sha256(new TextEncoder().encode(rpId)), 0);
  ad[32] = 0x05; // UP | UV
  return ad;
}

// A minimal real HashIDPreimage so signAuthEntry's `sha256(preimage.toXDR())` is genuine.
function preimageXdr(): string {
  const C = StrKey.encodeContract(Buffer.alloc(32, 3));
  return xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
    new xdr.HashIdPreimageSorobanAuthorization({
      networkId: Buffer.alloc(32, 9),
      nonce: xdr.Int64.fromString("123"),
      signatureExpirationLedger: 1000,
      invocation: new xdr.SorobanAuthorizedInvocation({
        function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
          new xdr.InvokeContractArgs({
            contractAddress: new Address(C).toScAddress(),
            functionName: "transfer",
            args: []
          })
        ),
        subInvocations: []
      })
    })
  ).toXDR("base64");
}
const payload: AuthEntryPayload = {
  preimageXdr: preimageXdr(),
  network: "testnet",
  signatureExpirationLedger: 1000
};

beforeEach(() => {
  derSignature = false;
  PasskeyMock.create.mockReset();
  PasskeyMock.get.mockReset();
  PasskeyMock.create.mockImplementation(() =>
    Promise.resolve({
      id: b64url(CRED_ID),
      rawId: b64url(CRED_ID),
      response: { authenticatorData: b64url(attestedAuthData(RP_ID)) }
    })
  );
  PasskeyMock.get.mockImplementation(({ challenge }: { challenge: string }) => {
    const authenticatorData = assertionAuthData(RP_ID);
    const clientDataJSON = new TextEncoder().encode(
      JSON.stringify({ type: "webauthn.get", challenge, origin: `https://${RP_ID}` })
    );
    const msg = new Uint8Array(authenticatorData.length + 32);
    msg.set(authenticatorData, 0);
    msg.set(sha256(clientDataJSON), authenticatorData.length);
    const sig = p256.sign(sha256(msg), PRIV, { lowS: true });
    const sigBytes = derSignature ? sig.toDERRawBytes() : sig.toCompactRawBytes();
    return Promise.resolve({
      id: b64url(CRED_ID),
      rawId: b64url(CRED_ID),
      response: {
        authenticatorData: b64url(authenticatorData),
        clientDataJSON: b64url(clientDataJSON),
        signature: b64url(sigBytes)
      }
    });
  });
});

describe("nativePasskey", () => {
  it("requires an rpId", () => {
    expect(() => nativePasskey({ rpId: "" })).toThrowError(/rpId/i);
  });

  it("has signer type 'passkey' (the OZ contract account binds it identically to web)", () => {
    expect(nativePasskey({ rpId: RP_ID }).type).toBe("passkey");
  });

  it("getPublicKey returns a 65-byte uncompressed secp256r1 key (COSE→0x04‖X‖Y)", async () => {
    const key = await nativePasskey({ rpId: RP_ID }).getPublicKey();
    expect(key.type).toBe("secp256r1");
    expect(key.publicKey).toHaveLength(130); // 65 bytes hex
    expect(key.publicKey.startsWith("04")).toBe(true);
    expect(PasskeyMock.create).toHaveBeenCalledOnce();
  });

  it("signAuthEntry yields the OZ WebAuthnSigData scval with a 64-byte raw r‖s signature", async () => {
    const signer = nativePasskey({ rpId: RP_ID });
    await signer.getPublicKey(); // bind the pubkey first (web parity)
    const sig = await signer.signAuthEntry(payload);
    expect(sig.signature).toBeInstanceOf(Uint8Array);
    expect(sig.publicKey).toHaveLength(130);
    const parts = decodeCheckAuthSignature(sig.signature);
    expect(parts.signature.length).toBe(64); // raw r‖s, not DER
    expect(parts.authenticatorData.length).toBeGreaterThan(0);
    expect(parts.clientDataJSON.length).toBeGreaterThan(0);
  });

  it("normalizes a DER authenticator signature to raw r‖s (reused web pipeline)", async () => {
    derSignature = true; // platform returns DER this time
    const signer = nativePasskey({ rpId: RP_ID });
    await signer.getPublicKey();
    const sig = await signer.signAuthEntry(payload);
    expect(decodeCheckAuthSignature(sig.signature).signature.length).toBe(64);
  });

  it("maps a user cancellation to BuckspayError SIGNATURE_REJECTED (no swallow)", async () => {
    const signer = nativePasskey({ rpId: RP_ID });
    await signer.getPublicKey();
    PasskeyMock.get.mockRejectedValue(new Error("UserCancelled"));
    await expect(signer.signAuthEntry(payload)).rejects.toBeInstanceOf(BuckspayError);
    await expect(signer.signAuthEntry(payload)).rejects.toMatchObject({ code: "SIGNATURE_REJECTED" });
  });
});
