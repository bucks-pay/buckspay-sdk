import { describe, expect, it, vi } from "vitest";
import { Address, Keypair, nativeToScVal, StrKey } from "@stellar/stellar-sdk";
import { BuckspayError } from "../src/errors";
import { buildUnsignedEntry, simulateRecording, type SorobanSimulator } from "../src/auth-entry-builder";

const FROM = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 1)).publicKey();
const TO = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 2)).publicKey();
const SAC = StrKey.encodeContract(Buffer.alloc(32, 9));

const call = {
  contract: SAC,
  fn: "transfer",
  args: [
    new Address(FROM).toScVal(),
    new Address(TO).toScVal(),
    nativeToScVal(15_000_000n, { type: "i128" })
  ]
};

describe("simulateRecording", () => {
  it("returns the recording auth entry the simulator reports", async () => {
    const recorded = buildUnsignedEntry({ sac: SAC, from: FROM, to: TO, stroops: 15_000_000n, nonce: 7n });
    const simulator: SorobanSimulator = {
      simulate: vi.fn(async () => ({ auth: [recorded.toXDR("base64")], minResourceFee: "1234" }))
    };
    const result = await simulateRecording({ from: FROM, call, network: "testnet", simulator });
    expect(result.auth[0]!.toXDR("base64")).toBe(recorded.toXDR("base64"));
    expect(result.minResourceFee).toBe("1234");
    expect(simulator.simulate as ReturnType<typeof vi.fn>).toHaveBeenCalledWith({
      from: FROM,
      call,
      network: "testnet"
    });
  });

  it("maps a simulator error to SIMULATION_FAILED with the cause preserved", async () => {
    const boom = new Error("contract panicked: insufficient balance");
    const simulator: SorobanSimulator = {
      simulate: vi.fn(async () => {
        throw boom;
      })
    };
    await expect(
      simulateRecording({ from: FROM, call, network: "testnet", simulator })
    ).rejects.toMatchObject({ code: "SIMULATION_FAILED", cause: boom });
  });

  it("maps an empty auth array to SIMULATION_FAILED (no recording captured)", async () => {
    const simulator: SorobanSimulator = {
      simulate: vi.fn(async () => ({ auth: [], minResourceFee: "0" }))
    };
    await expect(
      simulateRecording({ from: FROM, call, network: "testnet", simulator })
    ).rejects.toBeInstanceOf(BuckspayError);
  });
});
