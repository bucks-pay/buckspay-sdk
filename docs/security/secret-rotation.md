# Secret Rotation Runbook — `.env.bak` leak

> A `.env.bak` file containing **real** secrets was committed to the facilitator repo. Removing
> it from `HEAD` did **not** un-leak the values — they live in git history and in every clone.
> The only remediation is **rotation**. This runbook enumerates every burned secret and the
> exact procedure to rotate it. Enforced by `scripts/check-no-committed-env.sh`.

**Status:** active · **Incident date:** 2026-06 · **Owner:** buckspay security

---

## Incident

A `.env.bak` carrying production-grade secrets was committed to `github.com/bucks-pay/facilitator`
(present in commits `25bd513` and `4e8c83b`). It was later removed from tracking with
`git rm --cached .env.bak` and `.env.bak` is now in `.gitignore`. **Removal from `HEAD` is NOT
remediation:** the values remain in git history and in every existing clone/fork, in any CI log
that printed them, and with every current/former collaborator who pulled. Anyone with repo
history has **every value below**. The blast radius is the full set of secrets listed in
`## Burned secrets`. The only fix is to rotate each to brand-new material and abandon the old.

## Burned secrets (rotate ALL)

Exact keys present in the leaked `.env.bak` (verified from the file; values intentionally not
reproduced here).

| Secret | What it controls | Rotation action | New home | Old-value disposition |
|---|---|---|---|---|
| `STELLAR_SPONSOR_SECRET_TESTNET` | Sponsors/pays for ALL testnet gasless Soroban txs. **Leaked sponsor public key: `GDKACWHUTPRUFHENFT56SL7XPM5FJU25DARE76OG43Q73XCATTUX4RPI`.** | Generate a brand-new sponsor keypair on a clean host; **drain** the leaked G's XLM to the new sponsor (or treasury); abandon the old G permanently — never re-fund it. | Secret manager (`KmsSecretProvider`) | Drained to 0, abandoned, never reused |
| `RELAYER_PRIVATE_KEY` | EVM relayer signer — pays gas / submits on AVAX/Polygon/Base/Celo (`chain.ts` `privateKeyToAccount(env.RELAYER_PRIVATE_KEY)`). | Generate a new EOA; move any operational float off the leaked address; repoint `chain.ts` to the new key. | Secret manager | Float swept out, abandoned |
| `DEPLOYER_PRIVATE_KEY` | Contract-deployer EOA. | Rotate to a new deployer; the leaked one must hold nothing and never deploy again. | Secret manager | Emptied, never deploys again |
| `API_KEY` | Facilitator inbound auth key (`env.API_KEY`, checked on `/relay`). | Issue a new key; distribute to legitimate callers (dashboard BFF); revoke the old at the gateway so the burned value `401`s. | Secret manager / BFF env | Revoked at gateway |
| `ZEROEX_API_KEY` | 0x swap-provider key. | Rotate in the 0x dashboard (revoke old, issue new); update env. | Secret manager | Revoked in 0x dashboard |
| `ONEINCH_API_KEY` | 1inch swap-provider key. | Rotate in the 1inch dashboard (revoke old, issue new); update env. | Secret manager | Revoked in 1inch dashboard |
| `CALIBUR_*` (8: `CALIBUR_AVALANCHE`, `_POLYGON`, `_BASE`, `_CELO`, `_AVALANCHE_FUJI`, `_POLYGON_AMOY`, `_BASE_SEPOLIA`, `_CELO_SEPOLIA`) | EIP-7702 Calibur delegate addresses/keys (mainnet + testnet sets). | Rotate per the Calibur key-rotation procedure; treat every leaked delegate as compromised. | Secret manager | Treated as compromised, rotated |
| `AVAX_RPC_URL`, `BASE_RPC_URL`, `CELO_RPC_URL`, `POLYGON_RPC_URL` | RPC endpoints. | If any URL embeds a provider API key, rotate that provider key; otherwise these are **public endpoints, no secret** — recorded here so the row is not skipped. | env | Provider key rotated iff embedded |

Non-secret values also present (no rotation needed): `PORT`, `SWAP_DEFAULT_SLIPPAGE_BPS`,
`SWAP_MAX_SLIPPAGE_BPS`, `SWAP_QUOTE_TTL_SECONDS`.

> The mainnet sponsor `STELLAR_SPONSOR_SECRET_PUBNET` was **NOT** in `.env.bak`, but it MUST be
> generated fresh on a clean host post-incident and MUST differ from the leaked address above —
> enforced by `scripts/check-no-committed-env.sh` Guard 2.

## Rotation procedure

Apply these four steps to **every** row above:

1. **Generate** new material on a clean host. Never paste an old value into a new file; never
   reuse a leaked key on a "fresh" account.
2. **Deploy** to the secret manager / deploy target — the facilitator's `SecretProvider`:
   `KmsSecretProvider` in prod, a gitignored `.env` in dev. **Never** into a
   tracked file.
3. **Revoke / abandon** the old value at its source: gateway revoke for API keys (0x/1inch/
   `API_KEY`); for on-chain keys, sweep all funds out and never reuse the address.
4. **Verify** the new value works and the old value fails: old `API_KEY` → `401`; leaked sponsor
   G → zero balance and no longer referenced anywhere.

**Drain the leaked sponsor (specific):** build a payment of the full XLM balance (minus the base
reserve) from the leaked `GDKACWHU…4RPI` to the new sponsor (or treasury), submit it **once**,
then record the leaked G as abandoned in this doc. Never re-fund it.

## Never commit a secret file again (controls)

1. **`.gitignore`** in both repos ignores `.env` and `.env.*` and explicitly `.env.bak` /
   `.env.local`, allowing ONLY `.env.example`. (SDK: `.env`, `.env.*`, `!.env.example`;
   facilitator: `.env`, `.env.bak`, `.env.local`, `.env.*.local`.)
2. **`scripts/check-no-committed-env.sh`** runs in CI and the release gate — fails if any
   `.env*` (≠ `.env.example`) is tracked, and fails if the configured pubnet sponsor equals the
   leaked address.
3. **Pre-commit / CI secret scanner** (`gitleaks` or `trufflehog`) blocks secret-shaped strings
   before they land. This extends `scripts/check-no-secrets-in-src.sh` (blocks
   `S…` seeds / PEM markers / `apiKey` literals in `packages/*/src`) to **tracked files
   anywhere**, not just `src`.

## Post-rotation verification

- [ ] Leaked sponsor `GDKACWHU…4RPI` balance == 0 (drained + abandoned).
- [ ] New sponsor funded and referenced via the secret manager (never a tracked file).
- [ ] Old `API_KEY` returns `401` at the gateway; new key distributed to the BFF.
- [ ] `bash scripts/check-no-committed-env.sh` exits 0.
- [ ] No `.env*` (except `.env.example`) tracked in either repo:
      `git ls-files | grep -E '(^|/)\.env'` shows only `*.env.example`.
- [ ] 0x / 1inch / Calibur / EVM relayer + deployer keys rotated and old ones revoked/emptied.
