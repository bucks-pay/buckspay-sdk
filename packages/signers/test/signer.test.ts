import { describe, it, expect, vi } from "vitest";
import { walletsKit } from "../src/wallets-kit/signer.js";
import type { WalletsKitLike } from "../src/wallets-kit/kit-factory.js";
import type { AuthEntryPayload } from "@buckspay/core";

const G_ADDR = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF5";
const SIG_64 = new Uint8Array(64).map((_, i) => (i * 7 + 3) & 0xff);

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return Buffer.from(bin, "binary").toString("base64");
}

function mockKit(overrides: Partial<WalletsKitLike> = {}): WalletsKitLike {
  return {
    setWallet: vi.fn(),
    getAddress: vi.fn().mockResolvedValue({ address: G_ADDR }),
    signAuthEntry: vi.fn().mockResolvedValue({ signedAuthEntry: bytesToBase64(SIG_64) }),
    signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: "SIGNED_TX_XDR" }),
    ...overrides
  };
}

const payload: AuthEntryPayload = {
  preimageXdr: "AAAA",
  network: "testnet",
  signatureExpirationLedger: 1234
};

describe("walletsKit signer", () => {
  it("has type 'wallets-kit'", () => {
    const signer = walletsKit({ network: "testnet" }, mockKit());
    expect(signer.type).toBe("wallets-kit");
  });

  it("getPublicKey returns the G-address as an ed25519 SignerKey", async () => {
    const signer = walletsKit({ network: "testnet" }, mockKit());
    const key = await signer.getPublicKey();
    expect(key).toEqual({ type: "ed25519", publicKey: G_ADDR });
  });

  it("signAuthEntry signs the preimageXdr, normalizes, and echoes the publicKey", async () => {
    const kit = mockKit();
    const signer = walletsKit({ network: "testnet" }, kit);
    const sig = await signer.signAuthEntry(payload);
    expect(kit.signAuthEntry).toHaveBeenCalledWith(
      "AAAA",
      expect.objectContaining({ address: G_ADDR })
    );
    expect(sig.signature).toBeInstanceOf(Uint8Array);
    expect(sig.signature.length).toBe(64);
    expect(Array.from(sig.signature)).toEqual(Array.from(SIG_64));
    expect(sig.publicKey).toBe(G_ADDR);
  });

  it("unwraps a Freighter double-encoded signature transparently", async () => {
    const innerB64 = bytesToBase64(SIG_64);
    const ascii = new Uint8Array(innerB64.length);
    for (let i = 0; i < innerB64.length; i++) ascii[i] = innerB64.charCodeAt(i);
    const kit = mockKit({
      signAuthEntry: vi.fn().mockResolvedValue({ signedAuthEntry: bytesToBase64(ascii) })
    });
    const signer = walletsKit({ network: "testnet" }, kit);
    const sig = await signer.signAuthEntry(payload);
    expect(sig.signature.length).toBe(64);
    expect(Array.from(sig.signature)).toEqual(Array.from(SIG_64));
  });

  it("signTransaction delegates to kit.signTransaction and returns signedTxXdr", async () => {
    const kit = mockKit();
    const signer = walletsKit({ network: "testnet" }, kit);
    expect(signer.signTransaction).toBeTypeOf("function");
    const out = await signer.signTransaction?.("ENVELOPE_XDR", { network: "testnet", address: G_ADDR });
    expect(out).toBe("SIGNED_TX_XDR");
    expect(kit.signTransaction).toHaveBeenCalledWith(
      "ENVELOPE_XDR",
      expect.objectContaining({ address: G_ADDR })
    );
  });

  it("maps a transaction-sign rejection to BuckspayError SIGNATURE_REJECTED", async () => {
    const { BuckspayError } = await import("@buckspay/core");
    const kit = mockKit({
      signTransaction: vi.fn().mockRejectedValue(new Error("User declined the request"))
    });
    const signer = walletsKit({ network: "testnet" }, kit);
    await expect(
      signer.signTransaction?.("ENVELOPE_XDR", { network: "testnet", address: G_ADDR })
    ).rejects.toBeInstanceOf(BuckspayError);
  });

  it("maps a kit rejection (user cancel) to BuckspayError SIGNATURE_REJECTED", async () => {
    const { BuckspayError } = await import("@buckspay/core");
    const kit = mockKit({
      signAuthEntry: vi.fn().mockRejectedValue(new Error("User declined the request"))
    });
    const signer = walletsKit({ network: "testnet" }, kit);
    await expect(signer.signAuthEntry(payload)).rejects.toBeInstanceOf(BuckspayError);
    await expect(signer.signAuthEntry(payload)).rejects.toMatchObject({ code: "SIGNATURE_REJECTED" });
  });
});
