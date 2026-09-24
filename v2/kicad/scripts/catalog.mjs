import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const output = path.join(root, 'v2/kicad/src/generated/builtin-catalog.json');
const mode = process.argv[2];
if (mode !== 'generate' && mode !== 'check') throw new Error('Expected generate or check');

const result = spawnSync('cargo', ['run', '--quiet', '--manifest-path', 'v2/core/Cargo.toml', '--example', 'export_catalog'], {
  cwd: root,
  encoding: 'utf8',
});
if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}
const generated = `${JSON.stringify(JSON.parse(result.stdout), null, 2)}\n`;
if (mode === 'generate') {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, generated);
} else {
  let checkedIn;
  try {
    checkedIn = await readFile(output, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.error(`missing generated catalogue: ${path.relative(root, output)}`);
    process.exit(1);
  }
  if (checkedIn !== generated) {
    console.error(`generated catalogue differs: ${path.relative(root, output)}`);
    process.exit(1);
  }
}
