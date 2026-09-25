import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

test('library integrity rejects changed, missing and unlisted source files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'boardstudio-library-integrity-'));
  const library = join(root, 'library');
  const script = join(root, 'scripts', 'verify.mjs');
  const source = 'reviewed generator source';
  const files = { 'generator.js': createHash('sha256').update(source).digest('hex') };
  const verify = () => execFileSync(process.execPath, [script], { encoding: 'utf8', stdio: 'pipe' });
  try {
    await mkdir(library);
    await mkdir(join(root, 'scripts'));
    await copyFile(new URL('./verify.mjs', import.meta.url), script);
    await writeFile(join(root, 'library-integrity.json'), JSON.stringify({ schema: 1, files }));
    await writeFile(join(library, 'generator.js'), source);
    await writeFile(join(library, 'AGENTS.md'), 'local instructions');
    assert.match(verify(), /Verified 1 bundled Ergogen files/);
    await writeFile(join(library, 'generator.js'), 'changed source');
    assert.throws(verify, /hash differs: generator.js/);
    await rm(join(library, 'generator.js'));
    assert.throws(verify, /missing \[generator.js\]/);
    await writeFile(join(library, 'generator.js'), source);
    await writeFile(join(library, 'unexpected.js'), source);
    assert.throws(verify, /unexpected \[unexpected.js\]/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
