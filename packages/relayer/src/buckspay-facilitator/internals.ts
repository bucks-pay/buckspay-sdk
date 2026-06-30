import { z } from "zod";
import { BuckspayError, type FacilitatorChain, type Network } from "@buckspay/core";

export function toFacilitatorChain(network: Network): FacilitatorChain {
  return network === "pubnet" ? "stellar-pubnet" : "stellar-testnet";
}

/** Parse the facilitator's `blockNumber` (decimal string | number | null) into a ledger seq. */
function parseLedger(v: string | number | null | undefined): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string" && v.trim() === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

/**
 * README §4.3 Receipt. The soroban `/relay` response sends `blockNumber`
 * (string | null) — NOT `ledger` — plus `via`/`chain`; we map `blockNumber → ledger`
 * (README §4.3 contract) and strip extras to the contract shape. A direct numeric
 * `ledger` is also tolerated (forward-compat if a BFF pre-maps it).
 */
export const receiptSchema = z
  .object({
    ok: z.boolean(),
    via: z.string(),
    token: z.string(),
    chain: z.enum(["stellar-testnet", "stellar-pubnet"]),
    transferTx: z.string().min(1),
    blockNumber: z.union([z.string(), z.number(), z.null()]).optional(),
    ledger: z.number().int().nonnegative().optional(),
    status: z.string()
  })
  .transform((r) => {
    const ledger = r.ledger ?? parseLedger(r.blockNumber);
    return {
      ok: r.ok,
      via: r.via,
      token: r.token,
      chain: r.chain,
      transferTx: r.transferTx,
      ...(ledger !== undefined ? { ledger } : {}),
      status: r.status
    };
  });

/**
 * README §4.3 AccountState. The facilitator sends `nativeBalance` (string | null)
 * for XLM and `usdcBalance` (string | null), plus `chain`/`publicKey`/sponsor
 * extras. We rename `nativeBalance → xlmBalance`, drop nulls, and strip extras.
 */
export const accountStateSchema = z
  .object({
    exists: z.boolean(),
    hasUsdcTrustline: z.boolean(),
    nativeBalance: z.string().nullish(),
    xlmBalance: z.string().nullish(),
    usdcBalance: z.string().nullish()
  })
  .transform((s) => {
    const xlmBalance = s.xlmBalance ?? s.nativeBalance ?? undefined;
    return {
      exists: s.exists,
      hasUsdcTrustline: s.hasUsdcTrustline,
      ...(xlmBalance != null ? { xlmBalance } : {}),
      ...(s.usdcBalance != null ? { usdcBalance: s.usdcBalance } : {})
    };
  });

export const onboardBuildSchema = z.object({
  ok: z.boolean().optional(),
  unsignedTxXdr: z.string().optional(),
  nothingToDo: z.boolean().optional()
});

export const onboardSubmitSchema = z.object({
  ok: z.boolean()
});

/** POST /fee/quote response — the FeeQuote shape. Amounts are unsigned stroop strings. */
export const feeQuoteSchema = z.object({
  forwarder: z.string().regex(/^C[A-Z2-7]{55}$/, "forwarder must be a C address"),
  collector: z.string().regex(/^[GC][A-Z2-7]{55}$/, "collector must be a G or C address"),
  token: z.string().regex(/^C[A-Z2-7]{55}$/, "fee token must be a C address"),
  estimatedXlmFee: z.string().regex(/^\d+$/, "estimatedXlmFee must be unsigned stroops"),
  tokenAmount: z.string().regex(/^\d+$/, "tokenAmount must be unsigned stroops"),
  expiresAtLedger: z.number().int().positive()
});

export const deployContractSchema = z.object({
  ok: z.boolean().optional(),
  address: z.string().regex(/^C[A-Z2-7]{55}$/, "facilitator returned a non-C address")
});

// STRETCH swaps. /swap/quote response (facilitator/src/swapRoutes.ts) — only the fields the SDK reads.
export const swapQuoteResponseSchema = z.object({
  quoteId: z.string().uuid(),
  sellAmount: z.string().regex(/^\d+$/),
  expectedBuyAmount: z.string().regex(/^\d+$/),
  minBuyAmount: z.string().regex(/^\d+$/),
  typedData: z.string(),
  needsAuthorization: z.boolean(),
  source: z.string(),
  expiresAt: z.string()
});

/** Any swap-rail failure → SWAP_FAILED (README §4.7), cause preserved. `request` pre-maps HTTP
 *  errors to generic codes (e.g. RELAYER_REJECTED); in the swap context they all surface as
 *  SWAP_FAILED. Already-SWAP_FAILED errors pass through to avoid double-wrapping. */
export function mapSwapError(cause: unknown): BuckspayError {
  if (cause instanceof BuckspayError && cause.code === "SWAP_FAILED") return cause;
  return new BuckspayError("SWAP_FAILED", "facilitator swap rail rejected the request", { cause });
}

interface FacilitatorErrorBody {
  error?: string;
  message?: string;
}

/**
 * Map a facilitator HTTP error to a typed BuckspayError. Codes are the real ones
 * from stellarSubmit.ts (`auth_expired`, `auth_invalid`, `simulation_failed`,
 * `sponsor_not_configured`, `sponsor_unavailable`, `submission_failed`,
 * `tx_reverted`), stellarRoutes.ts (`unauthorized`, `horizon_unreachable`,
 * `build_failed`, `submit_failed`, `invalid_payload`) and relay.ts
 * (`stellar_submit_failed`, `facilitator_unreachable`, `recipient_not_allowed`).
 */
export function mapFacilitatorError(status: number, body: FacilitatorErrorBody): BuckspayError {
  const code = body.error ?? "";
  const message = body.message ?? (code !== "" ? code : `facilitator returned HTTP ${String(status)}`);

  if (code === "auth_expired") return new BuckspayError("AUTH_EXPIRED", message);
  if (code === "session_policy_violation") return new BuckspayError("SESSION_POLICY_VIOLATION", message);
  if (code === "session_expired") return new BuckspayError("SESSION_EXPIRED", message);
  if (code === "simulation_failed") return new BuckspayError("SIMULATION_FAILED", message);
  if (code === "sponsor_not_configured" || code === "sponsor_unavailable") {
    return new BuckspayError("INSUFFICIENT_SPONSOR", message);
  }
  if (code === "unauthorized" || status === 401) {
    return new BuckspayError("INVALID_CONFIG", message);
  }
  if (
    code === "facilitator_unreachable" ||
    code === "horizon_unreachable" ||
    code === "stellar_submit_failed" ||
    code === "submit_failed" ||
    code === "submission_failed" ||
    code === "build_failed" ||
    status >= 500
  ) {
    return new BuckspayError("RELAYER_UNREACHABLE", message);
  }
  // auth_invalid, tx_reverted, recipient_not_allowed, value_exceeds_max,
  // self_transfer_not_allowed, invalid_payload, invalid_onboard_tx, …
  return new BuckspayError("RELAYER_REJECTED", message);
}
