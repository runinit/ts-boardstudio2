# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-performance.spec.ts >> measures real keyboard editing response and source correctness
- Location: e2e/studio-performance.spec.ts:24:5

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('complementary', { name: 'Design inspector' }).getByRole('button', { name: 'fingers_c1_r1_diode' })

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
        - button "Undo project edit" [disabled] [ref=e128]:
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
              - treeitem "fingers 39 keys" [expanded] [selected] [ref=e155]:
                - generic [ref=e156]:
                  - button "Collapse fingers 39 keys" [ref=e157] [cursor=pointer]:
                    - img [ref=e158]
                  - button "fingers 39 keys" [pressed] [ref=e160] [cursor=pointer]:
                    - generic [ref=e161]: fingers 39 keys
                - group [ref=e162]:
                  - treeitem "Column 1 · c1" [ref=e163]:
                    - generic [ref=e164]:
                      - button "Expand Column 1 · c1" [ref=e165] [cursor=pointer]:
                        - img [ref=e166]
                      - button "Column 1 · c1" [ref=e168] [cursor=pointer]:
                        - generic [ref=e169]: c1
                  - treeitem "Column 2 · c2" [ref=e170]:
                    - generic [ref=e171]:
                      - button "Expand Column 2 · c2" [ref=e172] [cursor=pointer]:
                        - img [ref=e173]
                      - button "Column 2 · c2" [ref=e175] [cursor=pointer]:
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
                  - treeitem "Column 10 · c10" [ref=e226]:
                    - generic [ref=e227]:
                      - button "Expand Column 10 · c10" [ref=e228] [cursor=pointer]:
                        - img [ref=e229]
                      - button "Column 10 · c10" [ref=e231] [cursor=pointer]:
                        - generic [ref=e232]: c10
                  - treeitem "Column 11 · c11" [ref=e233]:
                    - generic [ref=e234]:
                      - button "Expand Column 11 · c11" [ref=e235] [cursor=pointer]:
                        - img [ref=e236]
                      - button "Column 11 · c11" [ref=e238] [cursor=pointer]:
                        - generic [ref=e239]: c11
                  - treeitem "Column 12 · c12" [ref=e240]:
                    - generic [ref=e241]:
                      - button "Expand Column 12 · c12" [ref=e242] [cursor=pointer]:
                        - img [ref=e243]
                      - button "Column 12 · c12" [ref=e245] [cursor=pointer]:
                        - generic [ref=e246]: c12
                  - treeitem "Column 13 · c13" [ref=e247]:
                    - generic [ref=e248]:
                      - button "Expand Column 13 · c13" [ref=e249] [cursor=pointer]:
                        - img [ref=e250]
                      - button "Column 13 · c13" [ref=e252] [cursor=pointer]:
                        - generic [ref=e253]: c13
                  - treeitem "Row 1 · r1" [ref=e254]:
                    - generic [ref=e255]:
                      - button "Expand Row 1 · r1" [ref=e256] [cursor=pointer]:
                        - img [ref=e257]
                      - button "Row 1 · r1" [ref=e259] [cursor=pointer]:
                        - generic [ref=e260]: r1
                  - treeitem "Row 2 · r2" [ref=e261]:
                    - generic [ref=e262]:
                      - button "Expand Row 2 · r2" [ref=e263] [cursor=pointer]:
                        - img [ref=e264]
                      - button "Row 2 · r2" [ref=e266] [cursor=pointer]:
                        - generic [ref=e267]: r2
                  - treeitem "Row 3 · r3" [ref=e268]:
                    - generic [ref=e269]:
                      - button "Expand Row 3 · r3" [ref=e270] [cursor=pointer]:
                        - img [ref=e271]
                      - button "Row 3 · r3" [ref=e273] [cursor=pointer]:
                        - generic [ref=e274]: r3
            - group [ref=e275]:
              - generic "Components and free objects" [active] [ref=e276] [cursor=pointer]
          - group [ref=e277]:
            - generic "Design" [ref=e278] [cursor=pointer]
            - button "Parameters" [ref=e279] [cursor=pointer]:
              - img [ref=e280]
              - text: Parameters
            - button "Constraints" [ref=e285] [cursor=pointer]:
              - img [ref=e286]
              - text: Constraints
            - group [ref=e290]:
              - generic "Mounting layers" [ref=e291] [cursor=pointer]
            - button "main Outline" [ref=e292] [cursor=pointer]:
              - text: main
              - generic [ref=e293]: Outline
            - button "Rebuild board outline" [ref=e294] [cursor=pointer]
            - button "Sketches" [ref=e296] [cursor=pointer]
        - group [ref=e298]:
          - generic "Selection" [ref=e299] [cursor=pointer]
          - heading "fingers" [level=2] [ref=e300]
          - group "Selection adjustments" [ref=e301]:
            - generic [ref=e302]: Selection adjustments
            - generic [ref=e303]:
              - generic [ref=e304]: Key size
              - combobox "Selection key size" [ref=e305]:
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
            - generic [ref=e306]:
              - generic [ref=e307]: Align X
              - combobox "Horizontal alignment" [ref=e308]:
                - option "Auto (make room)" [selected]
                - option "Left"
                - option "Centre"
                - option "Right"
            - generic [ref=e309]:
              - generic [ref=e310]: Align Y
              - combobox "Vertical alignment" [ref=e311]:
                - option "Top" [selected]
                - option "Centre"
                - option "Bottom"
            - group [ref=e312]:
              - generic "Relative adjustments" [ref=e313] [cursor=pointer]
          - generic [ref=e314]:
            - generic [ref=e315]: Label
            - textbox "Label" [ref=e316]: fingers
          - text: columns arrangement
          - group [ref=e317]:
            - generic "Matrix defaults" [ref=e318] [cursor=pointer]
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
          - heading "Arrangement" [level=3] [ref=e319]
          - generic [ref=e320]:
            - generic [ref=e321]: Columns
            - spinbutton "Matrix columns" [ref=e322]: "13"
          - generic [ref=e323]:
            - generic [ref=e324]: Rows
            - spinbutton "Matrix rows" [ref=e325]: "3"
          - paragraph [ref=e326]: Select a column to adjust splay and offsets, or select a key to edit it individually. Nets follow the matrix automatically.
          - heading "Spacing" [level=3] [ref=e327]
          - generic [ref=e328]:
            - generic [ref=e329]: Column spacing
            - generic [ref=e330]:
              - textbox "Column spacing" [ref=e332]: "19.05"
              - text: = 19.05 mm
          - generic [ref=e333]:
            - generic [ref=e334]: Row spacing
            - generic [ref=e335]:
              - textbox "Row spacing" [ref=e337]: "19.05"
              - text: = 19.05 mm
          - button "Column 1 · c1" [ref=e339] [cursor=pointer]
          - button "Column 2 · c2" [ref=e341] [cursor=pointer]
          - button "Column 3 · c3" [ref=e343] [cursor=pointer]
          - button "Column 4 · c4" [ref=e345] [cursor=pointer]
          - button "Column 5 · c5" [ref=e347] [cursor=pointer]
          - button "Column 6 · c6" [ref=e349] [cursor=pointer]
          - button "Column 7 · c7" [ref=e351] [cursor=pointer]
          - button "Column 8 · c8" [ref=e353] [cursor=pointer]
          - button "Column 9 · c9" [ref=e355] [cursor=pointer]
          - button "Column 10 · c10" [ref=e357] [cursor=pointer]
          - button "Column 11 · c11" [ref=e359] [cursor=pointer]
          - button "Column 12 · c12" [ref=e361] [cursor=pointer]
          - button "Column 13 · c13" [ref=e363] [cursor=pointer]
          - heading "Placement" [level=3] [ref=e364]
          - generic [ref=e365]:
            - generic [ref=e366]: X
            - generic [ref=e367]:
              - textbox "X" [ref=e369]: "0"
              - text: = 0 mm
          - generic [ref=e370]:
            - generic [ref=e371]: "Y"
            - generic [ref=e372]:
              - textbox "Y" [ref=e374]: "0"
              - text: = 0 mm
          - generic [ref=e375]:
            - generic [ref=e376]: Z
            - generic [ref=e377]:
              - textbox "Z" [ref=e379]: "0"
              - text: = 0 mm
          - generic [ref=e380]:
            - generic [ref=e381]: Rotation
            - generic [ref=e382]:
              - textbox "Rotation" [ref=e384]: "0"
              - text: = 0 °
          - group [ref=e385]:
            - generic "Advanced placement" [ref=e386] [cursor=pointer]
            - option "None" [selected]
            - option "world"
            - option "fingers"
            - option "fingers_c1_r1"
            - option "fingers_c1_r1_diode"
            - option "fingers_c1_r2"
            - option "fingers_c1_r2_diode"
            - option "fingers_c1_r3"
            - option "fingers_c1_r3_diode"
            - option "fingers_c2_r1"
            - option "fingers_c2_r1_diode"
            - option "fingers_c2_r3"
            - option "fingers_c2_r3_diode"
            - option "fingers_c3_r1"
            - option "fingers_c3_r1_diode"
            - option "fingers_c3_r2"
            - option "fingers_c3_r2_diode"
            - option "fingers_c3_r3"
            - option "fingers_c3_r3_diode"
            - option "fingers_c4_r1"
            - option "fingers_c4_r1_diode"
            - option "fingers_c4_r2"
            - option "fingers_c4_r2_diode"
            - option "fingers_c4_r3"
            - option "fingers_c4_r3_diode"
            - option "fingers_c5_r1"
            - option "fingers_c5_r1_diode"
            - option "fingers_c5_r2"
            - option "fingers_c5_r2_diode"
            - option "fingers_c5_r3"
            - option "fingers_c5_r3_diode"
            - option "fingers_c6_r1"
            - option "fingers_c6_r1_diode"
            - option "fingers_c6_r2"
            - option "fingers_c6_r2_diode"
            - option "fingers_c6_r3"
            - option "fingers_c6_r3_diode"
            - option "fingers_c7_r1"
            - option "fingers_c7_r1_diode"
            - option "fingers_c7_r2"
            - option "fingers_c7_r2_diode"
            - option "fingers_c7_r3"
            - option "fingers_c7_r3_diode"
            - option "fingers_c8_r1"
            - option "fingers_c8_r1_diode"
            - option "fingers_c8_r2"
            - option "fingers_c8_r2_diode"
            - option "fingers_c8_r3"
            - option "fingers_c8_r3_diode"
            - option "fingers_c9_r1"
            - option "fingers_c9_r1_diode"
            - option "fingers_c9_r2"
            - option "fingers_c9_r2_diode"
            - option "fingers_c9_r3"
            - option "fingers_c9_r3_diode"
            - option "fingers_c10_r1"
            - option "fingers_c10_r1_diode"
            - option "fingers_c10_r2"
            - option "fingers_c10_r2_diode"
            - option "fingers_c10_r3"
            - option "fingers_c10_r3_diode"
            - option "fingers_c11_r1"
            - option "fingers_c11_r1_diode"
            - option "fingers_c11_r2"
            - option "fingers_c11_r2_diode"
            - option "fingers_c11_r3"
            - option "fingers_c11_r3_diode"
            - option "fingers_c12_r1"
            - option "fingers_c12_r1_diode"
            - option "fingers_c12_r2"
            - option "fingers_c12_r2_diode"
            - option "fingers_c12_r3"
            - option "fingers_c12_r3_diode"
            - option "fingers_c13_r1"
            - option "fingers_c13_r1_diode"
            - option "fingers_c13_r2"
            - option "fingers_c13_r2_diode"
            - option "fingers_c13_r3"
            - option "fingers_c13_r3_diode"
            - option "fingers_c2_r2"
            - option "fingers_c2_r2_diode"
            - option "None"
            - option "main" [selected]
            - option "world"
          - generic [ref=e387]:
            - button "Duplicate" [ref=e388] [cursor=pointer]:
              - img [ref=e389]
              - text: Duplicate
            - button "Delete" [ref=e392] [cursor=pointer]:
              - img [ref=e393]
              - text: Delete
      - main [ref=e396]:
        - generic "Outline controls" [ref=e397]:
          - generic [ref=e398]:
            - checkbox "Automatic outline" [checked] [ref=e399]
            - text: Automatic outline
        - generic [ref=e400]:
          - toolbar "Canvas tools" [ref=e401]:
            - generic [ref=e402]:
              - button "Select Objects" [ref=e403] [cursor=pointer]:
                - img [ref=e404]
              - button "Select Columns" [ref=e406] [cursor=pointer]:
                - img [ref=e407]
              - button "Select Rows" [ref=e409] [cursor=pointer]:
                - img [ref=e410]
              - button "Select Matrices" [pressed] [ref=e412] [cursor=pointer]:
                - img [ref=e413]
              - button "Pan" [ref=e415] [cursor=pointer]:
                - img [ref=e416]
            - toolbar "Snapping" [ref=e421]:
              - button "Snapping" [pressed] [ref=e422] [cursor=pointer]:
                - img [ref=e423]
              - button "Snapping settings" [ref=e427] [cursor=pointer]:
                - img [ref=e428]
              - region [ref=e430]:
                - generic [ref=e431]:
                  - strong [ref=e432]: Snapping
                  - button [ref=e433] [cursor=pointer]:
                    - img [ref=e434]
                - group [ref=e437]:
                  - button [ref=e438] [cursor=pointer]: 1u
                  - button [ref=e439] [cursor=pointer]: ½u
                  - button [pressed] [ref=e440] [cursor=pointer]: ¼u
                  - button [ref=e441] [cursor=pointer]: ⅛u
                - generic [ref=e442]:
                  - generic [ref=e443]:
                    - checkbox [checked] [ref=e444]
                    - text: Grid
                  - generic [ref=e445]:
                    - checkbox [checked] [ref=e446]
                    - text: Centers
                  - generic [ref=e447]:
                    - checkbox [ref=e448]
                    - text: Origins
                  - generic [ref=e449]:
                    - checkbox [checked] [ref=e450]
                    - text: Edges
                - generic [ref=e451]:
                  - text: Increment · mm
                  - spinbutton [ref=e452]
                - generic [ref=e453]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e454]: "2"
                - group [ref=e455]:
                  - generic [ref=e456] [cursor=pointer]: Alt bypasses snapping · Help
            - button "Delete selection" [ref=e457] [cursor=pointer]:
              - img [ref=e458]
          - toolbar "View controls" [ref=e461]:
            - button "Side" [ref=e462] [cursor=pointer]
            - button "Fit layout" [ref=e463] [cursor=pointer]:
              - img [ref=e464]
            - button "Zoom out" [ref=e469] [cursor=pointer]:
              - img [ref=e470]
            - generic [ref=e471]: 100%
            - button "Zoom in" [ref=e472] [cursor=pointer]:
              - img [ref=e473]
          - group "Interactive board layout" [ref=e474]:
            - button "Select fingers_c1_r1" [pressed] [ref=e476]
            - button "Select fingers_c1_r1_diode" [pressed] [ref=e479]
            - button "Select fingers_c1_r2" [pressed] [ref=e482]
            - button "Select fingers_c1_r2_diode" [pressed] [ref=e485]
            - button "Select fingers_c1_r3" [pressed] [ref=e488]
            - button "Select fingers_c1_r3_diode" [pressed] [ref=e491]
            - button "Select fingers_c2_r1" [pressed] [ref=e494]
            - button "Select fingers_c2_r1_diode" [pressed] [ref=e497]
            - button "Select fingers_c2_r3" [pressed] [ref=e500]
            - button "Select fingers_c2_r3_diode" [pressed] [ref=e503]
            - button "Select fingers_c3_r1" [pressed] [ref=e506]
            - button "Select fingers_c3_r1_diode" [pressed] [ref=e509]
            - button "Select fingers_c3_r2" [pressed] [ref=e512]
            - button "Select fingers_c3_r2_diode" [pressed] [ref=e515]
            - button "Select fingers_c3_r3" [pressed] [ref=e518]
            - button "Select fingers_c3_r3_diode" [pressed] [ref=e521]
            - button "Select fingers_c4_r1" [pressed] [ref=e524]
            - button "Select fingers_c4_r1_diode" [pressed] [ref=e527]
            - button "Select fingers_c4_r2" [pressed] [ref=e530]
            - button "Select fingers_c4_r2_diode" [pressed] [ref=e533]
            - button "Select fingers_c4_r3" [pressed] [ref=e536]
            - button "Select fingers_c4_r3_diode" [pressed] [ref=e539]
            - button "Select fingers_c5_r1" [pressed] [ref=e542]
            - button "Select fingers_c5_r1_diode" [pressed] [ref=e545]
            - button "Select fingers_c5_r2" [pressed] [ref=e548]
            - button "Select fingers_c5_r2_diode" [pressed] [ref=e551]
            - button "Select fingers_c5_r3" [pressed] [ref=e554]
            - button "Select fingers_c5_r3_diode" [pressed] [ref=e557]
            - button "Select fingers_c6_r1" [pressed] [ref=e560]
            - button "Select fingers_c6_r1_diode" [pressed] [ref=e563]
            - button "Select fingers_c6_r2" [pressed] [ref=e566]
            - button "Select fingers_c6_r2_diode" [pressed] [ref=e569]
            - button "Select fingers_c6_r3" [pressed] [ref=e572]
            - button "Select fingers_c6_r3_diode" [pressed] [ref=e575]
            - button "Select fingers_c7_r1" [pressed] [ref=e578]
            - button "Select fingers_c7_r1_diode" [pressed] [ref=e581]
            - button "Select fingers_c7_r2" [pressed] [ref=e584]
            - button "Select fingers_c7_r2_diode" [pressed] [ref=e587]
            - button "Select fingers_c7_r3" [pressed] [ref=e590]
            - button "Select fingers_c7_r3_diode" [pressed] [ref=e593]
            - button "Select fingers_c8_r1" [pressed] [ref=e596]
            - button "Select fingers_c8_r1_diode" [pressed] [ref=e599]
            - button "Select fingers_c8_r2" [pressed] [ref=e602]
            - button "Select fingers_c8_r2_diode" [pressed] [ref=e605]
            - button "Select fingers_c8_r3" [pressed] [ref=e608]
            - button "Select fingers_c8_r3_diode" [pressed] [ref=e611]
            - button "Select fingers_c9_r1" [pressed] [ref=e614]
            - button "Select fingers_c9_r1_diode" [pressed] [ref=e617]
            - button "Select fingers_c9_r2" [pressed] [ref=e620]
            - button "Select fingers_c9_r2_diode" [pressed] [ref=e623]
            - button "Select fingers_c9_r3" [pressed] [ref=e626]
            - button "Select fingers_c9_r3_diode" [pressed] [ref=e629]
            - button "Select fingers_c10_r1" [pressed] [ref=e632]
            - button "Select fingers_c10_r1_diode" [pressed] [ref=e635]
            - button "Select fingers_c10_r2" [pressed] [ref=e638]
            - button "Select fingers_c10_r2_diode" [pressed] [ref=e641]
            - button "Select fingers_c10_r3" [pressed] [ref=e644]
            - button "Select fingers_c10_r3_diode" [pressed] [ref=e647]
            - button "Select fingers_c11_r1" [pressed] [ref=e650]
            - button "Select fingers_c11_r1_diode" [pressed] [ref=e653]
            - button "Select fingers_c11_r2" [pressed] [ref=e656]
            - button "Select fingers_c11_r2_diode" [pressed] [ref=e659]
            - button "Select fingers_c11_r3" [pressed] [ref=e662]
            - button "Select fingers_c11_r3_diode" [pressed] [ref=e665]
            - button "Select fingers_c12_r1" [pressed] [ref=e668]
            - button "Select fingers_c12_r1_diode" [pressed] [ref=e671]
            - button "Select fingers_c12_r2" [pressed] [ref=e674]
            - button "Select fingers_c12_r2_diode" [pressed] [ref=e677]
            - button "Select fingers_c12_r3" [pressed] [ref=e680]
            - button "Select fingers_c12_r3_diode" [pressed] [ref=e683]
            - button "Select fingers_c13_r1" [pressed] [ref=e686]
            - button "Select fingers_c13_r1_diode" [pressed] [ref=e689]
            - button "Select fingers_c13_r2" [pressed] [ref=e692]
            - button "Select fingers_c13_r2_diode" [pressed] [ref=e695]
            - button "Select fingers_c13_r3" [pressed] [ref=e698]
            - button "Select fingers_c13_r3_diode" [pressed] [ref=e701]
            - button "Select fingers_c2_r2" [pressed] [ref=e704]
            - button "Select fingers_c2_r2_diode" [pressed] [ref=e707]
    - status "Project status" [ref=e710]:
      - generic [ref=e711]: Layout positions current · 39 keys
      - button "Review 2 blockers" [ref=e712] [cursor=pointer]
```

# Test source

```ts
  118 |       resolve(output, 'timings.json'),
  119 |       JSON.stringify({ results, errors }, null, 2)
  120 |     );
  121 |     await settle(page);
  122 |     await expect(contour).toBeVisible();
  123 |     if (name.startsWith('nudge-'))
  124 |       expect(await contour.innerHTML()).not.toBe(outlineBefore);
  125 |     return before;
  126 |   }
  127 |   return measure;
  128 | }
  129 | export async function measurePreparation(
  130 |   page: Page,
  131 |   field: Locator,
  132 |   results: unknown[],
  133 |   name: string
  134 | ) {
  135 |   const source = await readSource(page);
  136 |   await page.evaluate(() =>
  137 |     Object.assign(window.performanceProbe, {
  138 |       armed: true,
  139 |       event: 'keydown',
  140 |       start: 0,
  141 |     })
  142 |   );
  143 |   await field.press('Tab');
  144 |   await expect(
  145 |     page.getByRole('dialog', { name: 'Review matrix resize' })
  146 |   ).toBeVisible();
  147 |   const elapsedMs = await page.evaluate(
  148 |     () => performance.now() - window.performanceProbe.start
  149 |   );
  150 |   expect(await readSource(page)).toBe(source);
  151 |   results.push({
  152 |     name: name + '-preparation',
  153 |     tabToDialogMs: elapsedMs,
  154 |     sourceUnchanged: true,
  155 |   });
  156 | }
  157 | 
  158 | export async function measureFrozenRebuild(
  159 |   page: Page,
  160 |   output: string,
  161 |   results: unknown[]
  162 | ) {
  163 |   const automatic = page.getByRole('checkbox', { name: 'Automatic outline' });
  164 |   const freezeStart = await page.evaluate(() => performance.now());
  165 |   await automatic.uncheck();
  166 |   await waitForStudio(page, await readSource(page), freezeStart);
  167 |   await settle(page);
  168 |   await writeFile(
  169 |     resolve(output, 'post-nudge-frozen-source.yaml'),
  170 |     await readSource(page)
  171 |   );
  172 |   await page.evaluate(() =>
  173 |     Object.assign(window.performanceProbe, {
  174 |       armed: true,
  175 |       event: 'click',
  176 |       start: 0,
  177 |     })
  178 |   );
  179 |   const frozen = await readSource(page);
  180 |   await page
  181 |     .getByRole('button', { name: 'Rebuild outline', exact: true })
  182 |     .click();
  183 |   const start = await page.evaluate(() => window.performanceProbe.start);
  184 |   const acknowledgment = await waitForStudio(page, frozen, start);
  185 |   await writeWorkerPackets(
  186 |     page,
  187 |     resolve(output, 'rebuild-worker.json'),
  188 |     acknowledgment.requestId,
  189 |     acknowledgment.revision
  190 |   );
  191 |   await settle(page);
  192 |   const elapsedMs = await page.evaluate(
  193 |     () => performance.now() - window.performanceProbe.start
  194 |   );
  195 |   await expect(automatic).not.toBeChecked();
  196 |   results.push({
  197 |     name: 'frozen-rebuild',
  198 |     completedMs: elapsedMs,
  199 |     acknowledgment,
  200 |     regions: regionEvidence(frozen, await readSource(page)),
  201 |   });
  202 |   await page.screenshot({ path: resolve(output, 'post-nudge-rebuilt.png') });
  203 |   const automaticStart = await page.evaluate(() => performance.now());
  204 |   await automatic.check();
  205 |   await waitForStudio(page, await readSource(page), automaticStart);
  206 |   await settle(page);
  207 | }
  208 | 
  209 | export async function verifyComponentMove(page: Page, output: string) {
  210 |   const id = 'fingers_c1_r1_diode';
  211 |   const before = await readSource(page);
  212 |   const label = parse(before).layout.objects[id].label || id;
  213 |   const inspector = await openInspector(page);
  214 |   await inspector
  215 |     .locator('summary')
  216 |     .filter({ hasText: /^Components and free objects$/ })
  217 |     .click();
> 218 |   await inspector.getByRole('button', { name: label }).click();
      |                                                        ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  219 |   const started = await page.evaluate(() => performance.now());
  220 |   await inspector.getByLabel('X', { exact: true }).fill('1');
  221 |   await inspector.getByLabel('X', { exact: true }).press('Tab');
  222 |   await expect
  223 |     .poll(
  224 |       async () =>
  225 |         parse(await readSource(page)).layout.objects[id].placement.at[0]
  226 |     )
  227 |     .toBe(1);
  228 |   await settle(page);
  229 |   const edited = await readSource(page);
  230 |   await waitForStudio(page, edited, started);
  231 |   await page
  232 |     .getByRole('button', { name: 'Undo project edit', exact: true })
  233 |     .click();
  234 |   await expect.poll(() => readSource(page)).toBe(before);
  235 |   await page
  236 |     .getByRole('button', { name: 'Redo project edit', exact: true })
  237 |     .click();
  238 |   await expect.poll(() => readSource(page)).toBe(edited);
  239 |   await page.reload();
  240 |   await waitForStudio(page, edited, 0);
  241 |   await settle(page);
  242 |   expect(await readSource(page)).toBe(edited);
  243 |   await writeFile(resolve(output, 'component-moved-source.yaml'), edited);
  244 |   await page.screenshot({
  245 |     path: resolve(output, 'component-moved-reloaded.png'),
  246 |   });
  247 | }
  248 | 
```