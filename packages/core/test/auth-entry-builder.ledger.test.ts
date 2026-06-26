import { describe, expect, it, vi } from "vitest";
import { BuckspayError } from "../src/errors";
import { getLatestLedger, type RpcFetch } from "../src/auth-entry-builder";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

describe("getLatestLedger", () => {
  it("posts a getLatestLedger JSON-RPC call and returns the sequence", async () => {
    const fetchImpl = vi.fn<RpcFetch>(async () =>
      jsonResponse({ jsonrpc: "2.0", id: 1, result: { id: "abc", sequence: 123456, protocolVersion: 22 } })
    );
    const seq = await getLatestLedger("https://rpc.example", fetchImpl);
    expect(seq).toBe(123456);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://rpc.example");
    expect(JSON.parse(String(init.body)).method).toBe("getLatestLedger");
  });

  it("maps an RPC error envelope to RELAYER_UNREACHABLE", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ jsonrpc: "2.0", id: 1, error: { code: -32000, message: "node down" } })
    );
    await expect(getLatestLedger("https://rpc.example", fetchImpl)).rejects.toMatchObject({
      code: "RELAYER_UNREACHABLE"
    });
  });

  it("maps a malformed result (missing sequence) to a BuckspayError", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ jsonrpc: "2.0", id: 1, result: {} }));
    await expect(getLatestLedger("https://rpc.example", fetchImpl)).rejects.toBeInstanceOf(BuckspayError);
  });

  it("maps a network throw to RELAYER_UNREACHABLE preserving the cause", async () => {
    const boom = new Error("ECONNREFUSED");
    const fetchImpl = vi.fn(async () => {
      throw boom;
    });
    await expect(getLatestLedger("https://rpc.example", fetchImpl)).rejects.toMatchObject({
      code: "RELAYER_UNREACHABLE",
      cause: boom
    });
  });
});
