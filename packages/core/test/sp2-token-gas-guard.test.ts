import { describe, expect, it } from "vitest";
import { BuckspayClient } from "../src/client";
import type { BuckspayConfig } from "../src/types";
import { makeMockConfig } from "./helpers/mocks";

// Quality add-on to sprint-0/01 Task 1: the fail-closed token guard must be observable at runtime,
// not only via the type surface. `prepare()` rejects with TOKEN_GAS_REJECTED until SP-2 sprint-1
// wires the FeeForwarder, so a token config can never silently fall through to the sponsored path.
describe("SP-2 token gas fails closed until sprint-1", () => {
  it("prepare() throws TOKEN_GAS_REJECTED when gas.mode === 'token'", async () => {
    const { config } = makeMockConfig();
    const tokenConfig: BuckspayConfig = {
      ...config,
      gas: { mode: "token", token: "CUSDC" }
    };
    const client = new BuckspayClient(tokenConfig);
    await expect(
      client.prepare([{ contract: "CUSDC", fn: "transfer", args: [] }])
    ).rejects.toMatchObject({ code: "TOKEN_GAS_REJECTED" });
  });
});
