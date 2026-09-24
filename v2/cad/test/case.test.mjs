import assert from 'node:assert/strict';
import test from 'node:test';
import { createInstance } from 'libcascade/single/init';
import { buildAssembly, buildCase, readStepModel } from '../src/index.ts';
import { prepareAssembly, prepareCase } from './native-prepare.mjs';

const rawCase = async (ir) => buildCase(prepareCase(ir));
const rawAssembly = async (ir) => buildAssembly(prepareAssembly(ir));

const square = (min, max) => [
  { x: min, y: min },
  { x: max, y: min },
  { x: max, y: max },
  { x: min, y: max },
];

test('imports a generated STEP with mesh and bounds', async () => {
  const result = await rawCase({
    revision: 1,
    body: { id: 'case', name: 'plate', boardId: 'board', kind: 'plate', thickness: 2, clearance: 0 },
    contours: [{ hole: false, points: square(0, 20) }],
  });
  const model = await readStepModel(result.step);
  assert.ok(model.mesh.positions.length > 0);
  assert.equal(model.mesh.positions.length, model.mesh.normals.length);
  assert.deepEqual(model.bounds.min.map(Math.round), [0, 0, 0]);
  assert.deepEqual(model.bounds.max.map(Math.round), [20, 20, 2]);
  await assert.rejects(readStepModel(new Uint8Array([1, 2, 3])), /STEP import failed/);
});

test('exports a holed plate as a readable STEP and mesh', async () => {
  const result = await rawCase({
    revision: 7,
    body: { id: 'case', name: 'plate', boardId: 'board', kind: 'plate', thickness: 2, clearance: 0.5 },
    contours: [
      { hole: false, points: square(0, 20) },
      { hole: true, points: square(5, 15) },
    ],
  });

  assert.equal(result.revision, 7);
  assert.ok(result.step.byteLength > 0);
  assert.ok(result.mesh.positions.length > 0);
  assert.equal(result.mesh.positions.length, result.mesh.normals.length);
  const measured = await inspectStep(result.step);
  assert.ok(Math.abs(measured.volume - (21 * 21 - 9 * 9) * 2) < 0.1);

  const oc = await createInstance();
  oc.FS.writeFile('/cad-smoke.step', result.step);
  using reader = new oc.STEPControl_Reader();
  const status = reader.ReadFile('/cad-smoke.step');
  assert.equal(status, oc.IFSelect_ReturnStatus.IFSelect_RetDone);
  oc.FS.unlink('/cad-smoke.step');
});

test('clearance closes a narrow concave notch without invalid edges', async () => {
  const contour = [
    { x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 30 },
    { x: 18, y: 30 }, { x: 18, y: 5 }, { x: 12, y: 5 },
    { x: 12, y: 30 }, { x: 0, y: 30 },
  ];
  const result = await rawCase({
    revision: 8,
    body: { id: 'case', name: 'plate', boardId: 'board', kind: 'plate', thickness: 2, clearance: 4 },
    contours: [{ hole: false, points: contour }],
  });
  const shape = await inspectStep(result.step);

  assert.ok(Math.abs(shape.volume - 38 * 38 * 2) < 0.1);
});

test('concave tray and lid retain valid wall solids after inset', async () => {
  const contour = [
    { x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 30 },
    { x: 26, y: 30 }, { x: 26, y: 7 }, { x: 14, y: 7 },
    { x: 14, y: 30 }, { x: 0, y: 30 },
  ];
  for (const kind of ['tray', 'lid']) {
    const result = await rawCase({
      revision: 9,
      body: {
        id: kind, name: kind, boardId: 'board', kind,
        thickness: 2, clearance: 1, wallHeight: 5, wallThickness: 2,
      },
      contours: [{ hole: false, points: contour }],
    });
    const shape = await inspectStep(result.step);
    assert.ok(shape.volume > 0);
    assert.ok(shape.volume < 42 * 32 * 7);
  }
});

async function inspectStep(bytes) {
  const oc = await createInstance();
  const path = '/cad-mass.step';
  oc.FS.writeFile(path, bytes);
  using reader = new oc.STEPControl_Reader();
  assert.equal(reader.ReadFile(path), oc.IFSelect_ReturnStatus.IFSelect_RetDone);
  reader.TransferRoots();
  using shape = reader.OneShape();
  using mass = new oc.GProp_GProps();
  using bounds = new oc.Bnd_Box();
  oc.BRepGProp.VolumeProperties(shape, mass, true, true, false);
  oc.BRepBndLib.AddOptimal(shape, bounds, false, false);
  oc.FS.unlink(path);
  return { volume: mass.Mass(), minZ: bounds.GetZMin(), maxZ: bounds.GetZMax() };
}

test('tray and lid form cavities and honor mounting geometry', async () => {
  const contours = [{ hole: false, points: square(0, 40) }];
  const base = { id: 'body', name: 'body', boardId: 'board', thickness: 2, clearance: 0, z: 3 };
  const plate = await inspectStep((await rawCase({
    revision: 1, body: { ...base, kind: 'plate' }, contours,
  })).step);
  const tray = await inspectStep((await rawCase({
    revision: 2,
    body: {
      ...base, kind: 'tray', wallHeight: 6, wallThickness: 3,
      mounts: [{ id: 'boss', kind: 'boss', at: { x: 10, y: 10 }, holeDiameter: 2, bossDiameter: 5, height: 3 }],
      gasket: { inset: 0.5, width: 1, depth: 0.5 },
    },
    contours,
  })).step);
  const lid = await inspectStep((await rawCase({
    revision: 3,
    body: { ...base, kind: 'lid', wallHeight: 6, wallThickness: 3 },
    contours,
  })).step);

  assert.ok(Math.abs(plate.volume - 3200) < 0.1);
  assert.ok(tray.volume > plate.volume);
  assert.ok(tray.volume < 40 * 40 * 8);
  assert.ok(Math.abs(lid.volume - (40 * 40 * 8 - 34 * 34 * 6)) < 0.1);
  assert.ok(Math.abs(tray.minZ - 3) < 0.01);
  assert.ok(Math.abs(tray.maxZ - 11) < 0.01);
  assert.ok(Math.abs(lid.minZ - 3) < 0.01);
  assert.ok(Math.abs(lid.maxZ - 11) < 0.01);
});

test('exports two vertically offset bodies as one STEP compound', async () => {
  const contours = [{ hole: false, points: square(0, 20) }];
  const bodies = [0, 8].map((z, index) => ({
    revision: 9,
    body: {
      id: `plate-${index}`, name: `plate-${index}`, boardId: 'board',
      kind: 'plate', thickness: 2, clearance: 0, z,
    },
    contours,
  }));
  const result = await rawAssembly({ revision: 9, bodies });
  const shape = await inspectStep(result.step);

  assert.equal(result.revision, 9);
  assert.ok(Math.abs(shape.volume - 1600) < 0.1);
  assert.ok(Math.abs(shape.minZ) < 0.01);
  assert.ok(Math.abs(shape.maxZ - 10) < 0.01);
  assert.ok(result.mesh.positions.length > 0);
  assert.equal(result.mesh.positions.length, result.mesh.normals.length);
});

test('plate construction retains a deleted corner and authored cutout', async () => {
  const contours = [
    { hole: false, points: [{x:10,y:0},{x:30,y:0},{x:30,y:30},{x:0,y:30},{x:0,y:10},{x:10,y:10}] },
    { hole: true, points: square(15, 20) },
  ];
  const result = await rawCase({
    revision: 12,
    body: { id: 'plate', name: 'plate', boardId: 'board', kind: 'plate', thickness: 2, clearance: 0 },
    contours,
  });
  const measured = await inspectStep(result.step);
  assert.equal(result.revision, 12);
  assert.ok(Math.abs(measured.volume - (30 * 30 - 10 * 10 - 5 * 5) * 2) < 0.1);
});
