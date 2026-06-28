# buckspay SDK — Key-Handling Review

Every place a key/secret could appear, and the rule for each. Enforced by
`scripts/check-no-secrets-in-src.sh` (no secret-shaped material in `packages/*/src`) and the
react bundle guard (`no-secret-in-bundle.test.ts`).

| Asset | MAY live in | MUST NOT live in | Enforced by |
|---|---|---|---|
| Stellar secret seed (`S…`) | the user's wallet · test-only `e2e/` env | any `packages/*` source · any client bundle | `check-no-secrets-in-src.sh` + react bundle guard |
| Passkey private key (secp256r1) | the platform authenticator only | exportable storage · any JS variable | WebAuthn (non-extractable by spec) |
| Facilitator API key | server env / BFF | any browser bundle | react bundle guard (`x-api-key`, `apiKey` patterns) |
| Sponsor secret (`STELLAR_SPONSOR_SECRET_*`) | the facilitator env only | referenced by the SDK **at all** | `check-no-secrets-in-src.sh` |

## Operational rules

- **Rotate** the sponsor secret and the facilitator API key on a schedule; treat anything
  that ever entered git history as compromised (rotate immediately).
- The sponsor account holds **only operational float** (enough for fees + reserves), never a
  treasury balance.
- **Never log** a raw `S…`/`C…`/`G…` address or a signature; logs carry codes, not PII.
- **Mainnet is gated:** `pubnet` is refused unless `BUCKSPAY_ALLOW_MAINNET=1`
  (`core/src/network-gate.ts`), so a default config cannot move real funds.
- The browser **never** holds the facilitator key — authenticated calls go through the
  app's same-origin BFF (`/api/gasless/relay`), which injects `x-api-key` server-side.
