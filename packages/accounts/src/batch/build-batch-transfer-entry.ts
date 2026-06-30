import { Address, xdr } from "@stellar/stellar-sdk";
import { BuckspayError, buildUnsignedCallEntry } from "@buckspay/core";
import type { BuildBatchEntryInput, SubInvocation } from "@buckspay/core";

/**
 * Shared atomic-batch entry builder for BOTH account models (classic G… and contract C…): the
 * unsigned entry is identical across models; only the signer differs.
 *
 * For N>1 same-token `transfer` calls it builds ONE auth entry whose root invocation is the pinned
 * Multicall router's `batch_transfer(payer, token, Vec<(to, amount)>)` with the N transfers as
 * sub-invocations — so the user authorizes the whole batch with a single signature and it settles
 * all-or-nothing through the EXISTING `/relay` (one host-function op; Soroban allows only one).
 *
 * Encoding ported verbatim from the multicall reference (`buildBatchTransferArgs`):
 * `transfers` is an ScVec of 2-tuples, each an ScVec `[Address, i128]` (how soroban-sdk represents
 * `Vec<(Address, i128)>`). Byte-checked against the pinned reference encoding.
 *
 * Callers (the adapters) handle the batch-of-1 golden-parity case BEFORE delegating here, so this
 * function is only invoked for N>1. It still validates the list defensively.
 */
export function buildBatchTransferEntry(
  input: BuildBatchEntryInput,
  multicall: string
): xdr.SorobanAuthorizationEntry {
  const { from, calls, nonce } = input;
  const first = calls[0];
  if (!first) {
    throw new BuckspayError("INVALID_CONFIG", "buildUnsignedBatchEntry requires at least one call");
  }
  const token = first.contract;

  // Each call must be a same-token `transfer(payer, to, amount)`; batch_transfer is single-token.
  const transferTuples: xdr.ScVal[] = [];
  const subInvocations: SubInvocation[] = [];
  for (const call of calls) {
    if (call.contract !== token) {
      throw new BuckspayError(
        "INVALID_CONFIG",
        "a batch must transfer the same token in every call (batch_transfer is single-token)"
      );
    }
    if (call.fn !== "transfer") {
      throw new BuckspayError("INVALID_CONFIG", `batch call fn "${call.fn}" must be "transfer"`);
    }
    const toArg = call.args[1];
    const amountArg = call.args[2];
    if (!toArg || !amountArg) {
      throw new BuckspayError("INVALID_CONFIG", "each batch transfer must include (from, to, amount) args");
    }
    // tuple (to, amount) — reuse the original ScVals so the encoding is byte-exact.
    transferTuples.push(xdr.ScVal.scvVec([toArg, amountArg]));
    // the SAC transfer the Multicall performs on the payer's behalf, declared in the auth tree.
    subInvocations.push({ contract: token, fn: "transfer", args: call.args });
  }

  const args = [
    new Address(from).toScVal(), // payer
    new Address(token).toScVal(), // token SAC
    xdr.ScVal.scvVec(transferTuples) // Vec<(to, amount)>
  ];

  return buildUnsignedCallEntry({
    from,
    contract: multicall,
    fn: "batch_transfer",
    args,
    nonce,
    subInvocations
  });
}
