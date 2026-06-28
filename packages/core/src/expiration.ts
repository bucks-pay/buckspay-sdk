import { BuckspayError } from "./errors";

/** Ceiling on how far in the future a signed auth entry may expire (~50 min at ~5s/ledger). */
export const MAX_EXPIRATION_LEDGERS = 600;

/**
 * Bound a requested expiration ledger: it must be strictly in the future and no further
 * than MAX_EXPIRATION_LEDGERS beyond the current ledger. A far-future expiration would
 * widen the replay window; an already-passed one fails closed.
 */
export function boundExpirationLedger(currentLedger: number, requested: number): number {
  if (requested <= currentLedger) {
    throw new BuckspayError("AUTH_EXPIRED", `auth entry already expired: ledger ${requested} <= current ${currentLedger}`);
  }
  const ceiling = currentLedger + MAX_EXPIRATION_LEDGERS;
  return Math.min(requested, ceiling);
}
