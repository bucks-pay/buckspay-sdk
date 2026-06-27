import { describe, expect, it } from "vitest";
import * as core from "../src/index";
import { BuckspayError } from "../src/index";

describe("@buckspay/core public entry", () => {
  it("re-exports the runtime BuckspayError class", () => {
    expect(typeof core.BuckspayError).toBe("function");
    expect(new BuckspayError("INVALID_CONFIG", "x")).toBeInstanceOf(Error);
  });

  it("exposes exactly the runtime values; all interface/type exports erase at build", () => {
    // BuckspayError + the auth-entry-builder runtime functions/const. Everything
    // else in the barrel is `export type` and must not appear as a runtime key.
    expect(Object.keys(core).sort()).toEqual(
      [
        "BuckspayClient",
        "BuckspayError",
        "GasAbstractionEngine",
        "USDC_DECIMALS",
        "buildUnsignedEntry",
        "createBuckspayClient",
        "createBuckspayConfig",
        "createRpcSimContext",
        "createSorobanSimulator",
        "getLatestLedger",
        "randomNonce",
        "simulateRecording",
        "toStroops"
      ].sort()
    );
    expect(Object.keys(core)).not.toContain("Network");
    expect(Object.keys(core)).not.toContain("Relayer");
  });
});
