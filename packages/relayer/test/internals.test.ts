import { describe, it, expect } from "vitest";
import {
  toFacilitatorChain,
  receiptSchema,
  accountStateSchema,
  mapFacilitatorError
} from "../src/buckspay-facilitator/internals.js";

describe("toFacilitatorChain", () => {
  it("maps testnet → stellar-testnet and pubnet → stellar-pubnet", () => {
    expect(toFacilitatorChain("testnet")).toBe("stellar-testnet");
    expect(toFacilitatorChain("pubnet")).toBe("stellar-pubnet");
  });
});

describe("receiptSchema", () => {
  it("accepts a valid soroban receipt", () => {
    const r = receiptSchema.parse({
      ok: true,
      via: "buckspay_self",
      token: "USDC",
      chain: "stellar-testnet",
      transferTx: "abc123",
      ledger: 555,
      status: "success"
    });
    expect(r.transferTx).toBe("abc123");
    expect(r.ledger).toBe(555);
  });

  it("maps the facilitator's `blockNumber` (string) → ledger", () => {
    const r = receiptSchema.parse({
      ok: true,
      via: "buckspay_self",
      token: "USDC",
      chain: "stellar-testnet",
      transferTx: "deadbeef",
      blockNumber: "555",
      status: "success"
    });
    expect(r.ledger).toBe(555);
    // The raw `blockNumber` field is stripped to the README contract shape.
    expect(r).not.toHaveProperty("blockNumber");
  });

  it("drops a null blockNumber (no ledger)", () => {
    const r = receiptSchema.parse({
      ok: true,
      via: "buckspay_self",
      token: "USDC",
      chain: "stellar-testnet",
      transferTx: "deadbeef",
      blockNumber: null,
      status: "pending"
    });
    expect(r.ledger).toBeUndefined();
  });

  it("rejects a receipt missing transferTx", () => {
    expect(() =>
      receiptSchema.parse({ ok: true, via: "x", token: "USDC", chain: "stellar-testnet", status: "success" })
    ).toThrow();
  });
});

describe("accountStateSchema", () => {
  it("accepts the facilitator account payload (with extra fields)", () => {
    const s = accountStateSchema.parse({
      chain: "stellar-testnet",
      publicKey: "GABC",
      exists: true,
      hasUsdcTrustline: false,
      usdcBalance: "0"
    });
    expect(s).toEqual({ exists: true, hasUsdcTrustline: false, usdcBalance: "0" });
  });

  it("renames nativeBalance → xlmBalance and tolerates null usdcBalance", () => {
    const s = accountStateSchema.parse({
      chain: "stellar-testnet",
      publicKey: "GABC",
      exists: false,
      hasUsdcTrustline: false,
      usdcBalance: null,
      nativeBalance: "12.5",
      usdcTrustlineSponsor: null,
      accountSponsor: null
    });
    expect(s).toEqual({ exists: false, hasUsdcTrustline: false, xlmBalance: "12.5" });
  });
});

describe("mapFacilitatorError", () => {
  it("maps auth_expired → AUTH_EXPIRED", () => {
    expect(mapFacilitatorError(400, { error: "auth_expired", message: "x" }).code).toBe("AUTH_EXPIRED");
  });
  it("maps sponsor_not_configured / sponsor_unavailable → INSUFFICIENT_SPONSOR", () => {
    expect(mapFacilitatorError(503, { error: "sponsor_not_configured" }).code).toBe("INSUFFICIENT_SPONSOR");
    expect(mapFacilitatorError(502, { error: "sponsor_unavailable" }).code).toBe("INSUFFICIENT_SPONSOR");
  });
  it("maps simulation_failed → SIMULATION_FAILED", () => {
    expect(mapFacilitatorError(400, { error: "simulation_failed" }).code).toBe("SIMULATION_FAILED");
  });
  it("maps 5xx / unreachable-ish to RELAYER_UNREACHABLE", () => {
    expect(mapFacilitatorError(502, { error: "facilitator_unreachable" }).code).toBe("RELAYER_UNREACHABLE");
    expect(mapFacilitatorError(500, { error: "submit_failed" }).code).toBe("RELAYER_UNREACHABLE");
    expect(mapFacilitatorError(502, { error: "stellar_submit_failed" }).code).toBe("RELAYER_UNREACHABLE");
  });
  it("maps unauthorized 401 → INVALID_CONFIG", () => {
    expect(mapFacilitatorError(401, { error: "unauthorized" }).code).toBe("INVALID_CONFIG");
  });
  it("defaults other 4xx (auth_invalid, tx_reverted, recipient_not_allowed) → RELAYER_REJECTED", () => {
    expect(mapFacilitatorError(400, { error: "auth_invalid" }).code).toBe("RELAYER_REJECTED");
    expect(mapFacilitatorError(400, { error: "tx_reverted" }).code).toBe("RELAYER_REJECTED");
    expect(mapFacilitatorError(403, { error: "recipient_not_allowed" }).code).toBe("RELAYER_REJECTED");
  });
});
