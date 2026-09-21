const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const crypto = require('node:crypto');
const root = process.cwd();
const { chromium } = require(path.join(root, 'app/node_modules/@playwright/test'));
const engine = require(path.join(root, 'engine/src/ergogen'));
const output = __dirname;
const expected = ['1', '2', '0', '01', 'A1', '', '3'];
const tokens = ['1', '2', '0', '"01"', '"A1"', '""', '"3"'];
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
async function generate() {
  engine.inject('footprint', 'qa_pad_ids', {
    params: Object.fromEntries(expected.map((_, i) => [`net${i}`, { type: 'net', value: `signal_${i}` }])),
    body: p => `(module qa_pad_ids (layer F.Cu) ${p.at}\n${tokens.map((id, i) => `(pad ${id} smd rect (at ${i * 3 - 9} 0) (size 2 2) (layers F.Cu F.Mask) ${p[`net${i}`].str})`).join('\n')})`,
  });
  const result = await engine.process({schema:'ergogen/v1',layout:{objects:{component:{kind:'component',pcb:'main',footprints:{main:{what:'qa_pad_ids'}}}}},designs:{regions:{board:{shape:{size:[30,12]}}},profiles:{board:{from:'regions.board'}}},pcbs:{main:{profile:'profiles.board'}}});
  const pcb = result.pcbs.main;
  fs.writeFileSync(path.join(output, 'native-pad-identifiers.kicad_pcb'), pcb);
  return pcb;
}
async function main() {
  const pcb = await generate();
  const bundlePath = path.join(root, 'app/dist/dependencies/kicanvas.js');
  const bundle = fs.readFileSync(bundlePath);
  const issues = [];
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html');
      res.end('<!doctype html><html><body style="margin:0"><style>kicanvas-embed{display:block;width:100vw;height:100vh}</style></body></html>');
    } else if (req.url === '/dependencies/kicanvas.js') {
      res.setHeader('Content-Type', 'text/javascript'); res.end(bundle);
    } else {res.statusCode = 404; res.end('missing');}
  });
  let browser;
  try {
    await new Promise(resolve => server.listen(43183, '127.0.0.1', resolve));
    browser = await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
    const page = await browser.newPage({viewport:{width:1200,height:800}});
    page.on('pageerror', error => issues.push({type:'pageerror', message:error.message}));
    page.on('response', response => {if(response.status()>=400)issues.push({type:'response',url:response.url(),status:response.status()});});
    await page.goto('http://127.0.0.1:43183/');
    await page.addScriptTag({url:'/dependencies/kicanvas.js'});
    const event = await page.evaluate(async pcb => {
      await customElements.whenDefined('kicanvas-embed');
      const embed = document.createElement('kicanvas-embed');
      embed.setAttribute('controls','full');
      const source = document.createElement('kicanvas-source');
      source.setAttribute('type','board');source.textContent=pcb;embed.append(source);
      const ready = new Promise((resolve,reject) => {
        const timeout=setTimeout(()=>reject(new Error('viewer load timeout')),30000);
        embed.addEventListener('kicanvas:load',()=>{clearTimeout(timeout);resolve('load');},{once:true});
        embed.addEventListener('kicanvas:error',e=>{clearTimeout(timeout);reject(new Error(JSON.stringify(e.detail)));},{once:true});
      });
      document.body.append(embed);return ready;
    }, pcb);
    await page.locator('canvas').first().waitFor({state:'visible'});
    await page.locator('kc-ui-focus-overlay').click();
    const parsed = await page.locator('kc-board-viewer').evaluate(element => {
      const footprint=element.viewer.board.footprints[0];
      element.viewer.zoom_to_board();element.viewer.draw();
      return footprint.pads.map(pad=>({number:pad.number,net:pad.netname,lookupMatches:footprint.pad_by_number(pad.number)===pad}));
    });
    assert.deepEqual(parsed.map(p=>p.number),expected);
    assert.deepEqual(parsed.map(p=>p.net),expected.map((_,i)=>`signal_${i}`));
    assert.ok(parsed.every(p=>p.lookupMatches));
    const retained = await page.locator('kicanvas-source').textContent();
    assert.equal(retained,pcb);
    await page.waitForTimeout(1000);
    await page.screenshot({path:path.join(output,'viewer.png')});
    fs.writeFileSync(path.join(output,'dom.txt'),await page.locator('body').ariaSnapshot());
    const receipt={event,node:process.version,bundlePath,bundleSha256:hash(bundle),sourceSha256:hash(pcb),sourceUnchanged:retained===pcb,parsed,issues};
    fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(receipt,null,2));
    console.log(JSON.stringify(receipt,null,2));
  } finally {
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
    fs.writeFileSync(path.join(output,'cleanup.json'),JSON.stringify({browserClosed:!browser?.isConnected(),serverClosed:!server.listening,port:43183},null,2));
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
