# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-continuous.spec.ts >> keeps drags, nudges and inspector edits through delayed outline updates
- Location: e2e/studio-continuous.spec.ts:164:5

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
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import { parse } from 'yaml';
  3   | import { addCluster, addOutline } from '../src/utils/studioSource';
  4   | import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/constants';
  5   | import { openInspector, readSource } from './utils/studio';
  6   | 
  7   | test.setTimeout(120000);
  8   | const RESPONSE_DELAY_MS = 2000;
  9   | const initial = addOutline(
  10  |   addCluster(
  11  |     'schema: ergogen/v1\nlayout: {objects: {}}\npcbs: {main: {}}\n',
  12  |     'fingers',
  13  |     'columns',
  14  |     { columns: 7, rows: 5 }
  15  |   )
  16  | );
  17  | const canvas = (page: Page) =>
  18  |   page.getByRole('group', { name: 'Interactive board layout' });
  19  | const outline = (page: Page) =>
  20  |   canvas(page).locator(
  21  |     ':scope > g[transform="scale(1,-1)"][pointer-events="none"]'
  22  |   );
  23  | 
  24  | async function visibleOutline(page: Page) {
  25  |   // Horizontal SVG segments have zero-height bounds; inspect their enclosing drawing.
> 26  |   await expect(outline(page)).toBeVisible();
      |                               ^ Error: expect(locator).toBeVisible() failed
  27  |   await expect(outline(page).locator('polyline').first()).toHaveAttribute(
  28  |     'points',
  29  |     /[-\d.]+,[-\d.]+/
  30  |   );
  31  | }
  32  | 
  33  | async function snapMillimeter(page: Page) {
  34  |   const snapping = page.getByRole('toolbar', { name: 'Snapping' });
  35  |   await snapping
  36  |     .getByRole('button', { name: 'Snapping settings', exact: true })
  37  |     .click();
  38  |   await snapping.getByLabel('Custom snap increment').fill('1');
  39  |   await snapping
  40  |     .getByRole('button', { name: 'Snapping settings', exact: true })
  41  |     .click();
  42  | }
  43  | 
  44  | async function open(page: Page, source = initial) {
  45  |   await page.addInitScript(
  46  |     ({ key, source }) => {
  47  |       localStorage.setItem(key, JSON.stringify(source));
  48  |       const state = window as Window & {
  49  |         studioDelay: number;
  50  |         studioRequests: number;
  51  |       };
  52  |       state.studioDelay = 0;
  53  |       state.studioRequests = 0;
  54  |       const NativeWorker = window.Worker;
  55  |       window.Worker = class extends NativeWorker {
  56  |         constructor(url: string | URL, options?: WorkerOptions) {
  57  |           super(url, options);
  58  |           let handler: ((event: MessageEvent) => void) | null = null;
  59  |           let studio = false;
  60  |           const post = this.postMessage.bind(this);
  61  |           this.postMessage = ((
  62  |             message: { type?: string },
  63  |             ...args: unknown[]
  64  |           ) => {
  65  |             if (message.type === 'studio') {
  66  |               studio = true;
  67  |               state.studioRequests += 1;
  68  |             }
  69  |             post(message, ...(args as [Transferable[]]));
  70  |           }) as Worker['postMessage'];
  71  |           Object.defineProperty(this, 'onmessage', {
  72  |             get: () => handler,
  73  |             set: (next) => {
  74  |               handler = next;
  75  |             },
  76  |           });
  77  |           this.addEventListener('message', (event) => {
  78  |             if (!studio || !state.studioDelay) {
  79  |               handler?.(event);
  80  |               return;
  81  |             }
  82  |             const captured = handler;
  83  |             setTimeout(() => captured?.(event), state.studioDelay);
  84  |           });
  85  |         }
  86  |       };
  87  |     },
  88  |     { key: CONFIG_LOCAL_STORAGE_KEY, source }
  89  |   );
  90  |   await page.goto('./');
  91  |   await expect(
  92  |     page.getByRole('checkbox', { name: 'Automatic outline' })
  93  |   ).toBeEnabled();
  94  |   await visibleOutline(page);
  95  |   await expect(page.getByText(/^Updating (layout|outline)…$/)).toHaveCount(0);
  96  | }
  97  | 
  98  | test('persists rapid moves through delayed analysis, undo and reload', async ({
  99  |   page,
  100 | }) => {
  101 |   await open(
  102 |     page,
  103 |     addOutline(
  104 |       addCluster(
  105 |         'schema: ergogen/v1\nlayout: {objects: {}}\npcbs: {main: {}}\n',
  106 |         'single',
  107 |         'columns',
  108 |         { columns: 1, rows: 1 }
  109 |       )
  110 |     )
  111 |   );
  112 |   await snapMillimeter(page);
  113 |   await page.evaluate((delay) => {
  114 |     (window as Window & { studioDelay: number }).studioDelay = delay;
  115 |   }, RESPONSE_DELAY_MS);
  116 |   await page
  117 |     .getByRole('button', { name: 'Select Objects', exact: true })
  118 |     .click();
  119 |   const key = page.getByRole('button', {
  120 |     name: 'Select single_c1_r1',
  121 |     exact: true,
  122 |   });
  123 |   await key.click();
  124 |   const camera = await canvas(page).getAttribute('viewBox');
  125 |   const position = async () =>
  126 |     parse(await readSource(page)).layout.objects.single_c1_r1.placement
```