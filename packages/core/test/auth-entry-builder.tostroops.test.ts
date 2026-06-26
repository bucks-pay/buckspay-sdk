import { describe, expect, it } from "vitest";
import { toStroops, USDC_DECIMALS } from "../src/auth-entry-builder";

describe("toStroops", () => {
  it("uses 7 decimals for USDC", () => {
    expect(USDC_DECIMALS).toBe(7);
  });

  it("converts a fractional amount (dashboard golden: 1.5 -> 15000000)", () => {
    expect(toStroops("1.5")).toBe(15_000_000n);
  });

  it("converts an integer amount", () => {
    expect(toStroops("1")).toBe(10_000_000n);
  });

  it("pads short fractional parts", () => {
    expect(toStroops("0.1")).toBe(1_000_000n);
  });

  it("truncates fractional parts beyond 7 decimals", () => {
    expect(toStroops("1.123456789")).toBe(11_234_567n);
  });

  it("handles a bare leading dot as zero integer part", () => {
    expect(toStroops(".5")).toBe(5_000_000n);
  });

  it("handles zero", () => {
    expect(toStroops("0")).toBe(0n);
  });
});
