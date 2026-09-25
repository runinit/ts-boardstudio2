import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';

async function files(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    // Local agent instructions are ignored by Git and are not vendor source.
    if (entry.name === 'AGENTS.md') return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(root, path) : [relative(root, path).replaceAll('\\', '/')];
  }));
  return nested.flat().sort();
}

async function verifyLibrary(root, inventory) {
  const expected = Object.keys(inventory).sort();
  const actual = await files(root);
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    const missing = expected.filter((name) => !actual.includes(name));
    const unexpected = actual.filter((name) => !expected.includes(name));
    throw new Error(`Ergogen library inventory differs: missing [${missing}], unexpected [${unexpected}]`);
  }
  for (const path of expected) {
    const digest = createHash('sha256').update(await readFile(resolve(root, path))).digest('hex');
    if (digest !== inventory[path]) throw new Error(`Ergogen library hash differs: ${path}`);
  }
  return expected.length;
}

const manifest = JSON.parse(await readFile(new URL('../library-integrity.json', import.meta.url), 'utf8'));
if (manifest.schema !== 1) throw new Error('Unsupported library integrity manifest');
const count = await verifyLibrary(fileURLToPath(new URL('../library/', import.meta.url)), manifest.files);
console.log(`Verified ${count} bundled Ergogen files`);
