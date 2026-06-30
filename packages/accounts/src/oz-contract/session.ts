import type { xdr } from "@stellar/stellar-sdk";
import type { SessionInstallInput, SessionRevokeInput } from "@buckspay/core";
import { buildInstallArgs, buildRevokeArgs } from "../policy/index.js";
import { buildContractEntry } from "./buildEntry.js";

/** The contract account's self-administration function names. */
const ADD_SIGNER_FN = "add_signer";
const REMOVE_SIGNER_FN = "remove_signer";

/**
 * UNSIGNED `add_signer` install: the account contract invokes it on ITSELF, authorized by the root
 * signer's `__check_auth` at assemble time. The session's on-chain expiry is `grant.expiresAt`
 * (epoch ms) converted to a ledger timestamp in seconds.
 */
export function buildSessionInstallEntry(input: SessionInstallInput): xdr.SorobanAuthorizationEntry {
  const expiresAtSeconds = Math.floor(input.grant.expiresAt / 1000);
  const args = buildInstallArgs({
    sessionKey: input.grant.sessionKey.publicKey,
    policies: input.grant.policies,
    expiresAt: expiresAtSeconds
  });
  return buildContractEntry({
    from: input.from,
    call: { contract: input.from, fn: ADD_SIGNER_FN, args },
    nonce: input.nonce
  });
}

/** UNSIGNED `remove_signer` revoke (self-administration). */
export function buildSessionRevokeEntry(input: SessionRevokeInput): xdr.SorobanAuthorizationEntry {
  return buildContractEntry({
    from: input.from,
    call: { contract: input.from, fn: REMOVE_SIGNER_FN, args: buildRevokeArgs({ sessionKey: input.sessionKey }) },
    nonce: input.nonce
  });
}
