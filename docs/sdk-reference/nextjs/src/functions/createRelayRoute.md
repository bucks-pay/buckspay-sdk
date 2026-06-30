[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [nextjs/src](../README.md) / createRelayRoute

# Function: createRelayRoute()

> **createRelayRoute**(`opts`, `deps?`): (`req`) => `Promise`\<`Response`\>

Defined in: [packages/nextjs/src/routes.ts:46](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/nextjs/src/routes.ts#L46)

App Router route handler that relays a signed intent to the facilitator with the apiKey
 server-side. Returns the `Receipt` JSON. The apiKey is captured here and never serialized.

## Parameters

### opts

[`CreateRelayRouteOptions`](../interfaces/CreateRelayRouteOptions.md)

### deps?

[`CreateRelayRouteDeps`](../interfaces/CreateRelayRouteDeps.md) = `{}`

## Returns

(`req`) => `Promise`\<`Response`\>
