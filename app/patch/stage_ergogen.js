const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

// Dereference package links into a disposable copy before applying GUI patches.
const stageErgogen = (installed, parent = os.tmpdir()) => {
  const source = fs.realpathSync(installed);
  const stage = fs.mkdtempSync(path.join(parent, 'ergogen-gui-build-'));
  try {
    fs.cpSync(source, stage, {
      recursive: true,
      dereference: true,
      filter: (entry) =>
        !['node_modules', '.git', 'dist'].includes(path.basename(entry)),
    });
    // Reuse the frozen workspace dependencies without patching the engine.
    fs.symlinkSync(
      path.join(source, 'node_modules'),
      path.join(stage, 'node_modules'),
      'dir'
    );
    return stage;
  } catch (error) {
    fs.rmSync(stage, { recursive: true, force: true });
    throw error;
  }
};

// Resolve the real executable: pnpm .bin wrappers are relative to the workspace.
const buildErgogen = (stage) => {
  const options = { cwd: stage, stdio: 'inherit' };
  execFileSync(process.execPath, ['scripts/build-schema.js'], options);
  const rollup = require.resolve('rollup/dist/bin/rollup', { paths: [stage] });
  execFileSync(process.execPath, [rollup, '-c'], options);
};

module.exports = { stageErgogen, buildErgogen };

if (require.main === module) {
  console.log(stageErgogen(process.argv[2]));
}
