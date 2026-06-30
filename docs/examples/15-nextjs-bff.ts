// Recipe 15 - NEXT.JS BFF (App Router). Three server-only route handlers, packaged.
//
// These are the same-origin endpoints your browser code calls (`/api/buckspay/...`). The
// facilitator apiKey and the provider secrets stay SERVER-SIDE - they are never in the client
// bundle. Each `export const POST` below lives in its own `route.ts` under app/.
import { createRelayRoute, createSignerProxyRoute } from "@buckspay/nextjs";

// app/api/buckspay/relay/route.ts - the gasless relay BFF (the dashboard pattern, packaged).
export const relayPOST = createRelayRoute({
  facilitatorUrl: process.env.BUCKSPAY_FACILITATOR_URL ?? "https://facilitator.example",
  apiKey: process.env.BUCKSPAY_FACILITATOR_API_KEY ?? "", // SERVER-SIDE ONLY
  network: "testnet"
});

// app/api/buckspay/auth/social/route.ts - social signer-proxy (forwards to /auth/social).
// Reads BUCKSPAY_FACILITATOR_URL + BUCKSPAY_FACILITATOR_API_KEY from server env.
export const socialPOST = createSignerProxyRoute({ provider: "web3auth", network: "testnet" });

// app/api/buckspay/auth/email/route.ts - email signer-proxy (forwards to /auth/email).
export const emailPOST = createSignerProxyRoute({ provider: "email", network: "testnet" });
