// @buckspay/nextjs — scaffold. createRelayRoute()/createSignerProxyRoute() land in SP-2 sprint-4.
// The BFF the dashboard already does, packaged: the facilitator apiKey + provider secrets stay
// server-side; the browser never holds them. Re-export the core contract consumers type against now.
export type { Network } from "@buckspay/core";
