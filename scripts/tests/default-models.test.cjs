const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const ergogen = require('ergogen');
const sexpr = require('ergogen/src/templates/sexpr');
const withoutModels = (source) =>
  sexpr.print(sexpr.parse(ergogen.footprints.models(source, []))[0]);
const library = path.resolve(
  process.env.BOARDSTUDIO_FOOTPRINTS ||
    path.join(__dirname, '../../vendor/boardstudio-footprints')
);

function evaluate(source) {
  const context = { module: { exports: {} } };
  vm.runInNewContext(source, context);
  return context.module.exports;
}
async function generate(module) {
  const params = {};
  for (const [name, value] of Object.entries(module.params)) {
    if (value === undefined || value?.type === 'net') {
      params[name] = value?.value || name;
    }
  }
  ergogen.inject('footprint', 'model_test', module);
  const result = await ergogen.process(
    {
      schema: 'ergogen/v1',
      layout: {
        objects: {
          part: {
            kind: 'component',
            pcb: 'main',
            footprints: { part: { what: 'model_test', params } },
          },
        },
      },
      designs: {
        regions: { main: { shape: { size: [100, 100] } } },
        profiles: { main: { from: 'regions.main' } },
      },
      pcbs: { main: { profile: 'profiles.main' } },
    },
    { debug: true }
  );
  return result.pcbs.main;
}

test('default adapters emit portable models without changing copper or nets', async () => {
  const { defaultModels, bindDefaults } = await import(
    pathToFileURL(path.join(library, 'src/defaultModels.mjs'))
  );
  const defaults = JSON.parse(
    fs.readFileSync(path.join(library, 'manifest/default-models.json'))
  );
  for (const name of Object.keys(defaults)) {
    const [namespace, file] = name.split('/');
    const source = fs.readFileSync(
      path.join(
        library,
        namespace === 'ceoloide' ? '' : 'vendor/infused-kim',
        file + '.js'
      ),
      'utf8'
    );
    const original = evaluate(source);
    if (name === 'ceoloide/display_nice_view') {
      assert.match(
        defaultModels(name).pin_header_3dmodel_filename,
        /1x-5\.step$/
      );
      assert.match(
        defaultModels(name).pin_socket_3dmodel_filename,
        /PinSocket_1x05_P2\.54mm_Vertical\.step$/
      );
    }
    for (const [key, value] of Object.entries(defaultModels(name))) {
      assert.ok(key in original.params, `${name}: undeclared ${key}`);
      if (!key.endsWith('_filename')) {
        continue;
      }
      const asset = value.replace(
        /^\$\{KIPRJMOD\}\/models\/boardstudio\/([^/]+)\//,
        'vendor/$1/3d_models/'
      );
      assert.ok(
        fs.existsSync(path.join(library, asset)),
        `${name}: missing ${asset}`
      );
    }
    const before = await generate(original);
    const after = await generate(evaluate(bindDefaults(source, name)));
    const info = ergogen.footprints.inspect(after);
    assert.ok(info.models.length, `${name}: no emitted models`);
    const paths = Object.entries(defaultModels(name))
      .filter(([key]) => key.endsWith('_filename'))
      .map(([, value]) => value);
    for (const model of info.models) {
      assert.ok(
        paths.includes(model.path),
        `${name}: malformed model path ${model.path}`
      );
    }
    assert.ok(
      info.models.every((model) =>
        model.path.startsWith('${KIPRJMOD}/models/boardstudio/')
      ),
      name
    );
    assert.equal(
      withoutModels(after),
      withoutModels(before),
      `${name}: non-model geometry changed`
    );
  }
});
