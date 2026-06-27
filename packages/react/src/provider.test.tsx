import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BuckspayContext, useBuckspayContext } from "./context";
import { makeHarness } from "./test/harness";

function Probe() {
  const ctx = useBuckspayContext();
  return <div data-testid="addr">{ctx.store.getState().address ?? "none"}</div>;
}

describe("BuckspayContext", () => {
  it("provides the client+store to descendants", () => {
    const h = makeHarness({ address: "GPROVIDED" });
    render(
      <BuckspayContext.Provider value={{ client: h.client, store: h.store }}>
        <Probe />
      </BuckspayContext.Provider>
    );
    expect(screen.getByTestId("addr").textContent).toBe("GPROVIDED");
  });

  it("throws a clear error when a hook is used outside the provider", () => {
    const orig = console.error;
    console.error = () => {};
    expect(() => render(<Probe />)).toThrow(/BuckspayProvider/);
    console.error = orig;
  });
});
