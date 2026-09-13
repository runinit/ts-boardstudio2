#!/bin/sh
set -eu

PROJECT_ROOT=$(pwd)
if [ ! -d node_modules/ergogen ]; then
  echo 'Install workspace dependencies with pnpm install first.' >&2
  exit 1
fi

ERGOGEN_BUILD=$(node patch/stage_ergogen.js node_modules/ergogen)
export ERGOGEN_BUILD
trap 'rm -rf "$ERGOGEN_BUILD"' EXIT
trap 'exit 1' INT TERM

BOARDSTUDIO_FOOTPRINTS=${BOARDSTUDIO_FOOTPRINTS:-$(node -p 'require("node:path").dirname(require.resolve("@boardstudio/footprints/package.json"))')}
if [ ! -f "$BOARDSTUDIO_FOOTPRINTS/manifest/sources.json" ]; then
  echo 'Workspace footprint package is missing.' >&2
  exit 1
fi
node patch/stage_boardstudio.cjs "$BOARDSTUDIO_FOOTPRINTS" "$ERGOGEN_BUILD" "$PROJECT_ROOT/public/footprint-models"

cp patch/footprints_index.js "$ERGOGEN_BUILD/src/footprints/index.js"
cp -R vendor/bhk/footprints "$ERGOGEN_BUILD/src/footprints/bhkfp"

node <<'JS'
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.ERGOGEN_BUILD;
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const [file, before, after] of [
  ['ergogen.js', "const version = require('../package.json').version", `const version = ${JSON.stringify(pkg.version)}`],
  ['io.js', "const package_json = require('../package.json')", `const package_json = ${JSON.stringify(pkg)}`],
]) {
  const target = path.join(root, 'src', file);
  fs.writeFileSync(target, fs.readFileSync(target, 'utf8').replace(before, after));
}
JS

node -e 'require("./patch/stage_ergogen").buildErgogen(process.env.ERGOGEN_BUILD)' 
node patch/stage_footprints.js "$ERGOGEN_BUILD" "$PROJECT_ROOT/.generated/footprints.json"
# Publish the bundle only after every build step succeeds.
cp "$ERGOGEN_BUILD/dist/ergogen.js" "$PROJECT_ROOT/public/dependencies/ergogen.js"
