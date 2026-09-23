import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { emptyProject } from '../../contracts/src/index.ts';
import type { Contour, ProjectDoc } from '../../contracts/src/index.ts';
import { builtinDefinitions, compileFootprint, exportBoard, exportFootprint, exportFootprintFile, importFootprint, KiCadError, previewFootprint, serializeBoard } from '../src/index.ts';

const fixture = (): { doc: ProjectDoc; contours: Contour[] } => {
  const doc = emptyProject('project', 'Test');
  doc.revision = 2;
  doc.definitions.push({
    id: 'switch',
    name: 'Switch',
    kind: 'switch',
    courtyard: [
      { x: -7, y: -7 },
      { x: 7, y: -7 },
      { x: 7, y: 7 },
      { x: -7, y: 7 },
    ],
    pads: [
      { id: 'left', number: '1', at: { x: -3, y: 0 }, size: { x: 1.8, y: 1.8 }, shape: 'circle', drill: 0.9 },
      { id: 'right', number: '2', at: { x: 3, y: 0 }, size: { x: 1.8, y: 1.8 }, shape: 'circle', drill: 0.9 },
    ],
  });
  doc.parts.push({ id: 's1', definitionId: 'switch', reference: 'SW1', pose: { at: { x: 0, y: 0 }, rotation: 0 }, side: 'front' });
  doc.nets.push({ id: 'row', name: 'ROW0', pins: [{ partId: 's1', padId: 'left' }] });
  doc.boards.push({ id: 'main', name: 'main', outlineIds: [], partIds: ['s1'], netIds: ['row'], thickness: 1.6 });
  const contours = [{ hole: false, points: [
    { x: -12, y: -12 }, { x: 12, y: -12 }, { x: 12, y: 12 }, { x: -12, y: 12 },
  ] }];
  return { doc, contours };
};

type DrcReport = {
  unconnected_items: { type: string }[];
  violations: { type: string }[];
};

const runDrc = (doc: ProjectDoc, contours: Contour[]): DrcReport => {
  const directory = mkdtempSync(join(tmpdir(), 'boardstudio-v2-drc-'));
  const path = join(directory, 'main.kicad_pcb');
  const report = join(directory, 'drc.json');
  writeFileSync(path, serializeBoard(doc, contours, 'main'));
  execFileSync('kicad-cli', ['pcb', 'drc', '--format', 'json', '--output', report, path], { encoding: 'utf8' });
  return JSON.parse(readFileSync(report, 'utf8')) as DrcReport;
};

test('exports a deterministic board with flipped Y coordinates and net pads', () => {
  const { doc, contours } = fixture();
  const first = exportBoard(doc, 'main', contours, doc.revision);
  assert.equal(first.filename, 'main.kicad_pcb');
  assert.equal(first.content, serializeBoard(doc, contours, 'main'));
  assert.match(first.content, /\(net 1 "ROW0"\)/u);
  assert.match(first.content, /\(start -12 12\) \(end 12 12\)/u);
  assert.match(first.content, /\(pad "1" thru_hole circle .*\(net 1 "ROW0"\)/u);
});

test('compiled geometry is immutable and ignores net labels', () => {
  const { doc } = fixture();
  const definition = doc.definitions[0];
  definition.generator = { source: 'custom:switch', version: '1', parameters: { spacing: 19 } };
  const first = compileFootprint(definition);
  definition.pads[0].netId = 'row';
  const second = compileFootprint(definition);

  assert.equal(first, second);
  assert.equal('netId' in first.pads[0], false);
  assert.ok(Object.isFrozen(first.pads[0].at));
  assert.match(previewFootprint(first), /<svg.*<rect/u);
  assert.notEqual(compileFootprint(definition, 'back'), first);
});

test('built-in switch and RGB settings compile repeatably', () => {
  const builtins = builtinDefinitions();
  assert.deepEqual(builtins.map((definition) => definition.id), ['mx-switch', 'choc-switch', 'mx-hotswap', 'choc-hotswap', 'rgb-led', 'matrix-diode']);
  for (const definition of builtins) {
    const first = compileFootprint(definition);
    assert.equal(compileFootprint(definition), first);
    assert.ok(first.pads.length >= 2);
    assert.match(exportFootprint(definition), /\(footprint/u);
  }

  const rgb = builtins.find((definition) => definition.id === 'rgb-led')!;
  rgb.generator!.parameters = { reversible: true, includeTracesVias: true, traceWidth: 0.3, viaSize: 0.8, viaDrill: 0.4 };
  const ir = compileFootprint(rgb);
  assert.equal(ir.traces.length, 4);
  assert.equal(ir.vias.length, 4);
  assert.match(previewFootprint(ir), /<line.*<circle/u);
  assert.match(exportFootprint(rgb), /\(fp_line .*\(layer "F.Cu"\)/u);

  const mx = builtins.find((definition) => definition.id === 'mx-switch')!;
  mx.generator!.parameters = { padSpacing: 1 };
  assert.throws(() => compileFootprint(mx), /overlaps mounting hole/u);
});

test('exports front and back copper traces and vias', () => {
  const { doc, contours } = fixture();
  doc.boards[0].traces = [
    { id: 'front', start: { x: -3, y: 0 }, end: { x: 0, y: 0 }, width: 0.25, layer: 'front', netId: 'row' },
    { id: 'back', start: { x: 0, y: 0 }, end: { x: 3, y: 0 }, width: 0.25, layer: 'back', netId: 'row' },
  ];
  doc.boards[0].vias = [{ id: 'through', at: { x: 0, y: 0 }, size: 0.8, drill: 0.4, netId: 'row' }];

  const board = exportBoard(doc, 'main', contours, doc.revision);
  assert.match(board.content, /\(segment \(start -3 0\) \(end 0 0\).*\(layer "F.Cu"\) \(net 1\)/u);
  assert.match(board.content, /\(segment \(start 0 0\) \(end 3 0\).*\(layer "B.Cu"\) \(net 1\)/u);
  assert.match(board.content, /\(via \(at 0 0\) \(size 0.8\) \(drill 0.4\).*\(net 1\)/u);
  assert.ok(Array.isArray(runDrc(doc, contours).violations));
});

test('rejects stale revisions and conflicting net assignments', () => {
  const { doc, contours } = fixture();
  assert.throws(() => exportBoard(doc, 'main', contours, 1), KiCadError);
  doc.definitions[0].pads[0].netId = 'another';
  assert.throws(() => serializeBoard(doc, contours, 'main'), /Conflicting net/u);
});

test('requires relative model paths and emits standalone footprints', () => {
  const { doc } = fixture();
  const definition = doc.definitions[0];
  definition.model = {
    assetId: 'switch-model',
    offset: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };
  assert.throws(() => exportFootprint(definition, new Map([['switch-model', '../secret.step']])), KiCadError);
  assert.match(exportFootprint(definition, new Map([['switch-model', 'models/switch.step']])), /\$\{KIPRJMOD\}\/models\/switch.step/u);
});

test('footprint filename matches the serialized KiCad name', () => {
  const { doc } = fixture();
  const definition = doc.definitions[0];
  definition.name = '../Switch / Test';

  const exported = exportFootprintFile(definition);
  const imported = importFootprint(exported.content, 'roundtrip');
  assert.equal(exported.filename, `${imported.name}.kicad_mod`);
  assert.equal(exported.content, exportFootprint(definition));
});

test('standalone footprint rejects invalid courtyard and pad geometry', () => {
  const { doc } = fixture();
  const definition = doc.definitions[0];
  definition.courtyard[0].x = Number.NaN;
  assert.throws(() => exportFootprintFile(definition), KiCadError);

  definition.courtyard[0].x = -7;
  definition.pads[0].size.x = Number.POSITIVE_INFINITY;
  assert.throws(() => exportFootprint(definition), KiCadError);

  definition.pads[0].size.x = 1.8;
  definition.pads[0].drill = 0;
  assert.throws(() => exportFootprintFile(definition), KiCadError);
});

test('standalone footprint requires distinct nonempty pad numbers', () => {
  const { doc } = fixture();
  const definition = doc.definitions[0];
  definition.pads[0].number = ' ';
  assert.throws(() => exportFootprint(definition), KiCadError);

  definition.pads[0].number = '2';
  assert.throws(() => exportFootprintFile(definition), KiCadError);
});

test('imports supported external footprint pads and courtyard', () => {
  const { doc } = fixture();
  const source = exportFootprint(doc.definitions[0]);
  const imported = importFootprint(source, 'external-switch');
  assert.equal(imported.name, 'Switch');
  assert.equal(imported.pads.length, 2);
  assert.deepEqual(imported.pads[0].at, { x: -3, y: 0 });
  assert.equal(imported.courtyard.length, 4);
});

test('rejects rotated pads and models that the document cannot preserve', () => {
  const { doc } = fixture();
  const source = exportFootprint(doc.definitions[0]);
  const rotated = source.replace('(at -3 0)', '(at -3 0 45)');
  assert.throws(() => importFootprint(rotated, 'rotated'), /Unsupported pad rotation/u);

  const model = source.replace(/\n  \)\s*$/u, '\n    (model "${KIPRJMOD}/models/switch.step")\n  )');
  assert.throws(() => importFootprint(model, 'model'), /unsupported model/u);
});

test('imports shuffled courtyard lines by connected endpoints', () => {
  const { doc } = fixture();
  const source = exportFootprint(doc.definitions[0]);
  const lines = [...source.matchAll(/    \(fp_line .*\)\n/gu)].map((match) => match[0]);
  assert.equal(lines.length, 4);
  const shuffled = source.replace(lines.join(''), [lines[2], lines[0], lines[3], lines[1]].join(''));
  const imported = importFootprint(shuffled, 'shuffled');
  const start = imported.courtyard.findIndex((point) => point.x === -7 && point.y === -7);
  assert.deepEqual([...imported.courtyard.slice(start), ...imported.courtyard.slice(0, start)], doc.definitions[0].courtyard);
});

test('rejects disconnected or unrepresented courtyard geometry', () => {
  const { doc } = fixture();
  const source = exportFootprint(doc.definitions[0]);
  const broken = source.replace(/\(end 7 7\)/u, '(end 8 7)');
  assert.throws(() => importFootprint(broken, 'broken'), /courtyard/i);

  const arc = source.replace(/\n  \)\s*$/u, '\n    (fp_arc (start 0 0) (mid 1 1) (end 2 0) (layer "F.CrtYd"))\n  )');
  assert.throws(() => importFootprint(arc, 'arc'), /courtyard/i);
});

test('rejects a truncated footprint without hanging', () => {
  assert.throws(() => importFootprint('(footprint "broken"', 'broken'), /Unexpected end/u);
});

test('rejects pad details the exporter would change', () => {
  const { doc } = fixture();
  const source = exportFootprint(doc.definitions[0]);
  assert.throws(() => importFootprint(source.replace('(drill 0.9)', '(drill oval 0.9 1.1)'), 'oval-drill'), /Unsupported drill/u);
  assert.throws(() => importFootprint(source.replace('(layers "*.Cu" "*.Mask")', '(layers "B.Cu" "B.Mask")'), 'layers'), /Unsupported pad layers/u);
  assert.throws(() => importFootprint(source.replace('(drill 0.9)', '(drill 0.9) (solder_mask_margin 0.2)'), 'mask'), /Unsupported pad feature/u);
});

test('KiCad 10 parses the exported board', () => {
  const { doc, contours } = fixture();
  const drc = runDrc(doc, contours);
  assert.deepEqual(drc.violations, []);
  assert.deepEqual(drc.unconnected_items, []);
  const directory = mkdtempSync(join(tmpdir(), 'boardstudio-v2-kicad-'));
  const path = join(directory, 'main.kicad_pcb');
  writeFileSync(path, serializeBoard(doc, contours, 'main'));

  const stats = join(directory, 'stats.json');
  execFileSync('kicad-cli', ['pcb', 'export', 'stats', '--format', 'json', '--output', stats, path], { encoding: 'utf8' });
  const parsed = JSON.parse(readFileSync(stats, 'utf8'));
  assert.equal(parsed.board.has_outline, true);
  assert.equal(parsed.board.width, '24.0000 mm');
  assert.equal(parsed.pads.through_hole, 2);
  assert.equal(parsed.components.total.front, 1);

  const netlist = join(directory, 'netlist.d356');
  execFileSync('kicad-cli', ['pcb', 'export', 'ipcd356', '--output', netlist, path], { encoding: 'utf8' });
  const nets = readFileSync(netlist, 'utf8');
  assert.match(nets, /317ROW0\s+SW1\s+-1\s/u);
  assert.match(nets, /317N\/C\s+SW1\s+-2\s/u);
});

test('KiCad reports unrouted nets independently of serializer validity', () => {
  const { doc, contours } = fixture();
  doc.parts.push({ id: 's2', definitionId: 'switch', reference: 'SW2', pose: { at: { x: 0, y: 18 }, rotation: 0 }, side: 'front' });
  doc.boards[0].partIds.push('s2');
  doc.nets[0].pins.push({ partId: 's2', padId: 'left' });
  contours[0].points[2].y = 30;
  contours[0].points[3].y = 30;
  const drc = runDrc(doc, contours);
  assert.deepEqual(drc.unconnected_items.map((item) => item.type), ['unconnected_items']);
  assert.deepEqual(drc.violations, []);
});

test('KiCad reports copper clearance independently of unrouted nets', () => {
  const { doc, contours } = fixture();
  doc.definitions[0].pads[1].at.x = -1.1;
  doc.nets.push({ id: 'column', name: 'COL0', pins: [{ partId: 's1', padId: 'right' }] });
  doc.boards[0].netIds.push('column');

  const drc = runDrc(doc, contours);
  assert.deepEqual(drc.unconnected_items, []);
  assert.ok(drc.violations.some((item) => item.type === 'clearance'));
});

test('KiCad 10 plots the standalone footprint', () => {
  const { doc } = fixture();
  const directory = mkdtempSync(join(tmpdir(), 'boardstudio-v2-footprint-'));
  const library = join(directory, 'BoardStudio.pretty');
  const output = join(directory, 'svg');
  mkdirSync(library);
  mkdirSync(output);
  writeFileSync(join(library, 'Switch.kicad_mod'), exportFootprint(doc.definitions[0]));
  execFileSync('kicad-cli', ['fp', 'export', 'svg', library, '--output', output], { encoding: 'utf8' });
  assert.ok(existsSync(join(output, 'Switch.svg')));
});

test('KiCad 10 parses built-in mechanical holes and reversible RGB copper', () => {
  const [mx, , , , rgb] = builtinDefinitions();
  rgb.generator!.parameters = { reversible: true, includeTracesVias: true };
  const directory = mkdtempSync(join(tmpdir(), 'boardstudio-v2-builtins-'));
  const library = join(directory, 'BoardStudio.pretty');
  const output = join(directory, 'svg');
  mkdirSync(library);
  mkdirSync(output);
  writeFileSync(join(library, 'MX.kicad_mod'), exportFootprint(mx));
  writeFileSync(join(library, 'RGB.kicad_mod'), exportFootprint(rgb));
  execFileSync('kicad-cli', ['fp', 'export', 'svg', library, '--output', output], { encoding: 'utf8' });
  assert.ok(existsSync(join(output, 'MX.svg')));
  assert.ok(existsSync(join(output, 'RGB.svg')));
});

test('built-in switch contacts clear their mounting holes in KiCad DRC', () => {
  for (const definition of builtinDefinitions().filter((entry) => entry.kind === 'switch' || entry.id.includes('hotswap'))) {
    const doc = emptyProject(definition.id, definition.name);
    doc.definitions = [definition];
    doc.parts = [{ id: 'part', definitionId: definition.id, reference: 'SW1', pose: { at: { x: 0, y: 0 }, rotation: 0 }, side: 'front' }];
    doc.boards = [{ id: 'main', name: 'board', outlineIds: [], partIds: ['part'], netIds: ['one', 'two'], thickness: 1.6 }];
    doc.nets = [
      { id: 'one', name: 'ONE', pins: [{ partId: 'part', padId: 'one' }] },
      { id: 'two', name: 'TWO', pins: [{ partId: 'part', padId: 'two' }] },
    ];
    const contours: Contour[] = [{ hole: false, points: [
      { x: -15, y: -15 }, { x: 15, y: -15 }, { x: 15, y: 15 }, { x: -15, y: 15 },
    ] }];
    const report = runDrc(doc, contours);
    assert.deepEqual(report.violations, [], `${definition.id}: ${JSON.stringify(report.violations)}`);
  }
});

test('6 by 5 switch, diode and RGB assemblies clear KiCad DRC', () => {
  const pitch = 19.05;
  const definitions = builtinDefinitions();
  const contours: Contour[] = [{ hole: false, points: [
    { x: -20, y: -30 }, { x: 100, y: -30 }, { x: 100, y: 115 }, { x: -20, y: 115 },
  ] }];
  for (const definitionId of ['mx-switch', 'choc-switch', 'mx-hotswap', 'choc-hotswap']) {
    const doc = emptyProject(definitionId, definitionId);
    doc.definitions = definitions;
    for (let row = 0; row < 6; row += 1) {
      for (let column = 0; column < 5; column += 1) {
        const x = column * pitch;
        const y = row * pitch;
        const id = `r${row}c${column}`;
        doc.parts.push(
          { id, definitionId, reference: `SW${row * 5 + column + 1}`, pose: { at: { x, y }, rotation: 0 }, side: 'front' },
          { id: `${id}-diode`, definitionId: 'matrix-diode', reference: `D${row * 5 + column + 1}`, pose: { at: { x: x + 6, y: y - 10 }, rotation: 0 }, side: 'back' },
          { id: `${id}-led`, definitionId: 'rgb-led', reference: `LED${row * 5 + column + 1}`, pose: { at: { x: x - 5, y: y - 12 }, rotation: 0 }, side: 'back' },
        );
      }
    }
    doc.boards = [{ id: 'main', name: 'main', outlineIds: [], partIds: doc.parts.map((part) => part.id), netIds: [], thickness: 1.6 }];
    const report = runDrc(doc, contours);
    assert.deepEqual(report.violations, [], `${definitionId}: ${JSON.stringify(report.violations)}`);
  }
});
