import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { bindDefaults } from "../src/defaultModels.mjs";
const context = { module: { exports: {} } };
vm.runInNewContext(
  bindDefaults(
    await readFile(
      new URL("../mcu_supermini_nrf52840.js", import.meta.url),
      "utf8",
    ),
    "ceoloide/mcu_supermini_nrf52840",
  ),
  context,
);
const fp = context.module.exports;
for (const side of ["F", "B"]) {
  for (const reversible of [false, true]) {
    for (const reverse_mount of [false, true]) {
      const net = {
        str: '(net 1 "test")',
        name: "test",
        index: 1,
        toString() {
          return this.str;
        },
      };
      const params = Object.fromEntries(
        Object.entries(fp.params).map(([key, value]) => [
          key,
          value?.type === "net" ? net : value,
        ]),
      );
      Object.assign(params, {
        side,
        reversible,
        reverse_mount,
        at: "(at 0 0)",
        ref: "MCU1",
        ref_hide: "",
        r: 0,
        local_net: () => net,
        eaxy: (x, y) => `${x} ${y}`,
      });
      const pcb = fp.body(params);
      assert.match(pcb, /models\/boardstudio\/tsuki\/nrf52840.step/);
      assert.ok(!pcb.includes("undefined"));
      const custom = fp.body({
        ...params,
        mcu_3dmodel_xyz_offset: [1, 2, 3],
        mcu_3dmodel_xyz_rotation: [4, 5, 6],
      });
      assert.ok(custom.includes("(offset (xyz 1 2 3))"));
      assert.ok(custom.includes("(rotate (xyz 4 5 6))"));
    }
  }
}
