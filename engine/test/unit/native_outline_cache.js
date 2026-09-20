const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const engine = require('../../src/ergogen')
const g = require('../../src/designs/geometry')
const fixture = require('../fixtures/native/matrix-outline-recovery.json')
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const settings = {analysis: true, debug: true, svg: true}
const input = () => structuredClone(fixture)

describe('Native staged outline reuse', function() {
    this.timeout(120000)

    it('retains complete analysis output without rebuilding the published outline geometry', async () => {
        const source = input()
        const expected = await engine.process(source, settings)
        assert.equal(hash(expected.outlines), '1eb82f1b99004f490e957249f7d36d7d627de33e88227b3a1d1837d988b26f29')
        assert.equal(hash(expected.designs.features), '8b059258e09975f330d83edda26044b410876ba583c8cbbefa5eb963e058529b')
        const preparedLayout = await engine.solveLayout(source)
        const options = {...settings, preparedLayout}
        const describe = sinon.spy(g, 'describe')
        const outline = await engine.process(source, {...options, outlineOnly: true})
        const described = describe.callCount
        outline.designs.features['profiles.board'].bounds.low[0] = -999
        const actual = await engine.process(source, options)
        assert.deepEqual(actual, expected, 'Staged analysis retains all geometry and diagnostics despite caller mutation')
        assert.equal(describe.callCount, described, 'Analysis must consume the completed outline geometry instead of rebuilding it')
        await engine.process(source, options)
        assert.ok(describe.callCount > described, 'The geometry handoff is consumed once')
    })

    for (const change of ['source', 'assets', 'scene']) {
        it(`rebuilds and retains complete output when the ${change} changes between stages`, async () => {
            const source = input()
            const options = {...settings, preparedLayout: await engine.solveLayout(source)}
            await engine.process(source, {...options, outlineOnly: true})
            if (change === 'source') { source.designs.boundaries.edge.clearance = 3 }
            if (change === 'assets') { options.assets = {'notes.txt': 'changed'} }
            if (change === 'scene') { options.preparedLayout = await engine.solveLayout(source) }
            const describe = sinon.spy(g, 'describe')
            const actual = await engine.process(source, options)
            assert.ok(describe.callCount > 0, 'Changed inputs cannot consume stale geometry')
            const expected = await engine.process(source, {...options, preparedLayout: undefined})
            assert.deepEqual(actual, expected)
        })
    }
})

describe('Native staged PCB output', function() {
    this.timeout(120000)
    it('retains board compilation and findings after publishing outlines', async () => {
        const source = {
            schema: 'ergogen/v1',
            layout: {objects: {key: {kind: 'key', pcb: 'main', footprints: {switch: {what: 'mx', params: {from: 'C', to: 'R'}}}}}},
            designs: {regions: {board: {shape: {size: [80, 60]}}}, profiles: {board: {from: 'regions.board'}}},
            pcbs: {main: {profile: 'profiles.board'}}
        }
        const expected = await engine.process(source, settings)
        const options = {...settings, preparedLayout: await engine.solveLayout(source)}
        await engine.process(source, {...options, outlineOnly: true})
        const actual = await engine.process(source, options)
        assert.ok(actual.pcbs.main.includes('(kicad_pcb'))
        assert.deepEqual(actual, expected)
    })
})
