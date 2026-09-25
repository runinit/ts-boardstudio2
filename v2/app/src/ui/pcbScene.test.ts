import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import type { PcbModel, PcbPreview } from '@boardstudio/v2-contracts';
import { pcbModelMatrix, boardShapes } from './pcbScene';
import { modelMatrix } from './modelTransform';
const model:PcbModel={id:'m',reference:'SW1',path:'part.step',pose:{at:{x:10,y:20},rotation:0},side:'front',offset:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}};
describe('PCB assembly coordinate frames',()=>{
  it('seats models on the physical top and bottom surfaces',()=>{
    expect(new Vector3(2,3,4).applyMatrix4(pcbModelMatrix(model,1.6)).toArray()).toEqual([12,23,5.6]);
    const p=new Vector3(2,3,4).applyMatrix4(pcbModelMatrix({...model,side:'back'},1.6));expect(p.x).toBeCloseTo(12);expect(p.y).toBeCloseTo(17);expect(p.z).toBeCloseTo(-4);
  });
  it('agrees with the native document model binding after KiCad serialization',()=>{
    const binding={offset:{x:2,y:3,z:4},rotation:{x:20,y:40,z:70},scale:{x:1,y:2,z:3}};
    const actual=pcbModelMatrix({...model,pose:{at:{x:0,y:0},rotation:0},offset:{x:2,y:-3,z:4},rotation:{x:20,y:40,z:-70},scale:binding.scale},0);
    const expected=modelMatrix(binding);actual.elements.forEach((v,i)=>expect(v).toBeCloseTo(expected.elements[i],10));
  });
  it('cuts holes only into the outer contour containing them',()=>{
    const square=(x:number)=>[{x,y:0},{x:x+10,y:0},{x:x+10,y:10},{x,y:10}];
    const board:PcbPreview={revision:0,thickness:1.6,contours:[{hole:false,points:square(0)},{hole:false,points:square(20)}],holes:[[{x:1,y:1},{x:2,y:1},{x:2,y:2}]],surfaces:[],models:[],diagnostics:[]};
    expect(boardShapes(board).map(shape=>shape.holes.length)).toEqual([1,0]);
  });
});
