const fs = require('node:fs');
const p = JSON.parse(fs.readFileSync(__dirname + '/release.cpuprofile'));
const raw = JSON.parse(fs.readFileSync(__dirname + '/raw.json'));
const nodes = new Map(p.nodes.map(n => [n.id, n]));
const parents = new Map();
for (const n of p.nodes) for(const c of n.children || []) parents.set(c, n.id);
const self = new Map(), total = new Map();
for(let i=0;i<p.samples.length;i++) {
  const id=p.samples[i], dt=p.timeDeltas[i]/1000;
  self.set(id,(self.get(id)||0)+dt);
  for(let cursor=id;cursor;cursor=parents.get(cursor)) total.set(cursor,(total.get(cursor)||0)+dt);
}
const desc = n => ({ id:n.id, function:n.callFrame.functionName, url:n.callFrame.url, line:n.callFrame.lineNumber+1, column:n.callFrame.columnNumber+1, selfMs:self.get(n.id)||0, inclusiveMs:total.get(n.id)||0 });
const top = [...p.nodes].sort((a,b)=>(self.get(b.id)||0)-(self.get(a.id)||0)).slice(0,45).map(n=>({ ...desc(n), stack: (()=>{const s=[]; for(let c=n.id;c;c=parents.get(c))s.unshift(desc(nodes.get(c))); return s;})() }));
const output = { durationMs:(p.endTime-p.startTime)/1000, top, inclusive:[...p.nodes].sort((a,b)=>(total.get(b.id)||0)-(total.get(a.id)||0)).slice(0,50).map(desc) };
fs.writeFileSync(__dirname+'/attribution.json',JSON.stringify(output,null,2));
console.log(JSON.stringify({duration:output.durationMs, self:top.slice(0,25).map(({stack,...x})=>x), inclusive:output.inclusive.slice(0,25)},null,2));
const aggregate = new Map();
for (const n of p.nodes) {
  const k = n.callFrame.functionName + ':' + n.callFrame.lineNumber + ':' + n.callFrame.columnNumber;
  const entry = aggregate.get(k) || { ...desc(n), selfMs:0, inclusiveMs:0 };
  entry.selfMs += self.get(n.id)||0;
  entry.inclusiveMs += total.get(n.id)||0;
  aggregate.set(k,entry);
}
const agg = [...aggregate.values()].sort((a,b)=>b.inclusiveMs-a.inclusiveMs);
fs.writeFileSync(__dirname+'/aggregate.json',JSON.stringify(agg,null,2));
console.log(JSON.stringify(agg.filter(n=>n.url&&n.line>1000).slice(0,35),null,2));
for (const name of ['moveTargets','BoardStudio','StudioCanvas']) {
 const n=p.nodes.find(n=>n.callFrame.functionName===name);
 if(n) { const walk=id=>({ ...desc(nodes.get(id)), children:(nodes.get(id).children||[]).filter(c=>(total.get(c)||0)>2).map(walk) }); fs.writeFileSync(__dirname+'/'+name+'-tree.json',JSON.stringify(walk(n.id),null,2)); }
}
