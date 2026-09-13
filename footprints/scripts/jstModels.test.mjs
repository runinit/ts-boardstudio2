import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { bindDefaults } from "../src/defaultModels.mjs";

const context = { module: { exports: {} } };
vm.runInNewContext(
  bindDefaults(
    await readFile(
      new URL("../battery_connector_jst_ph_2.js", import.meta.url),
      "utf8",
    ),
    "ceoloide/battery_connector_jst_ph_2",
  ),
  context,
);
const footprint = context.module.exports;
for (const side of ["F", "B"]) {
  const net = { str: '(net "test")', index: 1 };
  const params = {
    ...footprint.params,
    side,
    at: "(at 0 0)",
    ref: "J1",
    ref_hide: "",
    r: 0,
    BAT_P: net,
    BAT_N: net,
    local_net: () => net,
    eaxy: (x, y) => `${x} ${y}`,
  };
  const pcb = footprint.body(params);
  assert.match(pcb, /JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal\.step/);
  assert.ok(pcb.includes(`(offset (xyz ${side === "F" ? -1 : 1} 0 0))`));
  assert.ok(pcb.includes(`(rotate (xyz 0 0 ${side === "F" ? 0 : 180}))`));
  const custom = footprint.body({
    ...params,
    battery_connector_3dmodel_xyz_offset: [3, 4, 5],
    battery_connector_3dmodel_xyz_rotation: [6, 7, 8],
  });
  assert.ok(custom.includes("(offset (xyz 3 4 5))"));
  assert.ok(custom.includes("(rotate (xyz 6 7 8))"));
}
