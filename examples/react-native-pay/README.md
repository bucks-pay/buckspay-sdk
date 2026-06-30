# Buckspay React Native example — native passkey → gasless USDC

A minimal Expo app that connects with a **device passkey** (Secure Enclave / StrongBox) and pays
USDC **gasless** on Stellar testnet. It wires `@buckspay/react-native` exactly as a consumer would:
the polyfills load on import, `BuckspayProvider` gets a `nativePasskey` signer, and payments go
through your app's own backend (BFF) — the facilitator API key never ships in the bundle.

> **Web parity:** the on-chain `__check_auth` is **identical to web** — only the authenticator
> transport differs. A payment signed on iOS, Android, or the web verifies against the same contract.

## iOS / Android setup (passkeys fail silently without this)

The `rpId` in `src/config.ts` (`your-app.example`) **MUST** match your app's verified domain:

- **iOS — Associated Domains.** Add `webcredentials:your-app.example` to the app's Associated
  Domains entitlement, and host `https://your-app.example/.well-known/apple-app-site-association`.
- **Android — Digital Asset Links.** Host `https://your-app.example/.well-known/assetlinks.json`
  binding your app's signing certificate, and set the same host as `rpId`.

If `rpId` does not match the verified domain, the OS passkey prompt never appears (no error is
thrown) — this is the single most common integration mistake.

## Run it

This example is kept lean so the SDK monorepo stays free of the full Expo toolchain — it pins only
what it imports + the native peers. Add the Expo runtime locally to build/run it:

```bash
# from the repo root
pnpm install
cd examples/react-native-pay

# add the Expo runtime + the secure-store native module (kept out of the monorepo's prod tree)
npx expo install expo expo-secure-store

# native modules need pods on iOS
npx pod-install

# point BFF_RELAY_URL (src/config.ts) at YOUR backend relay route — it forwards to the
# facilitator with the API key SERVER-SIDE. Never put the facilitator key in the app.

pnpm ios       # or: pnpm android
```

## The flow

1. **Connect with passkey** → `react-native-passkey` registers/uses a credential in the device
   enclave; `@buckspay/signers/passkey` derives the 65-byte secp256r1 key and the OZ contract
   account C-address. The private key never leaves the enclave.
2. **Pay 1.50 USDC (free)** → the SDK builds the auth entry, the passkey signs `sha256(preimage)`
   in the enclave, and the relayer settles through your BFF → the facilitator (sponsor pays gas).
3. The scoped **session** blob (`serializeSession`) is persisted in the OS keystore via
   `expoSecureStore()` — never the root passkey, which stays in the enclave.

## What to verify in a review

- No facilitator API key anywhere in `src/` — `relayer.url` points at your BFF.
- `@buckspay/react-native` is imported (its polyfills run before `@stellar/stellar-sdk`).
- The signer is `nativePasskey` (enclave), and storage holds only the scoped session blob.
