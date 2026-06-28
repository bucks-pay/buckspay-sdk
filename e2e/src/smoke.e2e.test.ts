import { describe, it, expect } from "vitest";
import { E2E_ENABLED, e2eEnv } from "./env.js";

describe.skipIf(!E2E_ENABLED)("e2e harness", () => {
  it("resolves a facilitator url", () => {
    expect(e2eEnv.FACILITATOR_URL).toMatch(/^https?:\/\//);
  });
});
