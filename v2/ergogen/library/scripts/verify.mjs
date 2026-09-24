import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const manifest = JSON.parse(
  await readFile(join(root, "manifest/sources.json")),
);
const defaults = JSON.parse(
  await readFile(join(root, "manifest/default-models.json")),
);
const check = async (entries) => {
  const missing = [],
    changed = [];
  for (const [name, expected] of Object.entries(entries)) {
    try {
      const actual = createHash("sha256")
        .update(await readFile(join(root, name)))
        .digest("hex");
      if (actual !== expected) {
        changed.push(name);
      }
    } catch {
      missing.push(name);
    }
  }
  return { missing, changed };
};
const result = {
  footprints: await check(
    Object.assign({}, ...Object.values(manifest.footprints)),
  ),
  models: await check(manifest.models),
};
result.invalidKeys = [];
for (const [name, bindings] of Object.entries(defaults)) {
  const sourcePath = name.startsWith("infused-kim/")
    ? `vendor/infused-kim/${name.slice(12)}.js`
    : `${name.slice(9)}.js`;
  const source = await readFile(join(root, sourcePath), "utf8");
  for (const key of Object.keys(bindings)) {
    if (!new RegExp(`${key}\\s*:`).test(source)) {
      result.invalidKeys.push(`${name}:${key}`);
    }
  }
}
const tree = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    paths.push(...(entry.isDirectory() ? await tree(path) : [path]));
  }
  return paths;
};
const actualCeoloide = (await readdir(root, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
  .map((entry) => entry.name);
const actualInfused = (await tree(join(root, "vendor/infused-kim")))
  .filter((path) => path.endsWith(".js"))
  .map((path) => path.slice(root.length + 1));
const actualModels = (
  await Promise.all(
    ["infused-kim", "kiswitch", "keebio", "foostan", "kicad", "tsuki", "gdek", "koktoh"].map(
      (name) => tree(join(root, `vendor/${name}/3d_models`)),
    ),
  )
)
  .flat()
  .filter((path) => /\.(step|stp|wrl|vrml|stl)$/i.test(path))
  .map((path) => path.slice(root.length + 1));
result.unlisted = {
  ceoloide: actualCeoloide.filter(
    (name) => !Object.hasOwn(manifest.footprints.ceoloide, name),
  ),
  "infused-kim": actualInfused.filter(
    (name) => !Object.hasOwn(manifest.footprints["infused-kim"], name),
  ),
  models: actualModels.filter((name) => !Object.hasOwn(manifest.models, name)),
};
result.invalidCandidates = Object.values(manifest.mappings.candidates)
  .flat()
  .filter((name) => !Object.hasOwn(manifest.models, name));
console.log(
  JSON.stringify(
    {
      ...result,
      mappingsUnverified: manifest.mappings.unverifiedAlignment,
      nonphysical: manifest.mappings.nonphysical.length,
    },
    null,
    2,
  ),
);
if (
  result.footprints.missing.length ||
  result.footprints.changed.length ||
  result.models.missing.length ||
  result.models.changed.length ||
  Object.values(result.unlisted).some((items) => items.length) ||
  result.invalidCandidates.length ||
  result.invalidKeys.length
) {
  process.exitCode = 1;
}
