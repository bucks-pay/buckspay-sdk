---
"@buckspay/core": patch
"@buckspay/signers": patch
---

**Social login.** `@buckspay/signers/social` ships `socialSigner({ provider: "web3auth", clientId, network, proxyUrl })`,
a `BuckspaySigner` whose `authenticate()` runs the provider's OAuth flow — the public part client-side,
the secret-bearing verifier callback through your server-side signer-proxy — and resolves a Stellar
ed25519 key that backs the classic account model. After that, `getPublicKey()` / `signAuthEntry()` operate
on that key; the ed25519 signing stays inside the provider's secure context, so the SDK holds only the
public key and the 64-byte signature — no provider secret or private key ships client-side. The factory is
provider-agnostic behind a structural transport (v1 ships web3auth). `SignerType` gains the additive
`"social"` / `"email"` members.
