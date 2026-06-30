import { describe, it, expect, vi } from "vitest";
import { createSignerProxyRoute } from "../src/routes.js";

function req(body: unknown): Request {
  return new Request("http://localhost/api/buckspay/auth/social", { method: "POST", body: JSON.stringify(body) });
}

describe("createSignerProxyRoute", () => {
  it("forwards web3auth to /auth/social with x-api-key; the key is never in the client response", async () => {
    const seen: { url?: string; headers?: Record<string, string>; body?: string } = {};
    const fetchImpl = vi.fn(async (url: string, init: { headers: Record<string, string>; body: string }) => {
      seen.url = url;
      seen.headers = init.headers;
      seen.body = init.body;
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ ok: true, publicKey: "GABC" })
      } as unknown as Response;
    });
    const handler = createSignerProxyRoute(
      { provider: "web3auth", network: "testnet" },
      { facilitatorUrl: "https://f.example", apiKey: "PROXY_SECRET", fetchImpl: fetchImpl as unknown as typeof fetch }
    );
    const res = await handler(req({ provider: "web3auth", idToken: "a.b.c", network: "testnet" }));
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(seen.url).toBe("https://f.example/auth/social");
    expect(seen.headers?.["x-api-key"]).toBe("PROXY_SECRET");
    expect(text).not.toContain("PROXY_SECRET");
  });

  it("maps provider 'email' to /auth/email", async () => {
    const seen: { url?: string } = {};
    const fetchImpl = vi.fn(async (url: string) => {
      seen.url = url;
      return { ok: true, status: 200, text: async () => "{}" } as unknown as Response;
    });
    const handler = createSignerProxyRoute(
      { provider: "email", network: "testnet" },
      { facilitatorUrl: "https://f.example", apiKey: "k", fetchImpl: fetchImpl as unknown as typeof fetch }
    );
    await handler(req({ action: "issue", email: "u@x.com" }));
    expect(seen.url).toBe("https://f.example/auth/email");
  });

  it("fails closed with 503 when env/config is missing", async () => {
    const handler = createSignerProxyRoute(
      { provider: "web3auth", network: "testnet" },
      { fetchImpl: (async () => ({})) as unknown as typeof fetch } // no facilitatorUrl/apiKey
    );
    const res = await handler(req({ idToken: "x" }));
    expect(res.status).toBe(503);
  });

  it("rejects a non-object body with 400", async () => {
    const handler = createSignerProxyRoute(
      { provider: "web3auth", network: "testnet" },
      { facilitatorUrl: "https://f.example", apiKey: "k", fetchImpl: (async () => ({})) as unknown as typeof fetch }
    );
    const res = await handler(
      new Request("http://localhost/p", { method: "POST", body: '"just-a-string"' })
    );
    expect(res.status).toBe(400);
  });
});
