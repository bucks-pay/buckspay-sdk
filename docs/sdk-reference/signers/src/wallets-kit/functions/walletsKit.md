[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/wallets-kit](../README.md) / walletsKit

# Function: walletsKit()

> **walletsKit**(`opts`, `injected?`): [`BuckspaySigner`](../../social/interfaces/BuckspaySigner.md)

Defined in: [packages/signers/src/wallets-kit/signer.ts:26](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/wallets-kit/signer.ts#L26)

Build a `BuckspaySigner` backed by Stellar Wallets Kit (Freighter/xBull/LOBSTR).

Holds only the connected `G...` public key and the 64-byte signatures the wallet
returns - never a secret. The kit and address are memoized per signer instance,
so a signer is safe to construct once and reuse across many sign cycles. An
already-built kit may be injected (production app or tests); otherwise the
browser-only library is lazily imported on first use.

## Parameters

### opts

[`KitOptions`](../interfaces/KitOptions.md)

### injected?

[`WalletsKitLike`](../interfaces/WalletsKitLike.md)

## Returns

[`BuckspaySigner`](../../social/interfaces/BuckspaySigner.md)
