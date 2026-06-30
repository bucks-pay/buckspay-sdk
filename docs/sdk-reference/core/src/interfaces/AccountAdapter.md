[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / AccountAdapter

# Interface: AccountAdapter

Defined in: [packages/core/src/types.ts:110](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L110)

## Properties

### model

> `readonly` **model**: [`AccountModel`](../type-aliases/AccountModel.md)

Defined in: [packages/core/src/types.ts:111](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L111)

## Methods

### assembleSignedEntry()

> **assembleSignedEntry**(`input`): `Promise`\<`string`\>

Defined in: [packages/core/src/types.ts:122](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L122)

returns the SIGNED auth entry as base64 XDR.

#### Parameters

##### input

[`AssembleInput`](AssembleInput.md)

#### Returns

`Promise`\<`string`\>

***

### buildSessionInstallEntry()?

> `optional` **buildSessionInstallEntry**(`input`): `SorobanAuthorizationEntry`

Defined in: [packages/core/src/types.ts:126](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L126)

Contract account model only: the UNSIGNED entry that installs a policy-scoped session signer
 (the account self-administers, authorized by the root signer at assemble time). Classic adapters
 omit it → the session flow refuses with INVALID_CONFIG.

#### Parameters

##### input

[`SessionInstallInput`](SessionInstallInput.md)

#### Returns

`SorobanAuthorizationEntry`

***

### buildSessionRevokeEntry()?

> `optional` **buildSessionRevokeEntry**(`input`): `SorobanAuthorizationEntry`

Defined in: [packages/core/src/types.ts:128](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L128)

Contract account model only: the UNSIGNED entry that revokes a session signer.

#### Parameters

##### input

[`SessionRevokeInput`](SessionRevokeInput.md)

#### Returns

`SorobanAuthorizationEntry`

***

### buildUnsignedBatchEntry()

> **buildUnsignedBatchEntry**(`input`): `SorobanAuthorizationEntry`

Defined in: [packages/core/src/types.ts:120](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L120)

Build ONE unsigned auth entry covering an atomic batch of calls. For N>1 it is the pinned
 Multicall router's `batch_transfer(payer, token, Vec<(to, amount)>)` invocation with the N
 transfers as sub-invocations (one nonce, one signature for the whole batch — SAME shape for
 classic and contract, only the signer differs). A batch of 1 MUST equal buildUnsignedEntry of
 the same call (golden no-regression invariant).

#### Parameters

##### input

[`BuildBatchEntryInput`](BuildBatchEntryInput.md)

#### Returns

`SorobanAuthorizationEntry`

***

### buildUnsignedEntry()

> **buildUnsignedEntry**(`input`): `SorobanAuthorizationEntry`

Defined in: [packages/core/src/types.ts:114](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L114)

#### Parameters

##### input

[`BuildEntryInput`](BuildEntryInput.md)

#### Returns

`SorobanAuthorizationEntry`

***

### ensureReady()

> **ensureReady**(`input`): `Promise`\<`void`\>

Defined in: [packages/core/src/types.ts:113](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L113)

#### Parameters

##### input

[`EnsureReadyInput`](EnsureReadyInput.md)

#### Returns

`Promise`\<`void`\>

***

### resolveAddress()

> **resolveAddress**(`signer`): `Promise`\<`string`\>

Defined in: [packages/core/src/types.ts:112](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L112)

#### Parameters

##### signer

[`BuckspaySigner`](BuckspaySigner.md)

#### Returns

`Promise`\<`string`\>
