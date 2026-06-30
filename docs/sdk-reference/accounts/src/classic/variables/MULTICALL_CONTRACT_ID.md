[**buckspay-sdk**](../../../../README.md)

***

[buckspay-sdk](../../../../README.md) / [accounts/src/classic](../README.md) / MULTICALL\_CONTRACT\_ID

# Variable: MULTICALL\_CONTRACT\_ID

> `const` **MULTICALL\_CONTRACT\_ID**: `Record`\<[`Network`](../../../../nextjs/src/type-aliases/Network.md), `string`\>

Defined in: [packages/accounts/src/batch/multicall-pin.ts:16](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/accounts/src/batch/multicall-pin.ts#L16)

Pinned Multicall router C-address per network. The Multicall contract is sponsored-installed
once per network (hash-pinned `97b8f81a…`, like the OZ smart-account + FeeForwarder wasm) and
its `batch_transfer(payer, token, Vec<(to, amount)>)` entrypoint settles an atomic batch.

 - testnet: deployed and verified on-chain — the Multicall router is live.
 - pubnet:  empty until the facilitator deploys + pins it — a pubnet batch then
            fails closed with INVALID_CONFIG rather than using a wrong/testnet router.

A caller may override per-call via `ozContractAccount({ multicallContract })` /
`classicAccount({ multicallContract })`. No `process.env` read (the SDK runs in browsers).
