import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { bindDefaults } from "../src/defaultModels.mjs";

const source = await readFile(
  new URL("../vendor/infused-kim/smd_0805.js", import.meta.url),
  "utf8",
);
const context = { module: { exports: {} } };
vm.runInNewContext(bindDefaults(source, "infused-kim/smd_0805"), context);
const footprint = context.module.exports;
for (const side of ["F", "B"]) {
  for (const components of [1, 2, 6]) {
    const params = {
      ...footprint.params,
      side,
      reverse: false,
      components,
      at: "(at 0 0)",
      ref: "SMD1",
      ref_hide: "",
      rot: 0,
    };
    for (const [key, value] of Object.entries(params)) {
      if (value?.type === "net") {
        params[key] = { str: `(net 1 "${key}")` };
      }
    }
    const output = footprint.body(params);
    assert.equal(
      (output.match(/\(model /g) || []).length,
      components,
      `${side}: ${components} models`,
    );
  }
}

const params = {
  ...footprint.params,
  side: "B",
  reverse: false,
  components: 2,
  at: "(at 0 0)",
  ref: "SMD1",
  ref_hide: "",
  rot: 0,
  component_1_3dmodel_filename: "first.step",
  component_2_3dmodel_filename: "second.step",
  component_1_3dmodel_xyz_scale: [2, 3, 4],
};
for (const [key, value] of Object.entries(params)) {
  if (value?.type === "net") {
    params[key] = { str: `(net 1 "${key}")` };
  }
}
let output = footprint.body(params);
assert.match(output, /\(model "first\.step"[\s\S]*?\(scale \(xyz 2 3 4\)\)/);

// With mirroring disabled, each model must remain over its own net's pads.
params.mirror = false;
output = footprint.body(params);
const firstX =
  Number(output.match(/\(model "first\.step"\s+\(at \(xyz ([^ ]+)/)[1]) * 25.4;
assert.ok(
  Math.abs(firstX - -1.5125) < 1e-9,
  `model x=${firstX}, pad x=-1.5125`,
);

for (const side of ["F", "B"]) {
  for (const mirror of [false, true]) {
    for (const components of [1, 2, 6]) {
      const sample = {
        ...params,
        side,
        mirror,
        components,
        component_1_3dmodel_xyz_scale: "",
      };
      for (let index = 1; index <= components; index++) {
        sample[`component_${index}_3dmodel_filename`] = `part${index}.step`;
      }
      const result = footprint.body(sample);
      for (let index = 1; index <= components; index++) {
        const match = result.match(
          new RegExp(
            `\\(model "part${index}\\.step"\\s+\\(at \\(xyz ([^ ]+) ([^ ]+) ([^)]+)`,
          ),
        );
        assert.ok(match, `${side}/${mirror}/${components}: model ${index}`);
        const expectedX =
          (1.025 + sample.space) *
          (index - 1 - (components - 1) / 2) *
          (side === "B" && mirror ? -1 : 1);
        assert.ok(Math.abs(Number(match[1]) * 25.4 - expectedX) < 1e-9);
        assert.ok(
          Math.abs(Number(match[3]) * 25.4 - (side === "B" ? -1.6 : 0)) < 1e-9,
        );
      }
    }
  }
}
