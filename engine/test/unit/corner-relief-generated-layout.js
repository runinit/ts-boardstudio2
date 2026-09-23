const assert = require('node:assert/strict')
const engine = require('../../src/ergogen')
const g = require('../../src/designs/geometry')
const m = require('makerjs')

const tangent = (model, arc) => {
    const points=m.path.toPoints(arc,3)
    return [points[0],points[points.length-1]].every(point=> {
        const line=g.paths(model).find(path=>path.type==='line' &&
            [path.origin,path.end].some(end=>m.measure.pointDistance(end,point)<g.TOLERANCE))
        if (!line) { return false }
        const direction=[line.end[0]-line.origin[0],line.end[1]-line.origin[1]]
        const radial=[point[0]-arc.origin[0],point[1]-arc.origin[1]]
        const length=m.measure.pointDistance(line.origin,line.end)
        return Math.abs(direction[0]*radial[0]+direction[1]*radial[1])/length<g.TOLERANCE
    })
}

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

    it('heals the narrow notch and fits both tight corners on the saved outline', async () => {
        const input = require('../fixtures/native/corner-relief-generated-layout.json')
        input.designs.boundaries.main.corners.mode = 'adaptive'
        const result = await engine.process(input, {debug: true, analysis: true})
        const board = result.designs.features['boundaries.main'].model
        const pair = g.paths(board).filter(path=>path.type==='arc' &&
            path.origin[0]>124 && path.origin[0]<127 && path.origin[1]>32 && path.origin[1]<36)
        const fits = result.designs.diagnostics.filter(item=>item.code==='corner-relief-fit' &&
            item.at[0]>124 && item.at[0]<127 && item.at[1]>33 && item.at[1]<36)

        assert.ok(m.measure.isPointInsideModel([49.1,-6.7],board),'The marked notch is filled')
        assert.equal(pair.length,2,'Both corners sharing the 0.94 mm edge receive fillets')
        assert.ok(pair.every(path=>path.radius>g.TOLERANCE),'Both paired fillets have positive radii')
        assert.ok(pair.every(path=>tangent(board,path)),'Both paired fillets meet their edges tangentially')
        assert.equal(fits.length,2,'Each reduced fillet is reported')
        assert.ok(fits.every(item=>item.applied>g.TOLERANCE))
        assert.ok(Math.abs(fits[0].applied-fits[1].applied)<g.TOLERANCE)
        assert.equal(g.paths(board).filter(path=>path.type==='line' && m.measure.pathLength(path)<g.TOLERANCE).length,0,
            'The perimeter has no tiny residual edges')
        assert.equal(g.validate(board,'board','single'),1)
        assert.equal(g.chains(board)[0].contains?.length || 0,0)
    })
})
