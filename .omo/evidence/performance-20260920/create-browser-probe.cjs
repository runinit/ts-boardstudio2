const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'../../..');
let source=fs.readFileSync(path.join(root,'.omo/ulw-research/20260920-154353/artifacts/drag-final.cjs'),'utf8').split('\n(async () => {')[0];
source=source.replace(/const playwright = require\([^\n]+/, `const playwright = require(${JSON.stringify(path.join(root,'app/node_modules/@playwright/test'))});`);
source=source.replace(/const baseURL =[^\n]+/, "let baseURL = 'http://127.0.0.1:4182/boardstudio/';");
source=source.replace(/const fixturePath =\s*'[^']+';/,`const fixturePath = ${JSON.stringify(path.join(root,'.omo/ulw-research/20260920-154353/artifacts/fixture-60.yaml'))};`);
source=source.replace('await page.mouse.up();\n    await page.waitForFunction', 'await page.mouse.up();\n    await page.waitForFunction');
fs.writeFileSync(path.join(__dirname,'browser-matched.cjs'),source+fs.readFileSync(path.join(__dirname,'browser-main.cjs'),'utf8'));
