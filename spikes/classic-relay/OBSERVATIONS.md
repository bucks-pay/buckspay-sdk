# Spike: Classic Relay — OBSERVATIONS (Fase 0 gate evidence)

> Ran `pnpm spike` against a **local facilitator** (`STELLAR_MODE=self`, port 3002) on Stellar **testnet**.
> **Outcome: GREEN.** Run date: 2026-06-26.

## Preconditions
- [x] `PAYER_SECRET` is a funded testnet account — `state.exists === true` (Friendbot via `scripts/setup-testnet.ts`).
- [x] `RECIPIENT_PUBLIC_KEY` exists on testnet and has a USDC trustline (same setup script).
- [x] Facilitator reachable and `FACILITATOR_API_KEY` accepted (no 401); `/health` → 200.

## Path assertions (auto-checked by run.ts)
- [x] `getAccountState` returns a zod-valid `{ exists, hasUsdcTrustline, ... }`.
- [ ] ⚠️ Sponsored onboarding **not exercised in this run** — the trustline was pre-added by `setup-testnet.ts`,
      so `run.ts` skipped the onboard branch. The facilitator's onboarding endpoints (`/stellar/onboard/build|submit`)
      are validated separately (the dashboard uses them live; `getStellarAccountState`/`buildOnboardTx` read OK).
      → Re-run with a fresh payer that has **no** trustline to exercise the spike's onboarding path end-to-end.
- [x] `randomNonce()` stays ≤ 2^52 (facilitator does `Number(nonce)`) — unit test + live run.
- [x] `authorizeEntry` produces a 64-byte ed25519 signature; signed entry decodes. **The facilitator ACCEPTED
      the auth entry** (got past auth validation to balance simulation), confirming the signature format.
- [x] `RelayPayload` matches `stellarSorobanSchema` EXACTLY — accepted by the real `/relay`.
- [x] `/relay` returned `ok: true`, `via: "buckspay_self"`, a non-empty `transferTx`, `status: "success"`.
- [x] Horizon confirms the transfer `successful === true` independently (ledger 3298836).

## Decisions captured for Sprint 1–3
- [x] `signatureExpirationLedger` window of +60 ledgers is ample: signed against exp `3298895`, tx landed at
      ledger `3298836` (~1 ledger / ~5 s lag). +60 is a comfortable margin under real latency.
- [x] Receipt fields present: `transferTx`, `status`, `via`, `chain`. The facilitator returns `blockNumber`
      (string); the SDK relayer adapter will map it to `Receipt.ledger` (already noted in README §4.3).
- [x] **Key finding for Sprint 2 (`wallets-kit` signer):** Soroban auth signs `hash(preimage.toXDR())`, NOT the
      raw preimage XDR. Freighter/Wallets Kit hash internally; a local-key signer must hash explicitly. The SDK's
      signer callback must hand the wallet the preimage and let it hash+sign. (No `normalizeSignature` quirk here —
      the local ed25519 key returns a clean 64-byte sig; the double-encode fix stays a wallets-kit concern.)

## Evidence
- **Explorer URL:** https://stellar.expert/explorer/testnet/tx/b8b0ce3516aa4ea56c91a5bf10ad0628cebefdc9fbf65730aa52c98ebfc7647a
- **Receipt:** `{ ok: true, via: "buckspay_self", chain: "stellar-testnet", status: "success", transferTx: "b8b0ce35…7647a" }`
- **Amount:** 0.1 USDC (`1000000` stroops) · payer `GCM2…WFZH` → recipient `GBPY…LJRY`.
- **Observed ledger lag (sign → settle):** ~1 ledger (exp 3298895, settled 3298836).
- **Gasless proof:** the XLM fee (`23073` stroops) was paid by the facilitator **sponsor** account
  `GDKACWHUTPRUFHENFT56SL7XPM5FJU25DARE76OG43Q73XCATTUX4RPI` (the tx `source_account` / `fee_account`) — **NOT**
  by the payer, who only signed the Soroban auth entry. Gas is fully abstracted, exactly as designed.

## Outcome
- [x] **GREEN — proceed to Sprint 1.**
