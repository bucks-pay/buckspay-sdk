[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/policy-account](../README.md) / POLICY\_ACCOUNT\_WASM\_HASH

# Variable: POLICY\_ACCOUNT\_WASM\_HASH

> `const` **POLICY\_ACCOUNT\_WASM\_HASH**: `"58a0fbac8456490c7aedbd9c053c3e0be759288a056fc772e268548962713e35"` = `"58a0fbac8456490c7aedbd9c053c3e0be759288a056fc772e268548962713e35"`

Defined in: [packages/accounts/src/policy-account/wasm-pin.ts:8](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/policy-account/wasm-pin.ts#L8)

Pinned policy-account contract Wasm hash (sha256 of the wasm bytes; network-independent). The session
account is a deliberately-audited custom contract; the deploy refuses any other hash. Env-overridable
for a future re-pin (break-glass only).
