[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / AccountAdapter

# Interface: AccountAdapter

Defined in: [packages/core/src/types.ts:78](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L78)

## Properties

### model

> `readonly` **model**: [`AccountModel`](../type-aliases/AccountModel.md)

Defined in: [packages/core/src/types.ts:79](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L79)

## Methods

### assembleSignedEntry()

> **assembleSignedEntry**(`input`): `Promise`\<`string`\>

Defined in: [packages/core/src/types.ts:84](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L84)

returns the SIGNED auth entry as base64 XDR.

#### Parameters

##### input

[`AssembleInput`](AssembleInput.md)

#### Returns

`Promise`\<`string`\>

***

### buildUnsignedEntry()

> **buildUnsignedEntry**(`input`): `SorobanAuthorizationEntry`

Defined in: [packages/core/src/types.ts:82](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L82)

#### Parameters

##### input

[`BuildEntryInput`](BuildEntryInput.md)

#### Returns

`SorobanAuthorizationEntry`

***

### ensureReady()

> **ensureReady**(`input`): `Promise`\<`void`\>

Defined in: [packages/core/src/types.ts:81](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L81)

#### Parameters

##### input

[`EnsureReadyInput`](EnsureReadyInput.md)

#### Returns

`Promise`\<`void`\>

***

### resolveAddress()

> **resolveAddress**(`signer`): `Promise`\<`string`\>

Defined in: [packages/core/src/types.ts:80](https://github.com/bucks-pay/buckspay-sdk/blob/e72c277e7ff52faad26c1268225fd15d97119646/packages/core/src/types.ts#L80)

#### Parameters

##### signer

[`BuckspaySigner`](BuckspaySigner.md)

#### Returns

`Promise`\<`string`\>
