import assert from 'node:assert/strict';
import { defaultOutlineSettings, emptyProject } from '../src/index.ts';

assert.deepEqual(defaultOutlineSettings, {
  corners: 'fillet',
  size: 2,
  bridgeWidth: 10,
});

const document = emptyProject('node-import', 'Node import');
assert.equal(document.format, 'boardstudio/v2');
assert.equal(document.revision, 0);
assert.deepEqual(document.constraints, []);
