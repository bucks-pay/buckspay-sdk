# Feature coverage

Every buckspay feature is an extension of an existing port that maps to a **native Stellar
mechanism** — "adding an auth method is an adapter, not a rewrite." This table is the index from
feature → mechanism → SDK surface → runnable example → guide.

| Feature | Native Stellar mechanism | SDK surface | Example | Guide |
|---|---|---|---|---|
| Gasless (sponsored) | sponsor fee-bump (CAP-15) + sponsored reserves (CAP-33) | `gas: { mode: "sponsored" }` | `03-gasless-sponsored.ts` | `03-gasless-modes.md` |
| Passkey smart account | secp256r1 in `__check_auth` (CAP-51) | `@buckspay/accounts/oz-contract` + `passkey` | `02b-passkey-account.ts` | `02-account-models.md` |
| Gas in stablecoin | token-forwarding contract via relayer (FeeForwarder) | `gas: { mode: "token", token }` | `09-gas-in-token.ts` | `08-gas-in-token.md` |
| Atomic batch | multi-op tx (classic) / Multicall contract (Soroban) | `sendCalls([...])` / `batch()` | `10-batch.ts` | `09-atomic-batch.md` |
| Sessions | policy signers in `__check_auth` (spend limit + allowlist on-chain) | `grantSession` / `revokeSession` | `11-sessions.ts` | `10-sessions.md` |
| Parallel (transparent) | channel-account pool + non-sequential nonces (Protocol 23) | none (facilitator throughput) | — | `09-atomic-batch.md` |
| Social login | external provider → ed25519 key → smart-account signer | `socialSigner({ provider: "web3auth" })` | `12-social-login.ts` | `11-social-email-login.md` |
| Email/SMS login | external provider → derived ed25519 key | `emailSigner({ proxyUrl })` | `16-email-login.ts` | `11-social-email-login.md` |
| Mobile (React Native) | native passkey (WebAuthn) + secure storage | `@buckspay/react-native` `nativePasskey` | `13-react-native.tsx` | `12-react-native.md` |
| Server bindings (BFF) | server-side relay + signer proxy | `@buckspay/nextjs` `createRelayRoute` / `createSignerProxyRoute` | `15-nextjs-bff.ts` | `11-social-email-login.md` |
| Swaps (optional) | native DEX / Soroswap (reuses the facilitator `/swap/*` rail) | `quoteSwap` / `swap` | `14-swap.ts` | this page |

> **Swaps is optional** — the first surface deferred if the cycle tightens. The core (connect,
> gasless pay, gas-in-token, batch, sessions, social/email login, React Native) does not depend on
> it.

## Swaps — cut decision

**The EVM/Stellar seam.** The facilitator's existing `/swap/*` rail is the EVM Calibur (EIP-7702)
path: `/swap/submit` consumes an EIP-712 `batchSignature` from the payer's **EVM wallet**, not the
SDK's Soroban `BuckspaySigner`. `quoteSwap` is signer-agnostic and ships end-to-end; the `swap`
**submit** leg needs the EVM wallet path (the app BFF → `/swap/submit`).

> **Decided: KEEP — 2026-06-30**

**As KEPT (current state):**
- `BuckspayClient.quoteSwap` ships end-to-end (delegates to `/swap/quote`, maps to `SwapQuote`).
- `BuckspayClient.swap` enforces the `minOut` floor before submit and fails closed (`SWAP_FAILED`)
  until the EVM wallet submit path (app BFF → `/swap/submit`) is wired; the full submit leg / a
  native Stellar (Soroswap) rail is the future swap work.
- `buckspayFacilitator({ swapChain })` exposes `quoteSwap`/`swap`; without `swapChain` both are
  omitted. `docs/examples/14-swap.ts` and the gated `swap.e2e.test.ts` cover the quote path.

**If later cut:** revert this surface — the `Receipt.chain` widening, `Relayer.quoteSwap?`/`swap?`,
the `BuckspayClient.quoteSwap`/`swap` methods, the `swapChain` option, `docs/examples/14-swap.ts`,
the gated `swap.e2e.test.ts`, and this section's KEEP detail — and move swaps to a native DEX /
Soroswap rail on the Stellar side (removing the EVM seam).

Prev: [React Native](./12-react-native.md) · Back to [index](./README.md)
