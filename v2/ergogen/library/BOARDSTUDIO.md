# BoardStudio footprints

This directory is the BoardStudio source fork for modular Ergogen
footprints. It retains the complete ceoloide Git history so future changes can
be rebased or compared without losing provenance.

## Pinned sources

| Namespace      | Source                                         | Pin                                        | License                                                                          |
| -------------- | ---------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| `ceoloide/`    | https://github.com/ceoloide/ergogen-footprints | `48935f54b456ff1503d78d6b17d9d146b54e8ade` | MIT, with infused-kim-derived files under CC BY-NC-SA 4.0 as documented upstream |
| `infused-kim/` | https://github.com/infused-kim/kb_ergogen_fp   | `bb80a207d8a6fa7b9245caad2c2d97e2adc2f612` | CC BY-NC-SA 4.0                                                                  |

The ceoloide source is the repository root. The infused-kim source is vendored
under `vendor/infused-kim/` to keep namespaces and license boundaries explicit.
Its `3d_models/` and `3d_model_src/` directories are retained verbatim.

## Coverage snapshot

The fork contains 24 ceoloide and 15 infused-kim footprint modules, with
54 model assets: 49 STEP/STP sources, four STL companions and one WRL. These include
33 infused-kim, eight KiSwitch, six KiCad, two Keebio, and one each from
Foostan, Tsuki and GDEK.

Default bindings cover 24 of 26 physical footprints. The THT reset switch
and EC11/EC12 encoder still need matching models. Nine drawing utilities
and four PCB-only entries need no component model.
`manifest/coverage.json` records every entry; `manifest/alignment.json`
records the scope and limitations of completed geometry checks. Default
coverage does not establish complete variant or fabrication validation.

## License provenance

Keep `LICENSE` for ceoloide and `vendor/infused-kim/LICENSE` with their source
trees. Ceoloide's README identifies MIT and CC BY-NC-SA 4.0 material separately;
do not apply the root MIT license to infused-kim-derived files.

## Integration

`src/defaultModels.mjs` exposes `bindDefaults(source, name)`. It returns a
self-contained Ergogen module with model filename defaults; explicit generator
parameters retain precedence. V2-only Choc footprints select the koktoh Choc V2 switch and retain the Choc socket; the incompatible MBK keycap is suppressed.
The application stages the transformed modules and model assets, preserving the
upstream source files. `manifest/default-models.json` owns parameter mappings.

The KiSwitch sources and checksums are recorded in `manifest/kiswitch.json`.
`manifest/patches.json` records intentional footprint corrections and their
original hashes. Unpatched source files retain upstream bytes.

Run `npm test` to validate the inventory. GUI integration tests additionally
generate each mapped footprint and compare its non-model KiCad syntax with the
upstream output. These tests establish source and transform integrity, not
physical pin alignment or fabrication readiness.

The generic 0805 array defaults to the bundled resistor model for all six
available positions. Set `component_N_3dmodel_filename` to the bundled capacitor
path for a capacitor; empty strings disable individual models. Both models use
1.25 x 2 mm bodies with terminals along Y. Tests cover one, two and six positions,
front/back placement, mirroring and transform overrides. Board thickness remains
the upstream 1.6 mm assumption for back-side models.

Ceoloide's SSSS811101 power switch and SOD-123 diode use the bundled Infused-Kim
models with explicit rotations and diode height offset. `manifest/alignment.json`
records actual KiCad STEP export checks for terminal-to-copper placement on F/B
at 0/90 degrees, plus diode cathode orientation. The ceoloide Panasonic reset
switch uses matching KiCad EVQPU models. `include_bosses` selects the bossed
or unbossed variant; contact and locating-hole checks cover F/B at 0/90 degrees.

Ceoloide's two-pin Pico-EZmate connector now accepts socket/cable filenames and
scale, rotation and offset parameters. Default models follow its selected side;
KiCad exports verify both socket contacts intersect their copper pads on F/B at
0/90 degrees. An empty filename disables that model. The source patch and its
original hash are recorded in `manifest/patches.json`.

Keebio models are pinned and attributed in `manifest/keebio.json`. The LED
preserves filenames containing spaces and chooses normal/reverse mounting
orientation unless a rotation override is supplied. Contact and marked-pin-3
checks cover F/B at 0/90 degrees for both mounting modes. The PJ-320A default
tracks the selected side and reversible-layout offset. All four legs fit their
intended drilled slots in the three supported layouts on F/B at 0/90 degrees.

The SSD1306 default uses Foostan's OLED/socket/header assembly at the pin recorded
in `manifest/foostan.json`, retaining its MIT license. It translates the model's
header origin to the footprint's display-center origin and mirrors the pin order
on B. Eight KiCad checks cover its four mounting shafts on F/B at 0/90 degrees
in single-sided and reversible layouts. `qa/oled-pin-labels.png` shows the model's
etched pin labels used to verify signal order.

Panasonic EVQPU reset models come from the current KiCad package library at the
pin in `manifest/kicad.json`, with its CC-BY-SA license and design exception.
The default selects the boss/no-boss variant from `include_bosses`; explicit
filenames remain authoritative. Eight KiCad checks cover contacts and locating
bosses on F/B at 0/90 degrees.

JST PH S2B-PH-K now uses the pinned KiCad model, centered and oriented for
the selected side. Eight exported cases verify entry shafts and housing placement.
The model includes unloaded bent pins: full-depth rigid containment is not a
physical insertion test. The manufacturer's reference drill range is 0.7–0.8 mm,
with a larger-hole advisory for hard PCBs; existing 0.75 mm drills are unchanged.
See `manifest/kicad.json` for the datasheet and fit limitation.

The ceoloide nice!nano default now follows `side` and `reverse_mount` and
uses the bundled library's 5 mm socket spacing. Eight KiCad-exported checks
verify 24 main hole centers, module clearance and MCU package orientation.
Explicit XYZ transforms still override the default. Optional extra pins and
physical socket/header solids are outside this check's scope.

The ceoloide Choc V1 hotswap default places the switch and cap opposite the
socket side. Model transforms use `pcb_thickness` (1.6 mm by default) and
a 6.6 mm keycap seating offset; match `pcb_thickness` to the board when
changing board thickness. 32 exported cases verify switch pins and socket contacts on F/B at 0/90
degrees, including single/reversible, alternate pad placement and plated holes.
Eight additional solder-only cases verify both pin sections fit their drills,
retain input/output nets and omit socket solids. Non-default board
thickness remains unverified. Explicit model transforms remain authoritative.

The ceoloide MX hotswap default places the switch opposite the socket side,
correcting the downloaded housing and socket datums. Match `pcb_thickness`
(default 1.6 mm) to the board. 32 exported cases verify switch pins and socket
contacts on F/B at 0/90 degrees, including reversible layouts, alternate pad
placement and plated holes. Explicit transforms remain authoritative.
Eight additional solder-only cases verify both pin sections fit their drills,
retain input/output nets and omit socket solids. Other board thicknesses remain
unverified.

The PTS636 THT reset footprint follows the manufacturer's 6.4 mm hole pitch
and 1.2 mm drills. Pads are 1.9 mm to retain the previous 0.35 mm annular ring.
This changes PCB geometry from upstream's 6.5 mm pitch and 1.0 mm drills;
pad numbers and nets remain unchanged. A matching 3D default is still pending.

### Supermini NRF52840

The Tsuki model (MIT, pinned in `manifest/tsuki.json`) is assigned by default.
The assembly assumes a 5 mm socket gap and 1.6 mm module PCB. Reversible
footprints mount the module on the back; explicit model transforms override
these defaults. `pcb_thickness` defaults to 1.6 mm and controls the front-layer
model offset for that back-mounted assembly.

Forty KiCad-exported cases verify main-hole alignment, chip/USB orientation,
and direct/jumper net paths across both footprint layers, 0/90 degree rotation,
normal/reverse mounting and jumper variants. Optional model holes differ by
0.06225 mm from the footprint. Nominal 0.64 mm square pins fit both 1 mm hole
sets with one 0.03112 mm header translation, leaving 0.01712 mm clearance.
This is a nominal geometry check, not manufactured-tolerance or socket proof.

### nice!view default assembly

The ceoloide nice!view default uses KiCad's 8.5 mm vertical five-pin socket.
Its tails fit the existing 1 mm PCB holes. The previous generic 5 mm socket
model had 0.8 by 0.65 mm rectangular tails that did not fit those holes.
The default display/header elevation is therefore 3.5 mm higher than the
original 5 mm socket assembly. Check enclosure clearance when adopting it.
Explicit display, header and socket transforms remain available for other
hardware. The footprint's copper, drill sizes and nets are unchanged.

The infused-kim nice!view default uses the same 8.5 mm socket and matching
display/header elevations. Its `display_3dmodel_side` override is preserved,
including reversible back mounting. Unlike ceoloide, this upstream footprint
provides jumper pads without connecting tracks: route sockets to their local
jumper pads before fabrication. The model correction does not add copper.

### Infused-kim nice!nano socket assembly

The controller now uses two KiCad 8.5 mm sockets at 15.24 mm row spacing.
`scripts/assembleNanoSockets.py` positions unchanged copies of the pinned
single-row source; provenance and translations are in `manifest/kicad.json`.
The paired model retains KiCad's license and model exception.

The MCU/header assembly is 3.5 mm higher than the original 5 mm socket
assembly. Model-origin offsets also correct MCU/header hole alignment.
Hole sizes and centers remain unchanged; review enclosure clearance.
Custom jumper pads now rotate with the footprint, fixing disconnected
socket-to-jumper paths at rotated placements.

### Two-pin Molex polarity conventions

The two libraries use different default nets for the same connector geometry:
ceoloide assigns pin 1 to BAT_N and pin 2 to BAT_P; infused-kim assigns pin 1
to RAW and pin 2 to GND. The model bindings preserve those definitions.
Choose or override nets to match the intended cable pinout; swapping library
entries does not preserve default polarity.

### Gateron KS-33 default

The KS-27/KS-33 footprint defaults to the KS-33 Low Profile 2.0 switch
from GilDev/GDEK, retained unchanged under that repository's CERN-OHL-S-2.0
license. Source commit and hashes are in `manifest/gdek.json`. This default
represents KS-33; it does not establish KS-27 body or travel equivalence.
Hotswap mounts the switch opposite the footprint side; solder-only mounts
it on the footprint side. Automatic transforms use the model's four planar
feet and `pcb_thickness` (default 1.6 mm). Explicit XYZ overrides win.
Twenty-four native/KiCad exports verified both mounting modes, sides,
0/90-degree rotations, reversible variants and custom solder-pad positions
against actual drill holes and input/output nets. The socket model is not supplied by this asset.

### Trackpoint extension clearance

The bundled T460S extension crosses the PCB with a 5 mm outer diameter.
Default binding rejects a smaller center drill instead of exporting intersecting
geometry. The default 5.5 mm drill remains supported. Explicit model or transform
overrides are retained and require their own fit check. A compatible extension
for the documented 3.5 mm drill option is not currently bundled.

Infused-kim Choc omits the socket model when `hotswap: false`. Solder-only
exports retain switch and keycap models; four F/B and 0/90-degree reversible
checks confirm both solder pins fit their holes and reach distinct nets.

### Choc V2

V2-only configurations use koktoh's Choc V2 Red STEP model. Its matching
WRL is also bundled. Both retain upstream CC BY-NC-SA 4.0 licensing;
`manifest/koktoh.json` records the source revision and author precautions.

Twenty-four KiCad exports cover solder, hotswap and combined mounting on
F/B, single/reversible, at 0/90 degrees. All 120 pin/post sections fit their
drills. Solder pins retain input/output nets. The 32 hotswap/combined paths
connect each switch pin to one socket terminal and its corresponding copper
net, allowing a 0.1 mm solder gap. Combined mounting includes both stabilizer
positions, including single-sided footprints.

The automatic model requires round stabilizer holes and a center drill of
at least 4.8 mm. Custom models and transforms remain authoritative. Alternate
pad placement, oval stabilizers and other board thicknesses are unverified.

Infused-kim reset and power-switch defaults each pass eight native KiCad
exports covering requested F/B sides, 0/90 degrees and reverse settings.
All physical terminals fit their copper pads within a 0.1 mm solder gap.
Reset pads retain GND/RST. The power switch's middle terminal connects to
BAT_P (pad 2 on F, pad 5 on B); the connected outer terminal retains RAW.
Reversed defaults place the model on B. These checks use default dimensions.

The 0805 resistor default passes 28 native exports: 1/2/6 components on
F/B at 0/90 degrees, plus two-component mirror/pad-direction variants with
0.8 mm spacing. Each body bridges its own net pair and both terminals fit
copper. Other model types and spacing values are outside this check.

Nice!view checks cover 16 ceoloide and 24 Infused-Kim cases. Display/header
rows align, socket tails fit the PCB drills, and MOSI/SCK/VCC/GND/CS order
matches the jumper arrangement. Ceoloide trace connectivity is checked;
Infused-Kim provides pads requiring manual routing.

Infused-kim Choc checks cover four reversible solder cases and six hotswap
cases at 0/90 degrees. Solder pins fit their drills. Each hotswap pin contacts
a distinct socket terminal; those terminals meet the input/output copper
pads. Single-sided hotswap uses the supported F switch side.

The Infused-kim nice!nano assembly passes ten cases: F/B model sides at
0/37/90/180/270 degrees. All 24 header/socket holes and tails align, socket
housings avoid the module, and socket traces reach their expected signal
jumpers. Modified heights, tilt and board thickness are outside this check.

### Selected package targets

Use Alps EC11E15244G1 for the encoder default: vertical, 20 mm flat shaft,
push switch, 30 detents and 15 pulses. Its manufacturer drawing is the
alignment reference: https://tech.alpsalpine.com/e/products/detail/EC11E15244G1/.
The generic EC11/EC12 footprint and candidate models are not yet verified
against this exact part; selecting it does not establish compatibility.

Use Gateron KS-33H10B050NN-Y31 (white-housing Low Profile 2.0 Red) as the
switch package target. This replaces the preliminary black-housing Y24 choice.
The bundled GDEK model matches the Y31 drawing's 12.15 mm total height,
15 mm body width/depth, two terminal positions and 5.05 mm mounting post,
within the drawing's tolerances. Run `python scripts/gateronDimensions.py`
with system FreeCAD installed. This checks principal package dimensions;
it does not verify every molded feature, material or switch travel.
Reference: https://gateron.com/u_file/2311/10/file/GATERONKS-33LowProfileRed20SwitchWhiteBottomHousingKS-33H10B050NN-Y31.pdf.

### User-provided model takeaway

The user will provide the remaining reset and encoder model files:

- C&K PTS636SL43LFS, 4.3 mm THT reset switch.
- Alps EC11E15244G1 encoder.

Further sourcing and drawing-based model creation are paused. Existing candidates
remain unassigned. After the files arrive, verify model placement, mounting holes,
pad/net alignment and native KiCad export before assigning defaults.

### September 2026 electrical corrections and supported options

The ceoloide and Infused-Kim upstream HEADs were rechecked on September 20, 2026
and still match the source pins above. These are targeted local corrections,
not an upstream version update. Original upstream hashes and attribution remain
in `manifest/patches.json`; `manifest/sources.json` records corrected file hashes.

Choc's back, nonreversible, unplated same-side hotswap contacts now retain distinct
FROM/TO nets, following the correction proposed in upstream PR82. MX reversible
inner tracks and their via carry TO; outer tracks and their via carry FROM.
Plated stabilizer nets now follow `include_stabilizer_nets` independently of the
center-hole flag. MX outer pad widths now use their declared front/back controls
literally, keeping the inward edge at 5.81 mm. The default changes from the old
hardcoded 2.55 mm to the declared 2.6 mm, moving the outward edge from 8.36 to
8.41 mm; review existing edge clearances when regenerating a board.

All three MCU generators now assign each supplied track its intended signal or
local socket net explicitly. Infused-Kim tracks retain six-decimal placement
precision, and its pin-name loop variables stay local, following upstream PR4.
Existing custom-pad rotations and model overrides remain supported. Both
ceoloide MCUs reject `invert_jumpers_position: true`: inverted jumper placement
has no implemented topology. Leave it false and follow the documented assembly
instructions. Reduced jumpers and optional pins retain their package-specific
rules; these corrections do not route the keyboard matrix or solder jumpers.

The diode rejects `include_thru_hole_smd_pads: true` without `reversible: true`,
including configurations with outer THT pads enabled. Use reversible drilled-SMD
pads or disable the drilled-SMD option. Infused-Kim generic pad 6 now defaults to
PAD_6; explicit shared nets remain supported. SSD1306 `gnd_trace_width` now applies
to paths leading to GND jumpers on each face; other paths use
`signal_trace_width`.

Gateron `hotswap: true` together with `reversible: true` is rejected because the
mirrored 3 mm circular drills overlap. Choose single-sided hotswap or reversible
solder mounting. Custom solder polygons now follow arbitrary footprint rotation.
The historical Gateron export checks above do not qualify reversible hotswap as
a supported or manufacturable layout. No replacement merged slot is supplied.
KS27 equivalence, socket assets, board-house acceptance and tolerances remain
unverified. The SK6812mini-e physical-view/pin-number question also remains open;
logical pad-net checks do not establish the manufacturer's physical orientation.

`scripts/refreshSwitches.test.mjs`, `refreshControllers.test.mjs` and
`refreshPeripherals.test.mjs` check distinct pad nets, trace ownership, parameter
variants, rejection paths and rotated geometry through raw/native engine output.
These tests supplement model checks; they do not renew historical KiCad exports
or establish desktop KiCad roundtrip, schematic-update, whole-board DRC or
physical assembly qualification. Mixed-number/net conventions in combined Choc
mounting and Infused-Kim MCU pads remain unchanged. Infused-Kim nice!view still
requires manual local routing. Vendor license notices remain unchanged; the
Infused-Kim README/license inconsistency is not resolved by these corrections.
