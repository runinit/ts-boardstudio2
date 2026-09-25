import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
const context = { module: { exports: {} } };
vm.runInNewContext(
  await readFile(
    new URL("../vendor/infused-kim/nice_nano_pretty.js", import.meta.url),
    "utf8",
  ),
  context,
);
const footprint = context.module.exports;
const net = { str: '(net 1 "test")', name: "test", index: 1 };
for (const angle of [0, 37, 90, 180, 270]) {
  const params = Object.fromEntries(
    Object.entries(footprint.params).map(([key, value]) => [
      key,
      value?.type === "net" ? net : value,
    ]),
  );
  Object.assign(params, {
    at: `(at 0 0 ${angle})`,
    rot: angle,
    ref: "MCU1",
    ref_hide: "",
    local_net: () => net,
  });
  const source = footprint.body(params);
  const angles = [
    ...source.matchAll(
      /\(pad [^\n]+ smd custom \(at [-\d.]+ [-\d.]+ ([^)]+)\)/g,
    ),
  ].map((match) => Number(match[1]));
  assert.equal(angles.length, 96);
  assert.ok(
    angles.every((value) => value === angle || value === angle + 180),
    "Jumper pads must rotate with their footprint",
  );
}
