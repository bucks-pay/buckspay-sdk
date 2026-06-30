// @buckspay/signers/social — social-login signer (web3auth-backed).
//
// `socialSigner({ provider: "web3auth", clientId, network, proxyUrl })` returns a
// `BuckspaySigner` (type "social"). `authenticate()` runs the provider's OAuth flow — the
// PUBLIC part client-side, the SECRET-bearing verifier callback through the server-side
// signer-proxy (`@buckspay/nextjs` → facilitator POST /auth/social) — and resolves an
// `AuthDetails` whose `publicKey` is a Stellar G-address (ed25519). After that,
// getPublicKey()/signAuthEntry() operate on that key; the ed25519 signing stays inside the
// provider's secure context, so the SDK holds only the public key + the 64-byte signature.
//
// The web3auth project SECRET is NEVER in the browser: it lives in the facilitator, reached
// only via the app's signer-proxy. This factory ships no secret and stores no private key.
import { hash, xdr } from "@stellar/stellar-sdk";
import { BuckspayError } from "@buckspay/core";
import type { AuthDetails, AuthEntryPayload, BuckspaySigner, Network, Signature, SignerKey } from "@buckspay/core";
import type { SocialProvider } from "./provider.js";
import { defaultWeb3AuthProvider } from "./web3auth.js";

export type { BuckspaySigner, AuthDetails } from "@buckspay/core";
export type { SocialProvider } from "./provider.js";
export type { Web3AuthLike, Web3AuthLoader } from "./web3auth.js";

export interface SocialSignerOptions {
  provider: "web3auth";
  clientId: string;
  network: Network;
  /** Server signer-proxy that completes the SECRET OAuth/verifier callback (see @buckspay/nextjs). */
  proxyUrl?: string;
  /** Test/advanced seam: inject the provider transport. Defaults to the web3auth impl. */
  providerImpl?: SocialProvider;
}

/**
 * Build a social-login `BuckspaySigner` (type "social"). The connected Stellar ed25519 key
 * backs the classic account model (its G-address IS the account). Provider/OAuth/proxy
 * failures map to `AUTH_PROVIDER_ERROR`; using the signer before `authenticate()` maps to
 * `ACCOUNT_NOT_READY`; a malformed preimage maps to `INVALID_CONFIG`.
 */
export function socialSigner(opts: SocialSignerOptions): BuckspaySigner {
  // Defensive runtime guard for untyped (JS) callers — the type already pins "web3auth".
  const providerName = opts.provider as string;
  if (providerName !== "web3auth") {
    throw new BuckspayError("INVALID_CONFIG", `socialSigner: unsupported provider '${providerName}'`);
  }
  if (!opts.clientId || opts.clientId.trim() === "") {
    throw new BuckspayError("INVALID_CONFIG", "socialSigner: clientId is required");
  }

  const provider: SocialProvider =
    opts.providerImpl ??
    defaultWeb3AuthProvider({
      clientId: opts.clientId,
      network: opts.network,
      ...(opts.proxyUrl ? { proxyUrl: opts.proxyUrl } : {})
    });

  // Cache the connected key from authenticate(); a signer can't re-derive it (BuckspaySigner contract).
  let connectedKey: string | null = null;
  const requireConnected = (): string => {
    if (!connectedKey) {
      throw new BuckspayError("ACCOUNT_NOT_READY", "socialSigner: call authenticate() before using the signer");
    }
    return connectedKey;
  };

  return {
    type: "social",

    async authenticate(params?: Record<string, unknown>): Promise<AuthDetails> {
      let result: { publicKey: string; expiresAt?: number };
      try {
        result = await provider.connect(params);
      } catch (cause) {
        if (cause instanceof BuckspayError) throw cause;
        throw new BuckspayError("AUTH_PROVIDER_ERROR", "social provider failed to authenticate", { cause });
      }
      if (!result.publicKey.startsWith("G")) {
        throw new BuckspayError("AUTH_PROVIDER_ERROR", "social provider returned a non-Stellar (G…) public key");
      }
      connectedKey = result.publicKey;
      return {
        publicKey: result.publicKey,
        provider: "web3auth",
        ...(result.expiresAt !== undefined ? { expiresAt: result.expiresAt } : {})
      };
    },

    // Non-async on purpose: a pre-authenticate() call must REJECT (the BuckspaySigner contract), not
    // throw synchronously, so return an explicit resolved/rejected promise rather than `async` + throw.
    getPublicKey(): Promise<SignerKey> {
      return connectedKey
        ? Promise.resolve({ type: "ed25519", publicKey: connectedKey })
        : Promise.reject(
            new BuckspayError("ACCOUNT_NOT_READY", "socialSigner: call authenticate() before using the signer")
          );
    },

    async signAuthEntry(payload: AuthEntryPayload): Promise<Signature> {
      const publicKey = requireConnected();
      let preimage: xdr.HashIdPreimage;
      try {
        preimage = xdr.HashIdPreimage.fromXDR(payload.preimageXdr, "base64");
      } catch (cause) {
        throw new BuckspayError("INVALID_CONFIG", "socialSigner: could not decode preimageXdr", { cause });
      }
      // Same challenge as the passkey path: ed25519 over sha256(the HashIdPreimage XDR).
      const digest = hash(preimage.toXDR());
      let signature: Uint8Array;
      try {
        signature = await provider.signDigest(digest);
      } catch (cause) {
        if (cause instanceof BuckspayError) throw cause;
        throw new BuckspayError("AUTH_PROVIDER_ERROR", "social provider failed to sign the auth entry", { cause });
      }
      if (signature.length !== 64) {
        throw new BuckspayError(
          "AUTH_PROVIDER_ERROR",
          `socialSigner: expected a 64-byte ed25519 signature, got ${String(signature.length)}`
        );
      }
      return { signature, publicKey };
    },

    async signTransaction(txXdr: string, ctx: { network: Network; address: string }): Promise<string> {
      requireConnected();
      if (!provider.signTransaction) {
        throw new BuckspayError("AUTH_PROVIDER_ERROR", "social provider does not support transaction signing");
      }
      try {
        return await provider.signTransaction(txXdr, ctx);
      } catch (cause) {
        if (cause instanceof BuckspayError) throw cause;
        throw new BuckspayError("AUTH_PROVIDER_ERROR", "social provider failed to sign the transaction", { cause });
      }
    }
  };
}
