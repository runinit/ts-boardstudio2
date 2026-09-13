const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');

const sha256 = (file) =>
  crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const listJs = (directory) =>
  fs.existsSync(directory)
    ? fs
        .readdirSync(directory)
        .filter((name) => name.endsWith('.js'))
        .sort()
    : [];

const verify = (root, manifest, source, files) => {
  const expected = manifest.footprints[source] || {};
  const actual = files.map((file) =>
    source === 'infused-kim' ? `vendor/infused-kim/${file}` : file
  );
  const listed = Object.keys(expected).sort();
  if (JSON.stringify(actual) !== JSON.stringify(listed)) {
    throw new Error(`${source} manifest does not match its JavaScript files`);
  }
  for (const relative of listed) {
    const file = path.join(root, relative);
    if (sha256(file) !== expected[relative]) {
      throw new Error(`Hash mismatch for ${relative}`);
    }
  }
  return listed;
};

function stage(root, output) {
  const manifestPath = path.join(root, 'manifest', 'sources.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const ceoloide = verify(root, manifest, 'ceoloide', listJs(root));
  const infusedRoot = path.join(root, 'vendor', 'infused-kim');
  const infused = verify(root, manifest, 'infused-kim', listJs(infusedRoot));
  const targets = [
    ['ceoloide', ceoloide.map((file) => [file, file])],
    [
      'infused-kim',
      infused.map((relative) => [
        relative.replace('vendor/infused-kim/', ''),
        relative,
      ]),
    ],
  ];
  for (const [name, files] of targets) {
    const directory = path.join(output, 'src', 'footprints', name);
    fs.mkdirSync(directory, { recursive: true });
    for (const [destination, source] of files) {
      fs.copyFileSync(
        path.join(root, source),
        path.join(directory, destination)
      );
    }
  }
  return { ceoloide: ceoloide.length, infusedKim: infused.length };
}

async function stageDefaults(root, output, modelsOutput) {
  const { bindDefaults } = await import(
    pathToFileURL(path.resolve(root, 'src/defaultModels.mjs'))
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, 'manifest/sources.json'))
  );
  // Validate model bytes before publishing any asset to the application.
  for (const [file, hash] of Object.entries(manifest.models)) {
    if (sha256(path.join(root, file)) !== hash) {
      throw new Error(`Model hash mismatch: ${file}`);
    }
  }
  for (const namespace of ['ceoloide', 'infused-kim']) {
    const directory = path.join(output, 'src/footprints', namespace);
    for (const file of listJs(directory)) {
      const target = path.join(directory, file);
      fs.writeFileSync(
        target,
        bindDefaults(
          fs.readFileSync(target, 'utf8'),
          `${namespace}/${file.slice(0, -3)}`
        )
      );
    }
  }
  if (!modelsOutput) {
    return;
  }
  for (const file of Object.keys(manifest.models)) {
    const match = file.match(
      /^vendor\/(infused-kim|kiswitch|keebio|foostan|kicad|tsuki|gdek|koktoh)\/3d_models\/(.+)$/
    );
    if (!match) {
      throw new Error(`Unknown model source: ${file}`);
    }
    const target = path.join(modelsOutput, 'boardstudio', match[1], match[2]);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, file), target);
  }
  for (const [namespace, license] of Object.entries({
    'infused-kim': 'vendor/infused-kim/LICENSE',
    kiswitch: 'vendor/kiswitch/licenses/LICENSE',
    keebio: 'vendor/keebio/LICENSE',
    foostan: 'vendor/foostan/LICENSE',
    kicad: 'vendor/kicad/LICENSE',
    tsuki: 'vendor/tsuki/LICENSE',
    gdek: 'vendor/gdek/LICENSE',
    koktoh: 'vendor/koktoh/LICENSE',
  })) {
    fs.copyFileSync(
      path.join(root, license),
      path.join(modelsOutput, 'boardstudio', namespace, 'LICENSE')
    );
  }
}

module.exports = { stage, stageDefaults };

if (require.main === module) {
  const [, , root, output, modelsOutput] = process.argv;
  if (!root || !output) {
    throw new Error('Usage: stage_boardstudio.cjs ROOT OUTPUT');
  }
  console.log(JSON.stringify(stage(root, output)));
  stageDefaults(root, output, modelsOutput).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
