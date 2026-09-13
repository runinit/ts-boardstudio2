import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { bindDefaults } from "../src/defaultModels.mjs";

const context = { module: { exports: {} } };
vm.runInNewContext(
  bindDefaults(
    await readFile(new URL("../switch_mx.js", import.meta.url), "utf8"),
    "ceoloide/switch_mx",
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
    from: net,
    to: net,
    local_net: () => net,
    eaxy: (x, y) => `${x} ${y}`,
  };
  const pcb = footprint.body(params);
  assert.match(pcb, /SW_Cherry_MX_PCB\.stp/);
  assert.ok(
    pcb.includes(
      side === "F" ? "(rotate (xyz 0 180 0))" : "(rotate (xyz 180 0 0))",
    ),
  );
  const custom = footprint.body({
    ...params,
    switch_3dmodel_xyz_offset: [3, 4, 5],
    switch_3dmodel_xyz_rotation: [6, 7, 8],
  });
  assert.ok(custom.includes("(offset (xyz 3 4 5))"));
  assert.ok(custom.includes("(rotate (xyz 6 7 8))"));
}
