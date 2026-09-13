const assert = require('node:assert/strict')
const engine = require('../../src/ergogen')
const layout = require('../../src/native/layout')
const fixture = () => ({schema:'ergogen/v1', units:{u:19}, layout:{
    clusters:{fingers:{arrangement:{type:'columns', columns:['c1'], rows:['r1','r2'], pitch:['u','u'], splay:{c1:30}}}},
    objects:{a:{kind:'key',cluster:'fingers',cell:['c1','r1'],envelopes:{keycap:{size:[18,18]}}},
        b:{kind:'key',cluster:'fingers',cell:['c1','r2'],envelopes:{keycap:{size:[18,18]}}},
        encoder:{kind:'component',placement:{at:[30,40,0],solve:['x','y']},envelopes:{body:{size:[12,12],at:[2,0,0]}}}},}})
describe('Layout center guides', function () {
    this.timeout(30000)
    it('places row guides through the bounds of mixed-size keycaps', () => {
        const config=fixture()
        config.layout.clusters.fingers.arrangement={type:'columns',columns:['c1','c2'],rows:['r1'],pitch:[19,19],stagger:{c2:5}}
        config.layout.objects.b.cell=['c2','r1']
        config.layout.objects.b.envelopes.keycap={size:[28,28]}
        const row=layout.resolve(config).reference('rows.fingers.r1')
        assert.deepEqual(row.position,[12,5,0])
    })
    it('reflects splay in mirrored column guides', () => {
        const config=fixture()
        config.layout.clusters.right={mirror:{source:'fingers',axis:50}}
        const scene=layout.resolve(config), left=scene.reference('columns.fingers.c1'), right=scene.reference('columns.right.c1')
        assert.ok(Math.abs(right.matrix[4]+left.matrix[4])<1e-6)
        assert.ok(Math.abs(right.position[0]-(100-left.position[0]))<1e-6)
    })
    it('uses a declared part center before its body envelope', () => {
        const config=fixture()
        config.parts={encoder:{attachments:{center:{at:[4,3,0]}}}}
        config.layout.objects.encoder.part='encoder'
        assert.deepEqual(layout.resolve(config).guides['encoder.center'].position,[34,43,0])
    })
    it('resolves physical centers and splayed column frames', () => {
        const scene = layout.resolve(fixture())
        assert.equal(scene.reference('encoder.center').position[0],32)
        const column = scene.reference('columns.fingers.c1')
        assert.ok(Math.abs(column.matrix[4]-0.5)<1e-6)
        assert.equal(column.guideParent,'clusters.fingers')
    })
    it('aligns a component to a rotated column without rotating the component', async () => {
        const config=fixture()
        config.layout.constraints={center:{type:'aligned',refs:['encoder.center','columns.fingers.c1'],axis:'y'}}
        const result=await engine.process(config,{layoutOnly:true})
        const scene=layout.resolve(config)
        const target=scene.reference('columns.fingers.c1')
        const pos=result.layout.objects.encoder.position
        const dx=pos[0]+2-target.position[0],dy=pos[1]-target.position[1]
        assert.ok(Math.abs(dx*target.matrix[0]+dy*target.matrix[4])<1e-5)
        assert.ok(Math.abs(result.layout.objects.encoder.rotation)<1e-5)
    })
    it('moves the follower without pulling an unconstrained target', async () => {
        const config={schema:'ergogen/v1',layout:{objects:{
            target:{kind:'component',placement:{solve:['x','y']}},
            follower:{kind:'component',placement:{at:[30,20,4],solve:['x','y'],rotate:25}}
        },constraints:{alignment:{type:'aligned',refs:['follower.center','target.center'],axis:'y'}}}}
        const result=await engine.process(config,{layoutOnly:true})
        assert.ok(Math.hypot(...result.layout.objects.target.position)<1e-6)
        assert.ok(Math.abs(result.layout.objects.follower.position[0])<1e-6)
        assert.ok(Math.abs(result.layout.objects.follower.position[1]-20)<1e-6)
        assert.equal(result.layout.objects.follower.position[2],4)
        assert.ok(Math.abs(result.layout.objects.follower.rotation-25)<1e-6)
    })
    it('follows an alignment chain after reload and rejects cycles', async () => {
        const config={schema:'ergogen/v1',layout:{objects:{
            target:{kind:'component',placement:{at:[12,0,0]}},
            middle:{kind:'component',placement:{at:[20,20,0],solve:['x','y']}},
            follower:{kind:'component',placement:{at:[40,40,0],solve:['x','y']}}
        },constraints:{
            follower:{type:'aligned',refs:['follower.center','middle.center'],axis:'y'},
            middle:{type:'aligned',refs:['middle.center','target.center'],axis:'y'}
        }}}
        for (const x of [12,27]) {
            config.layout.objects.target.placement.at[0]=x
            const result=await engine.process(JSON.stringify(config),{layoutOnly:true})
            assert.ok(Math.abs(result.layout.objects.follower.position[0]-x)<1e-6)
            assert.ok(Math.abs(result.layout.objects.middle.position[0]-x)<1e-6)
            assert.ok(Math.abs(result.layout.objects.follower.position[1]-40)<1e-6)
        }
        config.layout.constraints.middle.refs[1]='follower.center'
        await assert.rejects(engine.process(config,{layoutOnly:true}),/Cyclic alignment/)
    })
})
