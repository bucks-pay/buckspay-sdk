[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [react/src](../README.md) / UseStellarPayResult

# Interface: UseStellarPayResult

Defined in: [packages/react/src/use-stellar-pay.ts:15](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/react/src/use-stellar-pay.ts#L15)

## Properties

### error

> **error**: `BuckspayError` \| `null`

Defined in: [packages/react/src/use-stellar-pay.ts:18](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/react/src/use-stellar-pay.ts#L18)

***

### pay

> **pay**: (`calls`) => `Promise`\<`Receipt`\>

Defined in: [packages/react/src/use-stellar-pay.ts:21](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/react/src/use-stellar-pay.ts#L21)

#### Parameters

##### calls

`Call`[]

#### Returns

`Promise`\<`Receipt`\>

***

### prepare

> **prepare**: (`calls`) => `Promise`\<`PreparedIntent`\>

Defined in: [packages/react/src/use-stellar-pay.ts:19](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/react/src/use-stellar-pay.ts#L19)

#### Parameters

##### calls

`Call`[]

#### Returns

`Promise`\<`PreparedIntent`\>

***

### receipt

> **receipt**: `Receipt` \| `null`

Defined in: [packages/react/src/use-stellar-pay.ts:17](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/react/src/use-stellar-pay.ts#L17)

***

### reset

> **reset**: () => `void`

Defined in: [packages/react/src/use-stellar-pay.ts:22](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/react/src/use-stellar-pay.ts#L22)

#### Returns

`void`

***

### sign

> **sign**: (`intent`) => `Promise`\<`SignedIntent`\>

Defined in: [packages/react/src/use-stellar-pay.ts:20](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/react/src/use-stellar-pay.ts#L20)

#### Parameters

##### intent

`PreparedIntent`

#### Returns

`Promise`\<`SignedIntent`\>

***

### status

> **status**: `"idle"` \| `"connecting"` \| `"ready"` \| `"signing"` \| `"relaying"` \| `"success"` \| `"error"`

Defined in: [packages/react/src/use-stellar-pay.ts:16](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/react/src/use-stellar-pay.ts#L16)
