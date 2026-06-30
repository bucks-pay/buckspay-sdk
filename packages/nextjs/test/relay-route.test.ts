import { describe, it, expect, vi } from "vitest";
import { createRelayRoute } from "../src/routes.js";

const PAYLOAD = {
  token: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  from: "GA6HCMBLTZS5VYYBCATRBR5VBZJEH5C2OON6XQGB3RNYDDAQ7JZ65YQH",
  to: "GA6HCMBLTZS5VYYBCATRBR5VBZJEH5C2OON6XQGB3RNYDDAQ7JZ65YQH",
  value: "15000000",
  authorizationEntryXdr: "AAAAAQ==",
  nonce: "123",
  signatureExpirationLedger: 8_000_000
};
const RECEIPT = {
  ok: true,
  via: "buckspay_self",
  token: PAYLOAD.token,
  chain: "stellar-testnet",
  transferTx: "deadbeef",
  status: "success"
};

function req(body: unknown): Request {
  return new Request("http://localhost/api/buckspay/relay", { method: "POST", body: JSON.stringify(body) });
}

describe("createRelayRoute", () => {
  it("forwards a valid payload and returns the receipt; apiKey reaches the facilitator, NOT the client", async () => {
    const seen: { url?: string; headers?: Record<string, string> } = {};
    const fetchImpl = vi.fn(async (url: string, init: { headers: Record<string, string> }) => {
      seen.url = url;
      seen.headers = init.headers;
      return { ok: true, status: 200, json: async () => RECEIPT } as unknown as Response;
    });
    const handler = createRelayRoute(
      { facilitatorUrl: "https://facilitator.example", apiKey: "SUPER_SECRET_KEY", network: "testnet" },
      { fetchImpl: fetchImpl as unknown as typeof fetch }
    );
    const res = await handler(req(PAYLOAD));
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(JSON.parse(text)).toMatchObject({ ok: true, transferTx: "deadbeef" });
    // SERVER → facilitator carried the key…
    expect(seen.url).toBe("https://facilitator.example/relay");
    expect(seen.headers?.["x-api-key"]).toBe("SUPER_SECRET_KEY");
    // …but the CLIENT response never contains it.
    expect(text).not.toContain("SUPER_SECRET_KEY");
  });

  it("rejects an invalid body with 400 (no upstream call)", async () => {
    const fetchImpl = vi.fn();
    const handler = createRelayRoute(
      { facilitatorUrl: "https://f.example", apiKey: "k", network: "testnet" },
      { fetchImpl: fetchImpl as unknown as typeof fetch }
    );
    const res = await handler(req({ token: "not-a-contract" }));
    expect(res.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("maps a facilitator 5xx to 502 with a coded error (no apiKey, no raw message leak)", async () => {
    const fetchImpl = vi.fn(
      async () =>
        ({ ok: false, status: 503, json: async () => ({ error: "facilitator_unreachable" }) }) as unknown as Response
    );
    const handler = createRelayRoute(
      { facilitatorUrl: "https://f.example", apiKey: "SECRET", network: "testnet" },
      { fetchImpl: fetchImpl as unknown as typeof fetch }
    );
    const res = await handler(req(PAYLOAD));
    const text = await res.text();
    expect(res.status).toBe(502);
    expect(text).not.toContain("SECRET");
  });
});
