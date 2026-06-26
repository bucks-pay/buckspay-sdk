import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(here, "..", "tsconfig.base.json"), "utf8");
const cfg = JSON.parse(raw);
const co = cfg.compilerOptions ?? {};

assert.equal(co.strict, true, "strict must be true");
assert.equal(co.noUncheckedIndexedAccess, true, "noUncheckedIndexedAccess must be true");
assert.equal(co.exactOptionalPropertyTypes, true, "exactOptionalPropertyTypes must be true");
assert.equal(co.target, "ES2022", "target must be ES2022");
assert.equal(co.moduleResolution, "bundler", "moduleResolution must be bundler");
console.log("tsconfig.base.json OK");
