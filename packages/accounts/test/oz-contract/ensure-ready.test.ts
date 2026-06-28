import { describe, it, expect, vi } from "vitest";
import { StrKey } from "@stellar/stellar-sdk";
import { ensureContractReady } from "../../src/oz-contract/ensureReady.js";

const PUBKEY = "04" + "ab".repeat(64);
const C = StrKey.encodeContract(Buffer.alloc(32, 1));

const signer = {
  type: "passkey" as const,
  async getPublicKey() {
    return { type: "secp256r1" as const, publicKey: PUBKEY };
  },
  async signAuthEntry() {
    throw new Error("not used");
  }
};

function relayer(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    relay: vi.fn(),
    // pre-deploy check: not on-chain; after deploy: materialized (RPC indexed).
    getAccountState: vi
      .fn()
      .mockResolvedValueOnce({ exists: false, hasUsdcTrustline: false })
      .mockResolvedValue({ exists: true, hasUsdcTrustline: false }),
    buildOnboard: vi.fn(),
    submitOnboard: vi.fn(),
    deployContract: vi.fn().mockResolvedValue({ address: C }),
    ...overrides
  };
}

describe("ensureContractReady", () => {
  it("deploys when the contract is not yet on-chain", async () => {
    const r = relayer();
    await ensureContractReady({ address: C, relayer: r as never, signer, network: "testnet" });
    expect(r.deployContract).toHaveBeenCalledWith({ passkeyPublicKey: PUBKEY });
  });

  it("does nothing when already deployed", async () => {
    const r = relayer({ getAccountState: vi.fn().mockResolvedValue({ exists: true, hasUsdcTrustline: false }) });
    await ensureContractReady({ address: C, relayer: r as never, signer, network: "testnet" });
    expect(r.deployContract).not.toHaveBeenCalled();
  });

  it("maps a relayer deploy failure to ACCOUNT_NOT_READY", async () => {
    const r = relayer({ deployContract: vi.fn().mockRejectedValue(new Error("502")) });
    await expect(
      ensureContractReady({ address: C, relayer: r as never, signer, network: "testnet" })
    ).rejects.toMatchObject({ code: "ACCOUNT_NOT_READY" });
  });

  it("rejects when the relayer-deployed address differs from the client-derived one", async () => {
    const other = StrKey.encodeContract(Buffer.alloc(32, 2));
    const r = relayer({ deployContract: vi.fn().mockResolvedValue({ address: other }) });
    await expect(
      ensureContractReady({ address: C, relayer: r as never, signer, network: "testnet" })
    ).rejects.toMatchObject({ code: "ACCOUNT_NOT_READY" });
  });
});
