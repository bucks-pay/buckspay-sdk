import { render, screen, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { BuckspayContext } from "./context";
import { useBuckspayState } from "./use-buckspay-state";
import { makeHarness, type Harness } from "./test/harness";

function StatusProbe() {
  const status = useBuckspayState((s) => s.status);
  return <div data-testid="status">{status}</div>;
}

function wrap(h: Harness, ui: ReactNode) {
  return render(
    <BuckspayContext.Provider value={{ client: h.client, store: h.store }}>{ui}</BuckspayContext.Provider>
  );
}

describe("useBuckspayState", () => {
  it("renders the current slice and re-renders on store updates", () => {
    const h = makeHarness();
    wrap(h, <StatusProbe />);
    expect(screen.getByTestId("status").textContent).toBe("idle");

    act(() => {
      h.store.setState({ status: "relaying" });
    });
    expect(screen.getByTestId("status").textContent).toBe("relaying");
  });

  it("does not re-render when an unselected slice changes (stable selector)", () => {
    const h = makeHarness();
    let renders = 0;
    function Counter() {
      renders++;
      const status = useBuckspayState((s) => s.status);
      return <span>{status}</span>;
    }
    wrap(h, <Counter />);
    const before = renders;
    act(() => {
      h.store.setState({ address: "GNEW" }); // unselected slice
    });
    expect(renders).toBe(before); // status unchanged -> no extra render
  });
});
