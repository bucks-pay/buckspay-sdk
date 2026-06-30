import { p256 } from "@noble/curves/p256";
import { sha256 } from "@noble/hashes/sha256";
import { BuckspayError } from "@buckspay/core";
import { coseToUncompressed, extractCoseKey } from "./cose.js";

export interface CreateInput {
  rpId: string;
  rpName: string;
  userName: string;
  challenge: Uint8Array;
}
export interface CreateOutput {
  /** 65-byte uncompressed secp256r1 public key (0x04 ‖ X ‖ Y). */
  publicKey: Uint8Array;
  credentialId: Uint8Array;
}
export interface GetInput {
  rpId: string;
  challenge: Uint8Array;
  credentialId?: Uint8Array;
}
export interface GetOutput {
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
  /** DER (real authenticator) OR raw r‖s (software impl) signature. */
  signature: Uint8Array;
  credentialId: Uint8Array;
}
export interface WebAuthnLike {
  create(input: CreateInput): Promise<CreateOutput>;
  get(input: GetInput): Promise<GetOutput>;
}

/** Real implementation backed by the browser. Throws if no navigator.credentials. */
export function defaultWebAuthn(): WebAuthnLike {
  return {
    async create({ rpId, rpName, userName, challenge }) {
      if (typeof navigator === "undefined" || !navigator.credentials) {
        throw new BuckspayError("INVALID_CONFIG", "passkey: WebAuthn unavailable (no navigator.credentials)");
      }
      let cred: PublicKeyCredential | null;
      try {
        cred = (await navigator.credentials.create({
          publicKey: {
            rp: { id: rpId, name: rpName },
            user: { id: new TextEncoder().encode(userName), name: userName, displayName: userName },
            challenge: challenge as BufferSource,
            pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256 = secp256r1
            authenticatorSelection: { residentKey: "required", userVerification: "required" },
            timeout: 60_000
          }
        })) as PublicKeyCredential | null;
      } catch (err) {
        throw new BuckspayError("SIGNATURE_REJECTED", "passkey: credential creation rejected", { cause: err });
      }
      if (!cred) throw new BuckspayError("SIGNATURE_REJECTED", "passkey: no credential returned");
      const att = cred.response as AuthenticatorAttestationResponse;
      const cose = extractCoseKey(new Uint8Array(att.getAuthenticatorData()));
      return { publicKey: coseToUncompressed(cose), credentialId: new Uint8Array(cred.rawId) };
    },
    async get({ rpId, challenge, credentialId }) {
      if (typeof navigator === "undefined" || !navigator.credentials) {
        throw new BuckspayError("INVALID_CONFIG", "passkey: WebAuthn unavailable");
      }
      let cred: PublicKeyCredential | null;
      try {
        cred = (await navigator.credentials.get({
          publicKey: {
            rpId,
            challenge: challenge as BufferSource,
            userVerification: "required",
            ...(credentialId
              ? { allowCredentials: [{ type: "public-key" as const, id: credentialId as BufferSource }] }
              : {}),
            timeout: 60_000
          }
        })) as PublicKeyCredential | null;
      } catch (err) {
        throw new BuckspayError("SIGNATURE_REJECTED", "passkey: assertion rejected", { cause: err });
      }
      if (!cred) throw new BuckspayError("SIGNATURE_REJECTED", "passkey: no assertion returned");
      const r = cred.response as AuthenticatorAssertionResponse;
      return {
        authenticatorData: new Uint8Array(r.authenticatorData),
        clientDataJSON: new Uint8Array(r.clientDataJSON),
        signature: new Uint8Array(r.signature),
        credentialId: new Uint8Array(cred.rawId)
      };
    }
  };
}

/**
 * Deterministic SOFTWARE secp256r1 authenticator for tests. Reproduces the exact
 * WebAuthn assertion construction the contract verifies on-chain:
 * authenticatorData = sha256(rpId) ‖ UP|UV ‖ counter, and the assertion signs
 * sha256(authenticatorData ‖ sha256(clientDataJSON)) as raw r‖s low-S.
 *
 * Test-only: the private key is seed-derived and this factory is never reached on the
 * production path (it requires explicit injection via `passkey({ webauthn })`). It is
 * tree-shaken from the production bundle (nothing in the entry graph imports it).
 */
export function softwareWebAuthn(opts: { seed?: number } = {}): WebAuthnLike {
  const priv = sha256(new Uint8Array([opts.seed ?? 1]));
  const pub = p256.getPublicKey(priv, false); // uncompressed 65 bytes
  const credentialId = sha256(pub).slice(0, 16);
  return {
    async create() {
      return { publicKey: pub, credentialId };
    },
    async get({ rpId, challenge }) {
      const rpIdHash = sha256(new TextEncoder().encode(rpId));
      const authenticatorData = new Uint8Array(37);
      authenticatorData.set(rpIdHash, 0);
      authenticatorData[32] = 0x05; // UP | UV
      const clientDataJSON = new TextEncoder().encode(
        JSON.stringify({ type: "webauthn.get", challenge: b64url(challenge), origin: `https://${rpId}` })
      );
      const clientDataHash = sha256(clientDataJSON);
      const message = new Uint8Array(authenticatorData.length + clientDataHash.length);
      message.set(authenticatorData, 0);
      message.set(clientDataHash, authenticatorData.length);
      const sig = p256.sign(sha256(message), priv, { lowS: true });
      return {
        authenticatorData,
        clientDataJSON,
        signature: sig.toCompactRawBytes(), // raw r‖s, 64 bytes, low-S
        credentialId
      };
    }
  };
}

function b64url(b: Uint8Array): string {
  return Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
