import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const tree = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    paths.push(...(entry.isDirectory() ? await tree(path) : [path]));
  }
  return paths;
};
const sha = async (path) =>
  createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
const files = async (dir, ext) =>
  (await tree(dir)).filter((path) => path.endsWith(ext));

const ceoloide = (await readdir(root, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
  .map((entry) => join(root, entry.name));
const infused = await files(join(root, "vendor/infused-kim"), ".js");
const models = (
  await Promise.all(
    ["infused-kim", "kiswitch", "keebio", "foostan", "kicad", "tsuki", "gdek", "koktoh"].map(
      (name) => tree(join(root, `vendor/${name}/3d_models`)),
    ),
  )
)
  .flat()
  .filter((path) => /\.(step|stp|wrl|vrml|stl)$/i.test(path));
const manifest = {
  schema: 1,
  sources: {
    koktoh: {url: "https://github.com/koktoh/keyswitch_model", commit: "2b6bcfac0032f1547e27b18b9a897e065e544b37", license: "vendor/koktoh/LICENSE"},
    gdek: {"url": "https://github.com/GilDev/GDEK", "commit": "629946873bc59c02567fb481bec7ae97d9bc59f8", "license": "vendor/gdek/LICENSE"},
    tsuki: {
      url: "https://github.com/42willow/tsuki",
      commit: "6ec3f66f3d0cb087d3a061690aaaaf412537c12d",
      license: "vendor/tsuki/LICENSE",
    },
    kicad: {
      url: "https://gitlab.com/kicad/libraries/kicad-packages3D",
      commit: "e62ed1fc7862da83f789bd562671b5e4b82afcdf",
      license: "vendor/kicad/LICENSE",
    },
    foostan: {
      url: "https://github.com/foostan/kbd",
      commit: "1f12004a1c9714d0eabec4028c9ae4b259b41562",
      license: "vendor/foostan/LICENSE",
    },
    keebio: {
      url: "https://github.com/keebio/Keebio-Parts.pretty",
      commit: "1486bef23f020c31bf69123c93da199850cc7243",
      license: "vendor/keebio/LICENSE",
    },
    kiswitch: {
      url: "https://github.com/kiswitch/kiswitch",
      commit: "aefcf65038d48d2666ff14530d482be3c350fa6e",
      license: "vendor/kiswitch/licenses/LICENSE",
    },
    ceoloide: {
      url: "https://github.com/ceoloide/ergogen-footprints",
      commit: "48935f54b456ff1503d78d6b17d9d146b54e8ade",
      license: "MIT; see upstream attribution for CC BY-NC-SA-derived files",
    },
    infusedKim: {
      url: "https://github.com/infused-kim/kb_ergogen_fp",
      commit: "bb80a207d8a6fa7b9245caad2c2d97e2adc2f612",
      license: "CC BY-NC-SA-4.0",
    },
  },
  footprints: { ceoloide: {}, "infused-kim": {} },
  models: {},
  mappings: {
    candidates: {
      "infused-kim/choc": [
        "vendor/infused-kim/3d_models/Choc_V1_Switch.step",
        "vendor/infused-kim/3d_models/Choc_V1_Hotswap.step",
      ],
      "infused-kim/conn_molex_pico_ezmate_1x02": [
        "vendor/infused-kim/3d_models/Molex_Ezmate_Pico_Socket_2pin.step",
      ],
      "infused-kim/conn_molex_pico_ezmate_1x05": [
        "vendor/infused-kim/3d_models/Molex_Ezmate_Pico_Socket_5pin.step",
      ],
      "infused-kim/nice_nano_pretty": [
        "vendor/infused-kim/3d_models/Nice_Nano_V2.step",
      ],
      "infused-kim/nice_view": ["vendor/infused-kim/3d_models/Nice_View.step"],
      "infused-kim/smd_0805": [
        "vendor/infused-kim/3d_models/SMD_0805_Capacitor.step",
        "vendor/infused-kim/3d_models/SMD_0805_Resistor.step",
      ],
      "infused-kim/switch_power": [
        "vendor/infused-kim/3d_models/Switch_Power.step",
      ],
      "infused-kim/switch_reset": [
        "vendor/infused-kim/3d_models/Switch_Reset.step",
      ],
    },
    unverifiedAlignment: true,
    nonphysical: [
      "ceoloide/utility_ergogen_logo",
      "ceoloide/utility_filled_zone",
      "ceoloide/utility_keepout_zone",
      "ceoloide/utility_point_debugger",
      "ceoloide/utility_router",
      "ceoloide/utility_text",
      "infused-kim/point_debugger",
      "infused-kim/text",
      "infused-kim/icon_bat",
    ],
    pcbOnly: [
      "infused-kim/pads",
      "infused-kim/mounting_hole",
      "ceoloide/mounting_hole_npth",
      "ceoloide/mounting_hole_plated",
    ],
  },
};
for (const path of ceoloide)
  manifest.footprints.ceoloide[relative(root, path)] = await sha(path);
for (const path of infused)
  manifest.footprints["infused-kim"][relative(root, path)] = await sha(path);
for (const path of models)
  manifest.models[relative(root, path)] = await sha(path);
await mkdir(join(root, "manifest"), { recursive: true });
await writeFile(
  process.argv[2] || join(root, "manifest/sources.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  `footprints: ${ceoloide.length + infused.length}; models: ${models.length}`,
);
