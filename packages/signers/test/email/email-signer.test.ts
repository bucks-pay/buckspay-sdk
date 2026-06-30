import { describe, it, expect, vi } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { emailSigner } from "../../src/email/index.js";
import { runBuckspaySignerConformance, conformancePreimageXdr } from "../helpers/buckspay-signer-conformance.js";

const G = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 21)).publicKey();
const SIG_B64 = Buffer.from(new Uint8Array(64).fill(9)).toString("base64");

/** A proxy double: issue → ok; verify → {publicKey, sessionToken}; sign → {signature}. */
function proxyFetch(over: Record<string, unknown> = {}) {
  return vi.fn(async (_url: string, init: { body: string }) => {
    const body = JSON.parse(init.body) as { action: string };
    const map: Record<string, unknown> = {
      issue: { ok: true },
      verify: { ok: true, publicKey: G, sessionToken: "sess-123", expiresAt: 1_900_000_000_000 },
      sign: { ok: true, signature: SIG_B64 },
      ...over
    };
    return { ok: true, status: 200, json: async () => map[body.action] };
  }) as unknown as typeof fetch;
}

function make() {
  return emailSigner({ proxyUrl: "/api/buckspay/auth/email", network: "testnet" }, { fetchImpl: proxyFetch() });
}

// Shared conformance suite (authenticate carries { email, otp }).
runBuckspaySignerConformance({
  label: "emailSigner(OTP)",
  makeSigner: make,
  expectedType: "email",
  expectedKeyType: "ed25519",
  expectedProvider: "email",
  authenticateParams: { email: "user@example.com", otp: "123456" },
  expectedPublicKey: G
});

describe("emailSigner specifics", () => {
  it("requires proxyUrl (INVALID_CONFIG)", () => {
    expect(() => emailSigner({ proxyUrl: "", network: "testnet" })).toThrowError(/proxyUrl/i);
  });

  it("requestOtp posts the issue action with the email", async () => {
    const fetchImpl = proxyFetch();
    const signer = emailSigner({ proxyUrl: "/p", network: "testnet" }, { fetchImpl });
    await signer.requestOtp("user@example.com");
    const body = JSON.parse((fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body).toEqual({ action: "issue", email: "user@example.com" });
  });

  it("authenticate requires both email and otp (INVALID_CONFIG without otp)", async () => {
    const signer = make();
    await expect(signer.authenticate?.({ email: "user@example.com" })).rejects.toMatchObject({
      code: "INVALID_CONFIG"
    });
  });

  it("authenticate verifies and returns AuthDetails with expiresAt", async () => {
    const signer = make();
    const details = await signer.authenticate?.({ email: "user@example.com", otp: "123456" });
    expect(details).toEqual({ publicKey: G, provider: "email", expiresAt: 1_900_000_000_000 });
  });

  it("signAuthEntry posts the sign action with the sessionToken and decodes the base64 signature", async () => {
    const fetchImpl = proxyFetch();
    const signer = emailSigner({ proxyUrl: "/p", network: "testnet" }, { fetchImpl });
    await signer.authenticate?.({ email: "user@example.com", otp: "123456" });
    const sig = await signer.signAuthEntry({
      preimageXdr: conformancePreimageXdr(),
      network: "testnet",
      signatureExpirationLedger: 1
    });
    expect(sig.signature.length).toBe(64);
    const signCall = (fetchImpl as ReturnType<typeof vi.fn>).mock.calls.at(-1);
    const body = JSON.parse(signCall![1].body as string);
    expect(body).toMatchObject({ action: "sign", sessionToken: "sess-123" });
  });

  it("maps an OTP rejection (HTTP 401) to AUTH_PROVIDER_ERROR", async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 401, json: async () => ({ error: "otp_invalid" }) }));
    const signer = emailSigner(
      { proxyUrl: "/p", network: "testnet" },
      { fetchImpl: fetchImpl as unknown as typeof fetch }
    );
    await expect(signer.authenticate?.({ email: "a@b.com", otp: "000000" })).rejects.toMatchObject({
      code: "AUTH_PROVIDER_ERROR"
    });
  });

  it("rejects a verify response with a non-G publicKey (AUTH_PROVIDER_ERROR)", async () => {
    const signer = emailSigner(
      { proxyUrl: "/p", network: "testnet" },
      { fetchImpl: proxyFetch({ verify: { ok: true, publicKey: "nope", sessionToken: "s" } }) }
    );
    await expect(signer.authenticate?.({ email: "a@b.com", otp: "1" })).rejects.toMatchObject({
      code: "AUTH_PROVIDER_ERROR"
    });
  });
});
