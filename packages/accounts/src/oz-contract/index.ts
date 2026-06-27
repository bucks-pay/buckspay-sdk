/**
 * OpenZeppelin Smart Account adapter for `C…` contract accounts + passkey
 * (`@buckspay/accounts/oz-contract`).
 *
 * `ozContractAccount(opts?)` returns an `AccountAdapter` (model "contract") that derives
 * the deterministic C-address (= facilitator plan 01), deploys the OZ smart account via
 * the relayer when needed, and builds + assembles the `__check_auth` auth entry with the
 * passkey signature (plan 03). The sponsor key lives only in the facilitator.
 */
import type {
  AccountAdapter,
  AssembleInput,
  BuildEntryInput,
  BuckspaySigner,
  EnsureReadyInput
} from "@buckspay/core";
import { resolveContractAddress } from "./resolveAddress.js";
import { ensureContractReady } from "./ensureReady.js";
import { buildContractEntry } from "./buildEntry.js";
import { assembleContractEntry } from "./assemble.js";
import type { OzContractOptions } from "./resolveAddress.js";

export type { OzContractOptions } from "./resolveAddress.js";
export { deriveContractAddress, contractSalt } from "./resolveAddress.js";

export function ozContractAccount(opts: OzContractOptions = {}): AccountAdapter {
  return {
    model: "contract",
    resolveAddress: (signer: BuckspaySigner) => resolveContractAddress(signer, opts),
    ensureReady: (input: EnsureReadyInput) => ensureContractReady(input),
    buildUnsignedEntry: (input: BuildEntryInput) => buildContractEntry(input),
    assembleSignedEntry: (input: AssembleInput) => assembleContractEntry(input)
  };
}
