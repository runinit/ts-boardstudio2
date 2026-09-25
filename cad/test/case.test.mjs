import assert from 'node:assert/strict';
import test from 'node:test';
import { createInstance } from 'libcascade/single/init';
import { buildAssembly, buildCase, readStepModel } from '../src/index.ts';
import { prepareAssembly, prepareCase, resolveMechanical } from './native-prepare.mjs';

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


test('generated mechanical plate and battery stack roundtrip with nominal dimensions', async () => {
  const document = mechanicalDocument();
  const contours = [{ hole: false, points: square(0, 40) }, { hole: true, points: square(12, 26) }];
  const assembly = resolveMechanical(document, contours);
  assert.deepEqual(assembly.nominalPlateContours, assembly.plateContours);
  assert.deepEqual(assembly.plateContours.filter(contour => contour.hole), contours.filter(contour => contour.hole));
  const outer = assembly.plateContours.find(contour => !contour.hole).points;
  assert.ok(Math.abs(Math.min(...outer.map(point => point.x)) + 2.2) < 0.001);
  const plate = assembly.case.bodies.find(body => body.body.id === 'plate');
  assert.deepEqual(plate.contours, assembly.plateContours);
  const plateResult = await rawCase(plate);
  const plateShape = await inspectStep(plateResult.step);
  assert.ok(Math.abs(plateShape.volume - (polygonArea(outer) - 196 - Math.PI) * 1.5) < 0.1);
  const full = await rawAssembly(assembly.case);
  const model = await readStepModel(full.step);
  const bottom = assembly.stack.find(layer => layer.id === 'bottom');
  assert.ok(Math.abs(model.bounds.min[2] - bottom.z) < 0.01);
  assert.ok(Math.abs(model.bounds.max[2] - 5) < 0.01);
  assert.equal(full.revision, 21);
  assert.ok(full.bodies.length >= 4);
});

test('integrated plate lid has downward frame and exact side-access subtraction', async () => {
  const contours = [{ hole: false, points: square(0, 40) }];
  const body = { id: 'plate-frame', name: 'plate-frame', boardId: 'board', kind: 'lid', thickness: 1.5, clearance: 0, z: -5, wallHeight: 8.5, wallThickness: 2 };
  const plain = await rawCase({ revision: 30, body, contours });
  const plainShape = await inspectStep(plain.step);
  assert.ok(Math.abs(plainShape.volume - (1600 * 1.5 + (1600 - 36 * 36) * 8.5)) < 0.1);
  assert.ok(Math.abs(plainShape.minZ + 5) < 0.01);
  assert.ok(Math.abs(plainShape.maxZ - 5) < 0.01);
  const cut = await rawCase({ revision: 30, contours, body: { ...body, openings: [{
    points: [{ x: 12, y: -1 }, { x: 22, y: -1 }, { x: 22, y: 3 }, { x: 12, y: 3 }], z: -2, height: 3,
  }] } });
  const cutShape = await inspectStep(cut.step);
  assert.ok(Math.abs(plainShape.volume - cutShape.volume - 10 * 2 * 3) < 0.1);
  const imported = await readStepModel(cut.step);
  assert.ok(imported.mesh.positions.length > 0);
  await assert.rejects(rawCase({ revision: 30, contours, body: { ...body, openings: [{ points: square(0, 2), z: 0, height: -1 }] } }), /opening/);
});


function polygonArea(points) {
  return Math.abs(points.reduce((area, point, index) => {
    const next = points[(index + 1) % points.length];
    return area + point.x * next.y - next.x * point.y;
  }, 0)) / 2;
}

function mechanicalDocument() {
  return {
    format: 'boardstudio/v2', id: 'mechanical', name: 'Mechanical', revision: 21,
    parameters: {}, definitions: [], parts: [], matrices: [], constraints: [], nets: [],
    outline: [], caseBodies: [], assets: [], materials: [], scripts: [],
    boards: [{ id: 'board', name: 'Board', outlineIds: [], partIds: [], netIds: [], thickness: 1.6, traces: [], vias: [] }],
    mechanical: { boardId: 'board', method: 'printed', mount: 'rigid', plateThickness: 1.5,
      plateFoamThickness: 1, pcbThickness: 1.6, bottomFoamThickness: 0.5, batteryHeight: 3,
      bottomThickness: 2, plateToPcb: 3.5, wallThickness: 2, clearance: 0.2, profiles: [],
      mounts: [{ id: 'hole', kind: 'hole', at: { x: 5, y: 5 }, holeDiameter: 2, bossDiameter: 5 }],
    },
  };
}


test('resolved allowance, integrated frame and gasket assemblies retain fit geometry through STEP', async () => {
  const contours = [{ hole: false, points: square(0, 40) }, { hole: true, points: square(12, 26) }];
  const doc = mechanicalDocument();
  doc.mechanical.openingAllowance = 0.2;
  const adjusted = resolveMechanical(doc, contours);
  const nominalOpening = adjusted.nominalPlateContours.find(contour => contour.hole);
  const actualOpening = adjusted.plateContours.find(contour => contour.hole);
  assert.ok(Math.abs(polygonArea(nominalOpening.points) - 196) < 0.001);
  assert.ok(Math.abs(polygonArea(actualOpening.points) - 14.4 ** 2) < 0.1);
  const plate = adjusted.case.bodies.find(body => body.body.id === 'plate');
  assert.deepEqual(plate.contours, adjusted.plateContours);
  const actual = await inspectStep((await rawCase(plate)).step);
  const outer = plate.contours.find(contour => !contour.hole);
  assert.ok(Math.abs(actual.volume - (polygonArea(outer.points) - polygonArea(actualOpening.points) - Math.PI) * 1.5) < 0.1);
  const foam = adjusted.case.bodies.find(body => body.body.id === 'plate-foam');
  assert.ok(foam.contours.some(contour => contour.hole && Math.abs(polygonArea(contour.points) - 196) < 0.001));
  for (const mount of ['rigid', 'gasket']) {
    doc.mechanical.openingAllowance = 0;
    doc.mechanical.integratedPlateFrame = mount === 'rigid';
    doc.mechanical.mount = mount;
    doc.mechanical.gasketTravel = mount === 'gasket' ? 0.5 : undefined;
    doc.mechanical.gasket = mount === 'gasket' ? { inset: 0.5, width: 1, depth: 0.5 } : undefined;
    const resolved = resolveMechanical(doc, contours);
    const plateBody = resolved.case.bodies.find(body => body.body.id === 'plate').body;
    assert.equal(plateBody.kind, mount === 'rigid' ? 'lid' : 'plate');
    if (mount === 'gasket') {
      const bottom = resolved.case.bodies.find(body => body.body.id === 'bottom');
      const gasket = resolved.case.bodies.find(body => body.body.id === 'gasket');
      const ring = await inspectStep((await rawCase(gasket)).step);
      const tray = await inspectStep((await rawCase(bottom)).step);
      const plateShape = await inspectStep((await rawCase(resolved.case.bodies.find(body => body.body.id === 'plate'))).step);
      assert.ok(Math.abs(tray.maxZ - 3.0) < 0.01, 'rigid rim stays below the plate');
      assert.ok(Math.abs(ring.minZ - 2.5) < 0.01, 'gasket seats in the machined groove');
      assert.ok(Math.abs(ring.maxZ - 3.5) < 0.01, 'gasket reaches plate underside');
      assert.ok(Math.abs(plateShape.minZ - ring.maxZ) < 0.01, 'plate meets gasket without rigid rim contact');
      assert.ok(ring.volume > 0);
    }
    const result = await rawAssembly(resolved.case);
    const imported = await readStepModel(result.step);
    assert.ok(imported.mesh.positions.length > 0);
    assert.ok(Math.abs(imported.bounds.max[2] - 5) < 0.01);
  }
});

test('component-local connector access transforms into a real side-wall opening', async () => {
  const contours = [{ hole: false, points: square(0, 40) }];
  const document = mechanicalDocument();
  const original = resolveMechanical(document, contours);
  const originalBottom = original.case.bodies.find(body => body.body.id === 'bottom');
  document.parts = [{ id: 'connector', definitionId: 'connector', reference: 'J1', side: 'front', pose: { at: { x: 0, y: 20 }, rotation: 90 } }];
  document.boards[0].partIds = ['connector'];
  document.mechanical.profiles = [{ definitionId: 'connector', source: 'Explicit connector datasheet fixture', cutouts: [], plateToPcb: 3.5, openings: [{
    points: [{ x: -5, y: -1 }, { x: 5, y: -1 }, { x: 5, y: 4 }, { x: -5, y: 4 }], z: -2, height: 3,
  }] }];
  const resolved = resolveMechanical(document, contours);
  const bottom = resolved.case.bodies.find(body => body.body.id === 'bottom');
  assert.equal(bottom.body.openings.length, 1);
  assert.ok(Math.abs(bottom.body.openings[0].points[0].x - 1) < 0.001);
  assert.ok(Math.abs(bottom.body.openings[0].points[0].y - 15) < 0.001);
  const before = await inspectStep((await rawCase(originalBottom)).step);
  const after = await inspectStep((await rawCase(bottom)).step);
  assert.ok(Math.abs(before.volume - after.volume - 60) < 0.1);
});
