[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / BuckspayErrorCode

# Type Alias: BuckspayErrorCode

> **BuckspayErrorCode** = `"SIGNATURE_REJECTED"` \| `"AUTH_EXPIRED"` \| `"SIMULATION_FAILED"` \| `"ACCOUNT_NOT_READY"` \| `"RELAYER_REJECTED"` \| `"RELAYER_UNREACHABLE"` \| `"INSUFFICIENT_SPONSOR"` \| `"INSUFFICIENT_BALANCE"` \| `"INVALID_CONFIG"` \| `"UNKNOWN"` \| `"TOKEN_GAS_REJECTED"` \| `"BATCH_TOO_LARGE"` \| `"SESSION_EXPIRED"` \| `"SESSION_POLICY_VIOLATION"` \| `"AUTH_PROVIDER_ERROR"` \| `"SWAP_FAILED"`

Defined in: [packages/core/src/errors.ts:6](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/errors.ts#L6)

Closed union of every error condition the SDK surfaces. Facilitator and RPC
failures are mapped onto these codes by the relayer/account adapters; the
consumer never sees a raw upstream error string.
