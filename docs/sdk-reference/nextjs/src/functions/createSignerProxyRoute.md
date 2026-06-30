---
title: "Function: createSignerProxyRoute()"
---

# Function: createSignerProxyRoute()

> **createSignerProxyRoute**(`opts`, `deps?`): (`req`) => `Promise`\<`Response`\>

Defined in: [packages/nextjs/src/routes.ts:97](https://github.com/bucks-pay/buckspay-sdk/blob/43ad599d2776cb5d657043c36847b3318093ccf4/packages/nextjs/src/routes.ts#L97)

App Router route handler that forwards a social/email body to the facilitator `/auth/*`,
 injecting the apiKey from server-side env. The provider secret stays in the facilitator.

## Parameters

### opts

[`CreateSignerProxyRouteOptions`](/sdk-reference/nextjs/src/interfaces/CreateSignerProxyRouteOptions)

### deps?

[`CreateSignerProxyRouteDeps`](/sdk-reference/nextjs/src/interfaces/CreateSignerProxyRouteDeps) = `{}`

## Returns

(`req`) => `Promise`\<`Response`\>
