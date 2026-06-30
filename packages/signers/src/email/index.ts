// @buckspay/signers/email — email/OTP signer.
//
// `emailSigner({ proxyUrl, network })` returns a `BuckspaySigner` (type "email") plus a
// `requestOtp(email)` helper. The OTP-derived Stellar ed25519 key is custodied SERVER-SIDE
// by the facilitator (`POST /auth/email`) and reached only through the app's signer-proxy:
//   - requestOtp(email)            → proxy { action: "issue",  email }
//   - authenticate({ email, otp }) → proxy { action: "verify", email, otp } → { publicKey, sessionToken }
//   - signAuthEntry(payload)       → proxy { action: "sign", sessionToken, preimageXdr } → { signature }
// The private key NEVER reaches this bundle; the signer holds only the public key, an opaque
// session token, and the returned 64-byte signatures.
import { z } from "zod";
import { BuckspayError } from "@buckspay/core";
import type { AuthDetails, AuthEntryPayload, BuckspaySigner, Network, Signature, SignerKey } from "@buckspay/core";

type FetchLike = (
  input: string,
  init: { method: "POST"; headers: Record<string, string>; body: string }
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export interface EmailSignerOptions {
  proxyUrl: string;
  network: Network;
}
export interface EmailSignerDeps {
  /** Test seam: inject fetch (defaults to global fetch). */
  fetchImpl?: FetchLike;
}
export interface EmailSigner extends BuckspaySigner {
  /** Trigger the OTP issue step (sends the code to `email`). */
  requestOtp(email: string): Promise<void>;
}

const verifyResponseSchema = z.object({
  ok: z.literal(true),
  publicKey: z.string().regex(/^G[A-Z2-7]{55}$/, "expected a Stellar G-address"),
  sessionToken: z.string().min(1),
  expiresAt: z.number().int().positive().optional()
});
const signResponseSchema = z.object({
  ok: z.literal(true),
  signature: z
    .string()
    .regex(/^[A-Za-z0-9+/]+=*$/, "expected base64")
    .min(1)
});

export function emailSigner(opts: EmailSignerOptions, deps: EmailSignerDeps = {}): EmailSigner {
  if (!opts.proxyUrl || opts.proxyUrl.trim() === "") {
    throw new BuckspayError("INVALID_CONFIG", "emailSigner: proxyUrl is required (the OTP backend is server-side only)");
  }
  const proxyUrl = opts.proxyUrl;
  // Global fetch's Response structurally satisfies FetchLike's { ok, status, json } — no cast needed.
  const doFetch: FetchLike = deps.fetchImpl ?? ((input, init) => fetch(input, init));

  let connectedKey: string | null = null;
  let sessionToken: string | null = null;

  async function post(body: Record<string, unknown>): Promise<unknown> {
    let res: Awaited<ReturnType<FetchLike>>;
    try {
      res = await doFetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch (cause) {
      throw new BuckspayError("AUTH_PROVIDER_ERROR", "email signer-proxy is unreachable", { cause });
    }
    let data: unknown;
    try {
      data = await res.json();
    } catch (cause) {
      throw new BuckspayError("AUTH_PROVIDER_ERROR", "email signer-proxy returned non-JSON", { cause });
    }
    if (!res.ok) {
      throw new BuckspayError(
        "AUTH_PROVIDER_ERROR",
        `email signer-proxy rejected the request (HTTP ${String(res.status)})`
      );
    }
    return data;
  }

  return {
    type: "email",

    async requestOtp(email: string): Promise<void> {
      if (!email || email.trim() === "") {
        throw new BuckspayError("INVALID_CONFIG", "emailSigner.requestOtp: email is required");
      }
      await post({ action: "issue", email });
    },

    async authenticate(params?: Record<string, unknown>): Promise<AuthDetails> {
      const email = typeof params?.email === "string" ? params.email : "";
      const otp = typeof params?.otp === "string" ? params.otp : "";
      if (email === "" || otp === "") {
        throw new BuckspayError(
          "INVALID_CONFIG",
          "emailSigner.authenticate: { email, otp } are required (call requestOtp first)"
        );
      }
      const data = await post({ action: "verify", email, otp });
      const parsed = verifyResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new BuckspayError("AUTH_PROVIDER_ERROR", "email signer-proxy returned an invalid verify response", {
          cause: parsed.error
        });
      }
      connectedKey = parsed.data.publicKey;
      sessionToken = parsed.data.sessionToken;
      return {
        publicKey: parsed.data.publicKey,
        provider: "email",
        ...(parsed.data.expiresAt !== undefined ? { expiresAt: parsed.data.expiresAt } : {})
      };
    },

    // Non-async on purpose: a pre-authenticate() call must REJECT (the BuckspaySigner contract), not
    // throw synchronously, so return an explicit resolved/rejected promise rather than `async` + throw.
    getPublicKey(): Promise<SignerKey> {
      return connectedKey
        ? Promise.resolve({ type: "ed25519", publicKey: connectedKey })
        : Promise.reject(
            new BuckspayError("ACCOUNT_NOT_READY", "emailSigner: call authenticate({ email, otp }) before getPublicKey()")
          );
    },

    async signAuthEntry(payload: AuthEntryPayload): Promise<Signature> {
      if (!connectedKey || !sessionToken) {
        throw new BuckspayError(
          "ACCOUNT_NOT_READY",
          "emailSigner: call authenticate({ email, otp }) before signAuthEntry()"
        );
      }
      const data = await post({ action: "sign", sessionToken, preimageXdr: payload.preimageXdr });
      const parsed = signResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new BuckspayError("AUTH_PROVIDER_ERROR", "email signer-proxy returned an invalid sign response", {
          cause: parsed.error
        });
      }
      const signature = new Uint8Array(Buffer.from(parsed.data.signature, "base64"));
      if (signature.length !== 64) {
        throw new BuckspayError(
          "AUTH_PROVIDER_ERROR",
          `emailSigner: expected a 64-byte ed25519 signature, got ${String(signature.length)}`
        );
      }
      return { signature, publicKey: connectedKey };
    }
  };
}
