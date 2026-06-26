import { describe, it, expect } from "vitest";
import { version } from "./index.js";

describe("@buckspay/react", () => {
  it("exports a string version", () => {
    expect(typeof version).toBe("string");
  });

  it("runs in a jsdom environment", () => {
    expect(typeof document).toBe("object");
  });
});
