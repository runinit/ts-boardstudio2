import { readFile } from "node:fs/promises";

const defaults = JSON.parse(
  await readFile(new URL("../manifest/default-models.json", import.meta.url)),
);

export const defaultModels = (name) => structuredClone(defaults[name] || {});

// Keep upstream geometry unchanged; generator parameter overrides still win.
export function bindDefaults(source, name) {
  const values = defaultModels(name);
  if (!Object.keys(values).length) {
    return source;
  }
  const trackpoint = name === "infused-kim/trackpoint_mount";
  const conditional = name === "ceoloide/switch_choc_v1_v2";
  const bossVariant =
    name === "ceoloide/reset_switch_smd_side"
      ? "${KIPRJMOD}/models/boardstudio/kicad/Panasonic_EVQPUL_EVQPUC.step"
      : null;
  return `${source}\n;module.exports = ((original) => {
    const defaults = ${JSON.stringify(values)};
    const bossVariant = ${JSON.stringify(bossVariant)};
    const chocV2 = "\${KIPRJMOD}/models/boardstudio/koktoh/Choc_V2_Red.step";
    return {
      ...original,
      params: {...original.params, ...defaults},
      body: p => {
        // The bundled extension crosses the PCB with a 5 mm outer diameter.
        const extensionDiameter = 5;
        if (${trackpoint} && p.drill < extensionDiameter
          && p.tp_extension_3dmodel_filename === defaults.tp_extension_3dmodel_filename
          && !p.tp_extension_3dmodel_xyz_scale
          && !p.tp_extension_3dmodel_xyz_rotation
          && !p.tp_extension_3dmodel_xyz_offset) {
          throw new Error('The bundled trackpoint extension requires a center drill of at least 5 mm. Select a compatible extension model or drill size.');
        }
        if (${conditional} && !p.choc_v1_support) {
          p = {...p};
          if (!p.choc_v2_support) {
            for (const key of Object.keys(defaults)) {
              if (p[key] === defaults[key]) { p[key] = ''; }
            }
          } else {
            if (p.switch_3dmodel_filename === defaults.switch_3dmodel_filename) {
              const automatic = !p.switch_3dmodel_xyz_rotation && !p.switch_3dmodel_xyz_offset
                && p.switch_3dmodel_xyz_scale.every(value => value === 1);
              const postDiameter = 4.8;
              if (automatic && (!p.include_stabilizer_pad || p.oval_stabilizer_pad
                || (p.center_hole_diameter > 0 && p.center_hole_diameter < postDiameter))) {
                throw new Error('The bundled Choc V2 model requires the round stabilizer hole and a center drill of at least 4.8 mm. Use a matching model or transform for modified hardware.');
              }
              p.switch_3dmodel_filename = chocV2;
              p.switch_3dmodel_xyz_rotation ||= p.side === 'F' ? [180, 0, 0] : [0, 180, 0];
              p.switch_3dmodel_xyz_offset ||= [0, 0, -p.pcb_thickness];
            }
            if (p.keycap_3dmodel_filename === defaults.keycap_3dmodel_filename) {
              p.keycap_3dmodel_filename = '';
            }
          }
        }
        if (bossVariant && p.include_bosses && p.reset_switch_3dmodel_filename === defaults.reset_switch_3dmodel_filename) {
          p = {...p, reset_switch_3dmodel_filename: bossVariant};
        }
        return original.body(p);
      }
    };
  })(module.exports);\n`;
}
