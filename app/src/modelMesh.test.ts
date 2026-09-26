import { describe, expect, it } from 'vitest';
import { readMeshModel } from './modelMesh';

describe('static model preview dispatch', () => {
  it('rejects empty or oversized inputs before loading the renderer', async () => {
    await expect(readMeshModel(new Uint8Array(), 'part.stl')).rejects.toThrow('between 1 byte and 32 MiB');
    await expect(readMeshModel(new Uint8Array(32 * 1024 * 1024 + 1), 'part.wrl')).rejects.toThrow('between 1 byte and 32 MiB');
  });

  it('does not send STEP or unknown files to the preview mesh parser', async () => {
    await expect(readMeshModel(new Uint8Array([1]), 'part.step')).rejects.toThrow('Choose a STEP, STL, or WRL model');
    await expect(readMeshModel(new Uint8Array([1]), 'part.obj')).rejects.toThrow('Choose a STEP, STL, or WRL model');
  });
});
