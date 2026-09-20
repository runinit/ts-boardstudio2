const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const m = require('makerjs')
const engine = require('../../src/ergogen')
const g = require('../../src/designs/geometry')
const hash = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex')

const matrix = () => {
    const columns = Array.from({length: 10}, (_, index) => `c${index + 1}`)
    const rows = Array.from({length: 6}, (_, index) => `r${index + 1}`)
    return {
        schema: 'ergogen/v1',
        layout: {
            clusters: {fingers: {arrangement: {type: 'columns', columns, rows, pitch: [19, 19]}}},
            objects: Object.fromEntries(columns.flatMap(column => rows.map(row => [`fingers_${column}_${row}`, {
                kind: 'key', pcb: 'main', cluster: 'fingers', cell: [column, row], envelopes: {keycap: {size: [18, 18]}},
                ...(column === 'c10' && row === 'r1' ? {placement: {at: [3, 0, 0]}} : {})
            }])))
        },
        pcbs: {main: {profile: 'profiles.main_outline'}},
        designs: {
            regions: {main_keycap: {select: {kind: 'key', pcb: 'main'}, envelope: 'keycap', close: 2}},
            boundaries: {main_edge: {from: ['regions.main_keycap'], clearance: 2, simplify: 2, corners: {fillet: 2}, holes: 'fill', connected: 'single', bridges: {}}},
            profiles: {main_outline: {from: 'boundaries.main_edge'}}
        }
    }
}

describe('Native notched matrix outline performance', function() {
    this.timeout(120000)
    it('retains the explicit intersection ray when a strict bundle deletes repair options', () => {
        const outline = m.model.outline
        let calls = 0
        sinon.stub(m.model, 'outline').callsFake(function(model, distance, joints, inside, options) {
            'use strict'
            if (++calls === 1) { return g.clone(model) }
            const ray = options.farPoint
            options.farPoint = [0, 0]
            delete options.farPoint
            assert.deepEqual(options.farPoint, ray)
            return outline(model, distance, joints, inside, options)
        })
        const result = g.offset(new m.models.Rectangle(10, 10), 1)
        assert.deepEqual(m.measure.modelExtents(result).low, [-1, -1])
        assert.deepEqual(m.measure.modelExtents(result).high, [11, 11])
    })

    it('retains the exported contour without repeated repairs after a three millimetre key move', async () => {
        const outline = sinon.spy(m.model, 'outline')
        const result = await engine.process(matrix(), {analysis: true, outlineOnly: true, debug: true, svg: true})
        assert.equal(hash(g.paths(result.designs.features['profiles.main_outline'].model)), '55512e458f3eb136640d7da7088164ada70748b75454ab76c77dc8074555da52')
        assert.equal(hash(result.outlines.main_outline.svg), 'e20e5530643cc784b2c68c337bd3ef13660e56a0919a3bd46c9b07ca111af3fd')
        assert.equal(hash(result.outlines.main_outline.dxf), '19ebb8591b7a570e3910bc87b518f20d044f070a26f172dd3c1e9d67474502f8')
        assert.ok(outline.callCount <= 7, `Expected bounded analytic offsets, observed ${outline.callCount} calls`)
    })
})
