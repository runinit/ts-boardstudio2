# Model contact QA

Requires `kicad-cli` and system Python with FreeCAD, Part and pcbnew.
Set `FREECAD_LIBDIR` if FreeCAD is outside `/usr/lib/freecad/lib`.
Run from the GUI checkout after installing dependencies and the footprint submodule:

```sh
QA_KEEP_MODELS=1 node scripts/qa/model-contacts.cjs power_infused
QA_KEEP_MODELS=1 node scripts/qa/model-contacts.cjs evq7_infused
```

The argument filters case-name prefixes; omit it to run all listed cases.
Each case generates a native PCB, exports STEP with copper pads, then checks
model terminals against that geometry. `QA_KEEP_MODELS=1` retains the printed
artifact directories. Otherwise temporary outputs are removed.

Checks cover the explicit parameters in `model-contacts.cjs`, not every variant
or manufacturing tolerance. Net and polarity checks depend on component type;
see `model-terminals.py` and the library's `manifest/alignment.json`.
