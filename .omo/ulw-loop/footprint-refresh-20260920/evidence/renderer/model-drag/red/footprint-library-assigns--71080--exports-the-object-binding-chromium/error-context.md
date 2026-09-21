# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: footprint-library.spec.ts >> assigns a model to a native BHK controller and exports the object binding
- Location: e2e/footprint-library.spec.ts:244:5

# Error details

```
Error: expect(received).not.toEqual(expected) // deep equality

Expected: not [8.89, 16.5, -8.2]


Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - link "Go to home page" [ref=e8] [cursor=pointer]:
          - /url: /boardstudio/
          - img "Board Studio logo" [ref=e9]
        - generic [ref=e10] [cursor=pointer]: Board Studio
      - button "Close navigation panel" [ref=e11] [cursor=pointer]:
        - img [ref=e12]
    - generic [ref=e15]:
      - generic [ref=e16]:
        - button "New" [ref=e17] [cursor=pointer]:
          - img [ref=e18]
          - generic [ref=e19]: New
        - button "Import" [ref=e20] [cursor=pointer]:
          - img [ref=e21]
          - generic [ref=e25]: Import
        - button "Download All" [ref=e26] [cursor=pointer]:
          - img [ref=e27]
          - generic [ref=e30]: Download All
      - generic [ref=e31]:
        - img
        - textbox "Search configurations" [ref=e32]:
          - /placeholder: Search configurations...
      - generic [ref=e33]:
        - generic [ref=e34]: Saved Configurations
        - generic [ref=e35]: "1"
      - generic [ref=e37]:
        - button "Legacy Config" [ref=e38] [cursor=pointer]:
          - img [ref=e39]
          - generic [ref=e42]: Legacy Config
        - generic [ref=e43]:
          - button "Rename configuration Legacy Config" [ref=e44] [cursor=pointer]:
            - img [ref=e45]
          - button "Duplicate configuration Legacy Config" [ref=e48] [cursor=pointer]:
            - img [ref=e49]
          - button "Delete configuration Legacy Config" [ref=e52] [cursor=pointer]:
            - img [ref=e53]
    - generic [ref=e57]:
      - button "Open documentation" [ref=e58] [cursor=pointer]:
        - img [ref=e59]
        - generic [ref=e62]: Docs
      - button "Join the Discord community" [ref=e63] [cursor=pointer]:
        - img [ref=e64]
      - button "View Ergogen Web UI 0.20.0 on GitHub" [ref=e66] [cursor=pointer]:
        - img [ref=e67]
        - generic [ref=e69]:
          - generic [ref=e70]: Web UI
          - generic [ref=e71]: 0.20.0
      - button "View Ergogen 6.0.0-develop on GitHub" [ref=e72] [cursor=pointer]:
        - img [ref=e73]
        - generic [ref=e75]:
          - generic [ref=e76]: Ergogen
          - generic [ref=e77]: 6.0.0-develop
  - region "Board Studio" [ref=e79]:
    - generic [ref=e80]:
      - button "Projects" [ref=e81] [cursor=pointer]:
        - img [ref=e82]
      - heading "Board Studio / Legacy Config" [level=1] [ref=e84]
      - generic [ref=e85]: Autosaved
      - button "Generate project" [ref=e86] [cursor=pointer]:
        - img [ref=e87]
        - generic [ref=e90]: Generate 3D
      - generic [ref=e92]:
        - button "Code" [ref=e93] [cursor=pointer]:
          - img [ref=e94]
          - text: Code
        - button "Edit key assembly" [ref=e98] [cursor=pointer]
        - button "Design setup" [ref=e99] [cursor=pointer]
        - button "Install app" [ref=e100] [cursor=pointer]:
          - img [ref=e101]
          - text: Install App
        - button "Settings" [ref=e104] [cursor=pointer]:
          - img [ref=e105]
    - navigation "Design workflow" [ref=e108]:
      - button "Design" [ref=e109] [cursor=pointer]:
        - img [ref=e110]
        - text: Design
      - button "PCB" [ref=e115] [cursor=pointer]:
        - img [ref=e116]
        - text: PCB
      - button "Case" [ref=e119] [cursor=pointer]:
        - img [ref=e120]
        - text: Case
      - button "Export" [ref=e123] [cursor=pointer]:
        - img [ref=e124]
        - text: Export
      - generic [ref=e127]:
        - button "Undo project edit" [ref=e128] [cursor=pointer]:
          - img [ref=e129]
        - button "Redo project edit" [disabled] [ref=e132]:
          - img [ref=e133]
        - button "Part library" [ref=e136] [cursor=pointer]:
          - img [ref=e137]
          - text: Part library
    - region "Case designer" [active] [ref=e142]:
      - generic [ref=e143]:
        - complementary "Assembly panel" [ref=e144]:
          - button "Close assembly tree" [ref=e145] [cursor=pointer]
          - heading "Assembly" [level=2] [ref=e146]
          - paragraph [ref=e147]: bhk
          - tree "Assembly" [ref=e148]:
            - generic [ref=e150]:
              - treeitem "Case shell" [level=1] [ref=e151] [cursor=pointer]:
                - img [ref=e152]
                - generic [ref=e155]: Case shell
              - button "Hide Case shell" [ref=e156] [cursor=pointer]:
                - img [ref=e157]
            - generic [ref=e161]:
              - treeitem "Top frame" [level=1] [ref=e162] [cursor=pointer]:
                - img [ref=e163]
                - generic [ref=e166]: Top frame
              - button "Hide Top frame" [ref=e167] [cursor=pointer]:
                - img [ref=e168]
            - generic [ref=e172]:
              - treeitem "Plate" [level=1] [ref=e173] [cursor=pointer]:
                - img [ref=e174]
                - generic [ref=e178]: Plate
              - button "Hide Plate" [ref=e179] [cursor=pointer]:
                - img [ref=e180]
            - generic [ref=e184]:
              - treeitem "PCB" [level=1] [ref=e185] [cursor=pointer]:
                - img [ref=e186]
                - generic [ref=e192]: PCB
              - button "Hide PCB" [ref=e193] [cursor=pointer]:
                - img [ref=e194]
            - generic [ref=e197]:
              - generic [ref=e198]:
                - button "Collapse Components (39)" [ref=e199] [cursor=pointer]:
                  - img [ref=e200]
                - treeitem "Components (39)" [expanded] [level=1] [ref=e202] [cursor=pointer]:
                  - img [ref=e203]
                  - generic [ref=e206]: Components
                  - generic [ref=e207]: "39"
                - button "Hide Components (39)" [ref=e208] [cursor=pointer]:
                  - img [ref=e209]
              - group [ref=e212]:
                - generic [ref=e214]:
                  - button "Expand component (1)" [ref=e215] [cursor=pointer]:
                    - img [ref=e216]
                  - treeitem "component (1)" [level=2] [ref=e218] [cursor=pointer]:
                    - img [ref=e219]
                    - generic [ref=e222]: component
                    - generic [ref=e223]: "1"
                  - button "Hide component (1)" [ref=e224] [cursor=pointer]:
                    - img [ref=e225]
                - generic [ref=e229]:
                  - button "Expand display (1)" [ref=e230] [cursor=pointer]:
                    - img [ref=e231]
                  - treeitem "display (1)" [level=2] [ref=e233] [cursor=pointer]:
                    - img [ref=e234]
                    - generic [ref=e237]: display
                    - generic [ref=e238]: "1"
                  - button "Hide display (1)" [ref=e239] [cursor=pointer]:
                    - img [ref=e240]
                - generic [ref=e244]:
                  - button "Expand key_rotated (18)" [ref=e245] [cursor=pointer]:
                    - img [ref=e246]
                  - treeitem "key_rotated (18)" [level=2] [ref=e248] [cursor=pointer]:
                    - img [ref=e249]
                    - generic [ref=e252]: key_rotated
                    - generic [ref=e253]: "18"
                  - button "Hide key_rotated (18)" [ref=e254] [cursor=pointer]:
                    - img [ref=e255]
                - generic [ref=e259]:
                  - button "Expand key (15)" [ref=e260] [cursor=pointer]:
                    - img [ref=e261]
                  - treeitem "key (15)" [level=2] [ref=e263] [cursor=pointer]:
                    - img [ref=e264]
                    - generic [ref=e267]: key
                    - generic [ref=e268]: "15"
                  - button "Hide key (15)" [ref=e269] [cursor=pointer]:
                    - img [ref=e270]
                - generic [ref=e273]:
                  - generic [ref=e274]:
                    - button "Collapse controller (1)" [ref=e275] [cursor=pointer]:
                      - img [ref=e276]
                    - treeitem "controller (1)" [expanded] [level=2] [selected] [ref=e278] [cursor=pointer]:
                      - img [ref=e279]
                      - generic [ref=e282]: controller
                      - generic [ref=e283]: "1"
                    - button "Hide controller (1)" [ref=e284] [cursor=pointer]:
                      - img [ref=e285]
                  - group [ref=e288]:
                    - generic [ref=e290]:
                      - treeitem "mcu" [level=3] [ref=e291] [cursor=pointer]:
                        - img [ref=e292]
                        - generic [ref=e295]: mcu
                      - button "Hide mcu" [ref=e296] [cursor=pointer]:
                        - img [ref=e297]
                - generic [ref=e301]:
                  - button "Expand power_switch (1)" [ref=e302] [cursor=pointer]:
                    - img [ref=e303]
                  - treeitem "power_switch (1)" [level=2] [ref=e305] [cursor=pointer]:
                    - img [ref=e306]
                    - generic [ref=e309]: power_switch
                    - generic [ref=e310]: "1"
                  - button "Hide power_switch (1)" [ref=e311] [cursor=pointer]:
                    - img [ref=e312]
                - generic [ref=e316]:
                  - button "Expand reset_button (1)" [ref=e317] [cursor=pointer]:
                    - img [ref=e318]
                  - treeitem "reset_button (1)" [level=2] [ref=e320] [cursor=pointer]:
                    - img [ref=e321]
                    - generic [ref=e324]: reset_button
                    - generic [ref=e325]: "1"
                  - button "Hide reset_button (1)" [ref=e326] [cursor=pointer]:
                    - img [ref=e327]
                - generic [ref=e331]:
                  - button "Expand scrollwheel (1)" [ref=e332] [cursor=pointer]:
                    - img [ref=e333]
                  - treeitem "scrollwheel (1)" [level=2] [ref=e335] [cursor=pointer]:
                    - img [ref=e336]
                    - generic [ref=e339]: scrollwheel
                    - generic [ref=e340]: "1"
                  - button "Hide scrollwheel (1)" [ref=e341] [cursor=pointer]:
                    - img [ref=e342]
            - generic [ref=e346]:
              - button "Expand Hardware" [ref=e347] [cursor=pointer]:
                - img [ref=e348]
              - treeitem "Hardware" [level=1] [ref=e350] [cursor=pointer]:
                - img [ref=e351]
                - generic [ref=e353]: Hardware
              - button "Hide Hardware" [ref=e354] [cursor=pointer]:
                - img [ref=e355]
          - group [ref=e358]:
            - generic "Case setup" [ref=e359] [cursor=pointer]
            - navigation "Case tools" [ref=e360]:
              - button "Layout" [ref=e361] [cursor=pointer]
              - button "Manufacturing" [ref=e362] [cursor=pointer]
              - button "Mounting" [ref=e363] [cursor=pointer]
              - button "Enclosure" [ref=e364] [cursor=pointer]
              - button "Components" [ref=e365] [cursor=pointer]
              - button "Hardware" [ref=e366] [cursor=pointer]
              - button "Review" [ref=e367] [cursor=pointer]
        - generic "Contextual inspector" [ref=e368]:
          - button "Close inspector" [ref=e369] [cursor=pointer]
          - heading "Components" [level=2] [ref=e370]
          - region "Board components" [ref=e372]:
            - generic [ref=e373]:
              - checkbox "Apply dimensions and manual model assignments to matching footprints" [checked] [ref=e374]
              - text: Apply dimensions and manual model assignments to matching footprints
            - generic [ref=e375]:
              - generic [ref=e376]: Component footprint
              - 'button "Help: Component footprint" [ref=e378] [cursor=pointer]': "?"
              - combobox "Component footprint" [ref=e379]:
                - option "Choose…"
                - option "board_zone_gnd"
                - option "display"
                - option "matrix_c1_r1"
                - option "matrix_c1_r2"
                - option "matrix_c1_r3"
                - option "matrix_c1_r4"
                - option "matrix_c2_r1"
                - option "matrix_c2_r2"
                - option "matrix_c2_r3"
                - option "matrix_c2_r4"
                - option "matrix_c3_r1"
                - option "matrix_c3_r2"
                - option "matrix_c3_r3"
                - option "matrix_c3_r4"
                - option "matrix_c3_r5"
                - option "matrix_c4_r1"
                - option "matrix_c4_r2"
                - option "matrix_c4_r3"
                - option "matrix_c4_r4"
                - option "matrix_c4_r5"
                - option "matrix_c5_r1"
                - option "matrix_c5_r2"
                - option "matrix_c5_r3"
                - option "matrix_c5_r4"
                - option "matrix_c6_r1"
                - option "matrix_c6_r2"
                - option "matrix_c6_r3"
                - option "matrix_c6_r4"
                - option "matrix_c7_r1"
                - option "matrix_c7_r2"
                - option "mcu" [selected]
                - option "power_switch"
                - option "reset_button"
                - option "scrollwheel"
                - option "thumbfan_c1_r2"
                - option "thumbfan_c2_r1"
                - option "thumbfan_c2_r2"
                - option "thumbfan_c3_r1"
                - option "thumbfan_c3_r2"
            - paragraph [ref=e380]: mcu controller
            - generic [ref=e381]:
              - generic [ref=e382]:
                - text: Model
                - combobox "Active model" [ref=e383]:
                  - option "1. nrf52840.step" [selected]
                  - option "2. C_0603_1608Metric.step"
              - generic [ref=e384]:
                - button "Add models" [ref=e385] [cursor=pointer]
                - button "Replace" [ref=e386] [cursor=pointer]
                - button "Remove" [ref=e387] [cursor=pointer]
              - paragraph [ref=e388]: STEP, STL or VRML · original files are retained.
              - group "Position (mm)" [ref=e389]:
                - generic [ref=e390]: Position (mm)
                - generic [ref=e391]:
                  - generic [ref=e392]:
                    - text: X
                    - spinbutton "Model offset X" [ref=e393]: "8.89"
                  - generic [ref=e394]:
                    - text: "Y"
                    - spinbutton "Model offset Y" [ref=e395]: "16.5"
                  - generic [ref=e396]:
                    - text: Z
                    - spinbutton "Model offset Z" [ref=e397]: "-8.2"
              - group "Rotation (°)" [ref=e398]:
                - generic [ref=e399]: Rotation (°)
                - generic [ref=e400]:
                  - generic [ref=e401]:
                    - text: X
                    - spinbutton "Model rotate X" [ref=e402]: "180"
                  - generic [ref=e403]:
                    - text: "Y"
                    - spinbutton "Model rotate Y" [ref=e404]: "0"
                  - generic [ref=e405]:
                    - text: Z
                    - spinbutton "Model rotate Z" [ref=e406]: "90"
              - group "Scale" [ref=e407]:
                - generic [ref=e408]: Scale
                - generic [ref=e409]:
                  - generic [ref=e410]:
                    - text: X
                    - spinbutton "Model scale X" [ref=e411]: "1"
                  - generic [ref=e412]:
                    - text: "Y"
                    - spinbutton "Model scale Y" [ref=e413]: "1"
                  - generic [ref=e414]:
                    - text: Z
                    - spinbutton "Model scale Z" [ref=e415]: "1"
              - paragraph [ref=e416]: Origin (0, 0, 0) is marked by the axes. Drag the matching canvas controls to align the model.
              - group [ref=e417]:
                - generic "KiCad reference or public URL" [ref=e418] [cursor=pointer]
            - group [ref=e419]:
              - generic "Import project assets & help" [ref=e420] [cursor=pointer]
            - group [ref=e421]:
              - generic "Use a cached project model" [ref=e422] [cursor=pointer]
              - option "Choose…" [selected]
              - option "4857b3dc717675bf1fb22edda622ac3b3ae03cf44d81eefaf3fa3ba3a86d84c1/C_0603_1608Metric.step"
            - heading "Resolved and missing envelopes" [level=3] [ref=e423]
            - group [ref=e424]:
              - generic "component · 1 placements" [ref=e425] [cursor=pointer]
            - group [ref=e426]:
              - generic "display · 1 placements" [ref=e427] [cursor=pointer]
            - group [ref=e428]:
              - generic "key_rotated · 18 placements" [ref=e429] [cursor=pointer]
            - group [ref=e430]:
              - generic "key · 15 placements" [ref=e431] [cursor=pointer]
            - group [ref=e432]:
              - generic "controller · 1 placements" [ref=e433] [cursor=pointer]
              - paragraph [ref=e434]: mcu
              - generic [ref=e435]:
                - paragraph [ref=e436]: mcu · controller · needs dimensions · top · model associated
                - generic [ref=e437]:
                  - generic [ref=e438]: mcu width (mm)
                  - 'button "Help: mcu width (mm)" [ref=e440] [cursor=pointer]': "?"
                  - textbox "mcu width (mm)" [ref=e441]: "18"
                - generic [ref=e442]:
                  - generic [ref=e443]: mcu length (mm)
                  - 'button "Help: mcu length (mm)" [ref=e445] [cursor=pointer]': "?"
                  - textbox "mcu length (mm)" [ref=e446]: "33"
                - generic [ref=e447]:
                  - generic [ref=e448]: mcu bottom above PCB face (mm)
                  - 'button "Help: mcu bottom above PCB face (mm)" [ref=e450] [cursor=pointer]': "?"
                  - textbox "mcu bottom above PCB face (mm)" [ref=e451]
                - generic [ref=e452]:
                  - generic [ref=e453]: mcu top above PCB face (mm)
                  - 'button "Help: mcu top above PCB face (mm)" [ref=e455] [cursor=pointer]': "?"
                  - textbox "mcu top above PCB face (mm)" [ref=e456]
                - button "Attach model to mcu" [ref=e457] [cursor=pointer]
                - generic [ref=e458]:
                  - checkbox "Create a linked case opening" [ref=e459]
                  - text: Create a linked case opening
            - group [ref=e460]:
              - generic "power_switch · 1 placements" [ref=e461] [cursor=pointer]
            - group [ref=e462]:
              - generic "reset_button · 1 placements" [ref=e463] [cursor=pointer]
            - group [ref=e464]:
              - generic "scrollwheel · 1 placements" [ref=e465] [cursor=pointer]
          - paragraph [ref=e466]: Components belong to physical mounting layers. Enter measured body heights to validate clearance. Service envelopes cut shell openings.
          - button "Add component" [ref=e467] [cursor=pointer]
          - button "Add opening" [ref=e468] [cursor=pointer]
          - group "mcu" [ref=e469]:
            - generic [ref=e470]: mcu
            - generic [ref=e471]:
              - generic [ref=e472]: mcu mounting layer
              - 'button "Help: mcu mounting layer" [ref=e474] [cursor=pointer]': "?"
              - combobox "mcu mounting layer" [ref=e475]:
                - option "world"
                - option "electronics" [selected]
                - option "display_support"
                - option "floor"
            - generic [ref=e476]:
              - paragraph [ref=e477]: Measured body
              - generic [ref=e478]:
                - generic [ref=e479]: mcu body width (mm)
                - 'button "Help: mcu body width (mm)" [ref=e481] [cursor=pointer]': "?"
                - textbox "mcu body width (mm)" [ref=e482]: "18"
              - generic [ref=e483]:
                - generic [ref=e484]: mcu body length (mm)
                - 'button "Help: mcu body length (mm)" [ref=e486] [cursor=pointer]': "?"
                - textbox "mcu body length (mm)" [ref=e487]: "33"
              - generic [ref=e488]:
                - generic [ref=e489]: mcu body bottom (mm)
                - 'button "Help: mcu body bottom (mm)" [ref=e491] [cursor=pointer]': "?"
                - textbox "mcu body bottom (mm)" [ref=e492]: "0"
              - generic [ref=e493]:
                - generic [ref=e494]: mcu body top (mm)
                - 'button "Help: mcu body top (mm)" [ref=e496] [cursor=pointer]': "?"
                - textbox "mcu body top (mm)" [ref=e497]
            - text: Move this object in Layout. YAML contains its placement and stacking relationships.
          - group "display" [ref=e498]:
            - generic [ref=e499]: display
            - generic [ref=e500]:
              - generic [ref=e501]: display mounting layer
              - 'button "Help: display mounting layer" [ref=e503] [cursor=pointer]': "?"
              - combobox "display mounting layer" [ref=e504]:
                - option "world"
                - option "electronics"
                - option "display_support" [selected]
                - option "floor"
            - generic [ref=e505]:
              - paragraph [ref=e506]: Measured body
              - generic [ref=e507]:
                - generic [ref=e508]: display body width (mm)
                - 'button "Help: display body width (mm)" [ref=e510] [cursor=pointer]': "?"
                - textbox "display body width (mm)" [ref=e511]: "14"
              - generic [ref=e512]:
                - generic [ref=e513]: display body length (mm)
                - 'button "Help: display body length (mm)" [ref=e515] [cursor=pointer]': "?"
                - textbox "display body length (mm)" [ref=e516]: "36"
              - generic [ref=e517]:
                - generic [ref=e518]: display body bottom (mm)
                - 'button "Help: display body bottom (mm)" [ref=e520] [cursor=pointer]': "?"
                - textbox "display body bottom (mm)" [ref=e521]: "0"
              - generic [ref=e522]:
                - generic [ref=e523]: display body top (mm)
                - 'button "Help: display body top (mm)" [ref=e525] [cursor=pointer]': "?"
                - textbox "display body top (mm)" [ref=e526]: "2.9"
            - text: Move this object in Layout. YAML contains its placement and stacking relationships.
          - group "scrollwheel" [ref=e527]:
            - generic [ref=e528]: scrollwheel
            - generic [ref=e529]:
              - generic [ref=e530]: scrollwheel mounting layer
              - 'button "Help: scrollwheel mounting layer" [ref=e532] [cursor=pointer]': "?"
              - combobox "scrollwheel mounting layer" [ref=e533]:
                - option "world"
                - option "electronics" [selected]
                - option "display_support"
                - option "floor"
            - text: Move this object in Layout. YAML contains its placement and stacking relationships.
          - group "board_zone_gnd" [ref=e534]:
            - generic [ref=e535]: board_zone_gnd
            - generic [ref=e536]:
              - generic [ref=e537]: board_zone_gnd mounting layer
              - 'button "Help: board_zone_gnd mounting layer" [ref=e539] [cursor=pointer]': "?"
              - combobox "board_zone_gnd mounting layer" [ref=e540]:
                - option "world"
                - option "electronics" [selected]
                - option "display_support"
                - option "floor"
            - text: Move this object in Layout. YAML contains its placement and stacking relationships.
          - group "power_switch" [ref=e541]:
            - generic [ref=e542]: power_switch
            - generic [ref=e543]:
              - generic [ref=e544]: power_switch mounting layer
              - 'button "Help: power_switch mounting layer" [ref=e546] [cursor=pointer]': "?"
              - combobox "power_switch mounting layer" [ref=e547]:
                - option "world"
                - option "electronics" [selected]
                - option "display_support"
                - option "floor"
            - text: Move this object in Layout. YAML contains its placement and stacking relationships.
          - group "reset_button" [ref=e548]:
            - generic [ref=e549]: reset_button
            - generic [ref=e550]:
              - generic [ref=e551]: reset_button mounting layer
              - 'button "Help: reset_button mounting layer" [ref=e553] [cursor=pointer]': "?"
              - combobox "reset_button mounting layer" [ref=e554]:
                - option "world"
                - option "electronics" [selected]
                - option "display_support"
                - option "floor"
            - text: Move this object in Layout. YAML contains its placement and stacking relationships.
        - generic [ref=e555]:
          - generic [ref=e556]:
            - button "plan" [ref=e557] [cursor=pointer]: 2D
            - button "assembled" [ref=e558] [cursor=pointer]
            - button "exploded" [pressed] [ref=e559] [cursor=pointer]
            - button "section" [ref=e560] [cursor=pointer]
            - button "part" [ref=e561] [cursor=pointer]
            - generic [ref=e562]: bhk · bottom
          - generic [ref=e563]:
            - generic "3D assembly preview" [ref=e564]
            - region "Model alignment inset" [ref=e568]:
              - generic [ref=e569]:
                - strong [ref=e570]: mcu · model alignment
                - button "Inset translate" [pressed] [ref=e571] [cursor=pointer]: Move
                - button "Inset rotate" [ref=e572] [cursor=pointer]: rotate
                - button "Inset scale" [ref=e573] [cursor=pointer]: scale
              - generic "Footprint preview" [ref=e574]:
                - status [ref=e575]: Board tracks and vias are omitted when inspecting one of several footprints; their ownership is ambiguous.
          - generic [ref=e579]:
            - button "bottom" [ref=e580] [cursor=pointer]
            - button "top" [ref=e581] [cursor=pointer]
            - button "plate" [ref=e582] [cursor=pointer]
            - combobox "Inspect part" [ref=e583]:
              - option "Choose part or reference" [selected]
              - option "bottom"
              - option "top"
              - option "plate"
              - option "pcb"
              - option "components_native_matrix_c5_r4"
              - option "components_native_matrix_c1_r4"
              - option "components_native_matrix_c1_r3"
              - option "components_native_matrix_c1_r2"
              - option "components_native_matrix_c1_r1"
              - option "components_native_matrix_c2_r4"
              - option "components_native_matrix_c2_r3"
              - option "components_native_matrix_c2_r2"
              - option "components_native_matrix_c2_r1"
              - option "components_native_matrix_c3_r5"
              - option "components_native_matrix_c3_r4"
              - option "components_native_matrix_c3_r3"
              - option "components_native_matrix_c3_r2"
              - option "components_native_matrix_c3_r1"
              - option "components_native_matrix_c4_r5"
              - option "components_native_matrix_c4_r4"
              - option "components_native_matrix_c4_r3"
              - option "components_native_matrix_c4_r2"
              - option "components_native_matrix_c4_r1"
              - option "components_native_matrix_c5_r3"
              - option "components_native_matrix_c5_r2"
              - option "components_native_matrix_c5_r1"
              - option "components_native_matrix_c6_r4"
              - option "components_native_matrix_c6_r3"
              - option "components_native_matrix_c6_r2"
              - option "components_native_matrix_c6_r1"
              - option "components_native_matrix_c7_r2"
              - option "components_native_matrix_c7_r1"
              - option "components_native_thumbfan_c1_r2"
              - option "components_native_thumbfan_c2_r2"
              - option "components_native_thumbfan_c2_r1"
              - option "components_native_thumbfan_c3_r2"
              - option "components_native_thumbfan_c3_r1"
              - option "components_native_display"
          - paragraph [ref=e584]: "Selected feature: board.components.mcu"
      - generic [ref=e585]:
        - status [ref=e586]: Current geometry · 39 components · PCB 1.6 mm
        - button "Review 0 blockers · 8 checks" [ref=e587] [cursor=pointer]
```

# Test source

```ts
  223 |       reopened.getByRole('status').filter({ hasText: /Current geometry/ })
  224 |     ).toBeVisible({ timeout: 90000 });
  225 |     await openLibrary(offlinePage);
  226 |     await studio(offlinePage)
  227 |       .getByRole('button', {
  228 |         name: `${manifest.entries[0].name} Custom · revision 1`,
  229 |         exact: true,
  230 |       })
  231 |       .click();
  232 |     await expect(
  233 |       studio(offlinePage).getByRole('spinbutton', {
  234 |         name: 'Model offset Z',
  235 |         exact: true,
  236 |       })
  237 |     ).toHaveValue('1');
  238 |   } finally {
  239 |     await offlineContext.close();
  240 |   }
  241 |   expect(errors).toEqual([]);
  242 | });
  243 | 
  244 | test('assigns a model to a native BHK controller and exports the object binding', async ({
  245 |   page,
  246 | }) => {
  247 |   const config = parseDocument(BHK.value);
  248 | 
  249 |   await page.setViewportSize({ width: 1487, height: 1058 });
  250 |   await page.addInitScript(
  251 |     ({ source, key }) => localStorage.setItem(key, JSON.stringify(source)),
  252 |     { source: config.toString(), key: CONFIG_LOCAL_STORAGE_KEY }
  253 |   );
  254 |   await page.goto('./');
  255 |   await expect(studio(page)).toBeVisible();
  256 |   await openCase(page);
  257 |   const dialog = page.getByRole('region', { name: 'Case designer' });
  258 |   await dialog
  259 |     .getByRole('treeitem', { name: 'controller (1)', exact: true })
  260 |     .click();
  261 |   await dialog
  262 |     .getByLabel('Component footprint', { exact: true })
  263 |     .selectOption('mcu');
  264 |   await dialog
  265 |     .getByLabel('Upload 3D models')
  266 |     .setInputFiles(`${fixture}${footprintName}.step`);
  267 |   await expect(dialog.getByLabel('Active model')).toContainText(footprintName, {
  268 |     timeout: 90000,
  269 |   });
  270 |   await expect(
  271 |     dialog.getByRole('button', { name: 'Replace', exact: true })
  272 |   ).toBeEnabled();
  273 |   await dialog
  274 |     .getByRole('button', { name: 'Manufacturing', exact: true })
  275 |     .click();
  276 |   for (const part of ['bottom', 'top', 'plate']) {
  277 |     await dialog
  278 |       .getByLabel(`${part} process`, { exact: true })
  279 |       .selectOption('fdm');
  280 |   }
  281 |   await dialog
  282 |     .getByRole('treeitem', { name: 'controller (1)', exact: true })
  283 |     .click();
  284 |   await page
  285 |     .getByRole('button', { name: 'Generate project', exact: true })
  286 |     .click();
  287 |   await expect(
  288 |     dialog.getByRole('status').filter({ hasText: /Current geometry/ })
  289 |   ).toBeVisible({ timeout: 90000 });
  290 |   await dialog.getByRole('button', { name: 'exploded', exact: true }).click();
  291 |   await expect(dialog.getByLabel('3D assembly preview')).toHaveAttribute(
  292 |     'data-rendered',
  293 |     'true'
  294 |   );
  295 |   await expect(dialog.getByLabel('Model alignment inset')).toBeVisible();
  296 |   await expect(dialog.getByLabel('Model alignment inset')).not.toContainText(
  297 |     'Error:'
  298 |   );
  299 |   await expect(
  300 |     dialog.getByText(/mcu · controller ·.*model associated/)
  301 |   ).toBeVisible({ timeout: 30000 });
  302 |   const beforeSource = await readSource(page);
  303 |   const beforeDrag = parse(beforeSource).layout.objects.mcu.models;
  304 |   await dialog.getByLabel('Active model').selectOption('0');
  305 |   const inset = dialog.getByLabel('Model alignment inset');
  306 |   await inset.screenshot({ path: 'test-results/inset-before-drag.png' });
  307 |   const bounds = await inset.boundingBox();
  308 |   expect(bounds).not.toBeNull();
  309 |   // The fixed BHK view places the model's blue Z handle at its upper-right corner.
  310 |   const handle = {
  311 |     x: bounds!.x + bounds!.width * 0.6,
  312 |     y: bounds!.y + bounds!.height * 0.62,
  313 |   };
  314 |   await page.mouse.move(handle.x, handle.y);
  315 |   await inset.screenshot({ path: 'test-results/inset-hover.png' });
  316 |   await page.mouse.click(handle.x, handle.y);
  317 |   await inset.screenshot({ path: 'test-results/inset-click.png' });
  318 |   expect(await readSource(page)).toBe(beforeSource);
  319 |   await page.mouse.down();
  320 |   await page.mouse.move(handle.x, handle.y - 14, { steps: 8 });
  321 |   await page.mouse.up();
  322 |   await inset.screenshot({ path: 'test-results/inset-after-drag.png' });
> 323 |   await expect
      |   ^ Error: expect(received).not.toEqual(expected) // deep equality
  324 |     .poll(
  325 |       async () =>
  326 |         parse(await readSource(page)).layout.objects.mcu.models[0].offset
  327 |     )
  328 |     .not.toEqual(beforeDrag[0].offset);
  329 |   const afterDrag = parse(await readSource(page)).layout.objects.mcu.models;
  330 |   // All pointer steps must contribute to the drag, not just its first frame.
  331 |   expect(
  332 |     Math.abs(afterDrag[0].offset[2] - beforeDrag[0].offset[2])
  333 |   ).toBeGreaterThan(3);
  334 |   expect(afterDrag[0].frame).toEqual(beforeDrag[0].frame);
  335 |   expect(afterDrag[0].path).toEqual(beforeDrag[0].path);
  336 |   expect(afterDrag[0].asset).toEqual(beforeDrag[0].asset);
  337 |   expect(afterDrag[1]).toEqual(beforeDrag[1]);
  338 |   await page
  339 |     .getByRole('button', { name: 'Undo project edit', exact: true })
  340 |     .click();
  341 |   await expect
  342 |     .poll(async () => parse(await readSource(page)).layout.objects.mcu.models)
  343 |     .toEqual(beforeDrag);
  344 |   await page
  345 |     .getByRole('button', { name: 'Generate project', exact: true })
  346 |     .click();
  347 |   await expect(
  348 |     dialog.getByRole('status').filter({ hasText: /Current geometry/ })
  349 |   ).toBeVisible({ timeout: 90000 });
  350 |   await page.setViewportSize({ width: 1487, height: 1058 });
  351 |   await page.mouse.move(0, 0);
  352 |   await page.screenshot({ path: 'test-results/cad-bhk-desktop.png' });
  353 |   await page.setViewportSize({ width: 390, height: 844 });
  354 |   await dialog
  355 |     .getByRole('button', { name: 'Close inspector', exact: true })
  356 |     .click();
  357 |   await page.mouse.move(0, 0);
  358 |   await page.screenshot({ path: 'test-results/cad-bhk-narrow.png' });
  359 |   await page.setViewportSize({ width: 1487, height: 1058 });
  360 |   await dialog.getByRole('button', { name: 'Review', exact: true }).click();
  361 |   const exportView = await openExport(page);
  362 |   await exportView
  363 |     .getByRole('checkbox', { name: /I reviewed dimensions/ })
  364 |     .check();
  365 |   const download = page.waitForEvent('download');
  366 |   await exportView
  367 |     .getByRole('button', { name: 'Download case ZIP', exact: true })
  368 |     .click();
  369 |   await (await download).saveAs('test-results/cad-bhk-project.zip');
  370 |   const zip = await JSZip.loadAsync(
  371 |     readFileSync('test-results/cad-bhk-project.zip')
  372 |   );
  373 |   const source = parse(await zip.file('config.yaml')!.async('string'));
  374 |   expect(
  375 |     Object.values(source.layout.objects).filter(
  376 |       (item) => (item as { models?: unknown }).models
  377 |     )
  378 |   ).toHaveLength(1);
  379 |   expect(zip.file('outputs/pcbs/bhk_pcb.kicad_pcb')).not.toBeNull();
  380 | });
  381 | 
```