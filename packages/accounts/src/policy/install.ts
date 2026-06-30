import { StrKey, xdr } from "@stellar/stellar-sdk";
import { BuckspayError, type SessionPolicy } from "@buckspay/core";
import { compilePolicies } from "./compile.js";

/** Decode an ed25519 session key (Stellar G-address) to its raw 32-byte public key. */
function sessionKeyBytes(sessionKey: string): Buffer {
  if (!StrKey.isValidEd25519PublicKey(sessionKey)) {
    throw new BuckspayError(
      "INVALID_CONFIG",
      "session key must be an ed25519 G-address (the public key of the policy-scoped session signer)"
    );
  }
  return Buffer.from(StrKey.decodeEd25519PublicKey(sessionKey));
}

/**
 * Args for the policy account's `add_signer(session_key: BytesN<32>, policy: Policy)` install call:
 * `[BytesN(sessionKey), <compiled Policy struct>]`. `sessionKey` is the session signer's ed25519
 * G-address; `expiresAt` is the session's on-chain expiry (ledger timestamp, seconds). Refuses an
 * unbounded session (no spend limit / empty allowlist) via `compilePolicies`.
 */
export function buildInstallArgs(input: {
  sessionKey: string;
  policies: SessionPolicy[];
  expiresAt: number | bigint;
}): xdr.ScVal[] {
  return [xdr.ScVal.scvBytes(sessionKeyBytes(input.sessionKey)), compilePolicies(input.policies, input.expiresAt)];
}

/** Args for the policy account's `remove_signer(session_key: BytesN<32>)` revoke call: `[BytesN(sessionKey)]`.
 *  Revocation takes effect immediately — a subsequent session-signed call is rejected on-chain. */
export function buildRevokeArgs(input: { sessionKey: string }): xdr.ScVal[] {
  return [xdr.ScVal.scvBytes(sessionKeyBytes(input.sessionKey))];
}
