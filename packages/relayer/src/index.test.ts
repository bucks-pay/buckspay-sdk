import { describe, it, expect } from "vitest";
import { version } from "./index.js";
import { version as facilitatorVersion } from "./buckspay-facilitator.js";

describe("@buckspay/relayer", () => {
  it("root and subpath export string versions", () => {
    expect(typeof version).toBe("string");
    expect(typeof facilitatorVersion).toBe("string");
  });
});
