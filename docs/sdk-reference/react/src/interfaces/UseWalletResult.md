[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [react/src](../README.md) / UseWalletResult

# Interface: UseWalletResult

Defined in: [packages/react/src/use-wallet.ts:8](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/react/src/use-wallet.ts#L8)

## Properties

### address

> **address**: `string` \| `null`

Defined in: [packages/react/src/use-wallet.ts:10](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/react/src/use-wallet.ts#L10)

***

### connect

> **connect**: () => `Promise`\<`void`\>

Defined in: [packages/react/src/use-wallet.ts:11](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/react/src/use-wallet.ts#L11)

#### Returns

`Promise`\<`void`\>

***

### error

> **error**: `BuckspayError` \| `null`

Defined in: [packages/react/src/use-wallet.ts:13](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/react/src/use-wallet.ts#L13)

***

### status

> **status**: `"idle"` \| `"connecting"` \| `"ready"` \| `"signing"` \| `"relaying"` \| `"success"` \| `"error"`

Defined in: [packages/react/src/use-wallet.ts:12](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/react/src/use-wallet.ts#L12)

***

### wallet

> **wallet**: `BuckspayWallet` \| `null`

Defined in: [packages/react/src/use-wallet.ts:9](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/react/src/use-wallet.ts#L9)
