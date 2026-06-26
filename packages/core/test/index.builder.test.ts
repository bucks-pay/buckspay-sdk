import { describe, expect, it } from "vitest";
import * as core from "../src/index";

describe("@buckspay/core builder re-exports", () => {
  it("re-exports the builder runtime functions", () => {
    expect(typeof core.toStroops).toBe("function");
    expect(typeof core.randomNonce).toBe("function");
    expect(typeof core.getLatestLedger).toBe("function");
    expect(typeof core.buildUnsignedEntry).toBe("function");
    expect(typeof core.simulateRecording).toBe("function");
    expect(core.USDC_DECIMALS).toBe(7);
  });

  it("toStroops is wired through the barrel (1.5 -> 15000000)", () => {
    expect(core.toStroops("1.5")).toBe(15_000_000n);
  });
});
