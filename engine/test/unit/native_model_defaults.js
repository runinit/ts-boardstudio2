const assert = require('node:assert/strict')
const engine = require('../../src/ergogen')
const frames = require('../../src/native/frames')
const tools = require('../../src/footprint-tools')
const inventory = require('../../src/designs/board-inventory')

const fixture = () => ({
    schema: 'ergogen/v1',
    layout: {objects: {part: {
        kind: 'component', pcb: 'main',
        placement: {at: [10,20,7], rotate: 30, tilt: 20},
        footprints: {
            front: {what: 'default_model_test', placement: {at: [3,4,0], rotate: 40}},
            back: {what: 'default_model_test', params: {side: 'B'}, placement: {at: [-3,2,0], rotate: -20}}
        }
    }}},
    designs: {regions: {main: {shape: {size: [100,100]}}}, profiles: {main: {from: 'regions.main'}}, assemblies: {main: {preset: 'enclosure', profile: 'profiles.main', board: {source: 'generated', name: 'main'}, mounting: 'bottom', ledge: {width: 2}}}},
    pcbs: {main: {profile: 'profiles.main', thickness: 2}}
})

before(() => engine.inject('footprint', 'default_model_test', {
    params: {side: 'F', designator: 'U'},
    body: p => `(footprint "default_test" (layer "${p.side}.Cu") ${p.at}
      (property "Reference" "${p.ref}")
      (model "\${KIPRJMOD}/models/one.step" (offset (xyz 1 0 1)) (scale (xyz 1 1 1)) (rotate (xyz 0 0 0)))
      (model "\${KIPRJMOD}/models/two.step" (offset (xyz 2 0 0)) (scale (xyz 1 1 1)) (rotate (xyz 0 0 30))))`
}))

it('carries every emitted model in its exact KiCad frame', async () => {
    const result = await engine.process(fixture(), {analysis: true, debug: true})
    const component = result.designs.boards.main.components[0]
    assert.equal(component.models.length, 4)
    const footprints = inventory.read(result.pcbs.main).components
    for (const model of component.models) {
        const target = component.native.footprints.find(target => target.reference === model.footprintReference)
        assert.deepEqual(target.frame, model.frame)
        const footprint = footprints.find(fp => fp.reference === model.footprintReference)
        assert.ok(footprint)
        const local = tools.modelPoint([2,3,4], {...model, frame: undefined})
        const boardFrame = require('../../src/native/layout').resolve(fixture()).boardFrame('main').matrix
        const expected = frames.transform(frames.multiply(boardFrame, frames.local([...footprint.position, footprint.side === 'top' ? 2 : 0], footprint.rotation, footprint.side === 'bottom' ? 180 : 0)), local)
        const actual = frames.transform(component.native.matrix, tools.modelPoint([2,3,4], model))
        actual.forEach((value, axis) => assert.ok(Math.abs(value - expected[axis]) < 1e-8, `${model.footprintKey}: axis ${axis}`))
    }
})

it('keeps an explicit object model list authoritative', async () => {
    const input = fixture()
    input.layout.objects.part.models = [{path: 'owned.step', offset: [0,0,0], rotate: [0,0,0], scale: [1,1,1]}]
    const result = await engine.process(input, {analysis: true, debug: true})
    assert.deepEqual(result.designs.boards.main.components[0].models, input.layout.objects.part.models)
})

it('places framed native imports once without repeating the component side flip', async () => {
    const component = {
        side: 'bottom', native: {matrix: frames.local([10,20,7],30,20)},
        models: [{path: '${KIPRJMOD}/models/part.step', asset: 'part.step', offset: [1,2,3], rotate: [0,0,10], scale: [1,1,1], frame: frames.local([3,4,5],50,180)}]
    }
    const kernel = {
        import: async () => [2,3,4],
        placeModel: (point, model, placement) => {
            const local = tools.modelPoint(point, {...model, frame: undefined})
            return placement.side === 'bottom' ? [local[0],-local[1],-local[2]] : local
        },
        placeRigid: (point, matrix) => frames.transform(matrix, point),
        compound: points => points
    }
    const result = await require('../../src/designs/native-models').place(kernel, component, {'part.step': 'STEP'}, 0, 'test')
    const expected = frames.transform(component.native.matrix, tools.modelPoint([2,3,4], component.models[0]))
    result[0].forEach((value, axis) => assert.ok(Math.abs(value - expected[axis]) < 1e-8))
})

it('retains emitted footprint targets for explicit native models', async () => {
    const input = fixture()
    input.layout.objects.part.footprints.front.reference = 'CUSTOM1'
    input.layout.objects.part.models = [{path: 'owned.step'}]
    const result = await engine.process(input, {analysis: true, debug: true})
    const targets = result.designs.boards.main.components[0].native.footprints
    assert.equal(targets?.length, 2)
    assert.equal(targets.find(target => target.key === 'front').reference, 'CUSTOM1')
    for (const target of targets) {
        assert.equal(tools.inspect(result.pcbs.main, {reference: target.reference}).models.length, 2)
    }
})
