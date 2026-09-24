import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = promisify(execFile);
const root = new URL("..", import.meta.url).pathname;
const temporary = await mkdtemp(join(tmpdir(), "boardstudio-inventory-"));
let manifest;
try {
  const output = join(temporary, "sources.json");
  await run(process.execPath, ["scripts/inventory.mjs", output], { cwd: root });
  manifest = JSON.parse(await readFile(output));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
assert.equal(Object.keys(manifest.footprints.ceoloide).length, 24);
assert.equal(Object.keys(manifest.footprints["infused-kim"]).length, 15);
assert.ok(
  Object.keys(manifest.footprints.ceoloide).every(
    (name) => !name.includes("vendor/"),
  ),
);
assert.ok(manifest.mappings.pcbOnly.includes("infused-kim/pads"));
assert.ok(!manifest.mappings.nonphysical.includes("infused-kim/pads"));
assert.equal(manifest.generatedAt, undefined);
