import { passkey, type WebAuthnLike } from "@buckspay/signers/passkey";
import type { BuckspaySigner } from "@buckspay/core";

/**
 * TEST HARNESS DOUBLE (e2e only, never SDK code). A software secp256r1 authenticator
 * that lets node CI run the passkey ceremony unattended.
 *
 * CORRECTNESS: we do NOT hand-roll the `__check_auth` signature (the plan's draft signed
 * the raw preimage and returned DER — which the on-chain verifier rejects). Instead we
 * implement the public `WebAuthnLike` seam with Web Crypto and feed it to the REAL
 * `passkey()` signer, so the actual SDK code path (challenge = sha256(preimage),
 * sha256(authData ‖ sha256(clientData)) signing, DER/raw → low-S, WebAuthnSigData scval)
 * is what runs. The real browser ceremony is exercised by Playwright (Task 6).
 */
function b64url(b: Uint8Array): string {
  return Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function softwareWebAuthn(): Promise<WebAuthnLike> {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", publicKey)); // 65-byte uncompressed 0x04‖X‖Y
  const credentialId = new Uint8Array(await crypto.subtle.digest("SHA-256", raw)).slice(0, 16);
  return {
    async create() {
      return { publicKey: raw, credentialId };
    },
    async get({ rpId, challenge }) {
      const rpIdHash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rpId)));
      const authenticatorData = new Uint8Array(37);
      authenticatorData.set(rpIdHash, 0);
      authenticatorData[32] = 0x05; // UP | UV
      const clientDataJSON = new TextEncoder().encode(
        JSON.stringify({ type: "webauthn.get", challenge: b64url(challenge), origin: `https://${rpId}` })
      );
      const clientHash = new Uint8Array(await crypto.subtle.digest("SHA-256", clientDataJSON));
      const message = new Uint8Array(authenticatorData.length + clientHash.length);
      message.set(authenticatorData, 0);
      message.set(clientHash, authenticatorData.length);
      // Web Crypto ECDSA returns raw r‖s (IEEE-P1363, 64 bytes), possibly high-S;
      // passkey()'s toRawLowS normalizes it. No DER here.
      const signature = new Uint8Array(
        await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, message)
      );
      return { authenticatorData, clientDataJSON, signature, credentialId };
    }
  };
}

export async function softwarePasskeySigner(rpId: string): Promise<BuckspaySigner> {
  return passkey({ rpId, webauthn: await softwareWebAuthn() });
}
