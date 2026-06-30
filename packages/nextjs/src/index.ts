// @buckspay/nextjs — App Router server helpers: BFF relay + social/email signer-proxy.
// The route factories are SERVER-ONLY (they hold the facilitator apiKey / read server env).
export { createRelayRoute, createSignerProxyRoute } from "./routes.js";
export type {
  CreateRelayRouteOptions,
  CreateRelayRouteDeps,
  CreateSignerProxyRouteOptions,
  CreateSignerProxyRouteDeps
} from "./routes.js";
export type { Network } from "@buckspay/core";
