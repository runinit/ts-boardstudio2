import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { strToU8, unzipSync, zipSync } from 'fflate';
import { emptyProject } from '../../contracts/src/index.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const build = spawnSync('cargo', ['build', '--manifest-path', 'v2/core/Cargo.toml', '--locked', '--example', 'core_request', '--example', 'archive_request'], { cwd: root, stdio: 'inherit' });
if (build.error) throw build.error;
assert.equal(build.status, 0, 'native boundary drivers build');

const wasm = await import('../../core/pkg/boardstudio_core.js');
const wasmBytes = await readFile(new URL('../../core/pkg/boardstudio_core_bg.wasm', import.meta.url));
const initStarted = performance.now();
const wasmExports = wasm.initSync({ module: wasmBytes });
const initMs = performance.now() - initStarted;

function equivalent(actual, expected, label = 'reply') {
  if (typeof expected === 'number') {
    assert.equal(typeof actual, 'number', label);
    assert.ok(Math.abs(actual - expected) <= 1e-9 * Math.max(1, Math.abs(expected)), `${label}: ${actual} versus ${expected}`);
  } else if (expected && typeof expected === 'object') {
    assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), `${label} keys`);
    for (const key of Object.keys(expected)) equivalent(actual[key], expected[key], `${label}.${key}`);
  } else {
    assert.equal(actual, expected, label);
  }
}

const matrix = { id: 'matrix', rows: 3, columns: 3, definitionId: 'switch', origin: { x: 7, y: -3 }, pitch: { x: 19, y: 19 }, partIds: ['legacy-a', 'matrix/matrix/r0c1', 'legacy-b', 'legacy-c', 'legacy-d', 'legacy-e'], cells: [0, 1, 2].map((column) => ({ row: 1, column, enabled: false })), columnStaggers: [0, 2, -1], columnSplays: [0, 15, -8] };
const document = emptyProject('boundary-fixture', 'Boundary fixture');
document.definitions = [{ id: 'switch', name: 'Switch', kind: 'switch', pads: [], courtyard: [] }];
document.matrices = [matrix];
document.parts = matrix.partIds.map((id, index) => ({ id, definitionId: 'switch', reference: `S${index + 1}`, side: 'front', pose: { at: { x: (index % 3) * 19, y: index < 3 ? 0 : -38 }, rotation: index * 3 } }));
const command = (phase) => ({ baseRevision: 0, transactionId: 'move', phase, targetIds: ['legacy-a'], operation: { kind: 'move-parts', positions: [{ id: 'legacy-a', at: { x: 10, y: 12 } }] } });
const requests = [
  { id: 'open', kind: 'open', document },
  { id: 'snapshot', kind: 'snapshot' },
  { id: 'draft', kind: 'project-matrices', baseRevision: 0, matrices: ['none', 'x', 'y'].flatMap((mirror) => [{ x: 0, y: 0 }, { x: 42, y: -17 }].map((origin, index) => ({ ...matrix, id: `draft-${mirror}-${index}`, origin, mirror, rotation: 37 }))) },
  { id: 'invalid-draft', kind: 'project-matrices', baseRevision: 0, matrices: [{ ...matrix, rows: 0 }] },
  { id: 'preview', kind: 'edit', command: command('preview') },
  { id: 'unchanged', kind: 'snapshot' },
  { id: 'commit', kind: 'edit', command: command('commit') },
  { id: 'stale-draft', kind: 'project-matrices', baseRevision: 0, matrices: [matrix] },
  { id: 'undo', kind: 'undo' },
  { id: 'redo', kind: 'redo' },
  { id: 'large-draft', kind: 'project-matrices', baseRevision: 3, matrices: [{ ...matrix, rows: 50, columns: 10, cells: [], partIds: [] }] },
];
const native = spawnSync(path.join(root, 'v2/core/target/debug/examples/core_request'), { input: `${requests.map((request) => JSON.stringify(request)).join('\n')}\n`, encoding: 'utf8' });
if (native.error) throw native.error;
assert.equal(native.status, 0, native.stderr);
const nativeReplies = native.stdout.trim().split('\n').map((line) => JSON.parse(line));
assert.equal(nativeReplies.length, requests.length);
const engine = new wasm.CoreEngine();
try {
  for (const [index, request] of requests.entries()) equivalent(JSON.parse(engine.request(JSON.stringify(request))), nativeReplies[index], request.id);
  assert.equal(nativeReplies[0].scene.matrixScenes[0].cells.length, 9);
  assert.equal(nativeReplies[2].kind, 'matrix-projections');
  assert.deepEqual(nativeReplies[4].scene.matrixScenes, nativeReplies[6].scene.matrixScenes);
  assert.deepEqual(nativeReplies[8].scene.matrixScenes, nativeReplies[0].scene.matrixScenes);
  assert.deepEqual(nativeReplies[9].scene.matrixScenes, nativeReplies[6].scene.matrixScenes);
  const drafts = nativeReplies[2].matrixScenes;
  assert.equal(drafts.length, 6);
  for (let pair = 0; pair < drafts.length; pair += 2) {
    drafts[pair].cells.forEach((cell, index) => {
      const translated = drafts[pair + 1].cells[index];
      equivalent(translated.pose, { at: { x: cell.pose.at.x + 42, y: cell.pose.at.y - 17 }, rotation: cell.pose.rotation }, 'draft translation');
      assert.equal(cell.memberId, undefined);
    });
  }
  assert.equal(nativeReplies[10].matrixScenes[0].cells.length, 500);
  assert.equal(nativeReplies[3].kind, 'error');
  assert.equal(nativeReplies[4].kind, 'preview');
  assert.deepEqual(nativeReplies[1].scene.matrixScenes, nativeReplies[5].scene.matrixScenes);
  assert.equal(nativeReplies[7].kind, 'error');
} finally {
  engine.free();
}

const temporary = await mkdtemp(path.join(tmpdir(), 'boardstudio-boundaries-'));
let archiveCases = 0;
async function archive(request, buffers) {
  const caseDir = path.join(temporary, String(archiveCases++));
  const { mkdir } = await import('node:fs/promises');
  await mkdir(caseDir);
  const requestPath = path.join(caseDir, 'request.json');
  await writeFile(requestPath, JSON.stringify(request));
  const inputs = await Promise.all(buffers.map(async (bytes, index) => {
    const filename = path.join(caseDir, `input-${index}.bin`);
    await writeFile(filename, bytes);
    return filename;
  }));
  const outputDir = path.join(caseDir, 'output');
  await mkdir(outputDir);
  const result = spawnSync(path.join(root, 'v2/core/target/debug/examples/archive_request'), [requestPath, outputDir, ...inputs], { encoding: 'utf8' });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  const nativeReply = JSON.parse(result.stdout.trim());
  const nativeBuffers = await Promise.all((await readdir(outputDir)).sort((a, b) => Number.parseInt(a) - Number.parseInt(b)).map((file) => readFile(path.join(outputDir, file))));
  const [replyJson, outputBuffers] = wasm.archive_request(JSON.stringify(request), buffers.map((bytes) => new Uint8Array(bytes)));
  equivalent(JSON.parse(replyJson), nativeReply, request.kind);
  assert.equal(outputBuffers.length, nativeBuffers.length);
  if (nativeReply.kind === 'packed') {
    assert.deepEqual(unzipSync(outputBuffers[0]), unzipSync(nativeBuffers[0]));
  } else {
    outputBuffers.forEach((bytes, index) => assert.deepEqual(new Uint8Array(bytes), new Uint8Array(nativeBuffers[index])));
  }
  return { reply: nativeReply, buffers: outputBuffers };
}

try {
  const asset = strToU8('STEP fixture bytes\n');
  const sha256 = createHash('sha256').update(asset).digest('hex');
  const project = { ...document, assets: [{ id: 'asset-id', name: 'component.step', mediaType: 'model/step', sha256 }], futureField: { preserve: true } };
  const projectJson = JSON.stringify(project);
  const packed = await archive({ kind: 'pack-project', projectJson, archiveJson: JSON.stringify({ embedUsedModels: true }), assets: [{ path: `assets/${sha256}`, bufferIndex: 0 }] }, [asset]);
  assert.equal(packed.reply.kind, 'packed');
  assert.equal(new TextDecoder().decode(unzipSync(packed.buffers[0])['project.json']), projectJson);
  const unpacked = await archive({ kind: 'unpack-project' }, packed.buffers);
  assert.equal(unpacked.reply.projectJson, projectJson);
  assert.deepEqual(unpacked.buffers[0], asset);
  const oldArchive = zipSync({ 'project.json': strToU8(projectJson), [`assets/${sha256}`]: asset });
  assert.equal((await archive({ kind: 'unpack-project' }, [oldArchive])).reply.projectJson, projectJson);
  const badHash = zipSync({ 'project.json': strToU8(projectJson), [`assets/${sha256}`]: strToU8('wrong') });
  assert.equal((await archive({ kind: 'unpack-project' }, [badHash])).reply.kind, 'error');
  assert.equal((await archive({ kind: 'unpack-project' }, [oldArchive.slice(0, -12)])).reply.kind, 'error');
  const generic = await archive({ kind: 'pack-files', entries: [{ path: 'BoardStudio.pretty/part.kicad_mod', bufferIndex: 0 }, { path: 'models/component.step', bufferIndex: 1 }] }, [strToU8('(footprint "part")'), asset]);
  assert.equal(generic.reply.kind, 'packed');
  assert.deepEqual(Object.keys(unzipSync(generic.buffers[0])), ['BoardStudio.pretty/part.kicad_mod', 'models/component.step']);
  assert.equal((await archive({ kind: 'pack-files', entries: [{ path: 'same', bufferIndex: 0 }, { path: 'same', bufferIndex: 1 }] }, [asset, asset])).reply.kind, 'error');
  const payload = new Uint8Array(4 * 1024 * 1024);
  let seed = 12345;
  for (let i = 0; i < payload.length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; payload[i] = seed >>> 24; }
  const payloadHash = createHash('sha256').update(payload).digest('hex');
  const largeJson = JSON.stringify({ ...document, assets: [{ id: 'memory-fixture', sha256: payloadHash }] });
  const memoryBefore = wasmExports.memory.buffer.byteLength;
  const measured = await archive({ kind: 'pack-project', projectJson: largeJson, assets: [{ path: `assets/${payloadHash}`, bufferIndex: 0 }] }, [payload]);
  assert.equal(measured.reply.kind, 'packed');
  assert.equal((await archive({ kind: 'unpack-project' }, measured.buffers)).reply.kind, 'unpacked');
  console.info(`Archive diagnostic (4 MiB incompressible asset): ZIP ${measured.buffers[0].length} bytes; WASM linear-memory high water ${wasmExports.memory.buffer.byteLength} bytes (before ${memoryBefore}); Node peak RSS ${process.resourceUsage().maxRSS * 1024} bytes.`);
  console.info(`Matrix diagnostic: 9-cell scene ${Buffer.byteLength(JSON.stringify(nativeReplies[0].scene.matrixScenes))} bytes; 500-cell draft ${Buffer.byteLength(JSON.stringify(nativeReplies[10].matrixScenes))} bytes.`);
  console.info(`Native/WASM boundary parity: ${requests.length} core requests, ${archiveCases} archive requests passed. WASM initialization ${initMs.toFixed(1)} ms; raw size ${wasmBytes.length} bytes. Diagnostic memory: ${JSON.stringify(process.memoryUsage())}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
