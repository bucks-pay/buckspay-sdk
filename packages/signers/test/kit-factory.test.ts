import { describe, it, expect, vi } from "vitest";
import { resolveKit } from "../src/wallets-kit/kit-factory.js";

describe("resolveKit", () => {
  it("returns an injected kit verbatim (no dynamic import)", async () => {
    const fakeKit = { id: "fake" };
    const got = await resolveKit({ network: "testnet" }, fakeKit as never);
    expect(got).toBe(fakeKit);
  });

  it("maps network to the kit WalletNetwork when building the default kit", async () => {
    // The default path is exercised via a stubbed loader so we never import the
    // real browser-only lib in node. resolveKit accepts an optional loader.
    const ctor = vi.fn().mockReturnValue({ id: "built" });
    const loader = vi.fn().mockResolvedValue({
      StellarWalletsKit: ctor,
      WalletNetwork: { TESTNET: "TESTNET", PUBLIC: "PUBLIC" },
      FreighterModule: class {},
      xBullModule: class {},
      LobstrModule: class {},
      FREIGHTER_ID: "freighter"
    });
    const got = await resolveKit({ network: "testnet" }, undefined, loader);
    expect(got).toEqual({ id: "built" });
    expect(loader).toHaveBeenCalledOnce();
    const arg = ctor.mock.calls[0]?.[0] as { network: string };
    expect(arg.network).toBe("TESTNET");
  });

  it("maps pubnet to WalletNetwork.PUBLIC", async () => {
    const ctor = vi.fn().mockReturnValue({ id: "built" });
    const loader = vi.fn().mockResolvedValue({
      StellarWalletsKit: ctor,
      WalletNetwork: { TESTNET: "TESTNET", PUBLIC: "PUBLIC" },
      FreighterModule: class {},
      xBullModule: class {},
      LobstrModule: class {},
      FREIGHTER_ID: "freighter"
    });
    await resolveKit({ network: "pubnet" }, undefined, loader);
    const arg = ctor.mock.calls[0]?.[0] as { network: string; selectedWalletId: string };
    expect(arg.network).toBe("PUBLIC");
    expect(arg.selectedWalletId).toBe("freighter");
  });
});
