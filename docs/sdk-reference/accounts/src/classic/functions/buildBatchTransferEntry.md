---
title: "Function: buildBatchTransferEntry()"
---

# Function: buildBatchTransferEntry()

> **buildBatchTransferEntry**(`input`, `multicall`): `SorobanAuthorizationEntry`

Defined in: [packages/accounts/src/batch/build-batch-transfer-entry.ts:21](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/batch/build-batch-transfer-entry.ts#L21)

Shared atomic-batch entry builder for BOTH account models (classic G... and contract C...): the
unsigned entry is identical across models; only the signer differs.

For N>1 same-token `transfer` calls it builds ONE auth entry whose root invocation is the pinned
Multicall router's `batch_transfer(payer, token, Vec<(to, amount)>)` with the N transfers as
sub-invocations - so the user authorizes the whole batch with a single signature and it settles
all-or-nothing through the EXISTING `/relay` (one host-function op; Soroban allows only one).

Encoding ported verbatim from the multicall reference (`buildBatchTransferArgs`):
`transfers` is an ScVec of 2-tuples, each an ScVec `[Address, i128]` (how soroban-sdk represents
`Vec<(Address, i128)>`). Byte-checked against the pinned reference encoding.

Callers (the adapters) handle the batch-of-1 golden-parity case BEFORE delegating here, so this
function is only invoked for N>1. It still validates the list defensively.

## Parameters

### input

`BuildBatchEntryInput`

### multicall

`string`

## Returns

`SorobanAuthorizationEntry`
