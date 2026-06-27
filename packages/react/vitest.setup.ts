import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount React trees between tests so multiple render() calls don't bleed DOM.
// (No `globals: true`, so @testing-library/react's auto-cleanup is registered here.)
afterEach(() => {
  cleanup();
});
