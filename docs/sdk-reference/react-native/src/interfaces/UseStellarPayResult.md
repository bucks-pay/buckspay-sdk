[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [react-native/src](../README.md) / UseStellarPayResult

# Interface: UseStellarPayResult

Defined in: packages/react/dist/index.d.ts:37

## Properties

### error

> **error**: `BuckspayError` \| `null`

Defined in: packages/react/dist/index.d.ts:40

***

### pay

> **pay**: (`calls`) => `Promise`\<`Receipt`\>

Defined in: packages/react/dist/index.d.ts:43

#### Parameters

##### calls

`Call`[]

#### Returns

`Promise`\<`Receipt`\>

***

### prepare

> **prepare**: (`calls`) => `Promise`\<`PreparedIntent`\>

Defined in: packages/react/dist/index.d.ts:41

#### Parameters

##### calls

`Call`[]

#### Returns

`Promise`\<`PreparedIntent`\>

***

### receipt

> **receipt**: `Receipt` \| `null`

Defined in: packages/react/dist/index.d.ts:39

***

### reset

> **reset**: () => `void`

Defined in: packages/react/dist/index.d.ts:44

#### Returns

`void`

***

### sign

> **sign**: (`intent`) => `Promise`\<`SignedIntent`\>

Defined in: packages/react/dist/index.d.ts:42

#### Parameters

##### intent

`PreparedIntent`

#### Returns

`Promise`\<`SignedIntent`\>

***

### status

> **status**: `"idle"` \| `"connecting"` \| `"ready"` \| `"signing"` \| `"relaying"` \| `"success"` \| `"error"`

Defined in: packages/react/dist/index.d.ts:38
