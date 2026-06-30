[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [nextjs/src](../README.md) / CreateSignerProxyRouteDeps

# Interface: CreateSignerProxyRouteDeps

Defined in: [packages/nextjs/src/routes.ts:85](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/nextjs/src/routes.ts#L85)

## Properties

### apiKey?

> `optional` **apiKey?**: `string`

Defined in: [packages/nextjs/src/routes.ts:89](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/nextjs/src/routes.ts#L89)

Defaults to BUCKSPAY_FACILITATOR_API_KEY (server env). SERVER-SIDE ONLY.

***

### facilitatorUrl?

> `optional` **facilitatorUrl?**: `string`

Defined in: [packages/nextjs/src/routes.ts:87](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/nextjs/src/routes.ts#L87)

Defaults to BUCKSPAY_FACILITATOR_URL (server env).

***

### fetchImpl?

> `optional` **fetchImpl?**: \{(`input`, `init?`): `Promise`\<`Response`\>; (`input`, `init?`): `Promise`\<`Response`\>; \}

Defined in: [packages/nextjs/src/routes.ts:90](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/nextjs/src/routes.ts#L90)

#### Call Signature

> (`input`, `init?`): `Promise`\<`Response`\>

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

##### Parameters

###### input

`RequestInfo` \| `URL`

###### init?

`RequestInit`

##### Returns

`Promise`\<`Response`\>

#### Call Signature

> (`input`, `init?`): `Promise`\<`Response`\>

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

##### Parameters

###### input

`string` \| `Request` \| `URL`

###### init?

`RequestInit`

##### Returns

`Promise`\<`Response`\>
