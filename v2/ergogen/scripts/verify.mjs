import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';

const project = fileURLToPath(new URL('../../../', import.meta.url));
const source = resolve(project, 'footprints');
const copy = resolve(project, 'v2/ergogen/library');

async function files(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(root, path) : [relative(root, path)];
  }));
  return nested.flat().sort();
}

const expected = await files(source);
const actual = await files(copy);
if (JSON.stringify(expected) !== JSON.stringify(actual)) {
  throw new Error('v2 Ergogen library file inventory differs from v1');
}
for (const path of expected) {
  const original = await readFile(resolve(source, path));
  const migrated = await readFile(resolve(copy, path));
  const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
  if (digest(original) !== digest(migrated)) {
    throw new Error(`v2 Ergogen library differs: ${path}`);
  }
}
console.log(`Verified ${expected.length} migrated Ergogen files`);
