const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

describe('Native CLI', function() {
    this.timeout(30000)
    it('exports native geometry and rejects a legacy document without changing existing output', () => {
        const temp = fs.mkdtempSync(path.join(os.tmpdir(),'ergogen-native-'))
        try {
            const output=path.join(temp,'output')
            const run = args => {
                const stdout = fs.openSync(path.join(temp,'stdout'), 'w+')
                const stderr = fs.openSync(path.join(temp,'stderr'), 'w+')
                const result = spawnSync(process.execPath, args, {stdio: ['ignore', stdout, stderr]})
                fs.closeSync(stdout)
                fs.closeSync(stderr)
                result.stdout = fs.readFileSync(path.join(temp,'stdout'), 'utf8')
                result.stderr = fs.readFileSync(path.join(temp,'stderr'), 'utf8')
                return result
            }
            const result=run(['src/cli.js','docs/examples/native/columns.yaml','-o',output,'--svg','--debug'])
            assert.equal(result.status,0,result.stderr)
            assert.ok(fs.existsSync(path.join(output,'pcbs','main.kicad_pcb')))
            const original=fs.readFileSync(path.join(output,'pcbs','main.kicad_pcb'))
            const legacy=path.join(temp,'legacy.yaml'); fs.writeFileSync(legacy,'points: {zones: {key: {}}}')
            const rejected=run(['src/cli.js',legacy,'-o',output,'--clean'])
            assert.equal(rejected.error, undefined)
            assert.notEqual(rejected.status,0)
            assert.match(rejected.stderr,/schema: ergogen\/v1/)
            assert.deepEqual(fs.readFileSync(path.join(output,'pcbs','main.kicad_pcb')),original)
        } finally { fs.rmSync(temp,{recursive:true,force:true}) }
    })
})
