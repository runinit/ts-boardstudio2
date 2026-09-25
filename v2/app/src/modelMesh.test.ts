import { describe, expect, it } from 'vitest';
import { readMeshModel } from './modelMesh';
const bytes=(s:string)=>new TextEncoder().encode(s);
describe('static model loading',()=>{
  it('loads ASCII STL with millimetre dimensions',()=>{
    const mesh=readMeshModel(bytes('solid part\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 2 0 0\nvertex 0 3 0\nendloop\nendfacet\nendsolid part'),'part.stl');
    expect(Array.from(mesh.positions)).toEqual([0,0,0,2,0,0,0,3,0]);
  });
  it('loads binary STL without decoding it as text',()=>{
    const b=new Uint8Array(134),view=new DataView(b.buffer);view.setUint32(80,1,true);[0,0,1,0,0,0,2,0,0,0,3,0].forEach((v,i)=>view.setFloat32(84+i*4,v,true));
    expect(readMeshModel(b,'binary.stl').positions.length).toBe(9);
  });
  it('preserves static WRL color and KiCad units',()=>{
    const mesh=readMeshModel(bytes('#VRML V2.0 utf8\nShape { appearance Appearance { material Material { diffuseColor 1 0 0 } } geometry IndexedFaceSet { coord Coordinate { point [ 0 0 0, 1 0 0, 0 1 0 ] } coordIndex [ 0, 1, 2, -1 ] } }'),'part.wrl');
    expect(Math.max(...mesh.positions)).toBeCloseTo(2.54);expect(mesh.colors?.[0]).toBe(1);expect(mesh.colors?.[1]).toBe(0);
  });
  it('rejects external WRL resources and empty files',()=>{
    expect(()=>readMeshModel(bytes('#VRML V2.0 utf8\nInline { url "https://example.com/model.wrl" }'),'bad.wrl')).toThrow(/external resources/);
    expect(()=>readMeshModel(new Uint8Array(),'empty.stl')).toThrow();
  });
});

it('loads WRL primitives without an explicit appearance', () => {
  expect(readMeshModel(bytes('#VRML V2.0 utf8\nShape { geometry Box { size 10 10 5 } }'), 'box.wrl').positions.length).toBeGreaterThan(0);
});
