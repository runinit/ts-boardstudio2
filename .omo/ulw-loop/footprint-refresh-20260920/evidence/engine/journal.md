# Engine debugging evidence
Runtime: Node 24.14.0, Mocha source loader; no debugger or server needed.
References read: debugging Node runtime and phases setup/investigate/fix/QA/cleanup.
Hypotheses: (1) mathjs returns NaN for F&B and inference accepts it; (2) template utility erases unknown fields; (3) importer treats blank numbers as mechanical independently of copper layers. Distinguishing regressions invoke engine source directly and native PCB export.
Artifacts: retained focused regression file and RED/GREEN logs in this evidence directory; no temporary instrumentation, processes, or environment mutations.

## Verified outcome
RED: five regressions failed before production changes, including NaN !== F&B, missing finite-number/template exceptions, blank copper misclassification, and native backend unresolved net 41.
GREEN: 76 tests passed across footprint_refresh, footprint_tools, kicad10, native, native_regressions, native_models, native_model_defaults, native_outline_cache (Node24, 16 seconds). Focused rerun passed 7 tests.
Native process integration generated a board with distinct SIGNAL_0 and SIGNAL_1 connections, blank pads shared the correct original net group, stale source IDs removed, NPTH remained unconnected. Separate standalone import test covers unrelated blank pads and shared numbered pads. Unknown-ID backend rejection remains active.
No debug instrumentation or temporary processes were created. No app, footprint sources, schemas, or manifests edited by this worker. Inspection geometry extension is handed off separately.

## Saved mapping roundtrip correction
Root review identified number-keyed mapping collision for separate blank copper groups. RED roundtrip test failed with Invalid net parameter: pad_net_2. Added optional collision-safe nets.mappingKey for blank-only groups (@pad:firstIndex), preserving numbered mapping API. Convert persists and consumes these group keys; generated module continues authoritative pad-index remapping. GREEN 30 tests (footprint_refresh, footprint_tools, kicad10), including convert -> saved mapping -> convert -> native A/B board connections. App consumers need mappingKey ?? number; root notified for library ownership routing.
