import { describe, expect, it } from 'vitest';
import type { AssemblyDefinition } from '@boardstudio/v2-contracts';
import { demoProject } from '../demo';
import { placeAssembly, matrixWithAssembly } from './sampleAssembly';

describe('saved assemblies',()=>{
  const assembly:AssemblyDefinition={id:'a',name:'Key',members:[{id:'switch',definitionId:'mx-switch',pose:{at:{x:2,y:3},rotation:30},side:'back',models:[]},{id:'cap',pose:{at:{x:2,y:3},rotation:30},side:'front',models:[{assetId:'cap',offset:{x:0,y:0,z:10},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}}]}]};
  it('snapshots member definitions and retains offsets and side',()=>{
    const before=demoProject();const after=placeAssembly(before,assembly,before.definitions,'main-board',{x:10,y:20},'placement');
    const part=after.parts.find(p=>p.id==='placement/switch')!;expect(part.pose).toEqual({at:{x:12,y:23},rotation:30});expect(part.side).toBe('back');
    expect(after.definitions.find(d=>d.id===part.definitionId)).not.toBe(before.definitions[0]);
    expect(before.parts).toHaveLength(15);expect(after.parts).toHaveLength(17);
    expect(after.parts.find(p=>p.id==='placement/cap')?.outline?.excluded).toBe(true);
  });
  it('rejects missing board and missing component definitions',()=>{
    const doc=demoProject();expect(()=>placeAssembly(doc,assembly,doc.definitions,'missing',{x:0,y:0},'x')).toThrow(/Select a board/);
    expect(()=>placeAssembly(doc,assembly,[],'main-board',{x:0,y:0},'x')).toThrow(/Missing component/);
  });
});

it('applies an assembly without changing matrix identities or disabled cells', () => {
  const doc = demoProject();
  const matrix = {...doc.matrices[0], cells: [{row:0,column:0,enabled:false,offset:{x:2,y:3}}]};
  const assembly: AssemblyDefinition = {id:'preset',name:'Switch',members:[{id:'main',definitionId:'mx-switch',side:'front',pose:{at:{x:0,y:0},rotation:0},models:[]},{id:'diode',definitionId:'mx-switch',side:'back',pose:{at:{x:3,y:4},rotation:90},models:[]}]};
  const result = matrixWithAssembly(matrix, assembly, doc.definitions, 7);
  expect(result.matrix.id).toBe(matrix.id);
  expect(result.matrix.partIds).toEqual(matrix.partIds);
  expect(result.matrix.cells[0]).toMatchObject({enabled:false,offset:{x:2,y:3},diode:false,assembliesLocal:true});
  expect(result.matrix.cells[1].assemblies[0]).toMatchObject({offset:{x:3,y:4},rotation:90,side:'back'});
  expect(result.definitions).toHaveLength(2);
});
