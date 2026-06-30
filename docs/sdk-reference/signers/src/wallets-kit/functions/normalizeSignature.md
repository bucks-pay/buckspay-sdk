[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [signers/src/wallets-kit](../README.md) / normalizeSignature

# Function: normalizeSignature()

> **normalizeSignature**(`signedAuthEntryB64`): `Uint8Array`

Defined in: [packages/signers/src/wallets-kit/normalize-signature.ts:24](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/signers/src/wallets-kit/normalize-signature.ts#L24)

Normalize the signature returned by Wallets Kit to the 64-byte Ed25519 value.

The FreighterModule double-encodes (`Buffer.from(string)` without `'base64'`),
so a 64-byte signature can come back as 88 bytes - the ASCII of its own base64.
We detect that case (the bytes decode to a valid base64 string whose inner
decode is exactly 64 bytes) and unwrap it. Anything else is a hard failure:
shipping a malformed signature to the relayer fails far downstream with a
cryptic error, so we fail loudly here as `SIGNATURE_REJECTED`.

Ported from the dashboard's `web3-stellar/sign.ts` (verified against real
wallet-captured fixtures); the dashboard's silent `return decoded` fallback is
replaced by the assertion below so no consumer ever sees a non-64-byte value.

## Parameters

### signedAuthEntryB64

`string`

## Returns

`Uint8Array`
