# Vendor Footprint and Model Guidance

## OVERVIEW

Eight upstream asset/source collections; score 9, a distinct licensing and
model-assembly domain rather than application dependencies.

## STRUCTURE

| Directory | Role |
| --- | --- |
| `infused-kim/` | 15 generators, model sources, models and KiCad footprint references |
| `kiswitch/` | Switch/keycap assets and separate `licenses/` directory |
| `kicad/` | Connector/reset models and assembled paired sockets |
| `keebio/` | LED/TRRS models with retained `reference/` inputs |
| `foostan/` | SSD1306 display/socket/header assembly |
| `tsuki/` | Supermini NRF52840 controller model |
| `gdek/` | Gateron KS-33 model |
| `koktoh/` | Choc V2 Red STEP and WRL |

## WHERE TO LOOK

- `../manifest/<vendor>.json` records the individual imported model provenance;
  `../manifest/sources.json` carries the shared integrity inventory.
- `infused-kim/3d_model_src/` retains editable source material;
  `infused-kim/kicad_footprints/` contains reference footprint assets.
- `../scripts/assembleNanoSockets.py` creates the paired KiCad socket assembly.
  `../manifest/kicad.json` records its single-row source and translations.
- `../scripts/gateronDimensions.py` checks the selected KS-33 package dimensions.
  Both Python geometry helpers require system FreeCAD.

## CONVENTIONS

- Infused-Kim and koktoh assets retain CC BY-NC-SA 4.0 terms. KiCad models retain
  their license and model exception; GDEK retains CERN-OHL-S-2.0.
- Keep license files, author notices, source models and revision records with
  each collection. KiSwitch notices live under `kiswitch/licenses/`.
- The paired KiCad sockets use unchanged source solids, translated to 15.24 mm
  row spacing. Record assembly provenance rather than presenting them as an
  unchanged downloaded model.
- Infused-Kim nice!view has jumper pads without local connecting tracks;
  its improved display/socket alignment does not remove the routing requirement.
- The two libraries' two-pin Molex defaults differ: ceoloide uses BAT_N/BAT_P,
  while Infused-Kim uses RAW/GND. Switching namespaces does not preserve polarity.

## ANTI-PATTERNS

- Do not treat retained upstream submodule installation instructions as this
  workspace's integration procedure; these collections are already vendored.
- Do not infer KS-27 equivalence from the bundled KS-33 model or dimensions.
- Do not silently resolve the Infused-Kim README/license inconsistency by
  relabeling its contents; `../BOARDSTUDIO.md` records that unresolved boundary.
