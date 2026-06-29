import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

// Copyleft / Unknown / UNLICENSED licenses in the PRODUCTION tree are an ACCEPTED risk ONLY
// when they are transitive deps of `@creit.tech/stellar-wallets-kit`'s multi-wallet connectors
// (Trezor/Near/Hot/WalletConnect/ethereumjs/xBull/LOBSTR) — connector modules the Stellar
// gasless path never exercises, never redistributed as part of any @buckspay/* package
// (see docs/security/audit-prep.md). This guard LOCKS that acceptance: any copyleft/Unknown
// dep OUTSIDE the known wallets-kit set — e.g. one introduced by buckspay code or a different
// dependency — fails CI. (Narrowing the runtime modules does not remove these: they are HARD
// deps of the umbrella package. The clean-slate fix is to vendor a Freighter-only connector.)
const FORBIDDEN = /(^|[^A-Za-z])(AGPL|LGPL|GPL|MPL)([^A-Za-z]|$)|Unknown|UNLICENSED/i;

// The accepted wallets-kit transitive set (mirrors scripts/check-licenses.mjs).
const KNOWN_NAMES = new Set(["rpc-websockets", "ua-parser-js", "text-encoding-utf-8"]);
const KNOWN_PREFIXES = [
  "@trezor/",
  "@near-wallet-selector/",
  "@ethereumjs/",
  "@lobstrco/",
  "@hot-wallet/",
  "@walletconnect/",
  "@creit.tech/xbull"
];
function isKnownWalletsKitDep(name: string): boolean {
  return KNOWN_NAMES.has(name) || KNOWN_PREFIXES.some((p) => name.startsWith(p));
}

function prodLicenses(): Record<string, Array<{ name: string }>> {
  let raw = "{}";
  try {
    raw = execSync("pnpm licenses list --json --prod", {
      cwd: new URL("../../..", import.meta.url).pathname,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024
    });
  } catch (err) {
    raw = (err as { stdout?: Buffer }).stdout?.toString() ?? "{}";
  }
  return JSON.parse(raw || "{}");
}

describe("production dependency tree license hygiene", () => {
  const data = prodLicenses();

  it("has no UNEXPECTED copyleft/unknown prod dep (all are confined to the wallets-kit tree)", () => {
    const offenders: string[] = [];
    for (const [license, pkgs] of Object.entries(data)) {
      if (!FORBIDDEN.test(license)) continue;
      for (const p of pkgs) {
        if (!isKnownWalletsKitDep(p.name)) offenders.push(`${p.name}: ${license}`);
      }
    }
    expect(
      offenders,
      `copyleft/unknown prod deps OUTSIDE the accepted wallets-kit set:\n${offenders.join("\n")}`
    ).toEqual([]);
  });
});
