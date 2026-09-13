import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { bindDefaults } from "../src/defaultModels.mjs";
const context = { module: { exports: {} } };
vm.runInNewContext(
  bindDefaults(
    await readFile(new URL("../display_nice_view.js", import.meta.url), "utf8"),
    "ceoloide/display_nice_view",
  ),
  context,
);
const fp = context.module.exports;
for (const side of ["F", "B"]) {
  const net = { str: '(net 1 "test")', index: 1 };
  const params = Object.fromEntries(
    Object.entries(fp.params).map(([key, value]) => [
      key,
      value?.type === "net" ? net : value,
    ]),
  );
  Object.assign(params, {
    side,
    at: "(at 0 0)",
    r: 0,
    ref: "DISP1",
    ref_hide: "",
    local_net: () => net,
    eaxy: (x, y) => `${x} ${y}`,
  });
  assert.match(fp.body(params), /PinSocket_1x05_P2.54mm_Vertical.step/);
  for (const name of ["niceview", "pin_header", "pin_socket"]) {
    const custom = fp.body({
      ...params,
      [name + "_3dmodel_xyz_offset"]: [1, 2, 3],
      [name + "_3dmodel_xyz_rotation"]: [4, 5, 6],
    });
    assert.ok(custom.includes("(offset (xyz 1 2 3))"));
    assert.ok(custom.includes("(rotate (xyz 4 5 6))"));
  }
}
