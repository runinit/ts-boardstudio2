const layout = require('./layout')
const g = require('../designs/geometry')

const EPSILON = 1e-10
const owner = ref => ref.replace(/^objects\./,'').replace(/\.(center|origin)$/,'')
const dot = (a,b) => a.reduce((sum,value,index)=>sum+value*b[index],0)

// Seed directed followers at their targets; an underconstrained target must not
// absorb the follower's initial error. The regular solver still checks all rules.
exports.resolve = config => {
    let scene=layout.resolve(config)
    const offsets={}, pending=new Set(Object.entries(config.layout.constraints || {}).filter(([,rule])=>rule.type==='aligned').map(([id])=>id))
    while (pending.size) {
        let progressed=false
        for (const id of pending) {
            const rule=config.layout.constraints[id], name=owner(rule.refs[0])
            const target=scene.guides[rule.refs[1]], members=target?.members || [owner(rule.refs[1])]
            if ([...pending].some(other=>other!==id && members.includes(owner(config.layout.constraints[other].refs[0])))) { continue }
            const item=scene.objects[name], entry=scene.placements[`objects.${name}`]
            pending.delete(id); progressed=true
            if (!entry || item.locked) { continue }
            const free=(entry.spec.solve || []).filter(axis=>axis==='x' || axis==='y')
            if (!free.length) { continue }
            const a=scene.reference(rule.refs[0]), b=scene.reference(rule.refs[1])
            const index=rule.axis==='y'?0:1, normal=[b.matrix[index],b.matrix[4+index],b.matrix[8+index]]
            const error=dot(b.position.map((value,axis)=>value-a.position[axis]),normal)
            const weights=free.map(axis=>{const index=axis==='x'?0:1;return dot(normal,[entry.editMatrix[index],entry.editMatrix[4+index],entry.editMatrix[8+index]])})
            const norm=dot(weights,weights)
            if (norm<EPSILON) { continue }
            const offset=offsets[entry.path] || {at:[0,0,0],rotate:0}
            free.forEach((axis,index)=>{offset.at[axis==='x'?0:1]+=error*weights[index]/norm})
            offsets[entry.path]=offset
            scene=layout.resolve(config,offsets)
        }
        if (!progressed) { g.fail('layout.constraints',`Cyclic alignment: ${[...pending].join(', ')}`,'constraint') }
    }
    return {scene,offsets}
}
