import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The browser bundle NEVER holds the facilitator API key. Authenticated calls
// (onboard/deploy/relay) go through this same-origin dev proxy, which injects
// `x-api-key` server-side — the exact BFF boundary the dashboard enforces.
const FACILITATOR_URL = process.env.FACILITATOR_URL ?? "http://localhost:3000";
const FACILITATOR_API_KEY = process.env.FACILITATOR_API_KEY ?? "";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/facilitator": {
        target: FACILITATOR_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/facilitator/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            if (FACILITATOR_API_KEY) proxyReq.setHeader("x-api-key", FACILITATOR_API_KEY);
          });
        }
      }
    }
  }
});
