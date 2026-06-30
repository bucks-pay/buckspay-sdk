---
"@buckspay/signers": patch
---

**Email / OTP login.** `@buckspay/signers/email` ships `emailSigner({ proxyUrl, network })` with
`requestOtp(email)` (issue) + `authenticate({ email, otp })` (verify) resolving a server-custodied
Stellar ed25519 key, and `signAuthEntry` signing through the signer-proxy. The OTP-derived private key
is custodied server-side by the facilitator and never reaches the browser — the signer holds only the
public key, an opaque session token, and the returned 64-byte signatures. No OTP credentials or private
key ship client-side. Passes the shared `BuckspaySigner` conformance suite (type `"email"`).
