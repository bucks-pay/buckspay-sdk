---
title: "Variable: OZ_SMART_ACCOUNT_WASM_HASH"
---

# Variable: OZ\_SMART\_ACCOUNT\_WASM\_HASH

> `const` **OZ\_SMART\_ACCOUNT\_WASM\_HASH**: `"bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69"` = `"bf1aa9b2a4f8c05e1e5226009800bf69bd9ab7375ad160a1113d8d31a6ffdc69"`

Defined in: [packages/accounts/src/oz-contract/wasm-pin.ts:12](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/accounts/src/oz-contract/wasm-pin.ts#L12)

Pinned OpenZeppelin Smart Account Wasm hash (hex, 32 bytes). This is the EXACT contract
code buckspay deploys/authorizes against; any other hash is rejected so a compromised or
swapped Wasm cannot be silently used.

VALUE: the hash validated on-chain against the installed testnet Wasm. The
hash is the sha256 of the Wasm bytes, so it is network-independent (same on pubnet once
installed). It must stay byte-identical to the facilitator's `OZ_SMART_ACCOUNT_WASM_HASH`.
