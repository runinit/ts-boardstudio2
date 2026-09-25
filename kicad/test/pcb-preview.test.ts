import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emptyProject, type PcbPreview } from '../../contracts/src/index.ts';
import { catalogue, modelAssetIds } from '../../ergogen/src/index.ts';
import { exportNativeBoard, nativeArtifact } from './nativeArtifact.ts';

for (const source of ['ceoloide/switch_mx', 'ceoloide/switch_choc_v1_v2', 'ceoloide/diode_tht_sod123']) {
  for (const side of ['front', 'back'] as const) {
    test(`projects generated ${source} on ${side} with models and copper`, () => {
      const definition = catalogue().find(d => d.generator?.source === source)!;
      const doc = emptyProject('preview', 'Preview');
      doc.definitions = [definition];
      doc.parts = [{ id: 'part', reference: 'SW1', definitionId: definition.id, side, pose: { at: { x: 12, y: -8 }, rotation: 37 } }];
      doc.boards = [{ id: 'board', name: 'Board', partIds: ['part'], netIds: [], outlineIds: [], thickness: 1.6 }];
      const paths = new Map(modelAssetIds(definition, doc.parts[0]).map((id, i) => [id, `models/${i}.step`]));
      const board = exportNativeBoard(doc, 'board', [{ hole: false, points: [{x:-30,y:-30},{x:30,y:-30},{x:30,y:30},{x:-30,y:30}] }], paths);
      const reply = nativeArtifact<{id:string;kind:string;result:PcbPreview}>({id:'preview',kind:'preview-board',source:board,revision:0});
      assert.ok(reply.result.models.length > 0);
      assert.ok(reply.result.surfaces.some(surface => surface.layer.endsWith('.Cu')));
      assert.ok(reply.result.models.every(model => model.side === side));
      assert.equal(reply.result.models[0].pose.at.y, -8);
      assert.equal(reply.result.contours.length, 1);
    });
  }
}
