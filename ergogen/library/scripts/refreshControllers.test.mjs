import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sx = require("../../engine/src/templates/sexpr");
const child = (node, key) =>
  node.find((value) => Array.isArray(value) && value[0] === key);
const value = sx.value;
const files = [
  "mcu_nice_nano.js",
  "mcu_supermini_nrf52840.js",
  "vendor/infused-kim/nice_nano_pretty.js",
];
const near = (a, b, tolerance = 0.36) =>
  Math.hypot(a[0] - b[0], a[1] - b[1]) < tolerance;
function inspect(source, angle, expected) {
  const nodes = sx.parse(source, "controller");
  const fp = nodes.find((node) => ["module", "footprint"].includes(node[0]));
  const transform = ([x, y]) => {
    const r = (angle * Math.PI) / 180;
    return [
      19 + x * Math.cos(r) + y * Math.sin(r),
      -23 + y * Math.cos(r) - x * Math.sin(r),
    ];
  };
  const pads = fp
    .filter((node) => node[0] === "pad")
    .map((node) => ({
      at: transform(child(node, "at").slice(1, 3).map(Number)),
      net: Number(child(node, "net")[1]),
      layers: child(node, "layers").slice(1).map(value),
    }));
  const segments = nodes
    .filter((node) => node[0] === "segment")
    .map((node) => ({
      points: ["start", "end"].map((key) =>
        child(node, key).slice(1).map(Number),
      ),
      net: Number(child(node, "net")?.[1]),
      layer: value(child(node, "layer")[1]),
    }));
  assert.equal(segments.length, expected);
  const unseen = new Set(segments);
  while (unseen.size) {
    const first = unseen.values().next().value;
    const group = [first];
    unseen.delete(first);
    for (const current of group)
      for (const other of unseen) {
        if (
          other.layer === first.layer &&
          current.points.some((a) =>
            other.points.some((b) => near(a, b, 0.00001)),
          )
        ) {
          group.push(other);
          unseen.delete(other);
        }
      }
    const anchors = pads.filter(
      (pad) =>
        (pad.layers.includes("*.Cu") || pad.layers.includes(first.layer)) &&
        group.some((segment) =>
          segment.points.some((point) => near(point, pad.at)),
        ),
    );
    assert.ok(anchors.length >= 2, "each trace chain reaches two pads");
    assert.equal(
      new Set(anchors.map((pad) => pad.net)).size,
      1,
      "chain joins only one intended pad net",
    );
    for (const segment of group)
      assert.equal(
        segment.net,
        anchors[0].net,
        "track owns its connected pad net",
      );
  }
  return segments;
}
for (const file of files) {
  const context = { module: { exports: {} } };
  vm.runInNewContext(
    await readFile(new URL(`../${file}`, import.meta.url), "utf8"),
    context,
  );
  const fp = context.module.exports;
  const infused = file.includes("infused");
  for (const angle of [0, 37, 90, 180, 270])
    for (const prefix of [0, 47])
      for (const reverse_mount of [false, true])
        for (const rectangular of infused ? [false] : [false, true])
          for (const reduced of infused ? [false] : [false, true]) {
            const nets = new Map();
            const net = (name) => {
              if (!nets.has(name)) {
                const index = prefix + nets.size + 1;
                nets.set(name, {
                  name,
                  index,
                  str: `(net ${index} "${name}")`,
                });
              }
              return nets.get(name);
            };
            const params = Object.fromEntries(
              Object.entries(fp.params).map(([key, v]) => [
                key,
                v?.type === "net" ? net(`SIGNAL_${key}`) : v,
              ]),
            );
            const r = (angle * Math.PI) / 180;
            Object.assign(params, {
              at: `(at 19 -23 ${angle})`,
              r: angle,
              rot: angle,
              ref: "MCU1",
              ref_hide: "",
              reversible: true,
              reverse_mount,
              use_rectangular_jumpers: rectangular,
              only_required_jumpers: reduced,
              local_net: (number) => net(`LOCAL_${number}`),
              eaxy: (x, y) =>
                `${19 + x * Math.cos(r) + y * Math.sin(r)} ${-23 + y * Math.cos(r) - x * Math.sin(r)}`,
            });
            inspect(fp.body(params), angle, infused ? 240 : reduced ? 64 : 192);
            inspect(
              fp.body({
                ...params,
                [infused ? "traces" : "include_traces"]: false,
              }),
              angle,
              0,
            );
            if (!infused)
              inspect(fp.body({ ...params, reversible: false }), angle, 0);
            if (!infused)
              assert.throws(
                () => fp.body({ ...params, invert_jumpers_position: true }),
                /invert_jumpers_position.*unsupported.*false/i,
              );
            assert.equal(
              context.pin_name_left,
              undefined,
              "pin names do not leak into global scope",
            );
            assert.equal(
              context.pin_name_right,
              undefined,
              "pin names do not leak into global scope",
            );
          }
  console.log(
    `${file}: distinct-net chain ownership, allocation offsets, rotations and jumper variants passed`,
  );
}

const engine = require("../../engine/src/ergogen");
for (const file of files) {
  const fp = require(`../${file}`);
  const name = `controllers/${file.replaceAll("/", "_")}`;
  engine.inject("footprint", name, fp);
  engine.inject("footprint", "controllers/prefix", {
    params: { designator: "X", unrelated: { type: "net", value: "UNRELATED" } },
    body: () => "",
  });
  const params = Object.fromEntries(
    Object.entries(fp.params)
      .filter(([, v]) => v?.type === "net")
      .map(([key]) => [key, `SIGNAL_${key}`]),
  );
  if (!file.includes("infused")) params.reversible = true;
  const result = await engine.process({
    schema: "ergogen/v1",
    layout: {
      objects: {
        prefix: {
          kind: "component",
          pcb: "main",
          footprints: { main: { what: "controllers/prefix" } },
        },
        controller: {
          kind: "component",
          pcb: "main",
          footprints: { main: { what: name, params } },
        },
      },
    },
    designs: {
      regions: { board: { shape: { size: [100, 100] } } },
      profiles: { board: { from: "regions.board" } },
    },
    pcbs: { main: { profile: "profiles.board" } },
  });
  const board = sx.parse(result.pcbs.main, "native controller")[0];
  const segments = board.filter((node) => node[0] === "segment");
  assert.equal(segments.length, file.includes("infused") ? 240 : 192);
  const names = segments.map((node) => value(child(node, "net")?.[1]));
  assert.ok(names.every((net) => net && net !== "UNRELATED"));
  assert.equal(
    new Set(names).size,
    46,
    "all 22 signal and 24 local socket nets survive native output",
  );
  if (process.env.CONTROLLER_EVIDENCE_DIR) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(
      `${process.env.CONTROLLER_EVIDENCE_DIR}/${file.replaceAll("/", "_")}.kicad_pcb`,
      result.pcbs.main,
    );
  }
  console.log(
    `${file}: native engine output retains explicit signal/local track nets`,
  );
}
