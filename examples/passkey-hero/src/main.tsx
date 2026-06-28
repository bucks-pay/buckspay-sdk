import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BuckspayProvider } from "@buckspay/react";
import { App } from "./App.js";
import { config, sim } from "./buckspay.js";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");

createRoot(root).render(
  <StrictMode>
    <BuckspayProvider config={config} sim={sim}>
      <App />
    </BuckspayProvider>
  </StrictMode>
);
