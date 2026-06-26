import { describe, expect, it } from "vitest";
import * as core from "../src/index";
import { makeMockConfig } from "./helpers/mocks";

describe("@buckspay/core client/config re-exports", () => {
  it("re-exports BuckspayClient + the two factories", () => {
    expect(typeof core.BuckspayClient).toBe("function");
    expect(typeof core.createBuckspayClient).toBe("function");
    expect(typeof core.createBuckspayConfig).toBe("function");
  });

  it("createBuckspayConfig via the barrel yields a client + store", () => {
    const { config } = makeMockConfig();
    const { client, store } = core.createBuckspayConfig(config);
    expect(client).toBeInstanceOf(core.BuckspayClient);
    expect(store.getState().status).toBe("idle");
  });
});
