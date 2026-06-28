import { describe, it, expect } from "vitest";
import { buildClient } from "./harness.js";

describe("buildClient", () => {
  it("wires a classic client on testnet", () => {
    const c = buildClient("classic");
    expect(c.client).toBeDefined();
    expect(c.relayer).toBeDefined();
  });
  it("wires a contract client on testnet", () => {
    const c = buildClient("contract");
    expect(c.client).toBeDefined();
  });
});
