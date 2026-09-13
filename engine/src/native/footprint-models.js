const frames = require('./frames')
const footprints = require('../footprint-tools')

// Locate emitted footprints in the owning object's frame, even without models.
exports.targets = (source, item, boardFrame, thickness, key) => {
    return footprints.inspect(source).targets.map(target => {
        const info = footprints.inspect(source, target)
        const [x,y,rotation] = info.at
        const bottom = info.side === 'B'
        const placement = frames.local([x,-y,bottom ? 0 : thickness], rotation, bottom ? 180 : 0)
        const frame = frames.multiply(frames.inverse(item.matrix), frames.multiply(boardFrame, placement))
        return {key, reference: target.reference, frame}
    })
}

// Keep model-local transforms intact and locate them from the emitted KiCad footprint.
exports.collect = (source, item, boardFrame, thickness, footprintKey) => {
    return exports.targets(source, item, boardFrame, thickness, footprintKey).flatMap((target, index) => {
        const info = footprints.inspect(source, {index})
        return info.models.map(model => ({...model, frame: target.frame, footprintKey, footprintReference: target.reference}))
    })
}
