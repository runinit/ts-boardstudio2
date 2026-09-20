# Manual QA: rendered Markdown report

The report source was rendered from `.omo/ulw-research/20260920-154353/SYNTHESIS.md` after the final assembly. The browser surface is a local HTML report opened with Playwright Chromium.

## manualQa

### surfaceEvidence

| Scenario | Criterion reference | Surface | Exact invocation | Verdict | Artifact refs |
|---|---|---|---|---|---|
| RQ-001 | Report render / desktop readability | Desktop browser, 1440x1000 | `uv run --with markdown python .omo/teams/team-093fd156/artifacts/render_report.py .omo/ulw-research/20260920-154353/SYNTHESIS.md --out-dir .omo/teams/team-093fd156/artifacts/report-render` then `node .omo/teams/team-093fd156/artifacts/qa_report.mjs --html .omo/teams/team-093fd156/artifacts/report-render/report.html --out-dir .omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa --source-limit 5` | PASS | `qa-results.json`, `desktop-full.png`, `desktop/section-001.png` through `section-010.png` |
| RQ-002 | Report render / mobile readability | Mobile browser, 390x844 | Same render and probe invocation as RQ-001; probe viewport `390x844` | PASS; one wide table uses contained horizontal scrolling | `qa-results.json`, `responsive-details.txt`, `mobile-full.png`, `mobile/section-001.png` through `section-021.png` |
| RQ-003 | Report assets and links | Local browser DOM and filesystem | Probe invocation from RQ-001; file-link existence check over `qa-results.json` | PASS | `qa-results.json`, `report.html`, `outline-observations.png`, `drag-observations.png`, `file-link-check.txt` |
| RQ-004 | Primary source references | External browser pages | Probe invocation from RQ-001; first five unique `https://` report links opened with Playwright and full-page screenshot requested | PASS with one recorded inaccessible source | `qa-results.json`, `source-01.png`, `source-02.png`, `source-03.png`, `source-04.png`, `source-05.png` |

### adversarialCases

| Scenario | Criterion reference | Adversarial class | Expected behavior | Verdict | Artifact refs |
|---|---|---|---|---|---|
| ADV-001 | Report render | Narrow mobile viewport | Text and tables remain within the viewport; no horizontal document overflow | PASS | `qa-results.json` (`mobile.horizontalOverflow=false`), `mobile-full.png` |
| ADV-002 | Report render | Broken local images | Every rendered image completes with non-zero natural dimensions | PASS | `qa-results.json` (`brokenImages=[]`), `desktop-full.png` |
| ADV-003 | Report integrity | Missing local links | Every `file://` link target exists on disk | PASS | `file-link-check.txt`, `qa-results.json` |
| ADV-004 | Source evidence | HTTP access failure | An inaccessible referenced source is recorded with URL/status rather than treated as captured | PASS | `qa-results.json` (`source-04`, HTTP 403), `source-04.png` |
| ADV-005 | Capture integrity | Wrong image signature or viewport | Captures are non-empty PNGs at requested viewport dimensions; full captures match document dimensions | PASS | `capture-signatures.txt`, `qa-results.json` |

### artifactRefs

| ID | Kind | Description | Path |
|---|---|---|---|
| A01 | qa-json | Playwright metrics, captures, image/link checks, and source-page status records | `.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa/qa-results.json` |
| A02 | html | Temporary rendered HTML report for review/archive | `.omo/teams/team-093fd156/artifacts/report-render/report.html` |
| A03 | screenshot | Complete desktop report, 1440px viewport | `.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa/desktop-full.png` |
| A04 | screenshot | Complete mobile report, 390px viewport | `.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa/mobile-full.png` |
| A05 | screenshots | All ten desktop viewport sections | `.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa/desktop/` |
| A06 | screenshots | All twenty-one mobile viewport sections | `.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa/mobile/` |
| A07 | source-captures | Four accessible full-page primary-source screenshots plus one 403 response capture | `.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa/source-01.png` through `source-05.png` |
| A08 | verification | File-link target existence check | `.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa/file-link-check.txt` |
| A09 | verification | PNG signatures and dimensions for all captures | `.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa/capture-signatures.txt` |
| A10 | verification | Root overflow and contained mobile table overflow measurements | `.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa/responsive-details.txt` |

## Surface facts

- The desktop document was 1,440px wide by 8,423px high and yielded 10 viewport sections.
- The mobile document was 390px wide by 15,355px high and yielded 21 viewport sections.
- Both viewports reported `horizontalOverflow=false`; all report images loaded with non-zero dimensions.
- The mobile table is wider than its card (`scrollWidth=524`, `clientWidth=338`) but is contained in an `overflow-x:auto` element; the document root remains exactly 390px wide.
- There were 52 local file links and no missing targets. Five external links were attempted: four returned HTTP 200 and one returned HTTP 403 from `https://www.w3.org/TR/pointerevents3/`; that source is recorded as inaccessible.
- All section/full/source captures are non-empty PNG files. Full-page report captures match the measured document dimensions.
