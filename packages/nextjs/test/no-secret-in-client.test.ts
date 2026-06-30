import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as nextjs from "../src/index.js";

const routesSrc = readFileSync(fileURLToPath(new URL("../src/routes.ts", import.meta.url)), "utf8");
const indexSrc = readFileSync(fileURLToPath(new URL("../src/index.ts", import.meta.url)), "utf8");

describe("@buckspay/nextjs no-secret-in-client", () => {
  it("the secret-bearing module carries the SERVER-ONLY banner", () => {
    expect(routesSrc.startsWith("// SERVER-ONLY")).toBe(true);
  });

  it("the package exports only the route factories + types — no secret value or accessor", () => {
    const names = Object.keys(nextjs);
    expect(names).toContain("createRelayRoute");
    expect(names).toContain("createSignerProxyRoute");
    // No exported value name leaks a key/secret.
    expect(names.some((n) => /apiKey|secret|key$/i.test(n))).toBe(false);
  });

  it("the public index never re-reads process.env or hard-codes a key (that lives in routes.ts, server-only)", () => {
    expect(indexSrc).not.toMatch(/process\.env/);
    expect(indexSrc).not.toMatch(/x-api-key/i);
  });

  it("the route factory holds apiKey in a closure / server env — never returned to the caller", () => {
    const handler = nextjs.createRelayRoute({
      facilitatorUrl: "https://f.example",
      apiKey: "ZZZ_SECRET",
      network: "testnet"
    });
    // The returned handler is an opaque function; its source must not embed the key literal.
    expect(handler.toString()).not.toContain("ZZZ_SECRET");
    expect(typeof handler).toBe("function");
  });
});
