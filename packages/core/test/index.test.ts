import { describe, expect, it } from "vitest";
import * as core from "../src/index";
import { BuckspayError } from "../src/index";

describe("@buckspay/core public entry", () => {
  it("re-exports the runtime BuckspayError class", () => {
    expect(typeof core.BuckspayError).toBe("function");
    expect(new BuckspayError("INVALID_CONFIG", "x")).toBeInstanceOf(Error);
  });

  it("does not leak unexpected runtime exports (types erase at build)", () => {
    // Only BuckspayError is a runtime value; everything else is type-only.
    expect(Object.keys(core)).toEqual(["BuckspayError"]);
  });
});
