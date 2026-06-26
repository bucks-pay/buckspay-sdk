import { describe, expect, it } from "vitest";
import * as core from "../src/index";

describe("@buckspay/core engine re-export", () => {
  it("re-exports the GasAbstractionEngine class", () => {
    expect(typeof core.GasAbstractionEngine).toBe("function");
    const engine = new core.GasAbstractionEngine({ mode: "sponsored" });
    expect(engine.toRelayPayload).toBeTypeOf("function");
  });
});
