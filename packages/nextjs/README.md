# @buckspay/nextjs

Server-side route handlers for the **Buckspay SDK** - gasless Stellar (Soroban) USDC payments.

Your facilitator API key and any provider secrets (web3auth, OTP) belong on the server, never in the
browser bundle. This package gives you two App Router route factories that sit between your client
and the facilitator: one relays signed payments, the other proxies social and email sign-in. The
SDK in the browser calls your own same-origin routes, and the secrets stay where they should.

## Install

```bash
pnpm add @buckspay/nextjs @buckspay/relayer
```

`next` (App Router, 14 or newer) is a peer dependency. These routes run on the server only.

## Usage

A relay route. The browser posts a signed payment here; this handler forwards it to the facilitator
with the key attached.

```ts
// app/api/gasless/route.ts
import { createRelayRoute } from "@buckspay/nextjs";

export const POST = createRelayRoute({
  facilitatorUrl: process.env.FACILITATOR_URL!,
  apiKey: process.env.FACILITATOR_API_KEY!, // server-only, never shipped to the client
  network: "testnet"
});
```

A signer-proxy route for social or email login. It completes the secret-bearing half of the flow
and hands back a public key and signatures, nothing more.

```ts
// app/api/buckspay/auth/social/route.ts
import { createSignerProxyRoute } from "@buckspay/nextjs";

export const POST = createSignerProxyRoute({ provider: "web3auth", network: "testnet" });
```

On the client, point the relayer and signer at these routes (`url: "/api/gasless"`,
`proxyUrl: "/api/buckspay/auth/social"`) and leave the `apiKey` out entirely.

## License

MIT - part of [buckspay-sdk](https://github.com/bucks-pay/buckspay-sdk).
