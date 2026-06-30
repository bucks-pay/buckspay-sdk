import { BuckspayError } from "@buckspay/core";

/**
 * Pinned OpenZeppelin Smart Account Wasm hash (hex, 32 bytes). This is the EXACT contract
 * code buckspay deploys/authorizes against; any other hash is rejected so a compromised or
 * swapped Wasm cannot be silently used.
 *
 * VALUE: the hash validated on-chain against the installed testnet Wasm. The
 * hash is the sha256 of the Wasm bytes, so it is network-independent (same on pubnet once
 * installed). It must stay byte-identical to the facilitator's `OZ_SMART_ACCOUNT_WASM_HASH`.
 */
export const OZ_SMART_ACCOUNT_WASM_HASH = "bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69";

/** Refuse any Wasm hash other than the pinned one (or a malformed hash). */
export function assertPinnedWasmHash(hash: string): void {
  if (!/^[0-9a-f]{64}$/.test(hash)) {
    throw new BuckspayError("INVALID_CONFIG", `wasm hash must be 32-byte hex, got "${hash}"`);
  }
  if (hash !== OZ_SMART_ACCOUNT_WASM_HASH) {
    throw new BuckspayError("INVALID_CONFIG", "OZ Smart Account wasm hash does not match the pinned value");
  }
}
