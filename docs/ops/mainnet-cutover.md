# Mainnet Cutover Runbook

> The deliberate, reversible, audited procedure to enable **Stellar pubnet (mainnet)** for the
> buckspay SDK + facilitator. **Invariant: nothing touches pubnet until the GO/NO-GO gate passes**,
> and every step has a rollback. Mainnet is OFF by default — the cutover is "turn the deliberate
> opt-in on, watched", and the rollback is "turn it back off."

**Owner:** buckspay eng lead · **On-call:** the rotation named in the team runbook (PagerDuty) ·
**Security sign-off:** per `docs/security/audit-prep.md` (sprint-6/05).

---

## Pre-flight checklist

Every row maps to a sprint-6 plan and a concrete verification command. **All must be green
before the GO/NO-GO gate.**

| Item | Owner | Verify | Source |
|---|---|---|---|
| Release gate PASS | eng | `bash scripts/release-gate.sh` exits 0 (all hard guards PASS) | sprint-5/03 + sprint-6/05 |
| Secrets rotated | security | Sponsor secret + facilitator API key rotated post-incident; old keys revoked; `bash scripts/check-no-committed-env.sh` exits 0 (no tracked `.env*`, sponsor ≠ leaked `G`) | sprint-6/05 |
| Sponsor funded + low-balance alert armed | ops | Pubnet sponsor XLM ≥ the configured floor (`SPONSOR_MIN_XLM`); the low-balance alert fires below it (tested in staging) | sprint-6/04 |
| OZ Wasm installed on pubnet + pin parity | eng | Pubnet-installed Wasm hash == `OZ_SMART_ACCOUNT_WASM_HASH`; `node scripts/verify-wasm-hash.mjs` + `bash scripts/check-pin-parity.sh` pass | sprint-6/02 |
| Dedicated RPC | ops | `SOROBAN_RPC_URL_PUBNET` points at a dedicated/consistent provider (NOT a public load balancer); a health probe returns the latest ledger | sprint-6/01 + sprint-6/06 |
| USDC allow-list set | eng | Only Circle's pubnet USDC SAC is accepted by the facilitator relay allow-list | sprint-6/03 |
| Spend caps + kill-switch armed | ops | Per-tx + rolling spend caps configured; the kill-switch is reachable and tested in staging | sprint-6/04 |
| Guarded mainnet smoke green | eng | `BUCKSPAY_E2E_MAINNET=1 BUCKSPAY_E2E=1 pnpm e2e` runs **both** pubnet smokes green with tiny funds (0.0001 USDC) | sprint-6/06 (this plan) |

## GO / NO-GO gate

The single decision point.

**GO only if ALL hold:**
- Every pre-flight row is checked green.
- `bash scripts/release-gate.sh` exits 0 (all hard guards PASS).
- The guarded mainnet smoke (classic + contract) is green.
- Two named approvers have signed: the **eng owner** and the **security sign-off** (sprint-6/05).

**NO-GO if ANY of these is true** (explicit triggers):
- `release-gate.sh` FAILs.
- Either mainnet smoke is red.
- Pubnet sponsor XLM below the floor.
- Pubnet Wasm hash ≠ `OZ_SMART_ACCOUNT_WASM_HASH` (pin mismatch).
- USDC allow-list unset (facilitator would sponsor an arbitrary token).
- Kill-switch unreachable / untested.

| Approver | Role | Date | GO / NO-GO |
|---|---|---|---|
| _(pending)_ | eng owner | | |
| _(pending)_ | security sign-off | | |

## Rollback

Reverse the cutover with **no fund loss** (pubnet config is OFF by default, so rollback = "turn
the deliberate flag back off"):

1. **Flip the opt-in off.** SDK: stop passing `allowMainnet: true` (browser) / unset
   `BUCKSPAY_ALLOW_MAINNET` (Node) → `resolveNetwork("pubnet", …)` throws again. Facilitator:
   set `STELLAR_NETWORK=testnet` (sprint-6/03) / disable the pubnet config → the relay refuses
   pubnet payloads.
2. **Drain in-flight intents.** Let signed, unexpired auth entries settle or expire
   (`signatureExpirationLedger` bounds them); do not accept new pubnet relays (kill-switch).
3. **Revert the docs "supported" change** if the GA changeset already shipped — publish a
   follow-up `patch` re-gating note (mainnet remains technically opt-in; the docs walk it back to
   "experimental" until re-cutover).
4. **Re-point clients to testnet** and confirm no pubnet traffic reaches the facilitator.

## Sponsor-refill procedure

The pubnet sponsor holds **only operational float**, never custody.

- **Funding source:** the buckspay treasury account (named in the ops vault), NOT a user account.
- **Threshold + target:** refill when sponsor XLM < `SPONSOR_MIN_XLM` (the low-balance auto-pause
  floor, sprint-6/04); top up to the configured target balance (≈ N days of expected gas).
- **Transfer:** the ops owner submits a payment from the treasury to the sponsor `G…` for the
  top-up amount; record the tx hash in the ops log.
- **Confirm:** after the refill confirms, verify the sprint-6/04 low-balance alert **clears** and
  the facilitator resumes relays (auto-pause lifts once balance ≥ floor).

## Emergency pause (kill-switch)

Immediately stop pubnet relays without a full rollback (seconds, reversible).

- **Trip it:** `POST /admin/relays/pause` with `x-admin-api-key` (sprint-6/04) — or set
  `RELAYS_ENABLED=false` and restart. `/relay` then returns `503 relays_paused`.
- **Who:** any on-call engineer with the admin key (SEPARATE from the relay `API_KEY`).
- **Propagation:** effective immediately on the instance(s); confirm across all replicas.
- **Verify tripped:** a pubnet relay attempt is refused with `503 relays_paused`; `submitStellarTransfer`
  is never reached.
- **Pause vs rollback:** pause is reversible in seconds (`/admin/relays/resume`); rollback is the
  full cutover reversal above. Pause first, then decide.

## Incident response

- **Severities:** SEV-1 (sponsor draining / funds at risk), SEV-2 (relays failing / degraded),
  SEV-3 (elevated errors, no fund risk).
- **Escalation:** on-call → eng lead → security sign-off (sprint-6/05). Page on SEV-1/2.
- **First five minutes:** (1) **trip the kill-switch** (emergency pause above); (2) assess the
  sponsor balance + spend-cap counters (sprint-6/04); (3) check facilitator logs for the offending
  intent (PII-free structured records, sprint-6/04 — chain/token/outcome, hashed address tags);
  (4) snapshot RPC/ledger state for the post-mortem.
- **Comms:** status update to the incident channel every 30 min until resolved; customer-facing
  note if user funds were affected.
- **Post-incident:** a written review within 48h (timeline, root cause, the guard that should have
  caught it, the follow-up). The relayer-trust + sponsor-exposure surfaces are in
  `docs/security/threat-model.md`.

## Go-live sequence (GA)

The human/machine boundary is explicit: **Claude prepares + stages; the maintainer publishes.**

1. **Claude** — ensure a changeset exists for every change since the last release
   (`.changeset/mainnet-ga.md` + any others) and stage it.
2. **Claude / CI** — run the go/no-go gate: `bash scripts/release-gate.sh` **must exit 0** (all
   hard guards PASS); `bash scripts/check-cutover-runbook.sh` → exit 0; the guarded mainnet smoke
   green (`BUCKSPAY_E2E_MAINNET=1 BUCKSPAY_E2E=1 pnpm e2e`). Security sign-off finalized
   (sprint-6/05). This is the GO/NO-GO gate above.
3. **MAINTAINER (user)** — run `pnpm changeset version` (computes the lockstep bump + CHANGELOGs —
   never hand-edit a `version`), then `pnpm -r build` + `pnpm -r publish --dry-run` (confirm each
   tarball is `dist/`-only), then `pnpm changeset publish` + `git push --follow-tags`. **Claude
   never runs version/publish** — it is outward, irreversible, and needs npm auth (`VERSIONING.md` §9).
4. **Flip pubnet on** per the pre-flight + GO gate; watch the sponsor balance + spend caps
   (sprint-6/04) for the first window; keep the kill-switch one command away.
