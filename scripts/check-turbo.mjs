import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(here, "..", "turbo.json"), "utf8"));
const tasks = cfg.tasks ?? cfg.pipeline ?? {};

for (const t of ["build", "test", "lint", "typecheck"]) {
  assert.ok(tasks[t], `turbo task "${t}" must be defined`);
}
assert.deepEqual(tasks.build.outputs, ["dist/**"], "build outputs must be dist/**");
console.log("turbo.json OK");
