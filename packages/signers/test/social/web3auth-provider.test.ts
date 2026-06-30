import { describe, it, expect, vi } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { defaultWeb3AuthProvider } from "../../src/social/web3auth.js";
import type { Web3AuthLike } from "../../src/social/web3auth.js";

const G = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 12)).publicKey();

function fakeLoader(over: Partial<Web3AuthLike> = {}): () => Promise<Web3AuthLike> {
  const impl: Web3AuthLike = {
    login: vi.fn().mockResolvedValue({ idToken: "header.payload.sig", ed25519PublicKeyHex: "ab".repeat(32) }),
    signEd25519: vi.fn().mockResolvedValue(new Uint8Array(64).fill(7)),
    ...over
  };
  return async () => impl;
}

function okFetch(body: unknown) {
  return vi.fn(async () => ({ ok: true, status: 200, json: async () => body })) as unknown as typeof fetch;
}

describe("defaultWeb3AuthProvider", () => {
  it("requires proxyUrl (the secret callback is server-side only)", () => {
    expect(() => defaultWeb3AuthProvider({ clientId: "id", network: "testnet" })).toThrowError(/proxyUrl/i);
  });

  it("connect(): logs in client-side, posts the idToken to the proxy, returns the server G-address", async () => {
    const fetchImpl = okFetch({ ok: true, publicKey: G, expiresAt: 123 });
    const provider = defaultWeb3AuthProvider({
      clientId: "id",
      network: "testnet",
      proxyUrl: "/api/buckspay/auth/social",
      loader: fakeLoader(),
      fetchImpl
    });
    const out = await provider.connect({ loginProvider: "google" });
    expect(out).toEqual({ publicKey: G, expiresAt: 123 });
    // The proxy received the idToken; it NEVER returns or echoes the web3auth secret.
    expect(fetchImpl).toHaveBeenCalledWith("/api/buckspay/auth/social", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse((fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body).toMatchObject({ provider: "web3auth", idToken: "header.payload.sig", network: "testnet" });
  });

  it("maps a proxy rejection to AUTH_PROVIDER_ERROR", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: "auth_provider_rejected" })
    }));
    const provider = defaultWeb3AuthProvider({
      clientId: "id",
      network: "testnet",
      proxyUrl: "/api/buckspay/auth/social",
      loader: fakeLoader(),
      fetchImpl: fetchImpl as unknown as typeof fetch
    });
    await expect(provider.connect({})).rejects.toMatchObject({ code: "AUTH_PROVIDER_ERROR" });
  });

  it("rejects a proxy response that is not a G-address with AUTH_PROVIDER_ERROR", async () => {
    const provider = defaultWeb3AuthProvider({
      clientId: "id",
      network: "testnet",
      proxyUrl: "/p",
      loader: fakeLoader(),
      fetchImpl: okFetch({ ok: true, publicKey: "not-a-key" })
    });
    await expect(provider.connect({})).rejects.toMatchObject({ code: "AUTH_PROVIDER_ERROR" });
  });

  it("signDigest delegates to the web3auth secure signer", async () => {
    const provider = defaultWeb3AuthProvider({
      clientId: "id",
      network: "testnet",
      proxyUrl: "/p",
      loader: fakeLoader(),
      fetchImpl: okFetch({ ok: true, publicKey: G })
    });
    await provider.connect({});
    const sig = await provider.signDigest(new Uint8Array(32).fill(1));
    expect(sig.length).toBe(64);
  });
});
