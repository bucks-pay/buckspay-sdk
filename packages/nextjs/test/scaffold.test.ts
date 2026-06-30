import { describe, expect, it } from "vitest";
import * as nextjs from "../src/index";

describe("@buckspay/nextjs package surface", () => {
  it("ships the App Router route factories", () => {
    expect(nextjs).toBeDefined();
    expect(typeof nextjs.createRelayRoute).toBe("function");
    expect(typeof nextjs.createSignerProxyRoute).toBe("function");
  });
});
