const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const root = '/tmp/outline-runtime.fEjAny'
const engine = require(path.join(root, 'engine/src/ergogen'))
const geometry = require(path.join(root, 'engine/src/designs/geometry'))
const maker = require(path.join(root, 'engine/node_modules/makerjs'))
const yaml = require(path.join(root, 'engine/node_modules/js-yaml'))
const {freezeOutlines} = require(path.join(root, 'studioOutline.cjs'))
const sourcePath = '/home/chris/projects/ts-boardstudio2/.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/baseline/initial-source.yaml'
const source = fs.readFileSync(sourcePath, 'utf8')
const hash = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex')
const paths = model => geometry.paths(model).length
const output = result => {
    const feature = result.designs.features['profiles.main_outline']
    return {
        analyticPaths: geometry.paths(feature.model),
        svg: result.outlines.main_outline.svg,
        dxf: result.outlines.main_outline.dxf,
        bounds: feature.bounds,
        contours: feature.contours,
    }
}
const instrument = () => {
    const records = {}
    const wrap = (object, name, label) => {
        const original = object[name]
        object[name] = function (...args) {
            const start = performance.now()
            try { return original.apply(this, args) }
            finally {
                const record = records[label] ||= {calls: 0, ms: 0, pathInputs: []}
                record.calls++
                record.ms += performance.now() - start
                if (args[0]?.paths || args[0]?.models) { record.pathInputs.push(paths(args[0])) }
            }
        }
        return () => { object[name] = original }
    }
    const restore = [
        wrap(maker.model, 'outline', 'maker.outline'),
        wrap(maker.model, 'findChains', 'maker.findChains'),
        wrap(maker.model, 'breakPathsAtIntersections', 'maker.breakPathsAtIntersections'),
        wrap(maker.path, 'intersection', 'maker.path.intersection'),
        wrap(maker.measure, 'isPointInsideModel', 'maker.measure.isPointInsideModel'),
        ...['union', 'combine', 'close', 'offset', 'validate', 'contains', 'requireContains', 'describe'].map(name => wrap(geometry, name, `geometry.${name}`)),
    ]
    return {records, restore: () => restore.reverse().forEach(fn => fn())}
}
const elapsed = async fn => {
    const start = performance.now()
    const value = await fn()
    return {ms: performance.now() - start, value}
}
const profile = async () => {
    const moved = yaml.safeLoad(source)
    moved.layout.objects.fingers_c10_r1.placement = {at: [3, 0, 0]}
    const movedSource = yaml.safeDump(moved)
    const direct = await elapsed(() => engine.process(movedSource, {analysis: true, debug: true, svg: true}))
    const expected = output(direct.value)
    const layout = await elapsed(() => engine.solveLayout(movedSource))
    const settings = {analysis: true, debug: true, svg: true, preparedLayout: layout.value}
    const probe = instrument()
    const outline = await elapsed(() => engine.process(movedSource, {...settings, outlineOnly: true}))
    const outlineRecords = structuredClone(probe.records)
    for (const key of Object.keys(probe.records)) { delete probe.records[key] }
    const staged = await elapsed(() => engine.process(movedSource, settings))
    const stagedRecords = structuredClone(probe.records)
    probe.restore()
    assert.deepEqual(output(outline.value), expected, 'outlineOnly output differs from direct source result')
    assert.deepEqual(output(staged.value), expected, 'same-source staged analysis differs from direct source result')
    const frozenSource = freezeOutlines(movedSource, outline.value.designs)
    const frozen = await elapsed(() => engine.process(frozenSource, settings))
    const frozenOutput = output(frozen.value)
    assert.deepEqual(frozenOutput.analyticPaths, expected.analyticPaths, 'freeze alters analytic profile paths')
    assert.equal(frozenOutput.svg, expected.svg, 'freeze alters SVG')
    assert.equal(frozenOutput.dxf, expected.dxf, 'freeze alters DXF')
    assert.deepEqual(frozenOutput.bounds, expected.bounds, 'freeze alters bounds')
    assert.equal(frozenOutput.contours, expected.contours, 'freeze alters contour count')
    const summary = {
        runtime: {node: process.version, makerjs: require(path.join(root, 'engine/node_modules/makerjs/package.json')).version},
        fixture: {sourcePath, sourceSha256: hash(source), movedKey: 'fingers_c10_r1', displacementMm: 3, keycaps: 60},
        patchSha256: '86464efaed2e561f5df0c9f4bbf21082773e6e568da1cfdcf4d73e63e154ff00',
        timingsMs: {direct: direct.ms, solveLayout: layout.ms, outlineOnlyInstrumented: outline.ms, sameSourceStagedAnalysisInstrumented: staged.ms, freezeFollowingAnalysis: frozen.ms},
        outputHashes: {direct: hash(expected), outline: hash(output(outline.value)), staged: hash(output(staged.value)), frozen: hash(frozenOutput)},
        outputCounts: {directPaths: expected.analyticPaths.length, frozenPaths: frozenOutput.analyticPaths.length, directContours: expected.contours, frozenContours: frozenOutput.contours},
        instrumentation: {outline: outlineRecords, sameSourceStagedAnalysis: stagedRecords},
        freeze: {sourceSha256: hash(frozenSource), snapshotCount: (frozenSource.match(/snapshot:/g) || []).length, automatic: /auto:\s*false/.test(frozenSource)},
    }
    fs.writeFileSync(path.join(root, 'raw-profile.json'), JSON.stringify(summary, null, 2))
    console.log(JSON.stringify(summary, null, 2))
}
profile().catch(error => { console.error(error); process.exitCode = 1 })
