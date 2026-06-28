import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// pnpm --filter runs with cwd = the package dir, so dist/ is here.
const DIST = join(process.cwd(), "dist");

// Patterns that must NEVER appear in a shipped browser bundle.
const FORBIDDEN = [
  /STELLAR_SPONSOR_SECRET/,
  /\bx-api-key\b/i,
  /S[A-Z2-7]{55}/, // a Stellar secret seed
  /"apiKey"\s*:\s*"[A-Za-z0-9]{16,}"/
];

describe("@buckspay/react bundle hygiene", () => {
  let blob = "";
  beforeAll(() => {
    execSync("pnpm --filter @buckspay/react build", { stdio: "inherit" });
    for (const f of readdirSync(DIST)) {
      if (f.endsWith(".js") || f.endsWith(".cjs") || f.endsWith(".mjs")) {
        blob += readFileSync(join(DIST, f), "utf8");
      }
    }
  }, 120_000);

  it("ships no secret-shaped strings", () => {
    for (const re of FORBIDDEN) expect(blob).not.toMatch(re);
  });
  it("never hardcodes a facilitator key", () => {
    expect(blob).not.toMatch(/apiKey:\s*["'][^"']{16,}/);
  });
});
