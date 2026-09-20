const m = require(process.cwd() + '/engine/node_modules/makerjs');
const cases = [];
global.sinon = require(process.cwd() + '/engine/node_modules/sinon');
global.describe = (_name, fn) => fn.call({timeout() {}});
global.it = (name, fn) => cases.push({name, fn});
require(process.cwd() + '/engine/test/unit/native_outline_offset');
const outline = m.model.outline;
const offsets = [];
m.model.outline = function(...args) {
    offsets.push({distance: args[1], inside: args[3]});
    return outline(...args);
};
cases[1].fn().then(() => {
    console.log(JSON.stringify({scenario: cases[1].name, hashAssertions: 'PASS', calls: offsets.length, offsets}));
    if (offsets.length !== 7) process.exitCode = 1;
}).catch(error => { console.error(error); process.exitCode = 1; });
