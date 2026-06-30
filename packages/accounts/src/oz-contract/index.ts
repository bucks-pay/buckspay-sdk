/**
 * OpenZeppelin Smart Account adapter for `C...` contract accounts + passkey
 * (`@buckspay/accounts/oz-contract`).
 *
 * `ozContractAccount(opts?)` returns an `AccountAdapter` (model "contract") that derives
 * the deterministic C-address (matching the facilitator's derivation), deploys the OZ smart
 * account via the relayer when needed, and builds + assembles the `__check_auth` auth entry
 * with the passkey signature. The sponsor key lives only in the facilitator.
 */
import { BuckspayError } from "@buckspay/core";
import type {
  AccountAdapter,
  AssembleInput,
  BuildBatchEntryInput,
  BuildEntryInput,
  BuckspaySigner,
  EnsureReadyInput,
  SessionInstallInput,
  SessionRevokeInput
} from "@buckspay/core";
import { resolveContractAddress } from "./resolveAddress.js";
import { ensureContractReady } from "./ensureReady.js";
import { buildContractEntry } from "./buildEntry.js";
import { assembleContractEntry } from "./assemble.js";
import type { OzContractOptions } from "./resolveAddress.js";
import { assertPinnedWasmHash, OZ_SMART_ACCOUNT_WASM_HASH } from "./wasm-pin.js";
import { buildBatchTransferEntry } from "../batch/build-batch-transfer-entry.js";
import { resolveMulticallContract } from "../batch/multicall-pin.js";
import { buildSessionInstallEntry, buildSessionRevokeEntry } from "./session.js";

export type { OzContractOptions } from "./resolveAddress.js";
export { deriveContractAddress, contractSalt } from "./resolveAddress.js";
export { OZ_SMART_ACCOUNT_WASM_HASH, assertPinnedWasmHash } from "./wasm-pin.js";
export { buildBatchTransferEntry } from "../batch/build-batch-transfer-entry.js";
export { MULTICALL_CONTRACT_ID, resolveMulticallContract } from "../batch/multicall-pin.js";

export function ozContractAccount(opts: OzContractOptions = {}): AccountAdapter {
  // Pin guard: refuse any Wasm hash other than the on-chain-validated pinned one.
  assertPinnedWasmHash(opts.wasmHash ?? OZ_SMART_ACCOUNT_WASM_HASH);
  return {
    model: "contract",
    resolveAddress: (signer: BuckspaySigner) => resolveContractAddress(signer, opts),
    ensureReady: (input: EnsureReadyInput) => ensureContractReady(input),
    buildUnsignedEntry: (input: BuildEntryInput) => buildContractEntry(input),
    buildUnsignedBatchEntry: (input: BuildBatchEntryInput) => {
      const first = input.calls[0];
      if (!first) {
        throw new BuckspayError("INVALID_CONFIG", "buildUnsignedBatchEntry requires at least one call");
      }
      // Batch of 1 -> byte-identical to the single-call __check_auth entry (golden invariant).
      if (input.calls.length === 1) {
        return buildContractEntry({ from: input.from, call: first, nonce: input.nonce });
      }
      return buildBatchTransferEntry(input, resolveMulticallContract(input.network, opts.multicallContract));
    },
    assembleSignedEntry: (input: AssembleInput) => assembleContractEntry(input),
    buildSessionInstallEntry: (input: SessionInstallInput) => buildSessionInstallEntry(input),
    buildSessionRevokeEntry: (input: SessionRevokeInput) => buildSessionRevokeEntry(input)
  };
}
