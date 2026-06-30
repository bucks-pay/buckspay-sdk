[**buckspay-sdk**](../../../README.md)

***

[buckspay-sdk](../../../README.md) / [nextjs/src](../README.md) / createSignerProxyRoute

# Function: createSignerProxyRoute()

> **createSignerProxyRoute**(`opts`, `deps?`): (`req`) => `Promise`\<`Response`\>

Defined in: [packages/nextjs/src/routes.ts:97](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/nextjs/src/routes.ts#L97)

App Router route handler that forwards a social/email body to the facilitator `/auth/*`,
 injecting the apiKey from server-side env. The provider secret stays in the facilitator.

## Parameters

### opts

[`CreateSignerProxyRouteOptions`](../interfaces/CreateSignerProxyRouteOptions.md)

### deps?

[`CreateSignerProxyRouteDeps`](../interfaces/CreateSignerProxyRouteDeps.md) = `{}`

## Returns

(`req`) => `Promise`\<`Response`\>
