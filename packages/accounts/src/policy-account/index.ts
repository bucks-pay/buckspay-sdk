// @buckspay/accounts/policy-account — an ed25519-root contract account that enforces session-key
// policies (spend limit + allowlist) in its on-chain __check_auth. Pairs with @buckspay/accounts/policy
// (the policy compiler) and the core SessionManager.
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
import { resolvePolicyAccountAddress, type PolicyAccountOptions } from "./resolveAddress.js";
import { assemblePolicyEntry } from "./assemble.js";
import { ensurePolicyAccountReady } from "./ensureReady.js";
import { buildContractEntry } from "../oz-contract/buildEntry.js";
import { buildSessionInstallEntry, buildSessionRevokeEntry } from "../oz-contract/session.js";
import { buildBatchTransferEntry } from "../batch/build-batch-transfer-entry.js";
import { resolveMulticallContract } from "../batch/multicall-pin.js";

export type { PolicyAccountOptions } from "./resolveAddress.js";
export { POLICY_ACCOUNT_WASM_HASH, assertPinnedPolicyWasm } from "./wasm-pin.js";
export { resolvePolicyAccountAddress } from "./resolveAddress.js";

export function policyAccount(opts: PolicyAccountOptions = {}): AccountAdapter {
  return {
    model: "contract",
    resolveAddress: (signer: BuckspaySigner) => resolvePolicyAccountAddress(signer, opts),
    ensureReady: (input: EnsureReadyInput) => ensurePolicyAccountReady(input),
    buildUnsignedEntry: (input: BuildEntryInput) => buildContractEntry(input),
    buildUnsignedBatchEntry: (input: BuildBatchEntryInput) => {
      const first = input.calls[0];
      if (!first) {
        throw new BuckspayError("INVALID_CONFIG", "buildUnsignedBatchEntry requires at least one call");
      }
      if (input.calls.length === 1) {
        return buildContractEntry({ from: input.from, call: first, nonce: input.nonce });
      }
      return buildBatchTransferEntry(input, resolveMulticallContract(input.network, opts.multicallContract));
    },
    assembleSignedEntry: (input: AssembleInput) => assemblePolicyEntry(input),
    buildSessionInstallEntry: (input: SessionInstallInput) => buildSessionInstallEntry(input),
    buildSessionRevokeEntry: (input: SessionRevokeInput) => buildSessionRevokeEntry(input)
  };
}
