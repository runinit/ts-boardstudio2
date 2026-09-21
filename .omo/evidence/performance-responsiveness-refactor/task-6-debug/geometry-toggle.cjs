const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const appRequire = createRequire(path.join(process.cwd(), 'app/package.json'));
const { parseDocument } = appRequire('yaml');
const ergogen = appRequire('ergogen');
const sourcePath = path.join(__dirname, 'candidate-diagnostic/diagnostic-keeps-drags-nud-6fdd5-ugh-delayed-outline-updates/final-source.yaml');
const source = fs.readFileSync(sourcePath, 'utf8');
async function rejectsDisconnected(label) {
  await assert.rejects(() => ergogen.process(source, { analysis: true, outlineOnly: true }), error => {
    console.log(JSON.stringify({ label, error: error.message, diagnostics: error.diagnostics }));
    return /designs\.boundaries\.main_edge: Expected one connected region; found 2/.test(error.message);
  });
}
(async () => {
  await rejectsDisconnected('single-before');
  const document = parseDocument(source);
  document.setIn(['designs', 'boundaries', 'main_edge', 'connected'], 'multiple');
  const result = await ergogen.process(String(document), { analysis: true, outlineOnly: true });
  assert.ok(result.designs.features['boundaries.main_edge']);
  console.log(JSON.stringify({ label: 'multiple', generatedBoundary: true }));
  await rejectsDisconnected('single-restored');
})().catch(error => { console.error(error); process.exitCode = 1; });
