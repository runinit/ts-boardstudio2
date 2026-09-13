const resolveLayout = (raw, offsets = {}) => {
    const native = require('./document').parse(raw)
    const effective = Object.fromEntries(Object.entries(offsets).map(([path, offset]) => {
        const placement = path.split('.').reduce((value, key) => value?.[key], native)
        const fixed = placement?.override?.fixed || []
        const axes = Array.isArray(fixed) ? fixed : Object.keys(fixed).filter(axis => fixed[axis])
        return [path, {at: offset.at.map((value, index) => axes.includes(['x','y','z'][index]) ? 0 : value), rotate: axes.includes('rotate') ? 0 : offset.rotate}]
    }))
    const scene = require('./layout').resolve(native, effective)
    scene.offsets = effective
    return require('./geometry').serializable(scene)
}

module.exports = {resolveLayout}
