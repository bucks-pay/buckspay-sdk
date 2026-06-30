import { describe, it, expect } from "vitest";
import { StrKey } from "@stellar/stellar-sdk";
import { BuckspayError } from "../src/errors";
import { sessionId, serializeSession, deserializeSession } from "../src/session";
import type { Session } from "../src/types";

const base = {
  account: StrKey.encodeContract(Buffer.alloc(32, 7)),
  sessionKey: StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 9)),
  policies: [{ kind: "allowlist" as const, contracts: [StrKey.encodeContract(Buffer.alloc(32, 44))] }],
  expiresAt: 1_900_000_000_000 // epoch ms
};

const NOW_BEFORE = 1_800_000_000_000; // < base.expiresAt → not expired
const session = (): Session => ({
  id: sessionId(base),
  account: base.account,
  sessionKey: base.sessionKey,
  policies: [...base.policies],
  expiresAt: base.expiresAt
});

describe("@buckspay/core session identity + serialization", () => {
  it("sessionId is deterministic over (account, sessionKey, expiresAt)", () => {
    expect(sessionId(base)).toBe(sessionId(base));
    expect(sessionId({ ...base, expiresAt: base.expiresAt + 1 })).not.toBe(sessionId(base));
  });

  it("serialize → deserialize round-trips (clock injected, not expired)", () => {
    const s = session();
    expect(deserializeSession(serializeSession(s), NOW_BEFORE)).toEqual(s);
  });

  it("deserialize throws SESSION_EXPIRED for a past session (injected now > expiresAt)", () => {
    const expired: Session = { ...session(), expiresAt: 1_000 };
    try {
      deserializeSession(serializeSession(expired), NOW_BEFORE);
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(BuckspayError);
      expect((e as BuckspayError).code).toBe("SESSION_EXPIRED");
    }
  });

  it("deserialize rejects a malformed blob with INVALID_CONFIG (zod)", () => {
    try {
      deserializeSession(Buffer.from(JSON.stringify({ nope: true })).toString("base64url"), NOW_BEFORE);
      throw new Error("should have thrown");
    } catch (e) {
      expect((e as BuckspayError).code).toBe("INVALID_CONFIG");
    }
  });
});
