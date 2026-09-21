# Fresh upstream reference — 20 September 2026

Read-only GitHub inspection used `gh api repos/{owner}/{repo}/commits/HEAD`, open issue/PR listings, PR metadata/files, and raw pinned source downloads. No product code changed.

Both current upstream HEADs exactly equal the inventory pins:

- Ceoloide: [`48935f54b456ff1503d78d6b17d9d146b54e8ade`](https://github.com/ceoloide/ergogen-footprints/commit/48935f54b456ff1503d78d6b17d9d146b54e8ade), committed 2026-05-26.
- Infused-Kim: [`bb80a207d8a6fa7b9245caad2c2d97e2adc2f612`](https://github.com/infused-kim/kb_ergogen_fp/commit/bb80a207d8a6fa7b9245caad2c2d97e2adc2f612), committed 2024-06-24.

Downloaded all 39 pinned upstream files and compared SHA-256 against either `patches.json` original hashes or the unpatched inventory hash: 39 checked, 12 unpatched, 27 patched, zero mismatches. No newer mainline changes are available. Retain source pins and original hashes while documenting local corrections.

## Relevant open proposals

- [Ceoloide PR82](https://github.com/ceoloide/ergogen-footprints/pull/82), open/unmerged: the Choc back full pad net becomes `p.hotswap_pads_same_side ? p.to.str : p.from.str`. Matches the confirmed audit defect. [Immutable source](https://github.com/ceoloide/ergogen-footprints/blob/fffe4c8f7d8c5a2dfabc27dcbad6172733a10852/switch_choc_v1_v2.js#L352).
- [Infused PR4](https://github.com/infused-kim/kb_ergogen_fp/pull/4), open/unmerged: declare loop variables `pin_name_left` and `pin_name_right`. These remain undeclared in the inspected local MCU file. [Immutable source](https://github.com/infused-kim/kb_ergogen_fp/blob/c7a40cbd5419e37bcc962e7efaaf518f6e1285c1/nice_nano_pretty.js#L435).
- [Infused PR3](https://github.com/infused-kim/kb_ergogen_fp/pull/3), open/unmerged: add custom jumper-pad rotations. Already applied locally; preserve. [Immutable source](https://github.com/infused-kim/kb_ergogen_fp/blob/9c11cb9139cf22f96b7254e13c345e15e42caa67/nice_nano_pretty.js).
- [Infused PR2](https://github.com/infused-kim/kb_ergogen_fp/pull/2), open/unmerged: increase generated track precision from two to three decimals. Locally still two; candidate for rotated connectivity verification, separate from hardcoded net-ID repair. [Immutable source](https://github.com/infused-kim/kb_ergogen_fp/blob/e698ccfe4e2c855c2d71017e23033348bfbb3ca3/nice_nano_pretty.js#L153).
- [Ceoloide PR77](https://github.com/ceoloide/ergogen-footprints/pull/77), open/unmerged: make back silk label swapping conditional on reversible/reverse mounting. Proposal needs label-to-pad verification before adoption. [Immutable source](https://github.com/ceoloide/ergogen-footprints/blob/bc0024d4661a635270d550cff8f412035f4748c5/mcu_nice_nano.js#L265).
- [Ceoloide issue80](https://github.com/ceoloide/ergogen-footprints/issues/80) remains an unresolved LED physical-view/pin-number allegation.

Existing audit corrections for MX track nets/stabilizer gate, diode padless combination, SSD1306 width selection, generic PAD_5 alias and fixed MCU track net IDs require local patches. Keepout is a source/engine typing interaction. This inspection adds no physical assembly, KiCad roundtrip, DRC or proposal validation.

## KiCanvas numeric pad IDs: bounded follow-up

The pinned KiCanvas revision is `b031159eb74aaa7eef2b026fd85d35bc05ff2095`. The existing patch has no Pad.number conversion correction. Its fixture exclusively uses quoted pad identifiers, so current passing checks do not cover numeric identifiers.

The producer is [`src/kicad/board.ts` Pad constructor, line1664](https://github.com/theacodes/kicanvas/blob/b031159eb74aaa7eef2b026fd85d35bc05ff2095/src/kicad/board.ts#L1664): `P.positional("number", T.string)`. [`T.string`](https://github.com/theacodes/kicanvas/blob/b031159eb74aaa7eef2b026fd85d35bc05ff2095/src/kicad/parser.ts#L69) rejects number primitives. The tokenizer has already converted unquoted numeric tokens into numbers. Result: unquoted `(pad 1 ...)` obtains undefined `number`; quoted `(pad "1" ...)` obtains string `"1"`. Prior browser evidence in `.omo/ulw-research/20260920-114822/browser/parser-followup.md` measured exactly this.

Consequences are concrete: Footprint inserts these values into its [`#pads_by_number` map](https://github.com/theacodes/kicanvas/blob/b031159eb74aaa7eef2b026fd85d35bc05ff2095/src/kicad/board.ts#L941), so distinct numeric pads overwrite the undefined map entry. Public `pad_by_number("1")` cannot find the expected pad, and painter labels receive missing IDs.

Minimal repair: extend `app/patch/kicanvas/kicad10.patch` at the Pad constructor only, replacing this positional processor with one that returns strings unchanged and converts finite numeric primitives using `String(value)`; reject or preserve the existing undefined result for unsupported values. Do not broaden `T.string` globally: net-name/type distinctions and unrelated properties should retain their current contract. Do not rewrite exported board text. A narrow named type processor is also acceptable if needed for readability, but only the pad number should use it.

Regression belongs in existing `app/patch/kicanvas/test-net-registry.fixture`, executed by build.sh before bundle replacement:

1. Parse one footprint with two unquoted pads `1` and `2`, each with a different named net and complete normal geometry. Assert exact `pads.map(p => p.number)` equals `["1", "2"]`, each public `pad_by_number(id)` resolves the right object and net, and pad types/shapes remain unchanged.
2. Controls: quoted `"1"`, `"01"`, alphanumeric `"A1"`, and unnumbered `""` remain exact strings. Zero as an unquoted token becomes `"0"`. Distinct net metadata must remain separate.
3. Run the existing fixture against the old patch first and retain the failure, then rebuild using `pnpm --dir app run build-kicanvas`. The script installs the committed lockfile in a temporary pinned checkout, tests, builds, then replaces `app/public/dependencies/kicanvas.js`.
4. Browser smoke the rebuilt viewer with the same board and inspect runtime Pad.number plus pad_by_number, matching the prior probe. Keep the source input unchanged; compare its original string before/after loading. Existing painter smoke can ensure no crash, but counting rendered shapes alone cannot prove pad labels.

Limit: converting number primitives cannot recover lexical distinctions already lost by tokenization, such as unquoted leading zeros or very large integers. The requested observed defect concerns ordinary numeric pad IDs. Preserve quoted forms exactly and avoid claiming arbitrary token spelling preservation without a tokenizer-specific extension.
