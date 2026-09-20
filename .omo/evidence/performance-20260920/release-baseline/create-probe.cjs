const fs = require('node:fs');
const folder = __dirname;
let original = fs.readFileSync('.omo/ulw-research/20260920-154353/artifacts/drag-final.cjs', 'utf8');
original = original.slice(0, original.indexOf('(async () => {'));
original = original.replace("require('/home/chris/projects/ts-boardstudio2/node_modules/.pnpm/playwright@1.59.1/node_modules/playwright')", "require('/home/chris/projects/ts-boardstudio2/app/node_modules/@playwright/test')");
original = original.replace('http://127.0.0.1:4173/boardstudio/', 'http://127.0.0.1:4181/boardstudio/');
fs.writeFileSync(folder + '/probe.cjs', original);
