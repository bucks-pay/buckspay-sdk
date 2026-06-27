import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BuckspayContext } from "./context";
import { useWallet } from "./use-wallet";
import { makeHarness, type Harness } from "./test/harness";

function WalletProbe() {
  const { address, status, connect, error } = useWallet();
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="address">{address ?? "none"}</div>
      <div data-testid="error">{error?.code ?? "none"}</div>
      <button onClick={() => void connect()}>connect</button>
    </div>
  );
}

function wrap(h: Harness) {
  return render(
    <BuckspayContext.Provider value={{ client: h.client, store: h.store }}>
      <WalletProbe />
    </BuckspayContext.Provider>
  );
}

describe("useWallet", () => {
  it("starts idle with no address", () => {
    wrap(makeHarness());
    expect(screen.getByTestId("status").textContent).toBe("idle");
    expect(screen.getByTestId("address").textContent).toBe("none");
  });

  it("calls client.connect and reflects the store address after connecting", async () => {
    const h = makeHarness();
    wrap(h);
    await act(async () => {
      screen.getByText("connect").click();
    });
    expect(h.client.connect).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("ready");
    });
    expect(screen.getByTestId("address").textContent).toBe("GTEST");
  });
});
