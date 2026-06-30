[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [core/src](../README.md) / SessionPolicy

# Type Alias: SessionPolicy

> **SessionPolicy** = \{ `kind`: `"spendLimit"`; `max`: `string`; `period`: `"day"` \| `"week"` \| `"month"` \| `"total"`; `token`: `string`; \} \| \{ `contracts`: `string`[]; `kind`: `"allowlist"`; \}

Defined in: [packages/core/src/types.ts:219](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/core/src/types.ts#L219)

Session policy compiled to an on-chain policy signer in `__check_auth`.
