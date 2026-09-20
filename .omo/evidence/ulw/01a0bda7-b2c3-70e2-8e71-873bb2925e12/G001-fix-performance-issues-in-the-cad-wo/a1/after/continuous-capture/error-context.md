# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: perf-continuous-capture.spec.ts >> keeps drags, nudges and inspector edits through delayed outline updates
- Location: e2e/perf-continuous-capture.spec.ts:165:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('group', { name: 'Interactive board layout' }).locator(':scope > g[transform="scale(1,-1)"][pointer-events="none"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('group', { name: 'Interactive board layout' }).locator(':scope > g[transform="scale(1,-1)"][pointer-events="none"]')

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
        - button "Inspector" [ref=e136] [cursor=pointer]:
          - img [ref=e137]
          - text: Inspector
        - button "Part library" [ref=e138] [cursor=pointer]:
          - img [ref=e139]
          - text: Part library
    - alert [ref=e144]:
      - text: "designs.boundaries.main_edge: Expected one connected region; found 2"
      - button "Retry board analysis" [ref=e145] [cursor=pointer]
    - main [ref=e147]:
      - generic "Outline controls" [ref=e148]:
        - generic [ref=e149]:
          - checkbox "Automatic outline" [checked] [ref=e150]
          - text: Automatic outline
        - button "Retry outline" [ref=e151] [cursor=pointer]
      - status [ref=e152]:
        - text: Showing the last valid geometry.
        - button "Retry analysis" [ref=e153] [cursor=pointer]
      - generic [ref=e154]:
        - toolbar "Canvas tools" [ref=e155]:
          - generic [ref=e156]:
            - button "Select Objects" [pressed] [ref=e157] [cursor=pointer]:
              - img [ref=e158]
            - button "Select Columns" [ref=e160] [cursor=pointer]:
              - img [ref=e161]
            - button "Select Rows" [ref=e163] [cursor=pointer]:
              - img [ref=e164]
            - button "Select Matrices" [ref=e166] [cursor=pointer]:
              - img [ref=e167]
            - button "Pan" [ref=e169] [cursor=pointer]:
              - img [ref=e170]
          - toolbar "Snapping" [ref=e175]:
            - button "Snapping" [ref=e176] [cursor=pointer]:
              - img [ref=e177]
            - button "Snapping settings" [ref=e181] [cursor=pointer]:
              - img [ref=e182]
            - region [ref=e184]:
              - generic [ref=e185]:
                - strong [ref=e186]: Snapping
                - button [ref=e187] [cursor=pointer]:
                  - img [ref=e188]
              - group [ref=e191]:
                - button [disabled] [ref=e192]: 1u
                - button [disabled] [ref=e193]: ½u
                - button [disabled] [ref=e194]: ¼u
                - button [disabled] [ref=e195]: ⅛u
              - generic [ref=e196]:
                - generic [ref=e197]:
                  - checkbox [checked] [ref=e198]
                  - text: Grid
                - generic [ref=e199]:
                  - checkbox [checked] [ref=e200]
                  - text: Centers
                - generic [ref=e201]:
                  - checkbox [ref=e202]
                  - text: Origins
                - generic [ref=e203]:
                  - checkbox [checked] [ref=e204]
                  - text: Edges
              - generic [ref=e205]:
                - text: Increment · mm
                - spinbutton [ref=e206]: "1"
              - generic [ref=e207]:
                - text: Edge gap · mm
                - spinbutton [ref=e208]: "2"
              - group [ref=e209]:
                - generic [ref=e210] [cursor=pointer]: Alt bypasses snapping · Help
        - toolbar "View controls" [ref=e211]:
          - button "Side" [ref=e212] [cursor=pointer]
          - button "Fit layout" [ref=e213] [cursor=pointer]:
            - img [ref=e214]
          - button "Zoom out" [ref=e219] [cursor=pointer]:
            - img [ref=e220]
          - generic [ref=e221]: 105%
          - button "Zoom in" [ref=e222] [cursor=pointer]:
            - img [ref=e223]
        - group "Interactive board layout" [ref=e224]:
          - button "Select fingers_c1_r1" [ref=e226]
          - button "Select fingers_c1_r2" [ref=e228]
          - button "Select fingers_c1_r3" [ref=e230]
          - button "Select fingers_c1_r4" [ref=e232]
          - button "Select fingers_c1_r5" [ref=e234]
          - button "Select fingers_c2_r1" [ref=e236]
          - button "Select fingers_c2_r2" [ref=e238]
          - button "Select fingers_c2_r3" [ref=e240]
          - button "Select fingers_c2_r4" [ref=e242]
          - button "Select fingers_c2_r5" [ref=e244]
          - button "Select fingers_c3_r1" [ref=e246]
          - button "Select fingers_c3_r2" [ref=e248]
          - button "Select fingers_c3_r3" [ref=e250]
          - button "Select fingers_c3_r4" [ref=e252]
          - button "Select fingers_c3_r5" [ref=e254]
          - button "Select fingers_c4_r1" [ref=e256]
          - button "Select fingers_c4_r2" [ref=e258]
          - button "Select fingers_c4_r3" [ref=e260]
          - button "Select fingers_c4_r4" [ref=e262]
          - button "Select fingers_c4_r5" [ref=e264]
          - button "Select fingers_c5_r1" [ref=e266]
          - button "Select fingers_c5_r2" [ref=e268]
          - button "Select fingers_c5_r3" [ref=e270]
          - button "Select fingers_c5_r4" [ref=e272]
          - button "Select fingers_c5_r5" [ref=e274]
          - button "Select fingers_c6_r1" [ref=e276]
          - button "Select fingers_c6_r2" [ref=e278]
          - button "Select fingers_c6_r3" [ref=e280]
          - button "Select fingers_c6_r4" [ref=e282]
          - button "Select fingers_c6_r5" [ref=e284]
          - button "Select fingers_c7_r1" [ref=e286]
          - button "Select fingers_c7_r2" [ref=e288]
          - button "Select fingers_c7_r3" [ref=e290]
          - button "Select fingers_c7_r4" [ref=e292]
          - button "Select fingers_c7_r5" [ref=e294]
          - button "Select matrix_c1_r1" [ref=e296]
          - button "Select matrix_c1_r2" [ref=e298]
          - button "Select matrix_c2_r1" [pressed] [ref=e300]
          - button "Select matrix_c2_r2" [ref=e303]
    - status "Project status" [ref=e305]:
      - generic [ref=e306]: Layout analysis failed · 39 keys
      - button "Review analysis error" [ref=e307] [cursor=pointer]
```

# Test source

```ts
  1   | import { writeFile } from 'node:fs/promises';
  2   | import { expect, test, type Page } from '@playwright/test';
  3   | import { parse } from 'yaml';
  4   | import { addCluster, addOutline } from '../src/utils/studioSource';
  5   | import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
  6   | import { openInspector, readSource } from './utils/studio';
  7   | 
  8   | test.setTimeout(120000);
  9   | const RESPONSE_DELAY_MS = 2000;
  10  | const initial = addOutline(
  11  |   addCluster(
  12  |     'schema: ergogen/v1\nlayout: {objects: {}}\npcbs: {main: {}}\n',
  13  |     'fingers',
  14  |     'columns',
  15  |     { columns: 7, rows: 5 }
  16  |   )
  17  | );
  18  | const canvas = (page: Page) =>
  19  |   page.getByRole('group', { name: 'Interactive board layout' });
  20  | const outline = (page: Page) =>
  21  |   canvas(page).locator(
  22  |     ':scope > g[transform="scale(1,-1)"][pointer-events="none"]'
  23  |   );
  24  | 
  25  | async function visibleOutline(page: Page) {
  26  |   // Horizontal SVG segments have zero-height bounds; inspect their enclosing drawing.
> 27  |   await expect(outline(page)).toBeVisible();
      |                               ^ Error: expect(locator).toBeVisible() failed
  28  |   await expect(outline(page).locator('polyline').first()).toHaveAttribute(
  29  |     'points',
  30  |     /[-\d.]+,[-\d.]+/
  31  |   );
  32  | }
  33  | 
  34  | async function snapMillimeter(page: Page) {
  35  |   const snapping = page.getByRole('toolbar', { name: 'Snapping' });
  36  |   await snapping
  37  |     .getByRole('button', { name: 'Snapping settings', exact: true })
  38  |     .click();
  39  |   await snapping.getByLabel('Custom snap increment').fill('1');
  40  |   await snapping
  41  |     .getByRole('button', { name: 'Snapping settings', exact: true })
  42  |     .click();
  43  | }
  44  | 
  45  | async function open(page: Page, source = initial) {
  46  |   await page.addInitScript(
  47  |     ({ key, source }) => {
  48  |       localStorage.setItem(key, JSON.stringify(source));
  49  |       const state = window as Window & {
  50  |         studioDelay: number;
  51  |         studioRequests: number;
  52  |       };
  53  |       state.studioDelay = 0;
  54  |       state.studioRequests = 0;
  55  |       const NativeWorker = window.Worker;
  56  |       window.Worker = class extends NativeWorker {
  57  |         constructor(url: string | URL, options?: WorkerOptions) {
  58  |           super(url, options);
  59  |           let handler: ((event: MessageEvent) => void) | null = null;
  60  |           let studio = false;
  61  |           const post = this.postMessage.bind(this);
  62  |           this.postMessage = ((
  63  |             message: { type?: string },
  64  |             ...args: unknown[]
  65  |           ) => {
  66  |             if (message.type === 'studio') {
  67  |               studio = true;
  68  |               state.studioRequests += 1;
  69  |             }
  70  |             post(message, ...(args as [Transferable[]]));
  71  |           }) as Worker['postMessage'];
  72  |           Object.defineProperty(this, 'onmessage', {
  73  |             get: () => handler,
  74  |             set: (next) => {
  75  |               handler = next;
  76  |             },
  77  |           });
  78  |           this.addEventListener('message', (event) => {
  79  |             if (!studio || !state.studioDelay) {
  80  |               handler?.(event);
  81  |               return;
  82  |             }
  83  |             const captured = handler;
  84  |             setTimeout(() => captured?.(event), state.studioDelay);
  85  |           });
  86  |         }
  87  |       };
  88  |     },
  89  |     { key: CONFIG_LOCAL_STORAGE_KEY, source }
  90  |   );
  91  |   await page.goto('./');
  92  |   await expect(
  93  |     page.getByRole('checkbox', { name: 'Automatic outline' })
  94  |   ).toBeEnabled();
  95  |   await visibleOutline(page);
  96  |   await expect(page.getByText(/^Updating (layout|outline)…$/)).toHaveCount(0);
  97  | }
  98  | 
  99  | test('persists rapid moves through delayed analysis, undo and reload', async ({
  100 |   page,
  101 | }) => {
  102 |   await open(
  103 |     page,
  104 |     addOutline(
  105 |       addCluster(
  106 |         'schema: ergogen/v1\nlayout: {objects: {}}\npcbs: {main: {}}\n',
  107 |         'single',
  108 |         'columns',
  109 |         { columns: 1, rows: 1 }
  110 |       )
  111 |     )
  112 |   );
  113 |   await snapMillimeter(page);
  114 |   await page.evaluate((delay) => {
  115 |     (window as Window & { studioDelay: number }).studioDelay = delay;
  116 |   }, RESPONSE_DELAY_MS);
  117 |   await page
  118 |     .getByRole('button', { name: 'Select Objects', exact: true })
  119 |     .click();
  120 |   const key = page.getByRole('button', {
  121 |     name: 'Select single_c1_r1',
  122 |     exact: true,
  123 |   });
  124 |   await key.click();
  125 |   const camera = await canvas(page).getAttribute('viewBox');
  126 |   const position = async () =>
  127 |     parse(await readSource(page)).layout.objects.single_c1_r1.placement
```