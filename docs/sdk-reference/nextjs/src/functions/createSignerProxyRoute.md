[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [nextjs/src](../README.md) / createSignerProxyRoute

# Function: createSignerProxyRoute()

> **createSignerProxyRoute**(`opts`, `deps?`): (`req`) => `Promise`\<`Response`\>

Defined in: [packages/nextjs/src/routes.ts:97](https://github.com/bucks-pay/buckspay-sdk/blob/6c133be3ba8b60ab91aeb175d16a4229a853f4b6/packages/nextjs/src/routes.ts#L97)

App Router route handler that forwards a social/email body to the facilitator `/auth/*`,
 injecting the apiKey from server-side env. The provider secret stays in the facilitator.

## Parameters

### opts

[`CreateSignerProxyRouteOptions`](../interfaces/CreateSignerProxyRouteOptions.md)

### deps?

[`CreateSignerProxyRouteDeps`](../interfaces/CreateSignerProxyRouteDeps.md) = `{}`

## Returns

(`req`) => `Promise`\<`Response`\>
