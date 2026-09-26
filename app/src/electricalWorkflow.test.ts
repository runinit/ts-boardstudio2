import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { catalogue, normalizeDefinition } from '@boardstudio/v2-ergogen';
import { CoreEngine, initSync } from '../../core/pkg/boardstudio_core';
import type { CoreReply, CoreRequest, ElectricalPlan, ProjectDoc } from '@boardstudio/v2-contracts';
import { demoProject } from './demo';
import { firmwareRequest } from './firmwareHandoff';
import { pcbAssemblyFiles } from './electricalHandoff';

initSync({ module: readFileSync(new URL('../../core/pkg/boardstudio_core_bg.wasm', import.meta.url)) });

function fixture(reduced = false): ProjectDoc {
  const doc = demoProject();
  doc.nets = []; doc.boards[0].netIds = [];
  const source = catalogue().find(definition => definition.generator?.source === 'ceoloide/mcu_nice_nano')!;
  const mcu = normalizeDefinition({ ...source, generator: { ...source.generator!, parameters: { reversible:true, only_required_jumpers:reduced } } });
  doc.definitions.push(mcu);
  doc.parts.push({id:'controller/left',reference:'U1',definitionId:mcu.id,pose:{at:{x:100,y:0},rotation:0},side:'front'});
  doc.boards[0].partIds.push('controller/left');
  return doc;
}
function call(engine: CoreEngine, request: CoreRequest): CoreReply {
  const reply = JSON.parse(engine.request(JSON.stringify(request))) as CoreReply;
  if (reply.kind === 'error') throw new Error(reply.message);
  return reply;
}
function resolve(engine: CoreEngine, document: ProjectDoc, mode: 'matrix' | 'direct' = 'direct', instanceId: string | null = null): ElectricalPlan {
  const reply = call(engine,{id:'resolve',kind:'resolve-electrical',request:{document,instanceId,boardId:'main-board',controllerPartId:null,controllerProfile:null,mode,locks:{}}});
  if (reply.kind !== 'electrical-resolved') throw new Error('Expected electrical plan');
  return reply.plan;
}

describe('real footprint electrical handoff', () => {
  test('RGB companions replace legacy automatic LED nets without conflicting with the scan plan', () => {
    const engine = new CoreEngine();
    const doc = fixture();
    const source = catalogue().find(definition => definition.generator?.source === 'ceoloide/led_sk6812mini-e')!;
    const rgb = normalizeDefinition(source);
    doc.definitions.push(rgb);
    for (let index = 0; index < 3; index += 1) {
      const id = `${doc.parts[index].id}/rgb`;
      doc.parts.push({ id, reference: `LED${index + 1}`, definitionId: rgb.id, pose: { at: { x: index * 19, y: 5 }, rotation: 0 }, side: 'front' });
      doc.boards[0].partIds.push(id);
    }
    doc.nets.push({ id: 'matrix/matrix/net/led/in', name: 'Legacy RGB', pins: [{ partId: `${doc.parts[0].id}/rgb`, padId: rgb.terminals!.P4[0] }] });
    doc.boards[0].netIds.push(doc.nets[0].id);
    doc.hardware = { topology: 'unibody', transport: 'none', instances: [], sharedConstruction: null, boards: [{ boardId: 'main-board', controllerPartId: 'controller/left', mode: 'direct', locks: {}, assignments: {}, keyBindings: {}, jumperStates: {}, protectedHandoff: null }] };
    const opened = call(engine, { id: 'open', kind: 'open', document: doc });
    if (opened.kind !== 'scene') throw new Error('Expected project');
    const plan = resolve(engine, opened.document);
    expect(plan.diagnostics.filter(finding => finding.severity === 'error')).toEqual([]);
    expect(Object.keys(plan.peripheralPins).filter(name => name.endsWith('/rgb-in'))).toHaveLength(1);
    expect(plan.peripherals.filter(peripheral => peripheral.kind === 'rgb')).toHaveLength(3);
    const applied = call(engine, { id: 'apply', kind: 'apply-electrical', baseRevision: opened.document.revision, plan, draft: false });
    if (applied.kind !== 'scene') throw new Error('Expected applied project');
    expect(applied.document.nets.some(net => net.id === 'matrix/matrix/net/led/in')).toBe(false);
    const firmware = firmwareRequest(applied.document, resolve(engine, applied.document)).request;
    expect(firmware.peripheral_overlays.join('\n')).toContain('chain-length = <3>');
    expect(call(engine, { id: 'firmware-rgb', kind: 'generate-firmware', request: firmware }).kind).toBe('firmware-generated');
    engine.free();
  });
  test('legacy nice!view reverse footprints retain their source-specific jumper faces and routing requirements', () => {
    const engine = new CoreEngine();
    const doc = fixture();
    const source = catalogue().find(definition => definition.generator?.source === 'infused-kim/nice_view')!;
    const display = normalizeDefinition({ ...source, generator: { ...source.generator!, parameters: { reverse: true, jumpers_at_bottom: true } } });
    doc.definitions.push(display);
    doc.parts.push({ id: 'display', reference: 'DISP1', definitionId: display.id, pose: { at: { x: 110, y: 0 }, rotation: 0 }, side: 'front' });
    doc.boards[0].partIds.push('display');
    const plan = resolve(engine, doc);
    expect(plan.diagnostics.filter(finding => finding.severity === 'error')).toEqual([]);
    const recipe = plan.jumpers.find(recipe => recipe.partId === 'display')!;
    expect(recipe.sites).toHaveLength(8);
    expect(recipe.sites.filter(site => site.close).every(site => site.face === 'front')).toBe(true);
    expect(recipe.sites.every(site => site.routingRequired && site.y === 19.6)).toBe(true);
    expect(recipe.sites.find(site => site.face === 'front' && site.localNetId.endsWith('_1'))?.signalTerminal).toBe('MOSI');
    expect(call(engine, { id: 'firmware-display', kind: 'generate-firmware', request: firmwareRequest(doc, plan).request }).kind).toBe('firmware-generated');
    engine.free();
  });
  test('a shared reversible PCB includes distinct bridge instructions for both physical halves', () => {
    const engine = new CoreEngine();
    const doc = fixture(true);
    doc.hardware = { topology: 'split', transport: 'wireless', boards: [], sharedConstruction: null, instances: [
      { id: 'left', name: 'Left half', boardId: 'main-board', half: 'left', role: 'central', flipped: false, controllerPartId: null, mechanical: null, constructionLinked: true },
      { id: 'right', name: 'Right half', boardId: 'main-board', half: 'right', role: 'peripheral', flipped: true, controllerPartId: null, mechanical: null, constructionLinked: true },
    ] };
    const canonical = resolve(engine, doc);
    const populations = doc.hardware.instances.map(instance => ({ name: instance.name, plan: resolve(engine, doc, 'direct', instance.id) }));
    expect(populations.every(({ plan }) => plan.diagnostics.every(finding => finding.severity !== 'error'))).toBe(true);
    expect(populations[0].plan.nets).toEqual(populations[1].plan.nets);
    expect(populations[0].plan.assignments[0].directGpio).not.toBe(populations[1].plan.assignments[0].directGpio);
    const files = pcbAssemblyFiles(canonical, false, populations);
    expect(files['ASSEMBLY.md']).toContain('Left half');
    expect(files['ASSEMBLY.md']).toContain('Right half');
    const report = JSON.parse(files['wiring-report.json']);
    expect(report.populations[0].plan.jumpers[0].sites.filter((site: { close: boolean }) => site.close).every((site: { face: string }) => site.face === 'back')).toBe(true);
    expect(report.populations[1].plan.jumpers[0].sites.filter((site: { close: boolean }) => site.close).every((site: { face: string }) => site.face === 'front')).toBe(true);
    expect(Object.keys(files).filter(name => name.endsWith('.svg'))).toHaveLength(2);
    engine.free();
  });
  test('full and reduced jumper variants resolve actual pad groups and module GPIOs', () => {
    const engine = new CoreEngine();
    for (const reduced of [false,true]) {
      const doc = fixture(reduced);
      const plan = resolve(engine,doc);
      expect(plan.diagnostics.filter(item => item.severity === 'error')).toEqual([]);
      expect(plan.assignments).toHaveLength(15);
      expect(plan.jumpers[0].sites).toHaveLength(reduced ? 16 : 48);
      expect(plan.jumpers[0].sites.filter(site => site.close).every(site => site.face === 'back')).toBe(true);
      expect(plan.nets.flatMap(net => net.pins).every(pin => doc.definitions.find(definition => definition.id === doc.parts.find(part => part.id === pin.partId)?.definitionId)?.pads.some(pad => pad.id === pin.padId))).toBe(true);
      if (reduced) expect(plan.moduleAliases.P21).toBe('P2');
      const request = firmwareRequest(doc,plan).request;
      expect(call(engine,{id:'firmware',kind:'generate-firmware',request}).kind).toBe('firmware-generated');
    }
    engine.free();
  });

  test('download protection survives undo and requires explicit review to remap', () => {
    const engine = new CoreEngine();
    const opened = call(engine,{id:'open',kind:'open',document:fixture()});
    if (opened.kind !== 'scene') throw new Error('Expected opened project');
    const first = resolve(engine,opened.document);
    const applied = call(engine,{id:'apply',kind:'apply-electrical',baseRevision:opened.document.revision,plan:first,draft:false});
    if (applied.kind !== 'scene') throw new Error('Expected applied project');
    const plan = resolve(engine,applied.document);
    call(engine,{id:'protect',kind:'protect-electrical-handoff',baseRevision:applied.document.revision,boardId:'main-board',plan});
    const undone = call(engine,{id:'undo',kind:'undo'});
    if (undone.kind !== 'scene') throw new Error('Expected undo');
    expect(undone.document.hardware?.boards[0].protectedHandoff?.fingerprint).toBe(plan.fingerprint);
    const reviewed = call(engine,{id:'review',kind:'review-electrical-remap',baseRevision:undone.document.revision,boardId:'main-board',expectedFingerprint:plan.fingerprint});
    if (reviewed.kind !== 'scene') throw new Error('Expected review');
    expect(reviewed.document.hardware?.boards[0].protectedHandoff).toBeNull();
    engine.free();
  });
});
