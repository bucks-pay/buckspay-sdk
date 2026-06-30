import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Address, StrKey, scValToNative, xdr } from "@stellar/stellar-sdk";
import { allowlist, spendLimit, buildInstallArgs } from "../src/policy/index";
import type { SessionPolicy } from "@buckspay/core";

// The on-chain-accepted install payload, frozen from a real testnet run. `buildInstallArgs` must
// reproduce these exact bytes — so a stellar-sdk bump or an accidental shape edit fails loudly.
const FIXTURE = fileURLToPath(
  new URL("../../../spikes/sp2-policy-signer/fixtures/policy-install.json", import.meta.url)
);

const PERIOD_BY_SECONDS: Record<string, "day" | "week" | "month" | "total"> = {
  "86400": "day",
  "604800": "week",
  "2592000": "month",
  "3155760000": "total"
};

describe("policy install — golden parity with the on-chain-accepted fixture", () => {
  it("buildInstallArgs reproduces the frozen installArgsXdr byte-for-byte", () => {
    const fx = JSON.parse(readFileSync(FIXTURE, "utf8")) as { schemaVersion: number; installArgsXdr: string[] };
    expect(fx.schemaVersion).toBe(1);
    expect(fx.installArgsXdr).toHaveLength(2);

    // Recover the logical inputs from the frozen args, then rebuild via the shipped encoder.
    const [a0, a1] = fx.installArgsXdr.map((b64) => xdr.ScVal.fromXDR(b64, "base64"));
    const sessionKey = StrKey.encodeEd25519PublicKey(a0!.bytes());
    const policyMap = a1!.map()!;
    const field = (k: string): xdr.ScVal => policyMap.find((e) => e.key().sym().toString() === k)!.val();

    const contracts = field("allowlist")
      .vec()!
      .map((c) => Address.fromScVal(c).toString());
    const token = Address.fromScVal(field("spend_token")).toString();
    const max = (scValToNative(field("spend_max")) as bigint).toString();
    const period = PERIOD_BY_SECONDS[(scValToNative(field("spend_period")) as bigint).toString()]!;
    const expiresAt = scValToNative(field("expiration")) as bigint;

    const policies: SessionPolicy[] = [spendLimit({ token, max, period }), allowlist(contracts)];
    const args = buildInstallArgs({ sessionKey, policies, expiresAt });

    expect(args.map((a) => a.toXDR("base64"))).toEqual(fx.installArgsXdr);
  });
});
