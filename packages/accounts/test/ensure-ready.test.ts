import { describe, it, expect, vi } from "vitest";
import { classicAccount } from "../src/classic/classic-account.js";
import type { AccountState, BuckspaySigner, EnsureReadyInput, Relayer } from "@buckspay/core";

const G_FROM = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF5";

function mockRelayer(state: AccountState, over: Partial<Relayer> = {}): Relayer {
  return {
    relay: vi.fn(),
    getAccountState: vi.fn().mockResolvedValue(state),
    buildOnboard: vi.fn().mockResolvedValue({ xdr: "UNSIGNED_TX_XDR" }),
    submitOnboard: vi.fn().mockResolvedValue({ ok: true }),
    deployContract: vi.fn(),
    ...over
  };
}

/** Signer that also exposes the wallet's full-tx signing (wallets-kit). */
function mockSigner(): BuckspaySigner & { signTransaction: ReturnType<typeof vi.fn> } {
  return {
    type: "wallets-kit",
    getPublicKey: vi.fn().mockResolvedValue({ type: "ed25519", publicKey: G_FROM }),
    signAuthEntry: vi.fn(),
    signTransaction: vi.fn().mockResolvedValue("SIGNED_TX_XDR")
  };
}

function input(signer: BuckspaySigner, relayer: Relayer): EnsureReadyInput {
  return { address: G_FROM, relayer, signer, network: "testnet" };
}

describe("classicAccount ensureReady", () => {
  it("no-ops when the account exists and has a USDC trustline", async () => {
    const relayer = mockRelayer({ exists: true, hasUsdcTrustline: true });
    const signer = mockSigner();
    await classicAccount().ensureReady(input(signer, relayer));
    expect(relayer.buildOnboard).not.toHaveBeenCalled();
    expect(signer.signTransaction).not.toHaveBeenCalled();
    expect(relayer.submitOnboard).not.toHaveBeenCalled();
  });

  it("runs build → sign → submit when the account is missing", async () => {
    const relayer = mockRelayer({ exists: false, hasUsdcTrustline: false });
    const signer = mockSigner();
    await classicAccount().ensureReady(input(signer, relayer));
    expect(relayer.buildOnboard).toHaveBeenCalledWith({ publicKey: G_FROM });
    expect(signer.signTransaction).toHaveBeenCalledWith("UNSIGNED_TX_XDR", {
      network: "testnet",
      address: G_FROM
    });
    expect(relayer.submitOnboard).toHaveBeenCalledWith({
      publicKey: G_FROM,
      signedTxXdr: "SIGNED_TX_XDR"
    });
  });

  it("runs onboarding when the account exists but lacks the USDC trustline", async () => {
    const relayer = mockRelayer({ exists: true, hasUsdcTrustline: false });
    const signer = mockSigner();
    await classicAccount().ensureReady(input(signer, relayer));
    expect(relayer.buildOnboard).toHaveBeenCalledOnce();
    expect(relayer.submitOnboard).toHaveBeenCalledOnce();
  });

  it("throws ACCOUNT_NOT_READY when the signer cannot sign a full transaction", async () => {
    const { BuckspayError } = await import("@buckspay/core");
    const relayer = mockRelayer({ exists: false, hasUsdcTrustline: false });
    const signer: BuckspaySigner = {
      type: "passkey", // passkey signer can't sign a classic onboarding tx
      getPublicKey: vi.fn().mockResolvedValue({ type: "ed25519", publicKey: G_FROM }),
      signAuthEntry: vi.fn()
    };
    const promise = classicAccount().ensureReady(input(signer, relayer));
    await expect(promise).rejects.toBeInstanceOf(BuckspayError);
    await expect(promise).rejects.toMatchObject({ code: "ACCOUNT_NOT_READY" });
    expect(relayer.buildOnboard).not.toHaveBeenCalled();
  });

  it("maps a failed submit to ACCOUNT_NOT_READY", async () => {
    const relayer = mockRelayer(
      { exists: false, hasUsdcTrustline: false },
      { submitOnboard: vi.fn().mockResolvedValue({ ok: false }) }
    );
    const signer = mockSigner();
    await expect(
      classicAccount().ensureReady(input(signer, relayer))
    ).rejects.toMatchObject({ code: "ACCOUNT_NOT_READY" });
  });
});
