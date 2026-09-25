import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { access, mkdir, rm } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const version = '8_0_1_rev2';
const builds = {
  wasm: {
    archive: `occt-${version}-wasm32_unknown_unknown.tar.gz`,
    sha256: '8149e781acdbd21507cfb29937e48e5fdbe628ee5c37007f720dcf5d4000e6ad',
  },
  native: {
    archive: `occt-${version}-x86_64_unknown_linux_gnu.tar.gz`,
    sha256: '95e068936c0cb4ba2668707c0dca209d3396103dfc1db85eb72d192badfb4143',
  },
};

const build = builds[process.argv[2]];
if (!build) throw new Error('Choose the `native` or `wasm` OCCT archive');

const cadRoot = fileURLToPath(new URL('..', import.meta.url));
const cache = join(cadRoot, '.cache', 'cadrum', process.argv[2]);
const archivePath = join(cache, build.archive);
const archiveRoot = join(cache, build.archive.slice(0, -'.tar.gz'.length));
const url = `https://github.com/lzpel/cadrum/releases/download/occt-${version}/${build.archive}`;

await mkdir(cache, { recursive: true });
if (!(await exists(archivePath))) {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`Could not download pinned OCCT archive (${response.status})`);
  const temporary = `${archivePath}.download`;
  await pipeline(response.body, createWriteStream(temporary));
  await rm(archivePath, { force: true });
  await import('node:fs/promises').then(({ rename }) => rename(temporary, archivePath));
}

const hash = createHash('sha256');
for await (const chunk of createReadStream(archivePath)) hash.update(chunk);
const digest = hash.digest('hex');
if (digest !== build.sha256) {
  throw new Error(`OCCT archive checksum mismatch for ${build.archive}: ${digest}`);
}

if (!(await exists(join(archiveRoot, 'include', 'opencascade')))) {
  const result = spawnSync('tar', ['-xzf', archivePath, '-C', cache], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Could not extract the verified OCCT archive');
}

if (!(await exists(join(archiveRoot, 'include', 'opencascade'))) || !(await exists(join(archiveRoot, 'lib')))) {
  throw new Error(`Verified OCCT archive has an unexpected layout: ${archiveRoot}`);
}

process.stdout.write(`${archiveRoot}\n`);

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
