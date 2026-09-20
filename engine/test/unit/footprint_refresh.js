const assert = require('node:assert/strict')
const vm = require('node:vm')
const pcbs = require('../../src/pcbs')
const Point = require('../../src/point')
const tools = require('../../src/footprint-tools')
const engine = require('../../src/ergogen')
const sexpr = require('../../src/templates/sexpr')

const evaluate = source => {
    const scope = {module: {exports: {}}}
    vm.runInNewContext(source, scope)
    return scope.module.exports
}
const capture = (params, overrides = {}, meta = {}) => {
    let received
    pcbs.inject_footprint('refresh_capture', {params, body: p => { received = p; return '' }})
    pcbs._footprint({}, () => 1, () => 'U1', {u: 19}, {})(
        {what: 'refresh_capture', params: overrides}, 'refresh', new Point(0, 0, 0, meta))
    return received
}
const pad = (number, type, net, layers = '"F.Cu"') => `(pad "${number}" ${type} circle (at 0 0) (size 1 1) ${type === 'np_thru_hole' ? '(drill 1)' : ''} (layers ${layers}) ${net ? `(net ${net} "old_${net}")` : ''})`
const imported = `(footprint "Refresh" (layer "F.Cu")
    ${pad('1', 'smd', 41)} ${pad('', 'smd', 41)}
    ${pad('', 'smd', 42)} ${pad('2', 'smd', 42)}
    ${pad('', 'np_thru_hole', null, '"*.Cu" "*.Mask"')}
    ${pad('', 'smd', null, '"F.Mask"')})`
const children = (node, name) => node.filter(n => Array.isArray(n) && n[0] === name)
const native = (what, params) => ({schema: 'ergogen/v1',
    parts: {part: {revision: '1', footprints: {base: {what, params}}}},
    layout: {objects: {one: {kind: 'component', part: 'part', pcb: 'board'}}}, designs: {regions: {board: {shape: {size: [30, 30]}}}, profiles: {board: {from: 'regions.board'}}}, pcbs: {board: {profile: 'profiles.board'}}})

describe('Footprint refresh engine boundaries', () => {
    it('keeps F&B shorthand literal while evaluating finite numeric expressions', () => {
        const result = capture({side: 'F&B', width: '2 * u', literal: {type: 'string', value: '2 * u'}})
        assert.equal(result.side, 'F&B')
        assert.equal(result.width, 38)
        assert.equal(result.literal, '2 * u')
        assert.equal(capture({width: 1}, {width: 'u / 2'}).width, 9.5)
    })
    it('rejects nonfinite and malformed explicit numeric values', () => {
        for (const value of ['0/0', '1/0', 'missing + 1', Infinity, NaN]) {
            assert.throws(() => capture({width: {type: 'number', value}}, {}), /refresh.params.width.*finite number/)
        }
    })
    it('reports unresolved net metadata and preserves intentionally empty nets', () => {
        for (const value of ['{{missing}}', 'prefix_{{missing}}', '{{nested.missing}}']) {
            assert.throws(() => capture({signal: {type: 'net', value}}), /refresh.params.signal.*unresolved net template.*missing/)
        }
        assert.equal(capture({signal: {type: 'net', value: ''}}).signal.name, '')
        assert.equal(capture({signal: {type: 'net', value: '{{signal}}'}}, {}, {signal: 'GND'}).signal.name, 'GND')
    })
    it('includes blank copper pads and preserves shared original net groups', () => {
        const inspected = tools.inspect(imported)
        assert.deepEqual(inspected.pads.map(p => p.mechanical), [false, false, false, false, true, true])
        assert.deepEqual(inspected.nets.map(n => n.pads), [[0, 1], [2, 3]])
    })
    it('keeps unrelated blank copper pads separate and maps shared numbered pads together', () => {
        const source = `(footprint "Separate" (layer "F.Cu") ${pad('', 'smd', null)} ${pad('', 'smd', null)} ${pad('1', 'smd', 9)} ${pad('2', 'smd', 9)})`
        const converted = tools.convert(source)
        assert.deepEqual(converted.nets.map(n => n.pads), [[0], [1], [2, 3]])
        const params = Object.fromEntries(converted.nets.map((net, i) => [net.parameter, {index: i + 1, name: `NET_${i}`}]))
        const output = evaluate(converted.source).body(params)
        const nets = children(sexpr.parse(output)[0], 'pad').map(p => children(p, 'net')[0][1])
        assert.deepEqual(nets, ['1', '2', '3', '3'])
        assert.throws(() => evaluate(converted.source).body({}), /Map pad.*to a net/)
    })
    it('retains native backend rejection of unknown numeric net IDs', async () => {
        engine.inject('footprint', 'refresh_unknown', {params: {}, body: () => `(footprint "Unknown" (layer "F.Cu") ${pad('1', 'smd', 99)})`})
        await assert.rejects(engine.process(native('refresh_unknown', {}), {analysis: true}), /unresolved net 99/)
    })
    it('roundtrips saved mappings for blank copper groups through native export', async () => {
        const source = `(footprint "Blank" (layer "F.Cu") ${pad('', 'smd', 41)} ${pad('', 'smd', 42)})`
        const first = tools.convert(source)
        const second = tools.convert(source, {mapping: first.mapping})
        assert.deepEqual(second.mapping, first.mapping)
        assert.equal(Object.keys(second.mapping).length, 2)
        const keys = second.nets.map(net => net.mappingKey ?? net.number)
        assert.deepEqual(keys.map(key => second.mapping[key]), ['pad_net', 'pad_net_2'])
        engine.inject('footprint', 'refresh_blank', evaluate(second.source))
        const output = (await engine.process(native('refresh_blank', {pad_net: 'A', pad_net_2: 'B'}), {analysis: true})).pcbs.board
        const pads = children(children(sexpr.parse(output)[0], 'footprint')[0], 'pad')
        assert.deepEqual(pads.map(p => children(p, 'net')[0][1]), ['"A"', '"B"'])
    })
    it('exports imported copper pads to distinct native nets without stale IDs', async () => {
        const converted = tools.convert(imported)
        engine.inject('footprint', 'refresh_import', evaluate(converted.source))
        const params = Object.fromEntries(converted.nets.map((net, i) => [net.parameter, `SIGNAL_${i}`]))
        const output = (await engine.process(native('refresh_import', params), {analysis: true})).pcbs.board
        const board = sexpr.parse(output)[0]
        const pads = children(children(board, 'footprint')[0], 'pad')
        const netIds = pads.slice(0, 4).map(p => children(p, 'net')[0][1])
        assert.equal(netIds[0], netIds[1])
        assert.equal(netIds[2], netIds[3])
        assert.notEqual(netIds[0], netIds[2])
        assert.ok(!netIds.includes('41') && !netIds.includes('42'))
        assert.equal(children(pads[4], 'net').length, 0)
    })
})
