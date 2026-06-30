[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / SessionPolicy

# Type Alias: SessionPolicy

> **SessionPolicy** = \{ `kind`: `"spendLimit"`; `max`: `string`; `period`: `"day"` \| `"week"` \| `"month"` \| `"total"`; `token`: `string`; \} \| \{ `contracts`: `string`[]; `kind`: `"allowlist"`; \}

Defined in: [packages/core/src/types.ts:219](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/core/src/types.ts#L219)

Session policy compiled to an on-chain policy signer in `__check_auth`.
