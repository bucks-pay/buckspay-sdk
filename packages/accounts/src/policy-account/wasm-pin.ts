import { BuckspayError } from "@buckspay/core";

/**
 * Pinned policy-account contract Wasm hash (sha256 of the wasm bytes; network-independent). The session
 * account is a deliberately-audited custom contract; the deploy refuses any other hash. Env-overridable
 * for a future re-pin (break-glass only).
 */
export const POLICY_ACCOUNT_WASM_HASH = "58a0fbac8456490c7aedbd9c053c3e0be759288a056fc772e268548962713e35";

/** Throw unless `hashHex` equals the pinned policy-account Wasm hash. */
export function assertPinnedPolicyWasm(hashHex: string): void {
  if (hashHex.toLowerCase() !== POLICY_ACCOUNT_WASM_HASH) {
    throw new BuckspayError("INVALID_CONFIG", `policy-account: refusing an unpinned wasm hash ${hashHex}`);
  }
}
