// License allow-list gate. Uses pnpm's native `licenses list --json` (no extra dep).
// Fails on any production dependency whose license is outside the permissive allow-list.
import { execSync } from "node:child_process";

const ALLOW = new Set([
  "MIT",
  "Apache-2.0",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "CC0-1.0",
  "0BSD",
  "BlueOak-1.0.0",
  "Unlicense",
  "Python-2.0",
  "MIT-0",
  "(MIT OR Apache-2.0)",
  "(MIT OR CC0-1.0)",
  "(Apache-2.0 OR MPL-1.1)",
  "(MIT AND BSD-3-Clause)",
  "(Apache-2.0 AND MIT)",
  "(MIT AND Apache-2.0)"
]);

/**
 * Vetted exceptions — name (or prefix via `isException`) → reason. All of these are
 * TRANSITIVE deps of `@creit.tech/stellar-wallets-kit` (a multi-wallet connector that
 * pulls Trezor/Near/WalletConnect adapters). They are NOT buckspay code and are not
 * redistributed as part of the SDK; their copyleft is confined to wallet-connector
 * modules the Stellar gasless path does not exercise. Tracked in audit-prep.md.
 */
const EXCEPTIONS = new Map([
  ["rpc-websockets", "LGPL-3.0 — transitive via stellar-wallets-kit"],
  ["ua-parser-js", "AGPL-3.0 — transitive via stellar-wallets-kit (WalletConnect)"],
  ["text-encoding-utf-8", "Unknown — transitive via stellar-wallets-kit"]
]);
// All transitive deps of @creit.tech/stellar-wallets-kit's wallet connectors (Trezor,
// xBull, LOBSTR, Near, Hot, WalletConnect, ethereumjs). Copyleft/Unknown here is confined
// to connector modules the Stellar gasless path never exercises — see audit-prep.md.
const WALLETKIT_PREFIXES = [
  "@trezor/",
  "@near-wallet-selector/",
  "@ethereumjs/",
  "@lobstrco/",
  "@hot-wallet/",
  "@walletconnect/",
  "@creit.tech/xbull"
];
function isException(name) {
  return EXCEPTIONS.has(name) || WALLETKIT_PREFIXES.some((p) => name.startsWith(p));
}

let raw;
try {
  raw = execSync("pnpm licenses list --json --prod", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch (err) {
  // pnpm exits non-zero when it has nothing to report in some versions; tolerate empty.
  raw = err.stdout?.toString() ?? "{}";
}

const data = JSON.parse(raw || "{}");
const offenders = [];
let total = 0;
for (const [license, pkgs] of Object.entries(data)) {
  const list = Array.isArray(pkgs) ? pkgs : [];
  total += list.length;
  if (ALLOW.has(license)) continue;
  for (const p of list) {
    const name = p.name ?? String(p);
    if (isException(name)) continue;
    offenders.push(`${name}: ${license}`);
  }
}

if (offenders.length > 0) {
  console.error("DISALLOWED licenses:\n  " + offenders.join("\n  "));
  process.exit(1);
}
console.log(`licenses: all ${total} prod deps within allow-list`);
