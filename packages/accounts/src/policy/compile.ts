import { Address, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { BuckspayError, type SessionPolicy } from "@buckspay/core";

/** Default accounting period for a spend limit. */
const DEFAULT_PERIOD = "day" as const;

/**
 * Build a `spendLimit` session policy. `max` is coerced to a decimal string of token base units
 * (USDC = 7 decimals); `period` defaults to "day". This is the shape `SessionManager` consumes and the
 * one the on-chain policy account enforces in `__check_auth`.
 */
export function spendLimit(opts: {
  token: string;
  max: string | bigint;
  period?: "day" | "week" | "month" | "total";
}): SessionPolicy {
  const max = typeof opts.max === "bigint" ? opts.max.toString() : opts.max;
  return { kind: "spendLimit", token: opts.token, max, period: opts.period ?? DEFAULT_PERIOD };
}

/** Build an `allowlist` session policy: the session key may call only these contract addresses. */
export function allowlist(contracts: string[]): SessionPolicy {
  return { kind: "allowlist", contracts };
}

/** Accounting period -> rolling window length in seconds (the on-chain `spend_period`). */
const PERIOD_SECONDS: Record<"day" | "week" | "month" | "total", bigint> = {
  day: 86_400n,
  week: 604_800n,
  month: 2_592_000n,
  total: 3_155_760_000n // ~100 years
};

function entry(key: string, val: xdr.ScVal): xdr.ScMapEntry {
  return new xdr.ScMapEntry({ key: nativeToScVal(key, { type: "symbol" }), val });
}

/**
 * Compile the session policies into the on-chain `Policy` struct the contract account expects - ONE
 * struct combining the allowlist, spend cap, and expiry. A session MUST carry BOTH a `spendLimit` and a
 * non-empty `allowlist`: an unbounded delegation (no cap, or no target restriction) is refused, matching
 * the contract's own `EmptyPolicy` rejection. `expiresAt` is the session's on-chain expiry as a ledger
 * timestamp in seconds (compared against the ledger clock in `__check_auth`).
 *
 * The struct's map keys are emitted in canonical sorted order
 * (`allowlist`, `expiration`, `spend_max`, `spend_period`, `spend_token`); enforcement is on-chain, so
 * the SDK's only job is to encode these rules exactly - pinned byte-for-byte by a golden test.
 */
export function compilePolicies(policies: SessionPolicy[], expiresAt: number | bigint): xdr.ScVal {
  const spend = policies.find(
    (p): p is Extract<SessionPolicy, { kind: "spendLimit" }> => p.kind === "spendLimit"
  );
  const allow = policies.find(
    (p): p is Extract<SessionPolicy, { kind: "allowlist" }> => p.kind === "allowlist"
  );
  if (!spend) {
    throw new BuckspayError(
      "INVALID_CONFIG",
      "a session needs a spend limit policy; an unbounded session (no spend cap) is refused"
    );
  }
  if (!allow || allow.contracts.length === 0) {
    throw new BuckspayError(
      "INVALID_CONFIG",
      "a session needs a non-empty allowlist policy; a session that can call any contract is refused"
    );
  }
  return xdr.ScVal.scvMap([
    entry("allowlist", xdr.ScVal.scvVec(allow.contracts.map((c) => new Address(c).toScVal()))),
    entry("expiration", nativeToScVal(BigInt(expiresAt), { type: "u64" })),
    entry("spend_max", nativeToScVal(BigInt(spend.max), { type: "i128" })),
    entry("spend_period", nativeToScVal(PERIOD_SECONDS[spend.period], { type: "u64" })),
    entry("spend_token", new Address(spend.token).toScVal())
  ]);
}
