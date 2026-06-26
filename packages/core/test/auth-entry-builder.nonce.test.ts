import { afterEach, describe, expect, it, vi } from "vitest";
import { randomNonce } from "../src/auth-entry-builder";

const CAP = 0x000fffffffffffffn; // 52 bits

afterEach(() => {
  vi.restoreAllMocks();
});

describe("randomNonce", () => {
  it("never exceeds the 52-bit cap (Number-safe for facilitator)", () => {
    for (let i = 0; i < 256; i++) {
      const n = randomNonce();
      expect(n).toBeGreaterThanOrEqual(0n);
      expect(n).toBeLessThanOrEqual(CAP);
      expect(Number.isSafeInteger(Number(n))).toBe(true);
    }
  });

  it("masks high bits even when RNG returns all-0xFF bytes", () => {
    vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(((buf: Uint8Array) => {
      buf.fill(0xff);
      return buf;
    }) as typeof crypto.getRandomValues);
    expect(randomNonce()).toBe(CAP);
  });

  it("returns 0 when RNG returns all-0x00 bytes", () => {
    vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(((buf: Uint8Array) => {
      buf.fill(0x00);
      return buf;
    }) as typeof crypto.getRandomValues);
    expect(randomNonce()).toBe(0n);
  });
});
