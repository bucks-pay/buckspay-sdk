import { describe, it, expect } from "vitest";
import { version } from "./index.js";
import { version as classicVersion } from "./classic.js";
import { version as ozVersion } from "./oz-contract.js";

describe("@buckspay/accounts", () => {
  it("root and subpaths export string versions", () => {
    expect(typeof version).toBe("string");
    expect(typeof classicVersion).toBe("string");
    expect(typeof ozVersion).toBe("string");
  });
});
