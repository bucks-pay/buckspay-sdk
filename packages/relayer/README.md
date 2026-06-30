# @buckspay/relayer

The relayer port for the **Buckspay SDK** - a typed client for the Buckspay facilitator.

## `@buckspay/relayer/buckspay-facilitator`

Mirrors the facilitator endpoints (`/relay`, `/stellar/account/:pk`, `/stellar/onboard/*`),
**zod-validates every response**, and maps HTTP/facilitator errors to typed `BuckspayError`s.

### Security - the API key is server-side only

The `x-api-key` header is sent **only when `apiKey` is set**. In the browser, construct the relayer
**without** `apiKey` and point `url` at your own backend (BFF); the secret never enters the client
bundle.

## Install

```bash
pnpm add @buckspay/relayer @buckspay/core
```

## Usage

```ts
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

// Server (Node / your BFF): the key is a server-side secret.
const relayer = buckspayFacilitator({
  url: process.env.FACILITATOR_URL!,
  apiKey: process.env.FACILITATOR_API_KEY,
  network: "pubnet"
});

// Browser: no apiKey - talk to your same-origin BFF.
const relayer = buckspayFacilitator({ url: "/api/gasless/relay", network: "pubnet" });
```

## License

MIT - part of [buckspay-sdk](https://github.com/bucks-pay/buckspay-sdk).
