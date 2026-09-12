# KiCad import fixtures

The unmodified `C_0603_1608Metric.kicad_mod` and STEP model come from the KiCad library community. Retrieved 2026-09-08 from the official GitLab file API:

- [Footprint source](https://gitlab.com/kicad/libraries/kicad-footprints/-/blob/master/Capacitor_SMD.pretty/C_0603_1608Metric.kicad_mod)
- [STEP source](https://gitlab.com/kicad/libraries/kicad-packages3D/-/blob/master/Capacitor_SMD.3dshapes/C_0603_1608Metric.step)
- [Library licence](https://www.kicad.org/libraries/license/)

The files retain their upstream contents. They are covered by CC-BY-SA 4.0 with the KiCad exception; see LICENSE.md. Test-generated placement and alignment changes are written only into disposable outputs.

SHA-256:

```text
4857b3dc717675bf1fb22edda622ac3b3ae03cf44d81eefaf3fa3ba3a86d84c1  C_0603_1608Metric.step
fe0dbfefbb181a0466f93a8de52d84ba7b00fcd9acdbb69575f4128a0af4e405  C_0603_1608Metric.kicad_mod
```

The real VRML fixture `C_0603_1608Metric.wrl` is retained from the archived
[KiCad source at b8b3cfdfad88ba66f21002b3de51dc6f7d55ba5a](https://raw.githubusercontent.com/KiCad/kicad-packages3D/b8b3cfdfad88ba66f21002b3de51dc6f7d55ba5a/Capacitor_SMD.3dshapes/C_0603_1608Metric.wrl).
It exercises indexed faces, normals, material and the KiCad VRML unit scale.
Its SHA-256 is `d8b095ab562bf44b3a6bcb4059c87775c51b7c5672480f3b2fdc796f165c8505`.

`model-volumes.json` records independent FreeCAD solid-volume measurements
and SHA-256 hashes for bundled assembly fixtures. Browser tests verify the
exact model list and source hashes, then compare generated volume within
0.1%. This rejects fallback envelopes while allowing numerical integration
variation between CAD kernels. Choc differs by 0.0152% between the two
measurements; other checked families differed by less than 0.005 mm³.
