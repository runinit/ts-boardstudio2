# Execution refinement

## Verdict

**CORRECTIONS REQUIRED.** The retained execution artifacts are reproducible, but the
keepout interpretation in `AUDIT.md` is false and two switch-result field names are
broader than their implemented checks.

## Replay evidence

Runtime: `/home/chris/.nvm/versions/node/v24.14.0/bin/node` (`v24.14.0`).

Scratch directory: `/tmp/boardstudio-footprint-verify.BYQmQu`. The journal was not
modified. `verify-local.cjs` was copied to the scratch directory so its `__dirname`
writes went to `/tmp`.

Fresh outputs compared byte-for-byte equal to retained outputs:

| Artifact | SHA-256 |
| --- | --- |
| `verify-switches.jsonl` | `39c992f6cade4999148249960acfe809deae029d59d0a205150e6d44f20458e2` |
| `verify-switches-upstream.jsonl` | `7f1e492175100f588af39008c608e61406b3599f7bd8a48ed57c290bbe2916aa` |
| `verify-local.json` | `19ebd04c2978ff0c0366d601b2ba1581df4c0002c7c22fcd5f3adacf0e0ab5ea` |
| `assets/six_pads_defaults.kicad_pcb` | `16989bc34accb99cfadbe350c2e195c07ce40fc1d81a815f60d6e0d5ea0f21f9` |

The other three saved PCB assets (`padless_diode`, ceoloide nice!nano, and
infused-kim nice!nano) also passed `cmp` against the fresh scratch outputs.

The pinned switch sources were fetched from ceoloide commit
`48935f54b456ff1503d78d6b17d9d146b54e8ade` before the upstream replay. Their
hashes matched the provenance data:

- `switch_mx.js`: `6921ae4671c77292f5c970e726f15c93bd600f120b72a67167647cad64466156`
- `switch_choc_v1_v2.js`: `26b32559b9724dc6106190aedcd710e19a304e6bb16036708f41d2d4369c36c9`

The 15 local and upstream switch case records are identical after excluding the
source-hash header. Each case executes rotations 0, 37, and 90, so the retained
counts of 45 local and 45 pinned-upstream generations are correct.

## Local count derivation

The manifest contains 39 modules. The script derives 128 generic variants:

- 6 modules with one case
- 5 modules with two cases
- 28 modules with four cases

Four focused cases bring the total to 132. The fresh JSON has 132 unique labels,
131 `ok:true` results, and one caught error. These counts are correct.

`verify-local.cjs` is an observational probe rather than a pass/fail gate: `run()`
catches per-case exceptions, and the top-level script still exits zero. Its
summarizer only inventories footprints, segments, and vias; it does not inspect
zones.

## Six-pad defaults

The `six_pads_defaults` result really uses source defaults. Although the focused
call text includes six `net_*` values, the special-case loop deletes every
`net_*` key before `engine.process`. The retained result records only
`params:{pads:6}`.

Pinned upstream `pads.js` at infused-kim commit
`bb80a207d8a6fa7b9245caad2c2d97e2adc2f612` is byte-identical to the local file
(`3953d2102230825d765ae1567c8085264b83f2b8de085ea21cfb0bcb064b1234`). An
independent generation using that downloaded upstream module and only `{pads:6}`
was byte-identical to the retained PCB. It contains 12 pads (six per face); front
pads 5 and 6 both use `PAD_5`, while the mirrored back face preserves that alias.

## Required correction: keepout is not an intentional valid negative

The harness intentionally creates a generic `side:'B'` variant for every module
that declares `side`, so the single caught case is mechanically intentional. Its
rejection is not correct behavior for this footprint:

- `utility_keepout_zone.js` documents `F`, `B`, or `F&B` and defaults to `F&B`.
- The local source is byte-identical to pinned upstream.
- `engine/src/assert.js` sends the string `F&B` through mathjs; it evaluates to
  `NaN`, whose JavaScript type is `number`. Parameter inference therefore treats
  `side` as numeric and rejects the documented `B` override.
- Direct execution of the default case emits `(layers "NaN.Cu")`.
- `verify-local` reports the default as successful because its summarizer ignores
  zones entirely.

Therefore `AUDIT.md` statements that the side parameter is numeric and the B case
was correctly rejected must be replaced with an integration/type-inference defect:
documented F/B overrides reject, while the default silently emits an invalid layer.
The observed 132/131 counts can remain, with this corrected interpretation.

## Switch harness scope

The switch replay is honest for its selected measurements, with two naming caveats:

- `bodyEqualsNative:true` compares `summarize(emitted)` with
  `summarize(result.pcbs.main)`; it is summary equality, not raw body/board equality.
- `rotationsPass` compares those selected summaries across rotations; it does not
  compare the complete generated boards.

The retained script has no endpoint/via connectivity graph. It measures exact
pad-center/segment-endpoint net-tag mismatches, unlike-tagged shared segment
endpoints, and via counts. The `AUDIT.md` assertion that an independent endpoint/via
graph proved the geometric chains connect corresponding nets has no retained replay
artifact and should be narrowed or backed by a retained script/output.
