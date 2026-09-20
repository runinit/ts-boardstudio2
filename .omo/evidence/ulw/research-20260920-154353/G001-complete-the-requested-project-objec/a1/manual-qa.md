# Manual QA: rendered Markdown report

The current report source is `.omo/ulw-research/20260920-154353/SYNTHESIS.md`. The renderer and Playwright probe ran after the citation-reference correction and responsive figure/table changes. Source-page screenshots were reused from the prior verified fetch and copied into this research-attempt directory; no source fetch was repeated in this delta.

## manualQa

### surfaceEvidence

| Scenario | Criterion reference | Surface | Exact invocation | Verdict | Artifact refs |
|---|---|---|---|---|---|
| RQ-001 | Report render / desktop readability | Desktop browser, 1440x1000 | `uv run --with markdown python .omo/teams/team-093fd156/artifacts/render_report.py .omo/ulw-research/20260920-154353/SYNTHESIS.md --out-dir .omo/teams/team-093fd156/artifacts/report-render` then `node .omo/teams/team-093fd156/artifacts/qa_report.mjs --html .omo/teams/team-093fd156/artifacts/report-render/report.html --out-dir .omo/evidence/ulw/research-20260920-154353/G001-complete-the-requested-project-objec/a1/report-qa --source-limit 0 --source-manifest .omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/report-qa/qa-results.json` | PASS | `qa-results.json`, `desktop-full.png`, `desktop/section-001.png` through `desktop/section-009.png` |
| RQ-002 | Report render / mobile readability | Mobile browser, 390x844 | Same render and probe invocation as RQ-001; probe viewport `390x844` | PASS | `qa-results.json`, `responsive-details.txt`, `mobile-full.png`, `mobile/section-001.png` through `mobile/section-020.png` |
| RQ-003 | Citation integrity | Rendered report links | Same render and probe invocation as RQ-001; probe compares every rendered `S##` href/title with the 34 source definitions in SYNTHESIS.md | PASS | `qa-results.json` (`citationRenderedCount=65`, `citationMismatches=0`), `report.html` |
| RQ-004 | Report assets and local links | Local browser DOM and filesystem | Same probe invocation as RQ-001; file-link existence check over rendered links | PASS | `qa-results.json`, `file-link-check.txt`, `report.html` |
| RQ-005 | Primary source references | External source screenshots reused from prior verified fetch | Source manifest supplied to probe with `--source-limit 0`; copied source PNGs have current research-attempt paths | PASS with one recorded inaccessible source | `qa-results.json`, `source-01.png`, `source-02.png`, `source-03.png`, `source-04.png`, `source-05.png` |

### adversarialCases

| Scenario | Criterion reference | Adversarial class | Expected behavior | Verdict | Artifact refs |
|---|---|---|---|---|---|
| ADV-001 | Report render | Narrow mobile viewport | Page root remains within viewport; charts remain at least 700px intrinsic width inside keyboard-focusable horizontal regions with an explicit cue | PASS | `qa-results.json`, `responsive-details.txt`, `mobile-full.png` |
| ADV-002 | Report render | Wide data table on mobile | Table is contained in a keyboard-focusable horizontal region with a visible scroll cue; page root does not overflow | PASS | `qa-results.json`, `responsive-details.txt`, `mobile/section-014.png` |
| ADV-003 | Citation integrity | Adjacent shortcut-reference parsing | Every rendered `S##` anchor resolves to the exact definition href and title; zero mismatches | PASS | `qa-results.json` (`citationMismatches=0`) |
| ADV-004 | Report assets | Broken local images | Every rendered report image completes with non-zero natural dimensions | PASS | `qa-results.json` (`brokenImages=[]`), `desktop-full.png` |
| ADV-005 | Report integrity | Missing local links | Every `file://` report link target exists on disk | PASS | `file-link-check.txt`, `qa-results.json` |
| ADV-006 | Source evidence | HTTP access failure | An inaccessible referenced source is recorded with URL/status instead of being treated as captured | PASS | `qa-results.json` (`source-04`, HTTP 403), `source-04.png` |
| ADV-007 | Capture integrity | Wrong image signature or stale section | Captures are non-empty PNGs at requested viewport dimensions, with no stale section beyond the current measured count | PASS | `capture-signatures.txt`, `qa-results.json` |

### artifactRefs

| ID | Kind | Description | Path |
|---|---|---|---|
| A01 | qa-json | Fresh Playwright metrics, citation audit, captures, image/link checks, and source status records | `.omo/evidence/ulw/research-20260920-154353/G001-complete-the-requested-project-objec/a1/report-qa/qa-results.json` |
| A02 | html | Fresh rendered HTML report | `.omo/teams/team-093fd156/artifacts/report-render/report.html` |
| A03 | screenshot | Complete desktop report, 1440px viewport | `.omo/evidence/ulw/research-20260920-154353/G001-complete-the-requested-project-objec/a1/report-qa/desktop-full.png` |
| A04 | screenshot | Complete mobile report, 390px viewport | `.omo/evidence/ulw/research-20260920-154353/G001-complete-the-requested-project-objec/a1/report-qa/mobile-full.png` |
| A05 | screenshots | All nine current desktop viewport sections | `.omo/evidence/ulw/research-20260920-154353/G001-complete-the-requested-project-objec/a1/report-qa/desktop/` |
| A06 | screenshots | All twenty current mobile viewport sections | `.omo/evidence/ulw/research-20260920-154353/G001-complete-the-requested-project-objec/a1/report-qa/mobile/` |
| A07 | source-captures | Four accessible full-page primary-source screenshots plus one HTTP 403 response capture | `.omo/evidence/ulw/research-20260920-154353/G001-complete-the-requested-project-objec/a1/report-qa/source-01.png` through `source-05.png` |
| A08 | verification | File-link target existence check | `.omo/evidence/ulw/research-20260920-154353/G001-complete-the-requested-project-objec/a1/report-qa/file-link-check.txt` |
| A09 | verification | PNG signatures and dimensions for current captures | `.omo/evidence/ulw/research-20260920-154353/G001-complete-the-requested-project-objec/a1/report-qa/capture-signatures.txt` |
| A10 | verification | Root overflow, chart intrinsic width, and contained table overflow measurements | `.omo/evidence/ulw/research-20260920-154353/G001-complete-the-requested-project-objec/a1/report-qa/responsive-details.txt` |

## Surface facts

- Desktop measured 1,440×7,705 and yielded 9 viewport sections; mobile measured 390×14,857 and yielded 20 viewport sections.
- Both roots reported `horizontalOverflow=false`; all report images loaded with non-zero dimensions.
- Mobile rendered all three charts at 700px intrinsic width inside 338px keyboard-focusable overflow regions with an explicit scroll cue.
- The mobile data table is contained in a 338px keyboard-focusable overflow region with `scrollWidth=1,834` and an explicit scroll cue.
- The report has 34 source definitions and 65 rendered `S##` citation occurrences; every href/title pair matched exactly (`citationMismatches=0`).
- There were 52 local file links and no missing targets. Four reused primary-source screenshots are HTTP 200 captures; the W3C Pointer Events page returned HTTP 403 and is recorded as inaccessible.
- All current captures are non-empty PNG files at the requested viewport dimensions. No QA or browser process remains running.
