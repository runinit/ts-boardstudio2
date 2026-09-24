import { describe, expect, it, vi } from 'vitest';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { catalogue, modelAssetIds } from '@boardstudio/v2-ergogen';
import { demoProject } from './demo';
import { packProject, unpackProject } from './storage';

describe('v2 project archive', () => {
  it('round trips the document without old format conversion', async () => {
    const project = demoProject();
    const archive = await packProject(project);

    expect(await unpackProject(archive)).toEqual(project);
  });

  it('can omit bundled models for catalog backed projects', async () => {
    const project = demoProject();
    const archive = await packProject(project, { embedUsedModels: false });

    expect(await unpackProject(archive)).toEqual(project);
  });

  it('embeds used bundled models by default', async () => {
    const definition = catalogue().find((item) => item.generator?.source === 'infused-kim/switch_reset');
    expect(definition).toBeDefined();
    const modelId = modelAssetIds(definition!)[0];
    expect(modelId).toMatch(/^ergogen:model:/);
    const project = demoProject();
    project.definitions = [definition!];
    project.parts[0].definitionId = definition!.id;
    const bytes = strToU8('model bytes');
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, arrayBuffer: async () => bytes.buffer })));

    try {
      const archive = await packProject(project);
      const files = unzipSync(archive);
      const saved = JSON.parse(strFromU8(files['project.json'])) as typeof project;
      const asset = saved.assets.find((item) => item.id === modelId);
      expect(asset).toBeDefined();
      expect(files[`assets/${asset!.sha256}`]).toEqual(bytes);

      const withoutBundle = await packProject(project, { embedUsedModels: false });
      const unbundled = JSON.parse(strFromU8(unzipSync(withoutBundle)['project.json'])) as typeof project;
      expect(unbundled.assets.some((item) => item.id === modelId)).toBe(false);

    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('rejects non-v2 documents', async () => {
    const archive = zipSync({
      'project.json': strToU8(JSON.stringify({ format: 'ergogen/v1', parts: [], boards: [] })),
    });

    await expect(unpackProject(archive)).rejects.toThrow('Unsupported project format');
  });

  it('rejects an oversized project before expanding its archive', async () => {
    const archive = zipSync({ 'project.json': strToU8('x'.repeat(9 * 1024 * 1024)) });

    await expect(unpackProject(archive)).rejects.toThrow('Project archive exceeds size limit');
  });
});
