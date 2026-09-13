import { describe, expect, it } from 'vitest';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import { STLExporter, STLLoader } from 'three-stdlib';
import { encodeAsset } from './caseAssets';
import { previewModels } from './modelPreview';
import type { Results } from '../types/results';
describe('Immediate model alignment', () => {
  it.each([
    { side: 'top', framed: false },
    { side: 'bottom', framed: false },
    { side: 'bottom', framed: true },
  ])(
    'aligns $side models (footprint frame: $framed) without changing the saved build',
    ({ side, framed }) => {
      const geometry = new BoxGeometry(1, 1, 1);
      geometry.translate(0.5, 0.5, 0.5);
      const material = new MeshBasicMaterial();
      const data = new STLExporter().parse(new Mesh(geometry, material), {
        binary: true,
      });
      const assets = {
        '__model_chip.step.json': JSON.stringify({
          stl: encodeAsset(new Uint8Array(data.buffer)),
        }),
      };
      const key = framed
        ? 'case_components_native_U1'
        : 'case_components_board_case_U1';
      const results = {
        solids: { [key]: { stl: 'previous' } },
        designs: {
          boards: {
            case: {
              thickness: 1.6,
              native: framed,
              components: [
                {
                  id: 'U1',
                  native: framed
                    ? {
                        matrix: [
                          1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
                        ],
                      }
                    : undefined,
                  side,
                  rotation: 90,
                  position: [10, 20],
                  models: [],
                },
              ],
            },
          },
          assemblies: {
            case: {
              parts: {},
              parameters: { pcb_z: 6, board: {} },
              placement: { origin: [0, 0, 0], angle: 0, lift: 0 },
            },
          },
        },
      } as unknown as Results;
      const transformed = previewModels(
        results,
        'case',
        {
          U1: [
            {
              path: 'chip.step',
              asset: 'chip.step',
              offset: [1, 2, 3],
              rotate: [0, 0, 0],
              scale: [1, 1, 1],
              frame: framed
                ? [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 5, 0, 0, 0, 1]
                : undefined,
            },
          ],
        },
        assets
      );
      const mesh = new STLLoader().parse(
        (transformed.solids![key].stl as Uint8Array).buffer as ArrayBuffer
      );
      mesh.computeBoundingBox();
      expect(mesh.boundingBox!.min.x).toBeCloseTo(
        framed ? 1 : side === 'top' ? 7 : 12
      );
      expect(mesh.boundingBox!.min.y).toBeCloseTo(framed ? -3 : 21);
      expect(mesh.boundingBox!.min.z).toBeCloseTo(
        framed ? 1 : side === 'top' ? 10.6 : 2
      );
      expect(results.solids![key].stl).toBe('previous');
      geometry.dispose();
      material.dispose();
      mesh.dispose();
    }
  );
});
