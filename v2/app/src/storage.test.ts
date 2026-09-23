import { describe, expect, it } from 'vitest';
import { strToU8, zipSync } from 'fflate';
import { demoProject } from './demo';
import { packProject, unpackProject } from './storage';

describe('v2 project archive', () => {
  it('round trips the document without old format conversion', async () => {
    const project = demoProject();
    const archive = await packProject(project);

    expect(await unpackProject(archive)).toEqual(project);
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
