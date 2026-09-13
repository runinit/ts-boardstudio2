import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const footprint = require("../reset_switch_tht_top.js");
for (const side of ["F", "B"]) {
  for (const reversible of [false, true]) {
    const pcb = footprint.body({
      ...footprint.params,
      side,
      reversible,
      at: "(at 0 0)",
      ref: "RST1",
      ref_hide: "",
      r: 0,
      from: { str: '(net "GND")' },
      to: { str: '(net "RST")' },
    });
    // C&K PTS636 THT land pattern: 6.4 mm centers and 1.2 mm drills.
    assert.match(
      pcb,
      /\(pad "2" thru_hole circle \(at -3\.2 0 0\) \(size 1\.9 1\.9\) \(drill 1\.2\).*\(net "GND"\)/,
    );
    assert.match(
      pcb,
      /\(pad "1" thru_hole circle \(at 3\.2 0 0\) \(size 1\.9 1\.9\) \(drill 1\.2\).*\(net "RST"\)/,
    );
  }
}
