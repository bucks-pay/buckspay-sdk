import { describe, expect, it } from "vitest";
import { GasAbstractionEngine } from "../src/gas-abstraction-engine";
import { BuckspayError } from "../src/errors";

describe("GasAbstractionEngine construction", () => {
  it("constructs with the sponsored gas config", () => {
    const engine = new GasAbstractionEngine({ mode: "sponsored" });
    expect(engine).toBeInstanceOf(GasAbstractionEngine);
  });

  it("rejects an unsupported gas mode with INVALID_CONFIG", () => {
    // Force an invalid mode past the type system to prove the runtime guard.
    expect(() => new GasAbstractionEngine({ mode: "pay-in-token" } as never)).toThrowError(BuckspayError);
    try {
      new GasAbstractionEngine({ mode: "pay-in-token" } as never);
    } catch (e) {
      expect((e as BuckspayError).code).toBe("INVALID_CONFIG");
    }
  });
});
