[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/wallets-kit](../README.md) / WalletsKitLike

# Interface: WalletsKitLike

Defined in: [packages/signers/src/wallets-kit/kit-factory.ts:4](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/wallets-kit/kit-factory.ts#L4)

Minimal structural type of the kit the signer needs (avoids a value import).

## Methods

### getAddress()

> **getAddress**(): `Promise`\<\{ `address`: `string`; \}\>

Defined in: [packages/signers/src/wallets-kit/kit-factory.ts:6](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/wallets-kit/kit-factory.ts#L6)

#### Returns

`Promise`\<\{ `address`: `string`; \}\>

***

### setWallet()

> **setWallet**(`id`): `void`

Defined in: [packages/signers/src/wallets-kit/kit-factory.ts:5](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/wallets-kit/kit-factory.ts#L5)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### signAuthEntry()

> **signAuthEntry**(`preimageXdr`, `opts`): `Promise`\<\{ `signedAuthEntry`: `string`; \}\>

Defined in: [packages/signers/src/wallets-kit/kit-factory.ts:7](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/wallets-kit/kit-factory.ts#L7)

#### Parameters

##### preimageXdr

`string`

##### opts

###### address

`string`

###### networkPassphrase?

`string`

#### Returns

`Promise`\<\{ `signedAuthEntry`: `string`; \}\>

***

### signTransaction()

> **signTransaction**(`txXdr`, `opts`): `Promise`\<\{ `signedTxXdr`: `string`; \}\>

Defined in: [packages/signers/src/wallets-kit/kit-factory.ts:11](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/wallets-kit/kit-factory.ts#L11)

#### Parameters

##### txXdr

`string`

##### opts

###### address

`string`

###### networkPassphrase?

`string`

#### Returns

`Promise`\<\{ `signedTxXdr`: `string`; \}\>
