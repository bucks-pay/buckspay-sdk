# React hooks

`@buckspay/react` wraps the core client in idiomatic hooks. Wrap your tree once:

```tsx
import { BuckspayProvider } from "@buckspay/react";
// <BuckspayProvider config={config} sim={createRpcSimContext(rpcUrl)}> … </BuckspayProvider>
```

> Pass `sim` (a `createRpcSimContext(...)`) so `useStellarPay().pay()` can simulate.
> Omit it only in connect-only apps.

## `useWallet()`

Returns `{ wallet, address, connect, status, error }`. Gate a "Connect" button on
`wallet === null`:

```tsx
const { wallet, connect, status } = useWallet();
if (!wallet) return <button onClick={() => void connect()}>Connect</button>;
```

## `useStellarPay()`

Returns `{ status, receipt, error, prepare, sign, pay, reset }`. Use one-shot `pay([...])`,
or the split `prepare → sign → send` (for backends that validate between sign and send —
see [Migrating](./07-migrating-from-facilitator.md)).

Full compiled component: `docs/examples/05-react-pay.tsx`.

## Status machine

`idle → connecting → ready → signing → relaying → success | error` — mapped from
`BuckspayState["status"]`. Render `error.code` (a `BuckspayErrorCode`) for user messages.

**A11y:** announce status via `aria-live`, keep the pay button keyboard-reachable.

Prev: [Onboarding](./04-onboarding.md) · Next: [API reference](./06-api-reference.md)
