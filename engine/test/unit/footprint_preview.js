const assert = require('node:assert/strict')
const tools = require('../../src/footprint-tools')
const source = `(footprint "jumper" (layer "F.Cu") (at 10 20 90)
(pad "1" smd custom (at 1 2 90) (size 0.2 0.2) (layers "F.Cu") (options (anchor rect))
(primitives (gr_poly (pts (xy -0.5 -0.625) (xy 0.25 -0.625) (xy 0.5 0) (xy 0.25 0.625) (xy -0.5 0.625)) (width 0) (fill yes))))
(pad "2" thru_hole oval (at 0 0) (size 3 2) (drill oval 2 1 (offset 0.2 0.1)) (layers "*.Cu" "*.Mask")))
(segment (start 12 19) (end 14 17) (width 0.25) (layer "F.Cu"))
(via (at 14 17) (size 0.6) (drill 0.3) (layers "F.Cu" "B.Cu"))`
describe('Footprint preview geometry', () => {
    it('exposes custom jumper copper and oval drill geometry independently', () => {
        const info = tools.inspect(source)
        assert.equal(info.pads[0].anchor, 'rect')
        assert.deepEqual(info.pads[0].polygons[0][2], [0.5, 0])
        assert.deepEqual(info.pads[1].drillSize, [2, 1])
        assert.deepEqual(info.pads[1].drillOffset, [0.2, 0.1])
    })
    it('converts adjacent board copper into the selected footprint local frame', () => {
        const info = tools.inspect(source)
        assert.ok(Math.abs(info.tracks[0].start[0] - 1) < 1e-9)
        assert.ok(Math.abs(info.tracks[0].start[1] - 2) < 1e-9)
        assert.ok(Math.abs(info.vias[0].at[0] - 3) < 1e-9)
        assert.equal(info.tracks[0].width, 0.25)
        assert.equal(info.vias[0].drill, 0.3)
    })
    it('reports unsupported pad primitives and board-only zones without a fake footprint', () => {
        const info = tools.inspect('(footprint "unknown" (layer "F.Cu") (pad "1" smd custom (at 0 0) (size 1 1) (layers "F.Cu") (primitives (gr_curve (pts (xy 0 0) (xy 1 1))))))')
        assert.deepEqual(info.pads[0].unsupportedGeometry, ['gr_curve'])
        assert.ok(info.diagnostics.some(d => d.code === 'unsupported-pad-geometry'))
        const zone = tools.inspect('(zone (net 0) (layer "F.Cu") (polygon (pts (xy 0 0) (xy 1 1) (xy 0 1))))', {index: 0})
        assert.equal(zone.pads.length, 0)
        assert.deepEqual(zone.zones[0].polygons, [[[0,0],[1,1],[0,1]]])
        assert.ok(zone.diagnostics.some(d => d.code === 'zone-preview'))
    })
    it('inspects real controller copper and holes after native engine generation', async () => {
        const engine = require('../../src/ergogen')
        const module = require('../../../footprints/mcu_nice_nano')
        engine.inject('footprint','preview_nano',module)
        for (const side of ['F','B']) {
            const config = {schema:'ergogen/v1',layout:{objects:{key:{kind:'key',pcb:'main',placement:{at:[10,12,0],rotate:37},footprints:{controller:{what:'preview_nano',params:{side,reversible:true}}}}}},designs:{regions:{board:{shape:{size:[80,60]}}},profiles:{board:{from:'regions.board'}}},pcbs:{main:{profile:'profiles.board'}}}
            const result = await engine.process(config,{debug:true})
            const info = tools.inspect(result.pcbs.main)
            assert.ok(info.pads.some(pad => pad.shape === 'custom' && pad.polygons[0].length >= 4))
            assert.ok(info.pads.some(pad => pad.drillSize?.[0] > 0))
            assert.ok(info.tracks.length > 0)
            assert.ok(info.pads.every(pad => !pad.unsupportedGeometry.length))
        }
    })
    it('classifies legacy F&B copper pads without promoting NPTH holes', () => {
        const info = tools.inspect('(footprint "legacy" (layer "F.Cu") (pad "1" thru_hole circle (at 0 0) (size 2 2) (drill 1) (layers "F&B.Cu" "*.Mask")) (pad "" np_thru_hole circle (at 3 0) (size 2 2) (drill 2) (layers "F&B.Cu" "*.Mask")))')
        assert.deepEqual(info.pads.map(pad => pad.mechanical), [false,true])
        assert.equal(info.nets.length,1)
    })
})
