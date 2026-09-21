# Peripheral fixes
Runtime: /home/chris/.nvm/versions/node/v24.14.0/bin/node; plain CommonJS generators through native Ergogen process.
References: footprints/AGENTS.md, BOARDSTUDIO.md, audit; debugging Node/setup/investigate/fix/QA/cleanup.
Hypotheses: (1) source option branching omits pads / wrong widths; compare option toggles in native output. (2) engine normalization aliases nets or angles; compare native pad/track attributes to emitted source. (3) wrong source/stale staging; inject current modules directly. Manufacturer switch layout cannot establish a safe merged socket slot; retain original drill geometry in supported modes.
Artifacts: retained red/green logs and native fixtures under this evidence directory; no temporary instrumentation or background processes.

## Confirmed causes and changes
- Native source injection accepted the diode option and produced no pad rejection; branch suppression was broader than replacement emission. Reject drilled-SMD without reversible, including outer THT variants so this declared reversible option cannot silently be ignored.
- Six default generic pads resolve to only five distinct nets. Correct net_6 default to PAD_6; explicit PAD_5 sharing remains supported.
- Native SSD traces had 0.21 mm where the adjacent global GND/RETURN bridge required 0.61 mm. Width now follows F socket index 0 and B socket index 3, rather than VCC indices 1 and 2. Four side/inversion native cases check adjacent global jumper identities rather than local net names.
- Reversible Gateron hotswap emits overlapping 3 mm circular drills. Reject hotswap && reversible without changing dimensions. Single-sided hotswap and reversible solder remain supported.
- Native Gateron custom pads had absolute angle 0 on a 37-degree footprint. Add p.r to all eight custom polygon templates. Eight F/B/0/37/90/180-degree solder cases check angles, distinct nets, and that each transformed custom polygon contains both associated drilled centers.

## Manufacturer evidence and limits
Retained y31.pdf and y31.png are page 6 of the exact Gateron KS-33H10B050NN-Y31 drawing:
https://gateron.com/u_file/2311/10/file/GATERONKS-33LowProfileRed20SwitchWhiteBottomHousingKS-33H10B050NN-Y31.pdf
Visual inspection confirms terminal offsets 2.60/4.40 mm and 5.75/4.70 mm. The drawing recommends solder slots, not a reversible socket layout or merged plated slot. Mirrored 3 mm socket drills are separated by sqrt(1.8² + 1.05²) = 2.08387 mm. There is no supported dimensional basis here to invent a replacement reversible hotswap drill or router path. Exact KS27 equivalence, socket assets, fabrication tolerance, clearance/DRC and board-house acceptance remain unproven.

## Verification
red.log: all five regression groups failed for the expected source defects before fixes.
green.log: 8/8 test groups/files pass on Node v24.14.0 (new native groups plus defaultModels, gateronModels, smdModels).
28 native KiCad PCB outputs retained as native-1 through native-28. These are native engine exports, not a KiCad desktop/DRC claim; kicad-cli was unavailable on PATH.
No source instrumentation or temporary running processes remain. Changes are restricted to the four assigned generators and the new regression script. Integration owner must register the test and update integrity/patch documentation manifests.
