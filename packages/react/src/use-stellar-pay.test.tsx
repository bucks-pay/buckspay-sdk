import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BuckspayContext } from "./context";
import { useStellarPay } from "./use-stellar-pay";
import { makeHarness, type Harness } from "./test/harness";
import type { Call, Receipt } from "@buckspay/core";

const RECEIPT: Receipt = {
  ok: true,
  via: "buckspay_self",
  token: "CUSDC",
  chain: "stellar-testnet",
  transferTx: "abc123",
  ledger: 42,
  status: "success"
};

function PayProbe({ calls }: { calls: Call[] }) {
  const { status, receipt, error, pay, reset } = useStellarPay();
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="tx">{receipt?.transferTx ?? "none"}</div>
      <div data-testid="error">{error?.code ?? "none"}</div>
      <button onClick={() => void pay(calls)}>pay</button>
      <button onClick={reset}>reset</button>
    </div>
  );
}

function wrap(h: Harness, calls: Call[]) {
  return render(
    <BuckspayContext.Provider value={{ client: h.client, store: h.store }}>
      <PayProbe calls={calls} />
    </BuckspayContext.Provider>
  );
}

describe("useStellarPay", () => {
  it("pay() delegates to client.pay and surfaces the receipt from the store", async () => {
    const h = makeHarness();
    (h.client.pay as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      h.store.setState({ status: "success", receipt: RECEIPT });
      return RECEIPT;
    });
    const calls: Call[] = [{ contract: "CUSDC", fn: "transfer", args: [] }];
    wrap(h, calls);

    await act(async () => {
      screen.getByText("pay").click();
    });
    expect(h.client.pay).toHaveBeenCalledWith(calls);
    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("success");
    });
    expect(screen.getByTestId("tx").textContent).toBe("abc123");
  });

  it("reset() returns the store to idle and clears receipt+error", async () => {
    const h = makeHarness({ status: "success", receipt: RECEIPT });
    wrap(h, []);
    expect(screen.getByTestId("status").textContent).toBe("success");
    await act(async () => {
      screen.getByText("reset").click();
    });
    expect(screen.getByTestId("status").textContent).toBe("idle");
    expect(screen.getByTestId("tx").textContent).toBe("none");
  });
});
