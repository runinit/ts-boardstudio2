const refs = ['footprints/manifest', 'footprints/scripts', 'public/licenses', 'public/components/licenses', '.impeccable'];
const result = await Bun.$`find app engine footprints -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" -o -name "*.cjs" -o -name "*.mts" -o -name "*.json" -o -name "*.md" -o -name "*.html" -o -name "*.yml" -o -name "*.yaml" 2>/dev/null`.text();
const files = result.trim().split('\n').filter(Boolean);

const matches = {};
for (const f of files) {
  try {
    const text = await Bun.$`cat ${f}`.text();
    for (const r of refs) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(r)) {
          if (!matches[f]) matches[f] = {};
          if (!matches[f][r]) matches[f][r] = [];
          matches[f][r].push(`L${i+1}: ${lines[i].trim().slice(0,180)}`);
        }
      }
    }
  } catch(e) {}
}
console.log(JSON.stringify(matches, null, 2));
