import { hash } from "@stellar/stellar-sdk";
import { z } from "zod";
import { BuckspayError } from "./errors";
import type { Session, SessionPolicy } from "./types";

/**
 * Deterministic session id over (account, sessionKey, expiresAt). Uses the stellar-sdk's isomorphic
 * `hash` (sha256) so it is identical in the browser, React Native, and Node. Pure: no clock.
 */
export function sessionId(input: { account: string; sessionKey: string; expiresAt: number }): string {
  const material = `${input.account}|${input.sessionKey}|${String(input.expiresAt)}`;
  return hash(Buffer.from(material, "utf8")).toString("hex").slice(0, 32);
}

/** Serialize a session to a base64url-encoded JSON blob (e.g. for secure storage). Pure. */
export function serializeSession(s: Session): string {
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64url");
}

const policySchema: z.ZodType<SessionPolicy> = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("spendLimit"),
    token: z.string(),
    max: z.string(),
    period: z.enum(["day", "week", "month", "total"])
  }),
  z.object({ kind: z.literal("allowlist"), contracts: z.array(z.string()) })
]);

const sessionSchema: z.ZodType<Session> = z.object({
  id: z.string().min(1),
  account: z.string().min(1),
  sessionKey: z.string().min(1),
  policies: z.array(policySchema).min(1),
  expiresAt: z.number().int().positive()
});

/** The single impure boundary: reads the host clock only when `now` is not injected. */
function hostNow(): number {
  return Date.now();
}

/**
 * Parse + validate a serialized session and enforce expiry. `now` (epoch ms) is injected so the
 * expiry check stays deterministic; when omitted it falls back to the host clock at this single
 * boundary. Throws `SESSION_EXPIRED` if the session is past its `expiresAt`, `INVALID_CONFIG` if the
 * blob is not a valid serialized session.
 */
export function deserializeSession(blob: string, now?: number): Session {
  let raw: unknown;
  try {
    raw = JSON.parse(Buffer.from(blob, "base64url").toString("utf8"));
  } catch (cause) {
    throw new BuckspayError("INVALID_CONFIG", "deserializeSession: blob is not valid base64url JSON", { cause });
  }
  const parsed = sessionSchema.safeParse(raw);
  if (!parsed.success) {
    throw new BuckspayError("INVALID_CONFIG", "deserializeSession: blob is not a valid session", {
      cause: parsed.error
    });
  }
  const ref = now ?? hostNow();
  if (parsed.data.expiresAt < ref) {
    throw new BuckspayError("SESSION_EXPIRED", "deserializeSession: session is past its expiresAt");
  }
  return parsed.data;
}
