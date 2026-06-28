import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BuckspayClient } from "../src/client";
import type { BuckspayConfig } from "../src/types";
import { makeMockConfig } from "./helpers/mocks";

/** Build a config on the requested network, optionally setting the config opt-in. */
function configOn(network: BuckspayConfig["network"], allowMainnet?: boolean): BuckspayConfig {
  const { config } = makeMockConfig();
  return { ...config, network, ...(allowMainnet === undefined ? {} : { allowMainnet }) };
}

describe("BuckspayClient mainnet gate (env OR config opt-in)", () => {
  const ORIGINAL = process.env.BUCKSPAY_ALLOW_MAINNET;
  beforeEach(() => {
    delete process.env.BUCKSPAY_ALLOW_MAINNET; // simulate a browser: no env opt-in
  });
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.BUCKSPAY_ALLOW_MAINNET;
    else process.env.BUCKSPAY_ALLOW_MAINNET = ORIGINAL;
  });

  it("(a) always allows testnet, even with no opt-in", () => {
    expect(() => new BuckspayClient(configOn("testnet"))).not.toThrow();
  });

  it("(b) refuses pubnet when neither env nor config flag is set (browser)", () => {
    expect(() => new BuckspayClient(configOn("pubnet"))).toThrowError(/INVALID_CONFIG|mainnet|pubnet/i);
  });

  it("(c) allows pubnet when allowMainnet:true is in config (browser opt-in)", () => {
    expect(() => new BuckspayClient(configOn("pubnet", true))).not.toThrow();
  });

  it("(d) allows pubnet when the Node env BUCKSPAY_ALLOW_MAINNET=1 is set", () => {
    process.env.BUCKSPAY_ALLOW_MAINNET = "1";
    expect(() => new BuckspayClient(configOn("pubnet"))).not.toThrow();
  });

  it("config allowMainnet:false does not override an env opt-in (logical OR)", () => {
    process.env.BUCKSPAY_ALLOW_MAINNET = "1";
    expect(() => new BuckspayClient(configOn("pubnet", false))).not.toThrow();
  });
});
