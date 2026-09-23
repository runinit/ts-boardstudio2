const assert = require('node:assert/strict')
const engine = require('../../src/ergogen')
const g = require('../../src/designs/geometry')

describe('generated outline corner relief', function () {
    this.timeout(30000)

    it('rebuilds the imported project outline without new holes', async () => {
        const input = require('../fixtures/native/corner-relief-generated-layout.json')
        const result = await engine.process(input, {debug: true, analysis: true})
        assert.ok(result.designs.features['boundaries.main'])
        assert.equal(Object.values(result.layout.objects).filter(item => item.kind === 'key').length, 33)
        for (const ref of ['boundaries.main', 'profiles.main']) {
            const model = result.designs.features[ref].model
            assert.equal(g.validate(model, ref, 'single'), 1)
            assert.equal(g.chains(model)[0].contains?.length || 0, 0)
        }
    })

    it('fits complex joins without holes or stray contours', async () => {
        const input = require('../fixtures/native/corner-relief-generated-layout.json')
        const adaptiveInput = structuredClone(input)
        adaptiveInput.designs.boundaries.main.corners.mode = 'adaptive'
        const adaptive = await engine.process(adaptiveInput, {debug: true, analysis: true})
        const board=adaptive.designs.features['boundaries.main'].model
        assert.equal(g.validate(board,'board','single'),1)
        assert.equal(g.chains(board)[0].contains?.length || 0,0)
        assert.ok(adaptive.designs.diagnostics.length>0)
    })
})
