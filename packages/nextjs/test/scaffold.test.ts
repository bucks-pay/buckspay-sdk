import { describe, expect, it } from "vitest";
import * as nextjs from "../src/index";

describe("@buckspay/nextjs scaffold", () => {
  it("module loads (route helpers arrive in sprint-4)", () => {
    expect(nextjs).toBeDefined();
    expect("createRelayRoute" in nextjs).toBe(false);
    expect("createSignerProxyRoute" in nextjs).toBe(false);
  });
});
