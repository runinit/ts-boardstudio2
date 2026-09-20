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
const initialSource = fs.readFileSync(sourcePath, 'utf8')
const moved = yaml.safeLoad(initialSource)
moved.layout.objects.fingers_c10_r1.placement = {at: [3, 0, 0]}
const source = yaml.safeDump(moved)
const digest = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex')
const contour = result => {
    const feature = result.designs.features['profiles.main_outline']
    return {paths: geometry.paths(feature.model), svg: result.outlines.main_outline.svg, dxf: result.outlines.main_outline.dxf, bounds: feature.bounds, contours: feature.contours}
}
const time = async operation => {
    const start = performance.now()
    const value = await operation()
    return {ms: performance.now() - start, value}
}
const run = async () => {
    await engine.process(source, {analysis: true, outlineOnly: true, debug: true, svg: true, preparedLayout: await engine.solveLayout(source)})
    const rows = []
    let expected
    for (let sample = 0; sample < 3; sample++) {
        const layout = await time(() => engine.solveLayout(source))
        const settings = {analysis: true, debug: true, svg: true, preparedLayout: layout.value}
        const outline = await time(() => engine.process(source, {...settings, outlineOnly: true}))
        const staged = await time(() => engine.process(source, settings))
        const outlineValue = contour(outline.value)
        const stagedValue = contour(staged.value)
        expected ||= outlineValue
        assert.deepEqual(outlineValue, expected)
        assert.deepEqual(stagedValue, expected)
        rows.push({sample, solveLayoutMs: layout.ms, outlineOnlyMs: outline.ms, sameSourceStagedAnalysisMs: staged.ms, hash: digest(outlineValue), paths: outlineValue.paths.length, contours: outlineValue.contours})
    }
    const layout = await time(() => engine.solveLayout(source))
    const settings = {analysis: true, debug: true, svg: true, preparedLayout: layout.value}
    const outline = await time(() => engine.process(source, {...settings, outlineOnly: true}))
    const frozenSource = freezeOutlines(source, outline.value.designs)
    const frozen = await time(() => engine.process(frozenSource, settings))
    assert.deepEqual(contour(frozen.value), contour(outline.value))
    const originalOutline = maker.model.outline
    const calls = []
    maker.model.outline = function (model, ...args) {
        const start = performance.now()
        try { return originalOutline.call(this, model, ...args) }
        finally { calls.push({ms: performance.now() - start, paths: geometry.paths(model).length, distance: args[0], inside: args[2]}) }
    }
    try {
        const diagnosticLayout = await engine.solveLayout(source)
        const diagnostic = await time(() => engine.process(source, {analysis: true, outlineOnly: true, debug: true, svg: true, preparedLayout: diagnosticLayout}))
        assert.deepEqual(contour(diagnostic.value), expected)
    } finally { maker.model.outline = originalOutline }
    const result = {
        runtime: {node: process.version, makerjs: require(path.join(root, 'engine/node_modules/makerjs/package.json')).version},
        fixture: {sourceSha256: digest(initialSource), movedSourceSha256: digest(source), movedKey: 'fingers_c10_r1', displacementMm: 3, keycaps: 60},
        patchSha256: '86464efaed2e561f5df0c9f4bbf21082773e6e568da1cfdcf4d73e63e154ff00',
        warmup: 'one outlineOnly call completed before timed samples',
        uninstrumentedWarmSamples: rows,
        freezeFollowingAnalysis: {solveLayoutMs: layout.ms, outlineOnlyMs: outline.ms, analysisMs: frozen.ms, hash: digest(contour(frozen.value)), paths: contour(frozen.value).paths.length, contours: contour(frozen.value).contours, automatic: yaml.safeLoad(frozenSource).meta.studio.outline.auto, snapshots: (frozenSource.match(/snapshot:/g) || []).length},
        diagnosticOnly: {makerOutlineCalls: calls},
    }
    fs.writeFileSync(path.join(root, 'raw-repeat.json'), JSON.stringify(result, null, 2))
    console.log(JSON.stringify(result, null, 2))
}
run().catch(error => { console.error(error); process.exitCode = 1 })
