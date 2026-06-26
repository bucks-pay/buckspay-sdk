import { describe, expect, it } from "vitest";
import { BuckspayClient } from "../src/client";
import { makeMockConfig, MOCK_FROM, MOCK_SAC, MOCK_TO } from "./helpers/mocks";

describe("BuckspayClient.connect / getAccountState / transfer", () => {
  it("connect resolves the address, ensures readiness, and returns a wallet", async () => {
    const { config, account } = makeMockConfig();
    const client = new BuckspayClient(config);
    const wallet = await client.connect();
    expect(wallet.address).toBe(MOCK_FROM);
    expect(wallet.model).toBe("classic");
    expect(account.ensureReadyCalls).toHaveLength(1);
    expect(account.ensureReadyCalls[0]!.address).toBe(MOCK_FROM);
  });

  it("wallet.getState delegates to the relayer", async () => {
    const { config } = makeMockConfig();
    const client = new BuckspayClient(config);
    const wallet = await client.connect();
    const state = await wallet.getState();
    expect(state.exists).toBe(true);
    expect(state.hasUsdcTrustline).toBe(true);
  });

  it("getAccountState defaults to the connected address", async () => {
    const { config } = makeMockConfig();
    const client = new BuckspayClient(config);
    await client.connect();
    const state = await client.getAccountState();
    expect(state.usdcBalance).toBe("100");
  });

  it("getAccountState throws ACCOUNT_NOT_READY when no address known", async () => {
    const { config } = makeMockConfig();
    const client = new BuckspayClient(config);
    await expect(client.getAccountState()).rejects.toMatchObject({ code: "ACCOUNT_NOT_READY" });
  });

  it("transfer builds a USDC transfer Call (7-decimal stroops)", async () => {
    const { config } = makeMockConfig();
    const client = new BuckspayClient(config);
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "1.5" });
    expect(call.contract).toBe(MOCK_SAC);
    expect(call.fn).toBe("transfer");
    expect(call.args).toHaveLength(3);
    // amount arg is i128 with lo == 15000000
    expect(call.args[2]!.i128().lo().toString()).toBe("15000000");
  });

  it("transfer accepts a bigint amount as raw stroops", async () => {
    const { config } = makeMockConfig();
    const client = new BuckspayClient(config);
    await client.connect();
    const call = client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: 25_000_000n });
    expect(call.args[2]!.i128().lo().toString()).toBe("25000000");
  });

  it("transfer throws ACCOUNT_NOT_READY before connect (no from address)", () => {
    const { config } = makeMockConfig();
    const client = new BuckspayClient(config);
    expect(() => client.transfer({ token: MOCK_SAC, to: MOCK_TO, amount: "1" })).toThrowError(
      /ACCOUNT_NOT_READY|not connected/i
    );
  });
});
