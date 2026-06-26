import { describe, it, expect } from "vitest";
import { version } from "./index.js";

describe("@buckspay/core", () => {
  it("exports a string version", () => {
    expect(typeof version).toBe("string");
    expect(version.length).toBeGreaterThan(0);
  });
});
