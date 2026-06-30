import { z } from "zod";
import { BuckspayError } from "@buckspay/core";
import type { Network } from "@buckspay/core";
import type { SocialProvider } from "./provider.js";

/**
 * Structural surface the default provider needs from the web3auth SDK. The real
 * `@web3auth/single-factor-auth` surface is mapped onto this by the loader. The PRIVATE
 * key stays inside web3auth's secure context — `signEd25519` is the only signing
 * capability that crosses this boundary.
 */
export interface Web3AuthLike {
  /** Run OAuth (the popup) and resolve the OIDC idToken + the derived ed25519 public key (hex). */
  login(opts: {
    clientId: string;
    network: Network;
    loginParams?: Record<string, unknown>;
  }): Promise<{ idToken: string; ed25519PublicKeyHex: string }>;
  /** ed25519-sign a 32-byte digest with the logged-in key, returning the raw 64-byte signature. */
  signEd25519(digest: Uint8Array): Promise<Uint8Array>;
}

export type Web3AuthLoader = () => Promise<Web3AuthLike>;

export interface DefaultWeb3AuthOptions {
  clientId: string;
  network: Network;
  proxyUrl?: string;
  /** Test seam: inject a fake web3auth impl instead of dynamically importing the SDK. */
  loader?: Web3AuthLoader;
  /** Test seam: inject fetch (defaults to global fetch). */
  fetchImpl?: typeof fetch;
}

// The signer-proxy response shape (server verified the idToken). Validated before use.
const proxyResponseSchema = z.object({
  ok: z.literal(true),
  publicKey: z.string().regex(/^G[A-Z2-7]{55}$/, "expected a Stellar G-address"),
  expiresAt: z.number().int().positive().optional()
});

// The browser-only web3auth SDK is pinned by the onboarding spike. Until then the default loader
// fails closed with a clear message — apps inject `loader`/`providerImpl`. Never imports during SSR/Node.
const defaultLoader: Web3AuthLoader = () => {
  throw new BuckspayError(
    "AUTH_PROVIDER_ERROR",
    "socialSigner: the default web3auth loader is not wired yet; inject `loader`/`providerImpl`"
  );
};

export function defaultWeb3AuthProvider(opts: DefaultWeb3AuthOptions): SocialProvider {
  if (!opts.proxyUrl || opts.proxyUrl.trim() === "") {
    throw new BuckspayError(
      "INVALID_CONFIG",
      "socialSigner(web3auth): proxyUrl is required — the verifier secret is server-side only"
    );
  }
  const proxyUrl = opts.proxyUrl;
  const loader = opts.loader ?? defaultLoader;
  const doFetch: typeof fetch = opts.fetchImpl ?? ((input, init) => fetch(input, init));

  let sdk: Web3AuthLike | null = null;
  const getSdk = async (): Promise<Web3AuthLike> => {
    sdk ??= await loader();
    return sdk;
  };

  return {
    async connect(params?: Record<string, unknown>): Promise<{ publicKey: string; expiresAt?: number }> {
      const w3a = await getSdk();
      const { idToken } = await w3a.login({
        clientId: opts.clientId,
        network: opts.network,
        ...(params ? { loginParams: params } : {})
      });

      // Server-side verification of the idToken (the web3auth secret lives in the facilitator).
      let res: Response;
      try {
        res = await doFetch(proxyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: "web3auth", idToken, network: opts.network })
        });
      } catch (cause) {
        throw new BuckspayError("AUTH_PROVIDER_ERROR", "social signer-proxy is unreachable", { cause });
      }
      let data: unknown;
      try {
        data = await res.json();
      } catch (cause) {
        throw new BuckspayError("AUTH_PROVIDER_ERROR", "social signer-proxy returned non-JSON", { cause });
      }
      if (!res.ok) {
        throw new BuckspayError(
          "AUTH_PROVIDER_ERROR",
          `social signer-proxy rejected the idToken (HTTP ${String(res.status)})`
        );
      }
      const parsed = proxyResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new BuckspayError("AUTH_PROVIDER_ERROR", "social signer-proxy returned an invalid response", {
          cause: parsed.error
        });
      }
      return {
        publicKey: parsed.data.publicKey,
        ...(parsed.data.expiresAt !== undefined ? { expiresAt: parsed.data.expiresAt } : {})
      };
    },

    async signDigest(digest: Uint8Array): Promise<Uint8Array> {
      const w3a = await getSdk();
      return w3a.signEd25519(digest);
    }
  };
}
