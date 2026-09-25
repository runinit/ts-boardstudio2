import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cadRoot = fileURLToPath(new URL('..', import.meta.url));
const prepare = spawnSync(process.execPath, [fileURLToPath(new URL('./prepare-cadrum-occt.mjs', import.meta.url)), 'native'], {
  cwd: cadRoot,
  encoding: 'utf8',
});
if (prepare.status !== 0) throw new Error(prepare.stderr || 'Could not prepare verified native OCCT libraries');

const nativeTest = spawnSync('cargo', ['test', '--manifest-path', 'wasm/Cargo.toml', '--locked'], {
  cwd: cadRoot,
  stdio: 'inherit',
  env: { ...process.env, OCCT_ROOT: prepare.stdout.trim(), CARGO_TARGET_DIR: fileURLToPath(new URL('../wasm/target', import.meta.url)) },
});
if (nativeTest.error) throw nativeTest.error;
if (nativeTest.status !== 0) throw new Error(`Cadrum native tests failed with exit code ${nativeTest.status}`);

const wasmBuild = spawnSync(process.execPath, [fileURLToPath(new URL('./build-cadrum-wasm.mjs', import.meta.url))], {
  cwd: cadRoot,
  stdio: 'inherit',
});
if (wasmBuild.error) throw wasmBuild.error;
if (wasmBuild.status !== 0) throw new Error(`Cadrum WASM build failed with exit code ${wasmBuild.status}`);
