# MCU correction evidence

Runtime: Node v24.14.0 at /home/chris/.nvm/versions/node/v24.14.0/bin/node.

Initial hypotheses were hardcoded allocation-order coupling (Infused), missing ownership metadata (Ceoloide), and wrong placement precision/global state (Infused). Pad topology inspection plus native generated output confirmed the first two independently. Existing nanoAngles and superminiModels tests passed before source edits; refreshControllers failed before edits with missing track net NaN versus connected pad net 13 (red.txt).

Corrections:
- Share each MCU's existing pin matrix between pad and trace emission. F signal traces carry their side's via net; B crossover chains carry their destination via net; outer socket chains carry their local socket net. Ceoloide follows the existing invert_pins selection for reverse mounting.
- Infused: replace literal 1/13/23/24 IDs with the above live row-local identities. Increase rotated coordinate precision from two to six decimal places, retaining original custom pad rotations. Declare both pin-name variables locally (same correction as upstream PR4 commit c7a40cbd5419e37bcc962e7efaaf518f6e1285c1, retained upstream-pr4.js).
- Ceoloide: preserve invert_jumpers_position:false declaration and explicitly reject true with actionable error; new geometry/assembly to support it is outside this bounded correction. Integrator should document this limitation in BOARDSTUDIO and patch reasons.

Validation: refreshControllers.test.mjs passes 180 raw traced configurations (160 Ceoloide and 20 Infused), plus trace-disabled and nonreversible controls. Matrix spans 0/37/90/180/270 degrees, two allocation offsets, both reverse_mount values, full/reduced and rectangular/chevron jumpers. The graph checks track endpoint chains on each layer against pad-net anchors (0.36mm anchor bound accommodates existing Ceoloide 0.325mm diagonal entry into 0.4mm-radius vias; exact shared-endpoint tolerance 0.00001mm). Every chain reaches at least two pads with one net; every segment must own that net. Native engine.process outputs with an unrelated net preceding the MCU retain 240/192/192 tracks and all 22 signal plus 24 local socket nets. Three native PCB artifacts are retained. green.txt is the passing transcript.

nanoAngles.test.mjs and superminiModels.test.mjs also pass after correction, retaining custom-pad rotations and model override checks. No model defaults, filenames, model transformations, pad geometry or pad numbering changed. No native desktop KiCad roundtrip/DRC, schematic update or physical assembly certification is claimed. Existing duplicate Infused pad numbers are preserved.

No package, manifest or documentation edits were made by this worker. Integrator must register refreshControllers.test.mjs in the footprint test command and update source hashes/patch reasons/documented limitation. Debug-only /tmp/controllers-fix.cjs was removed; retained artifacts above are intentional evidence.
