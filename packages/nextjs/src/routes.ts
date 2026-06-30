// SERVER-ONLY — this module reads the facilitator apiKey / provider secrets. NEVER import it
// in a client component or a browser bundle. It is the BFF boundary: the browser POSTs to the
// route this returns; this forwards to the facilitator with the secret key server-side.
import { z } from "zod";
import { BuckspayError } from "@buckspay/core";
import type { Network, RelayPayload } from "@buckspay/core";
import { buckspayFacilitator } from "@buckspay/relayer/buckspay-facilitator";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}

// Mirrors the facilitator stellarSorobanSchema + the optional gas-token / session markers on RelayPayload.
const stellarContract = z.string().regex(/^C[A-Z2-7]{55}$/, "invalid C-address");
const base64 = z
  .string()
  .regex(/^[A-Za-z0-9+/]+=*$/, "base64")
  .min(1);
const relayPayloadSchema = z.object({
  token: stellarContract,
  from: z.string().regex(/^[GC][A-Z2-7]{55}$/, "invalid G/C address"),
  to: z.string().regex(/^G[A-Z2-7]{55}$/, "invalid G-address"),
  value: z.string().regex(/^\d+$/, "stroops"),
  authorizationEntryXdr: base64,
  nonce: z.string().regex(/^\d+$/, "decimal"),
  signatureExpirationLedger: z.number().int().positive(),
  // gas-in-token: the entry IS a FeeForwarder forward() invocation (one host-function op; no separate
  // fee entry). session install/revoke: the relay is the self-administered add_signer/remove_signer.
  feeToken: stellarContract.optional(),
  sessionOp: z.enum(["install", "revoke"]).optional()
});

export interface CreateRelayRouteOptions {
  facilitatorUrl: string;
  /** SERVER-SIDE ONLY — pass `process.env.…`, never a client-exposed value. */
  apiKey: string;
  network: Network;
}
export interface CreateRelayRouteDeps {
  /** Test seam: inject fetch (defaults to global fetch). */
  fetchImpl?: typeof fetch;
}

/** App Router route handler that relays a signed intent to the facilitator with the apiKey
 *  server-side. Returns the `Receipt` JSON. The apiKey is captured here and never serialized. */
export function createRelayRoute(
  opts: CreateRelayRouteOptions,
  deps: CreateRelayRouteDeps = {}
): (req: Request) => Promise<Response> {
  const relayer = buckspayFacilitator(
    { url: opts.facilitatorUrl, apiKey: opts.apiKey, network: opts.network },
    deps.fetchImpl ? { fetch: deps.fetchImpl } : {}
  );

  return async (req: Request): Promise<Response> => {
    let body: unknown;
    try {
      body = await req.json();
    } catch (cause) {
      void cause;
      return json({ error: "invalid_json" }, 400);
    }
    const parsed = relayPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "invalid_payload", details: parsed.error.flatten() }, 400);
    }
    try {
      const receipt = await relayer.relay(parsed.data as RelayPayload);
      return json(receipt, 200);
    } catch (err) {
      // Return the coded error only — never the raw upstream message (may carry an address).
      const code = err instanceof BuckspayError ? err.code : "UNKNOWN";
      const status = code === "RELAYER_UNREACHABLE" ? 502 : code === "INVALID_CONFIG" ? 401 : 400;
      return json({ error: code }, status);
    }
  };
}

export interface CreateSignerProxyRouteOptions {
  provider: "web3auth" | "email";
  network: Network;
  // provider secrets (web3auth verifier / OTP backend) live in the facilitator;
  // this route only injects the facilitator apiKey — all server-side.
}
export interface CreateSignerProxyRouteDeps {
  /** Defaults to BUCKSPAY_FACILITATOR_URL (server env). */
  facilitatorUrl?: string;
  /** Defaults to BUCKSPAY_FACILITATOR_API_KEY (server env). SERVER-SIDE ONLY. */
  apiKey?: string;
  fetchImpl?: typeof fetch;
}

const bodyObjectSchema = z.record(z.string(), z.unknown());

/** App Router route handler that forwards a social/email body to the facilitator `/auth/*`,
 *  injecting the apiKey from server-side env. The provider secret stays in the facilitator. */
export function createSignerProxyRoute(
  opts: CreateSignerProxyRouteOptions,
  deps: CreateSignerProxyRouteDeps = {}
): (req: Request) => Promise<Response> {
  const endpoint = opts.provider === "email" ? "/auth/email" : "/auth/social";
  const doFetch: typeof fetch = deps.fetchImpl ?? ((input, init) => fetch(input, init));

  return async (req: Request): Promise<Response> => {
    const facilitatorUrl = deps.facilitatorUrl ?? process.env.BUCKSPAY_FACILITATOR_URL;
    const apiKey = deps.apiKey ?? process.env.BUCKSPAY_FACILITATOR_API_KEY;
    if (!facilitatorUrl || !apiKey) {
      return json({ error: "signer_proxy_not_configured" }, 503);
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch (cause) {
      void cause;
      return json({ error: "invalid_json" }, 400);
    }
    if (!bodyObjectSchema.safeParse(body).success) {
      return json({ error: "invalid_payload" }, 400);
    }
    const base = facilitatorUrl.replace(/\/+$/, "");
    let res: Response;
    try {
      res = await doFetch(`${base}${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify(body)
      });
    } catch (cause) {
      void cause;
      return json({ error: "facilitator_unreachable" }, 502);
    }
    // Forward the upstream JSON transparently (status + body); the apiKey is never echoed.
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { "content-type": "application/json" } });
  };
}
