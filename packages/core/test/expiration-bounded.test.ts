import { describe, it, expect } from "vitest";
import { boundExpirationLedger, MAX_EXPIRATION_LEDGERS } from "../src/expiration.js";

describe("signatureExpirationLedger bounds", () => {
  const current = 1_000_000;
  it("caps the delta to the ceiling", () => {
    expect(boundExpirationLedger(current, 10_000_000)).toBe(current + MAX_EXPIRATION_LEDGERS);
  });
  it("keeps a reasonable delta intact", () => {
    expect(boundExpirationLedger(current, current + 60)).toBe(current + 60);
  });
  it("rejects an already-passed expiration", () => {
    expect(() => boundExpirationLedger(current, current)).toThrow(/AUTH_EXPIRED|expired/i);
  });
  it("ceiling is positive and bounded (~50 min at ~5s/ledger)", () => {
    expect(MAX_EXPIRATION_LEDGERS).toBeGreaterThan(0);
    expect(MAX_EXPIRATION_LEDGERS).toBeLessThanOrEqual(600);
  });
});
