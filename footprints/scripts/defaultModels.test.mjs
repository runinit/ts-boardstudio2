import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { bindDefaults, defaultModels } from "../src/defaultModels.mjs";

const source = new URL("../switch_mx.js", import.meta.url);
const before = createHash("sha256")
  .update(await readFile(source))
  .digest("hex");
assert.equal(
  defaultModels("ceoloide/switch_choc_v1_v2").switch_3dmodel_filename.endsWith(
    ".step",
  ),
  true,
);
const bound = bindDefaults(
  await readFile(new URL("../switch_choc_v1_v2.js", import.meta.url), "utf8"),
  "ceoloide/switch_choc_v1_v2",
);
assert.match(bound, /models\/boardstudio\/infused-kim\/Choc_V1_Switch\.step/);
assert.deepEqual(defaultModels("missing"), {});
const after = createHash("sha256")
  .update(await readFile(source))
  .digest("hex");
assert.equal(after, before);
assert.deepEqual(
  defaultModels("ceoloide/power_switch_smd_side").switch_3dmodel_xyz_rotation,
  [-90, 0, -90],
);

const vm = await import("node:vm");
const resetContext = { module: { exports: {} } };
vm.runInNewContext(
  bindDefaults(
    await readFile(
      new URL("../reset_switch_smd_side.js", import.meta.url),
      "utf8",
    ),
    "ceoloide/reset_switch_smd_side",
  ),
  resetContext,
);
const reset = resetContext.module.exports;
const resetParams = {
  ...reset.params,
  include_bosses: true,
  side: "F",
  at: "(at 0 0)",
  ref: "SW1",
  ref_hide: "",
  r: 0,
};
assert.match(reset.body(resetParams), /Panasonic_EVQPUL_EVQPUC\.step/);

assert.match(
  reset.body({ ...resetParams, reset_switch_3dmodel_filename: "custom.step" }),
  /custom\.step/,
);
