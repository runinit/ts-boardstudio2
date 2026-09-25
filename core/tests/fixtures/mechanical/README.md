# Marbastlib mechanical geometry fixtures

These fixtures are verbatim KiCad footprint files from
[ebastler/marbastlib](https://github.com/ebastler/marbastlib), pinned to
commit [`6b0a9a73f579e377816d60b58eac2b3252de7868`](https://github.com/ebastler/marbastlib/tree/6b0a9a73f579e377816d60b58eac2b3252de7868)
(2026-03-22, “Huge release for KiCad 10.0, many new parts”). The repository
license is CERN-OHL-P-2.0; the upstream `LICENSE` is included unchanged.

## Geometry mapping

Marbastlib's README says MX switch and stabilizer footprints carry plate cuts on
`User.Eco2` and switch-spacing placement hints on `User.Drawings`. In the
KiCad 10 files at this pinned revision, the actual layer identifiers are
`Eco2.User` and `Dwgs.User`, respectively. Map geometry by purpose:

| Source | Layer or primitive | Purpose | Do not use as |
| --- | --- | --- | --- |
| `SW_MX_1u.kicad_mod` | `Eco2.User` lines and arcs | Switch plate opening | Board outline or mounting drill |
| `SW_MX_1u.kicad_mod` | `Dwgs.User` | 19.05 mm switch-spacing guide | Plate opening |
| `SW_MX_1u.kicad_mod` | `np_thru_hole` pads | Electrical-PCB switch mounting holes | Plate geometry |
| `STAB_MX_2u.kicad_mod`, `STAB_MX_6.25u.kicad_mod` | `Eco2.User` lines and arcs | Two stabilizer housing plate openings | PCB mounting holes |
| `STAB_MX_2u.kicad_mod`, `STAB_MX_6.25u.kicad_mod` | `np_thru_hole` pads | PCB-mounted stabilizer mounting holes | Plate openings |
| `STAB_MX_*` `Dwgs.User` | drawing guides | Placement/alignment guide | Cutout |
| `Plate_MX_1u.kicad_mod` | `Edge.Cuts` lines and arcs | Experimental FR4 plate switch opening example | Default profile geometry |
| `Plate_MX_1u.kicad_mod` | `Dwgs.User` rectangle | Switch-spacing guide | Cutout |

The stable `SW_MX_1u` Eco2 contour is nominally 14 × 14 mm: extents ±7 mm,
with approximately 0.5 mm corner rounds. Its associated NPTH pads are three
circles at x = −5.08, 0, +5.08 mm, with drill diameters 1.75, 3.9878, and
1.75 mm. These are separate PCB drill features and are not inferred as plate
openings.

The stable 2u and 6.25u stabilizer footprints each have two Eco2 rounded
rectangular openings. Each is 6.75 × 14 mm (x extent −15.28125…−8.53125 mm
and y extent −6…8 mm for the left 2u opening; mirrored about x=0 for the
right opening). For 6.25u, the x extents are −53.38125…−46.63125 mm and the
mirrored right opening. These are distinct from each footprint's four PCB
NPTH mounting pads. `STAB_MX` and `STAB_MX_P` are both PCB-mounted families;
the `P` variant changes screw-hole treatment to plated holes. It does not mean
plate-mounted.

Marbastlib does not provide a stable, dedicated plate-mounted MX stabilizer
footprint. A plate-mounted profile must be an explicit, reviewed profile that
uses compatible plate-opening geometry; do not advertise the PCB-mounted NPTH
features as plate-mounted support. The library also says stabilizer footprints
are add-ons intended to be placed with a switch footprint; it does not provide
a single combined switch/stabilizer footprint in this fixture set.

## Experimental plate reference

`Plate_MX_1u.kicad_mod` comes from `marbastlib-xp-plate-mx.pretty`. The upstream
README describes that library as experimental and asks users to validate its
footprints. The selected footprint uses Edge.Cuts contours for a bare milled
switch slot; the related `Plate-M_MX_*` and `Plate-MP_MX_*` variants add mask
or copper geometry that may require PCB-fabricator review. This file is
included only as a parser/reference fixture and must not seed a production
default without independent review and validation.

## Supplier constraints noted during review

JLCPCB's [capability table](https://jlcpcb.com/capabilities/Capab) currently
lists a 0.50 mm minimum non-plated hole, a 1.0 mm minimum non-plated slot
width, and ±0.2 mm non-plated slot tolerance. It says sharp-corner rectangular
holes and slots are unsupported. Its routed outline guidance also calls for
at least 0.2 mm copper clearance from routed board edges and slots. These are
supplier-published limits, not universal process limits or a guarantee that a
particular plate design will be accepted.

## Source hashes

The `.kicad_mod` files are unmodified. SHA-256:

```text
62911d74926f52abf4d75349cb6286b68944306aa8af30db76cd4b730d0eb5fd  Plate_MX_1u.kicad_mod
e6dbfefba073f23abe8a003656cee4d54d051cb21535850f3332c651f54c9bfc  STAB_MX_2u.kicad_mod
c0ddbafba01affa537638cd7ddec12c17ec0ea15c1e1436886f0a3d7b67a2d4d  STAB_MX_6.25u.kicad_mod
29c925516d79215884d1a89fc53250cd6c4899131e405af94966a74169fe4f19  SW_MX_1u.kicad_mod
```

Exact upstream paths:

```text
footprints/marbastlib-xp-plate-mx.pretty/Plate_MX_1u.kicad_mod
footprints/marbastlib-mx.pretty/STAB_MX_2u.kicad_mod
footprints/marbastlib-mx.pretty/STAB_MX_6.25u.kicad_mod
footprints/marbastlib-mx.pretty/SW_MX_1u.kicad_mod
```
