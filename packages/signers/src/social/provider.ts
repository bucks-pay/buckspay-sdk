import type { Network } from "@buckspay/core";

/**
 * Structural transport for a social-login provider. Keeps `socialSigner` provider-agnostic
 * and fully unit-testable (inject a double) while the default impl wraps web3auth. The
 * ed25519 PRIVATE key never crosses this boundary — only the public key + signatures do.
 */
export interface SocialProvider {
  /**
   * Run the provider OAuth flow (public part client-side; the secret verifier callback is
   * completed server-side via the signer-proxy). Resolves the connected Stellar ed25519
   * public key (a `G…` StrKey) and an optional provider-session expiry (epoch ms).
   */
  connect(params?: Record<string, unknown>): Promise<{ publicKey: string; expiresAt?: number }>;
  /**
   * ed25519-sign a 32-byte digest with the connected key (inside the provider's secure
   * context). Returns the raw 64-byte signature. Used by `signAuthEntry`.
   */
  signDigest(digest: Uint8Array): Promise<Uint8Array>;
  /**
   * Optional: sign a full transaction envelope (classic sponsored onboarding signs the
   * sponsor-sandwich tx, not an auth entry). Returns the signed envelope as base64 XDR.
   */
  signTransaction?(txXdr: string, ctx: { network: Network; address: string }): Promise<string>;
}
