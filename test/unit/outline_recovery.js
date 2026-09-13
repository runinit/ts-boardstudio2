const assert = require('node:assert/strict')
const m = require('makerjs')
const engine = require('../../src/ergogen')
const g = require('../../src/designs/geometry')

const ring = () => ({
    schema: 'ergogen/v1', layout: {},
    designs: {
        regions: {
            bottom: {shape: {size: [40, 10], anchor: {shift: [0, -15]}}},
            top: {shape: {size: [40, 10], anchor: {shift: [0, 15]}}},
            left: {shape: {size: [10, 40], anchor: {shift: [-15, 0]}}},
            right: {shape: {size: [10, 40], anchor: {shift: [15, 0]}}}
        },
        boundaries: {edge: {from: ['regions.bottom', 'regions.top', 'regions.left', 'regions.right'], holes: 'fill', clearance: 2, corners: {fillet: 2}, connected: 'single'}},
        profiles: {board: {from: 'boundaries.edge'}}
    }
})
const generate = async input => (await engine.process(input, {analysis: true})).designs.features['profiles.board'].model

describe('Board outline recovery', function () {
    this.timeout(60000)

    it('keeps every diode and LED envelope during gap closing', () => {
        const envelopes = Array.from({length: 58}, (_, i) => {
            const size = i % 2 ? [5, 5] : [3.2, 1.6]
            const model = m.model.center(new m.models.Rectangle(...size))
            return m.model.moveRelative(m.model.rotate(model, [0, 15, 37][i % 3], [0, 0]), [i % 10 * 20, Math.floor(i / 10) * 20])
        })
        const occupied = {models: Object.fromEntries(envelopes.map((model, i) => [i, model]))}
        const closed = g.close(occupied, 2)
        assert.equal(g.validate(closed, 'components'), envelopes.length)
        for (const envelope of envelopes) { assert.ok(g.contains(closed, envelope)) }
    })

    it('handles contraction at the exact expansion radius', () => {
        const occupied = m.model.center(new m.models.Rectangle(3.2, 1.6))
        const closed = g.close(occupied, 2)
        assert.equal(g.validate(closed, 'diode'), 1)
        assert.ok(g.contains(closed, occupied))
    })

    it('keeps all 33 keys in a filled multi-matrix board', async () => {
        // Synthetic replacement: the original reported design was unavailable.
        const input = require('../fixtures/native/matrix-outline-recovery.json')
        const result = await engine.process(input, {analysis: true})
        assert.equal(Object.values(result.layout.objects).filter(item => item.kind === 'key').length, 33)
        const board = result.designs.features['profiles.board'].model
        const keys = result.designs.features['regions.keys'].model
        const components = result.designs.features['regions.components'].model
        assert.equal(g.chains(components).length, 58)
        assert.ok(g.contains(board, g.offset(components, 2)))
        assert.equal(g.validate(board, 'board', 'single'), 1)
        assert.equal(g.chains(board)[0].contains?.length || 0, 0)
        assert.ok(g.contains(board, g.offset(keys, 2)))
        assert.ok(g.paths(board).some(path => path.type === 'arc' && Math.abs(path.radius - 2) < g.TOLERANCE))
    })

    it('fills incidental holes before finishing and keeps clearance', async () => {
        const board = await generate(ring())
        assert.equal(g.validate(board, 'board', 'single'), 1)
        assert.equal(g.chains(board)[0].contains?.length || 0, 0)
        assert.ok(g.contains(board, g.offset(m.model.center(new m.models.Rectangle(40, 40)), 2)))
        assert.ok(g.paths(board).some(path => path.type === 'arc' && Math.abs(path.radius - 2) < g.TOLERANCE))
    })

    it('preserves holes by default and when explicitly selected', async () => {
        for (const holes of [undefined, 'preserve']) {
            const input = ring()
            delete input.designs.boundaries.edge.corners
            if (holes) { input.designs.boundaries.edge.holes = holes }
            else { delete input.designs.boundaries.edge.holes }
            assert.equal(g.chains(await generate(input))[0].contains.length, 1)
        }
    })

    it('supports filled profiles and rejects unknown hole modes', async () => {
        const input = ring()
        delete input.designs.boundaries.edge.holes
        delete input.designs.boundaries.edge.corners
        input.designs.profiles.board.holes = 'fill'
        assert.equal(g.chains(await generate(input))[0].contains?.length || 0, 0)
        input.designs.profiles.board.holes = 'ignore'
        await assert.rejects(generate(input), /holes/)
    })

    it('retains explicit cutouts on filled boundaries', async () => {
        const input = ring()
        input.designs.regions.hole = {shape: {radius: 2}}
        input.designs.boundaries.edge.cutouts = ['regions.hole']
        const board = await generate(input)
        assert.equal(g.chains(board)[0].contains.length, 1)
        assert.ok(g.paths(board).some(path => path.type === 'circle' && path.radius === 2))
    })

    it('keeps inherited explicit cutouts when filling a derived profile', async () => {
        const input = ring()
        input.designs.regions.hole = {shape: {radius: 2}}
        input.designs.boundaries.edge.cutouts = ['regions.hole']
        input.designs.profiles.board.holes = 'fill'
        assert.equal(g.chains(await generate(input))[0].contains.length, 1)
    })

    it('never fills a protected gap silently', async () => {
        const input = ring()
        input.designs.regions.gap = {shape: {size: [4, 4]}}
        input.designs.boundaries.edge.gaps = ['regions.gap']
        delete input.designs.boundaries.edge.corners
        await assert.rejects(generate(input), /protected gap/)
    })

    it('does not connect genuinely separate regions', async () => {
        const input = ring()
        input.designs.boundaries.edge.from = ['regions.left', 'regions.right']
        await assert.rejects(generate(input), /connected|separate/)
    })
})
