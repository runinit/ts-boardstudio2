# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-performance.spec.ts >> measures real keyboard editing response and source correctness
- Location: e2e/studio-performance.spec.ts:24:5

# Error details

```
Error: expect(received).toBeUndefined()

Received: {"cell": ["c10", "r2"], "cluster": "fingers", "envelopes": {"keycap": {"size": [18, 18]}}, "footprints": {"studio_diode": {"params": {"from": "{{name}}_switch", "to": "{{row_net}}"}, "placement": {"at": [0, -5, 0]}, "what": "diode"}, "switch": {"params": {"to": "{{name}}_switch"}}}, "kind": "key", "label": "fingers_c10_r2", "part": "mx", "pcb": "main"}
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
              - treeitem "fingers 59 keys" [expanded] [ref=e155]:
                - generic [ref=e156]:
                  - button "Collapse fingers 59 keys" [ref=e157] [cursor=pointer]:
                    - img [ref=e158]
                  - button "fingers 59 keys" [ref=e160] [cursor=pointer]:
                    - generic [ref=e161]: fingers 59 keys
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
                      - treeitem "fingers_c10_r1" [ref=e234] [cursor=pointer]:
                        - generic [ref=e235]: r1
                      - treeitem "fingers_c10_r2" [ref=e236] [cursor=pointer]:
                        - generic [ref=e237]: r2
                      - treeitem "fingers_c10_r3" [ref=e238] [cursor=pointer]:
                        - generic [ref=e239]: r3
                      - treeitem "fingers_c10_r4" [ref=e240] [cursor=pointer]:
                        - generic [ref=e241]: r4
                      - treeitem "fingers_c10_r5" [ref=e242] [cursor=pointer]:
                        - generic [ref=e243]: r5
                      - treeitem "fingers_c10_r6" [ref=e244] [cursor=pointer]:
                        - generic [ref=e245]: r6
                  - treeitem "Row 1 · r1" [expanded] [ref=e246]:
                    - generic [ref=e247]:
                      - button "Collapse Row 1 · r1" [ref=e248] [cursor=pointer]:
                        - img [ref=e249]
                      - button "Row 1 · r1" [ref=e251] [cursor=pointer]:
                        - generic [ref=e252]: r1
                    - group
                  - treeitem "Row 2 · r2" [ref=e253]:
                    - generic [ref=e254]:
                      - button "Expand Row 2 · r2" [ref=e255] [cursor=pointer]:
                        - img [ref=e256]
                      - button "Row 2 · r2" [ref=e258] [cursor=pointer]:
                        - generic [ref=e259]: r2
                  - treeitem "Row 3 · r3" [ref=e260]:
                    - generic [ref=e261]:
                      - button "Expand Row 3 · r3" [ref=e262] [cursor=pointer]:
                        - img [ref=e263]
                      - button "Row 3 · r3" [ref=e265] [cursor=pointer]:
                        - generic [ref=e266]: r3
                  - treeitem "Row 4 · r4" [ref=e267]:
                    - generic [ref=e268]:
                      - button "Expand Row 4 · r4" [ref=e269] [cursor=pointer]:
                        - img [ref=e270]
                      - button "Row 4 · r4" [ref=e272] [cursor=pointer]:
                        - generic [ref=e273]: r4
                  - treeitem "Row 5 · r5" [ref=e274]:
                    - generic [ref=e275]:
                      - button "Expand Row 5 · r5" [ref=e276] [cursor=pointer]:
                        - img [ref=e277]
                      - button "Row 5 · r5" [ref=e279] [cursor=pointer]:
                        - generic [ref=e280]: r5
                  - treeitem "Row 6 · r6" [ref=e281]:
                    - generic [ref=e282]:
                      - button "Expand Row 6 · r6" [ref=e283] [cursor=pointer]:
                        - img [ref=e284]
                      - button "Row 6 · r6" [ref=e286] [cursor=pointer]:
                        - generic [ref=e287]: r6
            - group [ref=e288]:
              - generic "Components and free objects" [ref=e289] [cursor=pointer]
          - group [ref=e290]:
            - generic "Design" [ref=e291] [cursor=pointer]
            - button "Parameters" [ref=e292] [cursor=pointer]:
              - img [ref=e293]
              - text: Parameters
            - button "Constraints" [ref=e298] [cursor=pointer]:
              - img [ref=e299]
              - text: Constraints
            - group [ref=e303]:
              - generic "Mounting layers" [ref=e304] [cursor=pointer]
            - button "main_outline Outline" [ref=e305] [cursor=pointer]:
              - text: main_outline
              - generic [ref=e306]: Outline
            - button "Rebuild board outline" [ref=e307] [cursor=pointer]
            - button "Sketches" [ref=e309] [cursor=pointer]
        - group [ref=e311]:
          - generic "Selection" [ref=e312] [cursor=pointer]
          - heading "Column 2" [level=2] [ref=e313]
          - paragraph [ref=e314]: fingers · c2. Changes affect every key in this column.
          - generic [ref=e315]:
            - generic [ref=e316]: Column stagger
            - generic [ref=e317]:
              - generic [ref=e318]:
                - button "Decrease Column stagger" [ref=e319] [cursor=pointer]:
                  - img [ref=e320]
                - textbox "Column stagger" [ref=e321]: "0"
                - button "Increase Column stagger" [ref=e322] [cursor=pointer]:
                  - img [ref=e323]
              - text: = 0 mm
          - generic "Stagger presets" [ref=e324]:
            - button "0 u" [ref=e325] [cursor=pointer]
            - button "0.25 u" [ref=e326] [cursor=pointer]
            - button "0.5 u" [ref=e327] [cursor=pointer]
            - button "1 u" [ref=e328] [cursor=pointer]
          - generic [ref=e329]:
            - generic [ref=e330]: Column splay
            - generic [ref=e331]:
              - textbox "Column splay" [ref=e333]: "0"
              - text: = 0 °
          - group [ref=e334]:
            - generic "Additional offsets" [ref=e335] [cursor=pointer]
          - paragraph [ref=e336]: Splay rotates the column about its first row. Individual key edits stay relative to the column.
          - group [ref=e337]:
            - generic "Column keys" [ref=e338] [cursor=pointer]
            - list "Column keys" [ref=e339]:
              - listitem [ref=e340]:
                - button "Row 1 fingers_c2_r1" [ref=e341] [cursor=pointer]:
                  - generic [ref=e342]: Row 1
                  - generic [ref=e343]: fingers_c2_r1
                - button "Remove fingers_c2_r1" [ref=e344] [cursor=pointer]:
                  - img [ref=e345]
              - listitem [ref=e348]:
                - button "Add key in row 2" [ref=e349] [cursor=pointer]
              - listitem [ref=e350]:
                - button "Row 3 fingers_c2_r3" [ref=e351] [cursor=pointer]:
                  - generic [ref=e352]: Row 3
                  - generic [ref=e353]: fingers_c2_r3
                - button "Remove fingers_c2_r3" [ref=e354] [cursor=pointer]:
                  - img [ref=e355]
              - listitem [ref=e358]:
                - button "Row 4 fingers_c2_r4" [ref=e359] [cursor=pointer]:
                  - generic [ref=e360]: Row 4
                  - generic [ref=e361]: fingers_c2_r4
                - button "Remove fingers_c2_r4" [ref=e362] [cursor=pointer]:
                  - img [ref=e363]
              - listitem [ref=e366]:
                - button "Row 5 fingers_c2_r5" [ref=e367] [cursor=pointer]:
                  - generic [ref=e368]: Row 5
                  - generic [ref=e369]: fingers_c2_r5
                - button "Remove fingers_c2_r5" [ref=e370] [cursor=pointer]:
                  - img [ref=e371]
              - listitem [ref=e374]:
                - button "Row 6 fingers_c2_r6" [ref=e375] [cursor=pointer]:
                  - generic [ref=e376]: Row 6
                  - generic [ref=e377]: fingers_c2_r6
                - button "Remove fingers_c2_r6" [ref=e378] [cursor=pointer]:
                  - img [ref=e379]
          - group [ref=e382]:
            - generic "Matrix actions" [ref=e383] [cursor=pointer]
          - group "Selection adjustments" [ref=e384]:
            - generic [ref=e385]: Selection adjustments
            - generic [ref=e386]:
              - generic [ref=e387]: Key size
              - combobox "Selection key size" [ref=e388]:
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
            - generic [ref=e389]:
              - generic [ref=e390]: Align X
              - combobox "Horizontal alignment" [ref=e391]:
                - option "Auto (make room)" [selected]
                - option "Left"
                - option "Centre"
                - option "Right"
            - generic [ref=e392]:
              - generic [ref=e393]: Align Y
              - combobox "Vertical alignment" [ref=e394]:
                - option "Top" [selected]
                - option "Centre"
                - option "Bottom"
            - group [ref=e395]:
              - generic "Relative adjustments" [ref=e396] [cursor=pointer]
      - main [ref=e397]:
        - generic "Outline controls" [ref=e398]:
          - generic [ref=e399]:
            - checkbox "Automatic outline" [checked] [ref=e400]
            - text: Automatic outline
          - status [ref=e401]: Updating outline…
        - status [ref=e402]: Updating layout…
        - generic [ref=e403]:
          - toolbar "Canvas tools" [ref=e404]:
            - generic [ref=e405]:
              - button "Select Objects" [ref=e406] [cursor=pointer]:
                - img [ref=e407]
              - button "Select Columns" [pressed] [ref=e409] [cursor=pointer]:
                - img [ref=e410]
              - button "Select Rows" [ref=e412] [cursor=pointer]:
                - img [ref=e413]
              - button "Select Matrices" [ref=e415] [cursor=pointer]:
                - img [ref=e416]
              - button "Pan" [ref=e418] [cursor=pointer]:
                - img [ref=e419]
            - toolbar "Snapping" [ref=e424]:
              - button "Snapping" [pressed] [ref=e425] [cursor=pointer]:
                - img [ref=e426]
              - button "Snapping settings" [ref=e430] [cursor=pointer]:
                - img [ref=e431]
              - region [ref=e433]:
                - generic [ref=e434]:
                  - strong [ref=e435]: Snapping
                  - button [ref=e436] [cursor=pointer]:
                    - img [ref=e437]
                - group [ref=e440]:
                  - button [ref=e441] [cursor=pointer]: 1u
                  - button [ref=e442] [cursor=pointer]: ½u
                  - button [ref=e443] [cursor=pointer]: ¼u
                  - button [ref=e444] [cursor=pointer]: ⅛u
                - generic [ref=e445]:
                  - generic [ref=e446]:
                    - checkbox [checked] [ref=e447]
                    - text: Grid
                  - generic [ref=e448]:
                    - checkbox [checked] [ref=e449]
                    - text: Centers
                  - generic [ref=e450]:
                    - checkbox [ref=e451]
                    - text: Origins
                  - generic [ref=e452]:
                    - checkbox [checked] [ref=e453]
                    - text: Edges
                - generic [ref=e454]:
                  - text: Increment · mm
                  - spinbutton [ref=e455]: "1"
                - generic [ref=e456]:
                  - text: Edge gap · mm
                  - spinbutton [ref=e457]: "2"
                - group [ref=e458]:
                  - generic [ref=e459] [cursor=pointer]: Alt bypasses snapping · Help
          - toolbar "View controls" [ref=e460]:
            - button "Side" [ref=e461] [cursor=pointer]
            - button "Fit layout" [ref=e462] [cursor=pointer]:
              - img [ref=e463]
            - button "Zoom out" [ref=e468] [cursor=pointer]:
              - img [ref=e469]
            - generic [ref=e470]: 100%
            - button "Zoom in" [ref=e471] [cursor=pointer]:
              - img [ref=e472]
          - group "Interactive board layout" [ref=e473]:
            - button "Select fingers_c1_r1" [ref=e475]
            - button "Select fingers_c1_r2" [ref=e477]
            - button "Select fingers_c1_r3" [ref=e479]
            - button "Select fingers_c1_r4" [ref=e481]
            - button "Select fingers_c1_r5" [ref=e483]
            - button "Select fingers_c1_r6" [ref=e485]
            - button "Select fingers_c2_r1" [pressed] [ref=e487]
            - button "Select fingers_c2_r3" [pressed] [ref=e490]
            - button "Select fingers_c2_r4" [pressed] [ref=e493]
            - button "Select fingers_c2_r5" [pressed] [ref=e496]
            - button "Select fingers_c2_r6" [pressed] [ref=e499]
            - button "Select fingers_c3_r1" [ref=e502]
            - button "Select fingers_c3_r2" [ref=e504]
            - button "Select fingers_c3_r3" [ref=e506]
            - button "Select fingers_c3_r4" [ref=e508]
            - button "Select fingers_c3_r5" [ref=e510]
            - button "Select fingers_c3_r6" [ref=e512]
            - button "Select fingers_c4_r1" [ref=e514]
            - button "Select fingers_c4_r2" [ref=e516]
            - button "Select fingers_c4_r3" [ref=e518]
            - button "Select fingers_c4_r4" [ref=e520]
            - button "Select fingers_c4_r5" [ref=e522]
            - button "Select fingers_c4_r6" [ref=e524]
            - button "Select fingers_c5_r1" [ref=e526]
            - button "Select fingers_c5_r2" [ref=e528]
            - button "Select fingers_c5_r3" [ref=e530]
            - button "Select fingers_c5_r4" [ref=e532]
            - button "Select fingers_c5_r5" [ref=e534]
            - button "Select fingers_c5_r6" [ref=e536]
            - button "Select fingers_c6_r1" [ref=e538]
            - button "Select fingers_c6_r2" [ref=e540]
            - button "Select fingers_c6_r3" [ref=e542]
            - button "Select fingers_c6_r4" [ref=e544]
            - button "Select fingers_c6_r5" [ref=e546]
            - button "Select fingers_c6_r6" [ref=e548]
            - button "Select fingers_c7_r1" [ref=e550]
            - button "Select fingers_c7_r2" [ref=e552]
            - button "Select fingers_c7_r3" [ref=e554]
            - button "Select fingers_c7_r4" [ref=e556]
            - button "Select fingers_c7_r5" [ref=e558]
            - button "Select fingers_c7_r6" [ref=e560]
            - button "Select fingers_c8_r1" [ref=e562]
            - button "Select fingers_c8_r2" [ref=e564]
            - button "Select fingers_c8_r3" [ref=e566]
            - button "Select fingers_c8_r4" [ref=e568]
            - button "Select fingers_c8_r5" [ref=e570]
            - button "Select fingers_c8_r6" [ref=e572]
            - button "Select fingers_c9_r1" [ref=e574]
            - button "Select fingers_c9_r2" [ref=e576]
            - button "Select fingers_c9_r3" [ref=e578]
            - button "Select fingers_c9_r4" [ref=e580]
            - button "Select fingers_c9_r5" [ref=e582]
            - button "Select fingers_c9_r6" [ref=e584]
            - button "Select fingers_c10_r1" [ref=e586]
            - button "Select fingers_c10_r2" [ref=e588]
            - button "Select fingers_c10_r3" [ref=e590]
            - button "Select fingers_c10_r4" [ref=e592]
            - button "Select fingers_c10_r5" [ref=e594]
            - button "Select fingers_c10_r6" [ref=e596]
    - status "Project status" [ref=e598]:
      - generic [ref=e599]: Updating layout… · 59 keys
      - button "View findings" [ref=e600] [cursor=pointer]
```

# Test source

```ts
  97  |       await measure(
  98  |         `drag-${repeat}`,
  99  |         'pointermove',
  100 |         async () => {
  101 |           await page.mouse.move(
  102 |             box.x + box.width / 2 + 12,
  103 |             box.y + box.height / 2,
  104 |             { steps: 3 }
  105 |           );
  106 |           await page.mouse.up();
  107 |         },
  108 |         async () => {
  109 |           await expect
  110 |             .poll(
  111 |               async () =>
  112 |                 parse(await readSource(page)).layout.objects[
  113 |                   `fingers_c${columns}_r1`
  114 |                 ].placement.override.at[0]
  115 |             )
  116 |             .toBeGreaterThan(before[0]);
  117 |         }
  118 |       );
  119 |     }
  120 |     await openInspector(page);
  121 |     await page
  122 |       .getByRole('button', { name: `fingers ${total} keys`, exact: true })
  123 |       .click();
  124 |     for (const dimension of ['columns', 'rows']) {
  125 |       const field = page.getByLabel(`Matrix ${dimension}`, { exact: true });
  126 |       const base = dimension === 'columns' ? columns : rows;
  127 |       for (
  128 |         let repeat = 0;
  129 |         repeat < Number(process.env.PERF_REPEATS || 1);
  130 |         repeat++
  131 |       ) {
  132 |         for (const delta of [1, 0]) {
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
  194 |             parse(await readSource(page)).layout.objects[
  195 |               `fingers_c${columns}_r2`
  196 |             ]
> 197 |           ).toBeUndefined();
      |             ^ Error: expect(received).toBeUndefined()
  198 |         }
  199 |       );
  200 |       await measure(
  201 |         `add-key-${repeat}`,
  202 |         'click',
  203 |         () =>
  204 |           page
  205 |             .getByRole('button', { name: 'Add key in row 2', exact: true })
  206 |             .click(),
  207 |         async () => {
  208 |           await expect(keys(page)).toHaveCount(total);
  209 |           expect(
  210 |             parse(await readSource(page)).layout.objects[
  211 |               `fingers_c${columns}_r2`
  212 |             ].cell
  213 |           ).toEqual(['c2', 'r2']);
  214 |         }
  215 |       );
  216 |     }
  217 |     const finalSource = await readSource(page);
  218 |     await page
  219 |       .getByRole('button', { name: 'Undo project edit', exact: true })
  220 |       .click();
  221 |     await expect(keys(page)).toHaveCount(total - 1);
  222 |     await page
  223 |       .getByRole('button', { name: 'Redo project edit', exact: true })
  224 |       .click();
  225 |     await expect.poll(() => readSource(page)).toBe(finalSource);
  226 |     await settle(page);
  227 |     await page.screenshot({ path: resolve(output, 'after.png') });
  228 |     await writeFile(resolve(output, 'final-source.yaml'), finalSource);
  229 |     await page.reload();
  230 |     await expect(keys(page)).toHaveCount(total);
  231 |     expect(await readSource(page)).toBe(finalSource);
  232 |     if (process.env.PERF_NATIVE_ROWS) await verifyComponentMove(page, output);
  233 |     expect(errors).toEqual([]);
  234 |   } finally {
  235 |     await writeFile(
  236 |       resolve(output, 'worker-packets.json'),
  237 |       JSON.stringify(await page.evaluate(() => window.studioPackets), null, 2)
  238 |     );
  239 |     await writeFile(
  240 |       resolve(output, 'last-source.yaml'),
  241 |       await readSource(page)
  242 |     );
  243 |     await writeFile(
  244 |       resolve(output, 'timings.json'),
  245 |       JSON.stringify({ results, errors }, null, 2)
  246 |     );
  247 |     await page.screenshot({ path: resolve(output, 'last-state.png') });
  248 |   }
  249 | });
  250 | 
```