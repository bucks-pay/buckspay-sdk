import { describe, it, expect } from "vitest";
import * as core from "../src/index";

// Parallel throughput (channel-account pool + sponsor fee-bump) is delivered ENTIRELY in the
// facilitator — README §4.4. This pins that it added NOTHING to the published SDK surface.
describe("parallel is transparent — no new SDK surface (README §4.4)", () => {
  it("the batch surface from sprint-2/01 is present and unchanged", () => {
    expect(typeof core.batch).toBe("function");
    expect(core.MAX_BATCH_CALLS).toBeGreaterThan(0);
    expect(typeof core.BuckspayClient.prototype.sendCalls).toBe("function");
  });
  it("parallel added NO channel/pool/parallel symbol to the public API", () => {
    const names = Object.keys(core);
    expect(names.some((n) => /channel|pool|parallel/i.test(n))).toBe(false);
  });
});
