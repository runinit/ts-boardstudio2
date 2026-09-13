const assert = require('node:assert/strict')
const engine = require('../../src/ergogen')

const paths = [
    {type: 'line', origin: [0, 0], end: [10, 0]},
    {type: 'arc', center: [10, 5], radius: 5, startAngle: 270, endAngle: 90},
    {type: 'line', origin: [10, 10], end: [0, 10]},
    {type: 'line', origin: [0, 10], end: [0, 0]},
    {type: 'circle', center: [4, 5], radius: 1}
]
const frozen = () => ({schema: 'ergogen/v1', layout: {}, designs: {
    regions: {keys: {select: {ids: ['deleted']}, envelope: 'missing', close: 'unknown_unit', snapshot: {paths}}},
    boundaries: {edge: {from: 'regions.deleted', clearance: 'unknown_unit', snapshot: {paths}}},
    profiles: {board: {from: 'boundaries.deleted', corners: {fillet: 'unknown_unit'}, snapshot: {paths}}}
}})

describe('Frozen native outlines', () => {
    it('retains exact curves and bypasses every retained recipe', async () => {
        const result = await engine.process(frozen(), {debug: true, svg: true, analysis: true})
        for (const ref of ['regions.keys', 'boundaries.edge', 'profiles.board']) {
            const actual = Object.values(result.designs.features[ref].model.paths)
            assert.equal(actual.length, paths.length)
            assert.deepEqual(actual[1], {type: 'arc', origin: [10, 5], radius: 5, startAngle: 270, endAngle: 90})
            assert.deepEqual(actual[4], {type: 'circle', origin: [4, 5], radius: 1})
        }
        assert.match(result.outlines.board.svg, /svg/)
    })
    it('rejects non-finite coordinates and malformed paths before geometry', async () => {
        for (const bad of [
            {type: 'line', origin: [Infinity, 0], end: [1, 0]},
            {type: 'circle', center: [0, 0], radius: -1},
            {type: 'arc', center: [0, 0], radius: 1, startAngle: NaN, endAngle: 90},
            {type: 'line', origin: [1], end: [2, 3]}
        ]) {
            const source = frozen()
            source.designs.regions.keys.snapshot.paths = [bad]
            await assert.rejects(engine.process(source, {debug: true, analysis: true}))
        }
    })
    it('resolves draft dependencies without invoking the constraint solver', () => {
        const report = engine.resolveLayout({schema: 'ergogen/v1', layout: {
            objects: {a: {kind: 'anchor', placement: {at: [7, 0, 0]}}, b: {kind: 'anchor', placement: {ref: 'a', at: [3, 0, 0]}}},
            constraints: {impossible: {type: 'distance', refs: ['a', 'b'], value: 99}}
        }})
        assert.deepEqual(report.objects.b.position, [10, 0, 0])
        assert.equal(typeof report.then, 'undefined')
    })
    it('retains fixed placement targets and reports conflicting constraints', async () => {
        const source = {schema: 'ergogen/v1', layout: {objects: {
            a: {kind: 'anchor'}, b: {kind: 'anchor', placement: {at: [10, 0, 0], solve: ['x'], override: {at: [5, 0, 0], fixed: ['x']}}}
        }, constraints: {spacing: {type: 'distance', refs: ['a', 'b'], value: 10}}}}
        assert.equal(engine.resolveLayout(source).objects.b.position[0], 15)
        await assert.rejects(engine.solveLayout(source), error => error.diagnostics.some(item => item.feature === 'layout.constraints.spacing'))
        delete source.layout.objects.b.placement.override.fixed
        const solved = await engine.solveLayout(source)
        assert.ok(Math.abs(solved.results.layout.objects.b.position[0] - 10) < 1e-6)
    })
})

it('carries solved offsets into a synchronous dependent draft and drops fixed axes', async () => {
    const source = {schema: 'ergogen/v1', layout: {objects: {
        a: {kind: 'anchor'},
        b: {kind: 'anchor', placement: {at: [10, 0, 0], solve: ['x']}},
        child: {kind: 'anchor', placement: {ref: 'b', at: [2, 0, 0]}}
    }, constraints: {distance: {type: 'distance', refs: ['a', 'b'], value: 20}}}}
    const solved = await engine.solveLayout(source)
    const offsets = solved.results.layout.offsets
    assert.ok(offsets)
    assert.equal(engine.resolveLayout(source, offsets).objects.child.position[0], 22)
    source.layout.objects.b.placement.override = {at: [15, 0, 0], fixed: ['x']}
    const draft = engine.resolveLayout(source, offsets)
    assert.equal(draft.objects.b.position[0], 25)
    assert.equal(draft.objects.child.position[0], 27)
})
