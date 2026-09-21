# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-performance.spec.ts >> measures real keyboard editing response and source correctness
- Location: e2e/studio-performance.spec.ts:24:5

# Error details

```
Test timeout of 600000ms exceeded.
```

```
Error: page.evaluate: Target page, context or browser has been closed
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
      - button "Generate project" [disabled] [ref=e86]:
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
        - button "Inspector" [expanded] [ref=e136] [cursor=pointer]:
          - img [ref=e137]
          - text: Inspector
        - button "Part library" [ref=e138] [cursor=pointer]:
          - img [ref=e139]
          - text: Part library
    - generic [ref=e144]:
      - complementary "Design inspector" [ref=e145]:
        - generic [ref=e146]:
          - group [ref=e147]:
            - generic "Objects" [ref=e148] [cursor=pointer]
            - button "Add" [ref=e150] [cursor=pointer]:
              - img [ref=e151]
              - text: Add
            - group [ref=e152]:
              - generic "Layout defaults" [ref=e153] [cursor=pointer]
              - option "Custom"
              - option "MX 1u" [selected]
              - option "MX 1.25u"
              - option "MX 1.5u"
              - option "MX 1.75u"
              - option "MX 2u"
              - option "MX 2.25u"
              - option "MX 2.75u"
              - option "MX 6.25u"
              - option "MX 7u"
              - option "MX 1.25u · tall"
              - option "MX 1.5u · tall"
              - option "MX 2u · tall"
            - tree "Layout clusters" [ref=e154]:
              - treeitem "fingers 60 keys" [expanded] [ref=e155]:
                - generic [ref=e156]:
                  - button "Collapse fingers 60 keys" [ref=e157] [cursor=pointer]:
                    - img [ref=e158]
                  - button "fingers 60 keys" [ref=e160] [cursor=pointer]:
                    - generic [ref=e161]: fingers 60 keys
                - group [ref=e162]:
                  - treeitem "Column 1 · c1" [ref=e163]:
                    - generic [ref=e164]:
                      - button "Expand Column 1 · c1" [ref=e165] [cursor=pointer]:
                        - img [ref=e166]
                      - button "Column 1 · c1" [ref=e168] [cursor=pointer]:
                        - generic [ref=e169]: c1
                  - treeitem "Column 2 · c2" [selected] [ref=e170]:
                    - generic [ref=e171]:
                      - button "Expand Column 2 · c2" [ref=e172] [cursor=pointer]:
                        - img [ref=e173]
                      - button "Column 2 · c2" [pressed] [ref=e175] [cursor=pointer]:
                        - generic [ref=e176]: c2
                  - treeitem "Column 3 · c3" [ref=e177]:
                    - generic [ref=e178]:
                      - button "Expand Column 3 · c3" [ref=e179] [cursor=pointer]:
                        - img [ref=e180]
                      - button "Column 3 · c3" [ref=e182] [cursor=pointer]:
                        - generic [ref=e183]: c3
                  - treeitem "Column 4 · c4" [ref=e184]:
                    - generic [ref=e185]:
                      - button "Expand Column 4 · c4" [ref=e186] [cursor=pointer]:
                        - img [ref=e187]
                      - button "Column 4 · c4" [ref=e189] [cursor=pointer]:
                        - generic [ref=e190]: c4
                  - treeitem "Column 5 · c5" [ref=e191]:
                    - generic [ref=e192]:
                      - button "Expand Column 5 · c5" [ref=e193] [cursor=pointer]:
                        - img [ref=e194]
                      - button "Column 5 · c5" [ref=e196] [cursor=pointer]:
                        - generic [ref=e197]: c5
                  - treeitem "Column 6 · c6" [ref=e198]:
                    - generic [ref=e199]:
                      - button "Expand Column 6 · c6" [ref=e200] [cursor=pointer]:
                        - img [ref=e201]
                      - button "Column 6 · c6" [ref=e203] [cursor=pointer]:
                        - generic [ref=e204]: c6
                  - treeitem "Column 7 · c7" [ref=e205]:
                    - generic [ref=e206]:
                      - button "Expand Column 7 · c7" [ref=e207] [cursor=pointer]:
                        - img [ref=e208]
                      - button "Column 7 · c7" [ref=e210] [cursor=pointer]:
                        - generic [ref=e211]: c7
                  - treeitem "Column 8 · c8" [ref=e212]:
                    - generic [ref=e213]:
                      - button "Expand Column 8 · c8" [ref=e214] [cursor=pointer]:
                        - img [ref=e215]
                      - button "Column 8 · c8" [ref=e217] [cursor=pointer]:
                        - generic [ref=e218]: c8
                  - treeitem "Column 9 · c9" [ref=e219]:
                    - generic [ref=e220]:
                      - button "Expand Column 9 · c9" [ref=e221] [cursor=pointer]:
                        - img [ref=e222]
                      - button "Column 9 · c9" [ref=e224] [cursor=pointer]:
                        - generic [ref=e225]: c9
                  - treeitem "Column 10 · c10" [expanded] [ref=e226]:
                    - generic [ref=e227]:
                      - button "Collapse Column 10 · c10" [ref=e228] [cursor=pointer]:
                        - img [ref=e229]
                      - button "Column 10 · c10" [ref=e231] [cursor=pointer]:
                        - generic [ref=e232]: c10
                    - group [ref=e233]:
                      - treeitem "fingers_c10_r1" [ref=e234]:
                        - generic [ref=e235]:
                          - button "Expand fingers_c10_r1" [ref=e236] [cursor=pointer]:
                            - img [ref=e237]
                          - button "fingers_c10_r1" [ref=e239] [cursor=pointer]:
                            - generic [ref=e240]: r1
                      - treeitem "fingers_c10_r2" [ref=e241]:
                        - generic [ref=e242]:
                          - button "Expand fingers_c10_r2" [ref=e243] [cursor=pointer]:
                            - img [ref=e244]
                          - button "fingers_c10_r2" [ref=e246] [cursor=pointer]:
                            - generic [ref=e247]: r2
                      - treeitem "fingers_c10_r3" [ref=e248]:
                        - generic [ref=e249]:
                          - button "Expand fingers_c10_r3" [ref=e250] [cursor=pointer]:
                            - img [ref=e251]
                          - button "fingers_c10_r3" [ref=e253] [cursor=pointer]:
                            - generic [ref=e254]: r3
                      - treeitem "fingers_c10_r4" [ref=e255]:
                        - generic [ref=e256]:
                          - button "Expand fingers_c10_r4" [ref=e257] [cursor=pointer]:
                            - img [ref=e258]
                          - button "fingers_c10_r4" [ref=e260] [cursor=pointer]:
                            - generic [ref=e261]: r4
                      - treeitem "fingers_c10_r5" [ref=e262]:
                        - generic [ref=e263]:
                          - button "Expand fingers_c10_r5" [ref=e264] [cursor=pointer]:
                            - img [ref=e265]
                          - button "fingers_c10_r5" [ref=e267] [cursor=pointer]:
                            - generic [ref=e268]: r5
                      - treeitem "fingers_c10_r6" [ref=e269]:
                        - generic [ref=e270]:
                          - button "Expand fingers_c10_r6" [ref=e271] [cursor=pointer]:
                            - img [ref=e272]
                          - button "fingers_c10_r6" [ref=e274] [cursor=pointer]:
                            - generic [ref=e275]: r6
                  - treeitem "Row 1 · r1" [expanded] [ref=e276]:
                    - generic [ref=e277]:
                      - button "Collapse Row 1 · r1" [ref=e278] [cursor=pointer]:
                        - img [ref=e279]
                      - button "Row 1 · r1" [ref=e281] [cursor=pointer]:
                        - generic [ref=e282]: r1
                    - group
                  - treeitem "Row 2 · r2" [ref=e283]:
                    - generic [ref=e284]:
                      - button "Expand Row 2 · r2" [ref=e285] [cursor=pointer]:
                        - img [ref=e286]
                      - button "Row 2 · r2" [ref=e288] [cursor=pointer]:
                        - generic [ref=e289]: r2
                  - treeitem "Row 3 · r3" [ref=e290]:
                    - generic [ref=e291]:
                      - button "Expand Row 3 · r3" [ref=e292] [cursor=pointer]:
                        - img [ref=e293]
                      - button "Row 3 · r3" [ref=e295] [cursor=pointer]:
                        - generic [ref=e296]: r3
                  - treeitem "Row 4 · r4" [ref=e297]:
                    - generic [ref=e298]:
                      - button "Expand Row 4 · r4" [ref=e299] [cursor=pointer]:
                        - img [ref=e300]
                      - button "Row 4 · r4" [ref=e302] [cursor=pointer]:
                        - generic [ref=e303]: r4
                  - treeitem "Row 5 · r5" [ref=e304]:
                    - generic [ref=e305]:
                      - button "Expand Row 5 · r5" [ref=e306] [cursor=pointer]:
                        - img [ref=e307]
                      - button "Row 5 · r5" [ref=e309] [cursor=pointer]:
                        - generic [ref=e310]: r5
                  - treeitem "Row 6 · r6" [ref=e311]:
                    - generic [ref=e312]:
                      - button "Expand Row 6 · r6" [ref=e313] [cursor=pointer]:
                        - img [ref=e314]
                      - button "Row 6 · r6" [ref=e316] [cursor=pointer]:
                        - generic [ref=e317]: r6
            - group [ref=e318]:
              - generic "Components and free objects" [ref=e319] [cursor=pointer]
          - group [ref=e320]:
            - generic "Design" [ref=e321] [cursor=pointer]
            - button "Parameters" [ref=e322] [cursor=pointer]:
              - img [ref=e323]
              - text: Parameters
            - button "Constraints" [ref=e328] [cursor=pointer]:
              - img [ref=e329]
              - text: Constraints
            - group [ref=e333]:
              - generic "Mounting layers" [ref=e334] [cursor=pointer]
            - button "main Outline" [ref=e335] [cursor=pointer]:
              - text: main
              - generic [ref=e336]: Outline
            - button "Rebuild board outline" [ref=e337] [cursor=pointer]
            - button "Sketches" [ref=e339] [cursor=pointer]
        - group [ref=e341]:
          - generic "Selection" [ref=e342] [cursor=pointer]
          - heading "Column 2" [level=2] [ref=e343]
          - paragraph [ref=e344]: fingers · c2. Changes affect every key in this column.
          - generic [ref=e345]:
            - generic [ref=e346]: Column stagger
            - generic [ref=e347]:
              - generic [ref=e348]:
                - button "Decrease Column stagger" [ref=e349] [cursor=pointer]:
                  - img [ref=e350]
                - textbox "Column stagger" [ref=e351]: "0"
                - button "Increase Column stagger" [ref=e352] [cursor=pointer]:
                  - img [ref=e353]
              - text: = 0 mm
          - generic "Stagger presets" [ref=e354]:
            - button "0 u" [ref=e355] [cursor=pointer]
            - button "0.25 u" [ref=e356] [cursor=pointer]
            - button "0.5 u" [ref=e357] [cursor=pointer]
            - button "1 u" [ref=e358] [cursor=pointer]
          - generic [ref=e359]:
            - generic [ref=e360]: Column splay
            - generic [ref=e361]:
              - textbox "Column splay" [ref=e363]: "0"
              - text: = 0 °
          - group [ref=e364]:
            - generic "Additional offsets" [ref=e365] [cursor=pointer]
          - paragraph [ref=e366]: Splay rotates the column about its first row. Individual key edits stay relative to the column.
          - group [ref=e367]:
            - generic "Column keys" [ref=e368] [cursor=pointer]
            - list "Column keys" [ref=e369]:
              - listitem [ref=e370]:
                - button "Row 1 fingers_c2_r1" [ref=e371] [cursor=pointer]:
                  - generic [ref=e372]: Row 1
                  - generic [ref=e373]: fingers_c2_r1
                - button "Remove fingers_c2_r1" [ref=e374] [cursor=pointer]:
                  - img [ref=e375]
              - listitem [ref=e378]:
                - button "Row 2 fingers_c2_r2" [active] [ref=e379] [cursor=pointer]:
                  - generic [ref=e380]: Row 2
                  - generic [ref=e381]: fingers_c2_r2
                - button "Remove fingers_c2_r2" [ref=e382] [cursor=pointer]:
                  - img [ref=e383]
              - listitem [ref=e386]:
                - button "Row 3 fingers_c2_r3" [ref=e387] [cursor=pointer]:
                  - generic [ref=e388]: Row 3
                  - generic [ref=e389]: fingers_c2_r3
                - button "Remove fingers_c2_r3" [ref=e390] [cursor=pointer]:
                  - img [ref=e391]
              - listitem [ref=e394]:
                - button "Row 4 fingers_c2_r4" [ref=e395] [cursor=pointer]:
                  - generic [ref=e396]: Row 4
                  - generic [ref=e397]: fingers_c2_r4
                - button "Remove fingers_c2_r4" [ref=e398] [cursor=pointer]:
                  - img [ref=e399]
              - listitem [ref=e402]:
                - button "Row 5 fingers_c2_r5" [ref=e403] [cursor=pointer]:
                  - generic [ref=e404]: Row 5
                  - generic [ref=e405]: fingers_c2_r5
                - button "Remove fingers_c2_r5" [ref=e406] [cursor=pointer]:
                  - img [ref=e407]
              - listitem [ref=e410]:
                - button "Row 6 fingers_c2_r6" [ref=e411] [cursor=pointer]:
                  - generic [ref=e412]: Row 6
                  - generic [ref=e413]: fingers_c2_r6
                - button "Remove fingers_c2_r6" [ref=e414] [cursor=pointer]:
                  - img [ref=e415]
          - group [ref=e418]:
            - generic "Matrix actions" [ref=e419] [cursor=pointer]
          - group "Selection adjustments" [ref=e420]:
            - generic [ref=e421]: Selection adjustments
            - generic [ref=e422]:
              - generic [ref=e423]: Key size
              - combobox "Selection key size" [ref=e424]:
                - option "Custom / mixed"
                - option "MX 1u" [selected]
                - option "MX 1.25u"
                - option "MX 1.5u"
                - option "MX 1.75u"
                - option "MX 2u"
                - option "MX 2.25u"
                - option "MX 2.75u"
                - option "MX 6.25u"
                - option "MX 7u"
                - option "MX 1.25u · tall"
                - option "MX 1.5u · tall"
                - option "MX 2u · tall"
            - generic [ref=e425]:
              - generic [ref=e426]: Align X
              - combobox "Horizontal alignment" [ref=e427]:
                - option "Auto (make room)" [selected]
                - option "Left"
                - option "Centre"
                - option "Right"
            - generic [ref=e428]:
              - generic [ref=e429]: Align Y
              - combobox "Vertical alignment" [ref=e430]:
                - option "Top" [selected]
                - option "Centre"
                - option "Bottom"
            - group [ref=e431]:
              - generic "Relative adjustments" [ref=e432] [cursor=pointer]
      - main [ref=e433]:
        - generic "Outline controls" [ref=e434]:
          - generic [ref=e435]:
            - checkbox "Automatic outline" [checked] [ref=e436]
            - text: Automatic outline
          - status [ref=e437]: Updating outline…
        - status [ref=e438]: Updating layout…
        - generic [ref=e439]:
          - toolbar "Canvas tools" [ref=e440]:
            - generic [ref=e441]:
              - button "Select Objects" [ref=e442] [cursor=pointer]:
                - img [ref=e443]
              - button "Select Columns" [pressed] [ref=e445] [cursor=pointer]:
                - img [ref=e446]
              - button "Select Rows" [ref=e448] [cursor=pointer]:
                - img [ref=e449]
              - button "Select Matrices" [ref=e451] [cursor=pointer]:
                - img [ref=e452]
              - button "Pan" [ref=e454] [cursor=pointer]:
                - img [ref=e455]
            - toolbar "Snapping" [ref=e460]:
              - button "Snapping" [pressed] [ref=e461] [cursor=pointer]:
                - img [ref=e462]
              - button "Snapping settings" [ref=e466] [cursor=pointer]:
                - img [ref=e467]
              - region [ref=e469]:
                - generic [ref=e470]:
                  - strong [ref=e471]: Snapping
                  - button [ref=e472] [cursor=pointer]:
                    - img [ref=e473]
                - group [ref=e476]:
                  - button [ref=e477] [cursor=pointer]: 1u
                  - button [ref=e478] [cursor=pointer]: ½u
                  - button [ref=e479] [cursor=pointer]: ¼u
                  - button [ref=e480] [cursor=pointer]: ⅛u
                - generic [ref=e481]:
                  - generic [ref=e482]:
                    - checkbox [checked] [ref=e483]
                    - text: Grid
                  - generic [ref=e484]:
                    - checkbox [checked] [ref=e485]
                    - text: Centers
                  - generic [ref=e486]:
                    - checkbox [ref=e487]
                    - text: Origins
                  - generic [ref=e488]:
                    - checkbox [checked] [ref=e489]
                    - text: Edges
                - generic [ref=e490]:
                  - text: Increment · mm
                  - spinbutton [ref=e491]: "1"
                - generic [ref=e492]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e493]: "2"
                - group [ref=e494]:
                  - generic [ref=e495] [cursor=pointer]: Alt bypasses snapping · Help
          - toolbar "View controls" [ref=e496]:
            - button "Side" [ref=e497] [cursor=pointer]
            - button "Fit layout" [ref=e498] [cursor=pointer]:
              - img [ref=e499]
            - button "Zoom out" [ref=e504] [cursor=pointer]:
              - img [ref=e505]
            - generic [ref=e506]: 100%
            - button "Zoom in" [ref=e507] [cursor=pointer]:
              - img [ref=e508]
          - group "Interactive board layout" [ref=e509]:
            - button "Select fingers_c1_r1" [ref=e511]
            - button "Select fingers_c1_r1_diode" [ref=e513]
            - button "Select fingers_c1_r1_led" [ref=e515]
            - button "Select fingers_c1_r2" [ref=e517]
            - button "Select fingers_c1_r2_diode" [ref=e519]
            - button "Select fingers_c1_r2_led" [ref=e521]
            - button "Select fingers_c1_r3" [ref=e523]
            - button "Select fingers_c1_r3_diode" [ref=e525]
            - button "Select fingers_c1_r3_led" [ref=e527]
            - button "Select fingers_c1_r4" [ref=e529]
            - button "Select fingers_c1_r4_diode" [ref=e531]
            - button "Select fingers_c1_r4_led" [ref=e533]
            - button "Select fingers_c1_r5" [ref=e535]
            - button "Select fingers_c1_r5_diode" [ref=e537]
            - button "Select fingers_c1_r5_led" [ref=e539]
            - button "Select fingers_c1_r6" [ref=e541]
            - button "Select fingers_c1_r6_diode" [ref=e543]
            - button "Select fingers_c1_r6_led" [ref=e545]
            - button "Select fingers_c2_r1" [pressed] [ref=e547]
            - button "Select fingers_c2_r1_diode" [pressed] [ref=e550]
            - button "Select fingers_c2_r1_led" [pressed] [ref=e553]
            - button "Select fingers_c2_r3" [pressed] [ref=e556]
            - button "Select fingers_c2_r3_diode" [pressed] [ref=e559]
            - button "Select fingers_c2_r3_led" [pressed] [ref=e562]
            - button "Select fingers_c2_r4" [pressed] [ref=e565]
            - button "Select fingers_c2_r4_diode" [pressed] [ref=e568]
            - button "Select fingers_c2_r4_led" [pressed] [ref=e571]
            - button "Select fingers_c2_r5" [pressed] [ref=e574]
            - button "Select fingers_c2_r5_diode" [pressed] [ref=e577]
            - button "Select fingers_c2_r5_led" [pressed] [ref=e580]
            - button "Select fingers_c2_r6" [pressed] [ref=e583]
            - button "Select fingers_c2_r6_diode" [pressed] [ref=e586]
            - button "Select fingers_c2_r6_led" [pressed] [ref=e589]
            - button "Select fingers_c3_r1" [ref=e592]
            - button "Select fingers_c3_r1_diode" [ref=e594]
            - button "Select fingers_c3_r1_led" [ref=e596]
            - button "Select fingers_c3_r2" [ref=e598]
            - button "Select fingers_c3_r2_diode" [ref=e600]
            - button "Select fingers_c3_r2_led" [ref=e602]
            - button "Select fingers_c3_r3" [ref=e604]
            - button "Select fingers_c3_r3_diode" [ref=e606]
            - button "Select fingers_c3_r3_led" [ref=e608]
            - button "Select fingers_c3_r4" [ref=e610]
            - button "Select fingers_c3_r4_diode" [ref=e612]
            - button "Select fingers_c3_r4_led" [ref=e614]
            - button "Select fingers_c3_r5" [ref=e616]
            - button "Select fingers_c3_r5_diode" [ref=e618]
            - button "Select fingers_c3_r5_led" [ref=e620]
            - button "Select fingers_c3_r6" [ref=e622]
            - button "Select fingers_c3_r6_diode" [ref=e624]
            - button "Select fingers_c3_r6_led" [ref=e626]
            - button "Select fingers_c4_r1" [ref=e628]
            - button "Select fingers_c4_r1_diode" [ref=e630]
            - button "Select fingers_c4_r1_led" [ref=e632]
            - button "Select fingers_c4_r2" [ref=e634]
            - button "Select fingers_c4_r2_diode" [ref=e636]
            - button "Select fingers_c4_r2_led" [ref=e638]
            - button "Select fingers_c4_r3" [ref=e640]
            - button "Select fingers_c4_r3_diode" [ref=e642]
            - button "Select fingers_c4_r3_led" [ref=e644]
            - button "Select fingers_c4_r4" [ref=e646]
            - button "Select fingers_c4_r4_diode" [ref=e648]
            - button "Select fingers_c4_r4_led" [ref=e650]
            - button "Select fingers_c4_r5" [ref=e652]
            - button "Select fingers_c4_r5_diode" [ref=e654]
            - button "Select fingers_c4_r5_led" [ref=e656]
            - button "Select fingers_c4_r6" [ref=e658]
            - button "Select fingers_c4_r6_diode" [ref=e660]
            - button "Select fingers_c4_r6_led" [ref=e662]
            - button "Select fingers_c5_r1" [ref=e664]
            - button "Select fingers_c5_r1_diode" [ref=e666]
            - button "Select fingers_c5_r1_led" [ref=e668]
            - button "Select fingers_c5_r2" [ref=e670]
            - button "Select fingers_c5_r2_diode" [ref=e672]
            - button "Select fingers_c5_r2_led" [ref=e674]
            - button "Select fingers_c5_r3" [ref=e676]
            - button "Select fingers_c5_r3_diode" [ref=e678]
            - button "Select fingers_c5_r3_led" [ref=e680]
            - button "Select fingers_c5_r4" [ref=e682]
            - button "Select fingers_c5_r4_diode" [ref=e684]
            - button "Select fingers_c5_r4_led" [ref=e686]
            - button "Select fingers_c5_r5" [ref=e688]
            - button "Select fingers_c5_r5_diode" [ref=e690]
            - button "Select fingers_c5_r5_led" [ref=e692]
            - button "Select fingers_c5_r6" [ref=e694]
            - button "Select fingers_c5_r6_diode" [ref=e696]
            - button "Select fingers_c5_r6_led" [ref=e698]
            - button "Select fingers_c6_r1" [ref=e700]
            - button "Select fingers_c6_r1_diode" [ref=e702]
            - button "Select fingers_c6_r1_led" [ref=e704]
            - button "Select fingers_c6_r2" [ref=e706]
            - button "Select fingers_c6_r2_diode" [ref=e708]
            - button "Select fingers_c6_r2_led" [ref=e710]
            - button "Select fingers_c6_r3" [ref=e712]
            - button "Select fingers_c6_r3_diode" [ref=e714]
            - button "Select fingers_c6_r3_led" [ref=e716]
            - button "Select fingers_c6_r4" [ref=e718]
            - button "Select fingers_c6_r4_diode" [ref=e720]
            - button "Select fingers_c6_r4_led" [ref=e722]
            - button "Select fingers_c6_r5" [ref=e724]
            - button "Select fingers_c6_r5_diode" [ref=e726]
            - button "Select fingers_c6_r5_led" [ref=e728]
            - button "Select fingers_c6_r6" [ref=e730]
            - button "Select fingers_c6_r6_diode" [ref=e732]
            - button "Select fingers_c6_r6_led" [ref=e734]
            - button "Select fingers_c7_r1" [ref=e736]
            - button "Select fingers_c7_r1_diode" [ref=e738]
            - button "Select fingers_c7_r1_led" [ref=e740]
            - button "Select fingers_c7_r2" [ref=e742]
            - button "Select fingers_c7_r2_diode" [ref=e744]
            - button "Select fingers_c7_r2_led" [ref=e746]
            - button "Select fingers_c7_r3" [ref=e748]
            - button "Select fingers_c7_r3_diode" [ref=e750]
            - button "Select fingers_c7_r3_led" [ref=e752]
            - button "Select fingers_c7_r4" [ref=e754]
            - button "Select fingers_c7_r4_diode" [ref=e756]
            - button "Select fingers_c7_r4_led" [ref=e758]
            - button "Select fingers_c7_r5" [ref=e760]
            - button "Select fingers_c7_r5_diode" [ref=e762]
            - button "Select fingers_c7_r5_led" [ref=e764]
            - button "Select fingers_c7_r6" [ref=e766]
            - button "Select fingers_c7_r6_diode" [ref=e768]
            - button "Select fingers_c7_r6_led" [ref=e770]
            - button "Select fingers_c8_r1" [ref=e772]
            - button "Select fingers_c8_r1_diode" [ref=e774]
            - button "Select fingers_c8_r1_led" [ref=e776]
            - button "Select fingers_c8_r2" [ref=e778]
            - button "Select fingers_c8_r2_diode" [ref=e780]
            - button "Select fingers_c8_r2_led" [ref=e782]
            - button "Select fingers_c8_r3" [ref=e784]
            - button "Select fingers_c8_r3_diode" [ref=e786]
            - button "Select fingers_c8_r3_led" [ref=e788]
            - button "Select fingers_c8_r4" [ref=e790]
            - button "Select fingers_c8_r4_diode" [ref=e792]
            - button "Select fingers_c8_r4_led" [ref=e794]
            - button "Select fingers_c8_r5" [ref=e796]
            - button "Select fingers_c8_r5_diode" [ref=e798]
            - button "Select fingers_c8_r5_led" [ref=e800]
            - button "Select fingers_c8_r6" [ref=e802]
            - button "Select fingers_c8_r6_diode" [ref=e804]
            - button "Select fingers_c8_r6_led" [ref=e806]
            - button "Select fingers_c9_r1" [ref=e808]
            - button "Select fingers_c9_r1_diode" [ref=e810]
            - button "Select fingers_c9_r1_led" [ref=e812]
            - button "Select fingers_c9_r2" [ref=e814]
            - button "Select fingers_c9_r2_diode" [ref=e816]
            - button "Select fingers_c9_r2_led" [ref=e818]
            - button "Select fingers_c9_r3" [ref=e820]
            - button "Select fingers_c9_r3_diode" [ref=e822]
            - button "Select fingers_c9_r3_led" [ref=e824]
            - button "Select fingers_c9_r4" [ref=e826]
            - button "Select fingers_c9_r4_diode" [ref=e828]
            - button "Select fingers_c9_r4_led" [ref=e830]
            - button "Select fingers_c9_r5" [ref=e832]
            - button "Select fingers_c9_r5_diode" [ref=e834]
            - button "Select fingers_c9_r5_led" [ref=e836]
            - button "Select fingers_c9_r6" [ref=e838]
            - button "Select fingers_c9_r6_diode" [ref=e840]
            - button "Select fingers_c9_r6_led" [ref=e842]
            - button "Select fingers_c10_r1" [ref=e844]
            - button "Select fingers_c10_r1_diode" [ref=e846]
            - button "Select fingers_c10_r1_led" [ref=e848]
            - button "Select fingers_c10_r2" [ref=e850]
            - button "Select fingers_c10_r2_diode" [ref=e852]
            - button "Select fingers_c10_r2_led" [ref=e854]
            - button "Select fingers_c10_r3" [ref=e856]
            - button "Select fingers_c10_r3_diode" [ref=e858]
            - button "Select fingers_c10_r3_led" [ref=e860]
            - button "Select fingers_c10_r4" [ref=e862]
            - button "Select fingers_c10_r4_diode" [ref=e864]
            - button "Select fingers_c10_r4_led" [ref=e866]
            - button "Select fingers_c10_r5" [ref=e868]
            - button "Select fingers_c10_r5_diode" [ref=e870]
            - button "Select fingers_c10_r5_led" [ref=e872]
            - button "Select fingers_c10_r6" [ref=e874]
            - button "Select fingers_c10_r6_diode" [ref=e876]
            - button "Select fingers_c10_r6_led" [ref=e878]
            - button "Select fingers_c2_r2" [pressed] [ref=e880]
            - button "Select fingers_c2_r2_diode" [pressed] [ref=e883]
            - button "Select fingers_c2_r2_led" [pressed] [ref=e886]
    - status "Project status" [ref=e889]:
      - generic [ref=e890]: Updating layout… · 60 keys
      - button "Review 3 blockers" [ref=e891] [cursor=pointer]
```

# Test source

```ts
  133 |           await field.fill(String(base + delta));
  134 |           const count =
  135 |             dimension === 'columns'
  136 |               ? (base + delta) * rows
  137 |               : (base + delta) * columns;
  138 |           if (!delta)
  139 |             await measurePreparation(
  140 |               page,
  141 |               field,
  142 |               results,
  143 |               `remove-${dimension}-${repeat}`
  144 |             );
  145 |           const confirm = page.getByRole('button', {
  146 |             name: 'Remove keys and resize',
  147 |             exact: true,
  148 |           });
  149 |           await measure(
  150 |             `${delta ? 'add' : 'remove'}-${dimension}-${repeat}`,
  151 |             delta ? 'keydown' : 'click',
  152 |             () => (delta ? field.press('Tab') : confirm.click()),
  153 |             async () => {
  154 |               await expect(keys(page)).toHaveCount(count);
  155 |               expect(
  156 |                 Object.keys(
  157 |                   parse(await readSource(page)).layout.objects
  158 |                 ).filter((id) => /^fingers_c\d+_r\d+$/.test(id)).length
  159 |               ).toBe(count);
  160 |             }
  161 |           );
  162 |         }
  163 |       }
  164 |     }
  165 |     await page
  166 |       .getByRole('button', { name: 'Select Columns', exact: true })
  167 |       .click();
  168 |     await page.getByRole('button', { name: 'Fit layout', exact: true }).click();
  169 |     await page
  170 |       .getByRole('button', { name: 'Select fingers_c2_r1', exact: true })
  171 |       .click();
  172 |     await page
  173 |       .locator('summary')
  174 |       .filter({ hasText: /^Column keys$/ })
  175 |       .click();
  176 |     for (
  177 |       let repeat = 0;
  178 |       repeat < Number(process.env.PERF_REPEATS || 1);
  179 |       repeat++
  180 |     ) {
  181 |       await measure(
  182 |         `remove-key-${repeat}`,
  183 |         'click',
  184 |         () =>
  185 |           page
  186 |             .getByRole('button', {
  187 |               name: `Remove fingers_c2_r2`,
  188 |               exact: true,
  189 |             })
  190 |             .click(),
  191 |         async () => {
  192 |           await expect(keys(page)).toHaveCount(total - 1);
  193 |           expect(
  194 |             parse(await readSource(page)).layout.objects['fingers_c2_r2']
  195 |           ).toBeUndefined();
  196 |         }
  197 |       );
  198 |       await measure(
  199 |         `add-key-${repeat}`,
  200 |         'click',
  201 |         () =>
  202 |           page
  203 |             .getByRole('button', { name: 'Add key in row 2', exact: true })
  204 |             .click(),
  205 |         async () => {
  206 |           await expect(keys(page)).toHaveCount(total);
  207 |           expect(
  208 |             parse(await readSource(page)).layout.objects['fingers_c2_r2'].cell
  209 |           ).toEqual(['c2', 'r2']);
  210 |         }
  211 |       );
  212 |     }
  213 |     const finalSource = await readSource(page);
  214 |     await page
  215 |       .getByRole('button', { name: 'Undo project edit', exact: true })
  216 |       .click();
  217 |     await expect(keys(page)).toHaveCount(total - 1);
  218 |     await page
  219 |       .getByRole('button', { name: 'Redo project edit', exact: true })
  220 |       .click();
  221 |     await expect.poll(() => readSource(page)).toBe(finalSource);
  222 |     await settle(page);
  223 |     await page.screenshot({ path: resolve(output, 'after.png') });
  224 |     await writeFile(resolve(output, 'final-source.yaml'), finalSource);
  225 |     await page.reload();
  226 |     await expect(keys(page)).toHaveCount(total);
  227 |     expect(await readSource(page)).toBe(finalSource);
  228 |     if (process.env.PERF_NATIVE_ROWS) await verifyComponentMove(page, output);
  229 |     expect(errors).toEqual([]);
  230 |   } finally {
  231 |     await writeFile(
  232 |       resolve(output, 'worker-packets.json'),
> 233 |       JSON.stringify(await page.evaluate(() => window.studioPackets), null, 2)
      |                                 ^ Error: page.evaluate: Target page, context or browser has been closed
  234 |     );
  235 |     await writeFile(
  236 |       resolve(output, 'last-source.yaml'),
  237 |       await readSource(page)
  238 |     );
  239 |     await writeFile(
  240 |       resolve(output, 'timings.json'),
  241 |       JSON.stringify({ results, errors }, null, 2)
  242 |     );
  243 |     await page.screenshot({ path: resolve(output, 'last-state.png') });
  244 |   }
  245 | });
  246 | 
```