# Social & email login

Sign the user in with Google/Apple/Discord (social) or an email one-time code, and back the
account with a Stellar key they never have to manage. Both are just **another signer** — the
accounts, relayer, and engine are untouched.

```ts
import { socialSigner } from "@buckspay/signers/social";
import { emailSigner } from "@buckspay/signers/email";

const social = socialSigner({
  provider: "web3auth",
  clientId: "BN…your-web3auth-client-id",
  network: "testnet",
  proxyUrl: "/api/buckspay/auth/social" // YOUR same-origin signer-proxy
});

const email = emailSigner({
  proxyUrl: "/api/buckspay/auth/email",
  network: "testnet"
});

// Resolve the identity, then pay like any other gasless transfer.
const details = await social.authenticate?.({ loginProvider: "google" });
console.log(details?.publicKey, details?.provider); // AuthDetails { publicKey, provider }
```

## The native mechanism

The provider authenticates the user and hands back (or derives) a **Stellar ed25519 key**; that key
becomes the smart-account **signer**. There is no new on-chain primitive — "adding an auth method is
an adapter, not a rewrite." The rest of the pipeline (`prepare → sign → send`, gasless settlement)
is identical to wallet-backed flows.

The optional `BuckspaySigner.authenticate?()` returns `AuthDetails` (`{ publicKey, provider }`). A
provider failure surfaces as `BuckspayError("AUTH_PROVIDER_ERROR")`.

## The server-side secret boundary

The web3auth **client secret** and the OTP backend secret are **never** in the browser bundle. The
signer calls *your* same-origin `proxyUrl`, which is the `@buckspay/nextjs` signer-proxy
(`createSignerProxyRoute` → facilitator `POST /auth/social` / `POST /auth/email`). Only public keys
and signatures cross back to the client.

```ts
// Server route (App Router) — secrets stay here, never in the bundle.
import { createSignerProxyRoute } from "@buckspay/nextjs";
export const POST = createSignerProxyRoute({ provider: "web3auth", network: "testnet" });
```

Compiled examples: `docs/examples/12-social-login.ts` (social), `docs/examples/16-email-login.ts`
(email/OTP), and `docs/examples/15-nextjs-bff.ts` (the BFF relay + proxy routes).

Prev: [Sessions](./10-sessions.md) · Next: [React Native](./12-react-native.md)
