import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const readManifest = async (name) =>
  JSON.parse(
    await readFile(new URL(`../manifest/${name}.json`, import.meta.url)),
  );
const manifest = await readManifest("sources");
const defaults = await readManifest("default-models");
const names = Object.entries(manifest.footprints)
  .flatMap(([namespace, files]) =>
    Object.keys(files).map((file) => `${namespace}/${basename(file, ".js")}`),
  )
  .sort();
const nonphysical = new Set(manifest.mappings.nonphysical);
const pcbOnly = new Set(manifest.mappings.pcbOnly);

// Account for every entry without mistaking a model binding for alignment proof.
const entries = names.map((name) => ({
  name,
  kind: nonphysical.has(name)
    ? "drawing"
    : pcbOnly.has(name)
      ? "pcb-only"
      : "physical",
  defaultBound: Object.hasOwn(defaults, name),
  alignment:
    nonphysical.has(name) || pcbOnly.has(name)
      ? "not-applicable"
      : "unverified",
}));
const invalid = [...nonphysical, ...pcbOnly, ...Object.keys(defaults)].filter(
  (name) => !names.includes(name),
);
const overlap = [...nonphysical].filter((name) => pcbOnly.has(name));
if (invalid.length || overlap.length) {
  throw new Error(
    `Invalid classification: ${JSON.stringify({ invalid, overlap })}`,
  );
}
const physical = entries.filter((entry) => entry.kind === "physical");
const report = {
  total: entries.length,
  physical: physical.length,
  bound: physical.filter((entry) => entry.defaultBound).length,
  missing: physical
    .filter((entry) => !entry.defaultBound)
    .map((entry) => entry.name),
  entries,
};
if (process.argv.includes("--check")) {
  assert.deepEqual(await readManifest("coverage"), report);
} else {
  console.log(JSON.stringify(report, null, 2));
}
