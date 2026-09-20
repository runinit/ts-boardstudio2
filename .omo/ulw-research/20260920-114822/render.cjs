const fs=require('node:fs');const path=require('node:path');const root=process.cwd();const b=__dirname;
const Markdown=require(path.join(root,'node_modules/.pnpm/markdown-it@14.1.0/node_modules/markdown-it'));
const {chromium}=require(path.join(root,'app/node_modules/@playwright/test'));
(async()=>{
 const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:1000},deviceScaleFactor:1});
 await page.setContent('<html><body></body></html>');
 await page.addScriptTag({path:path.join(b,'assets/mermaid.min.js')});
 const source=fs.readFileSync(path.join(b,'SYNTHESIS.md'),'utf8');const graph=source.match(/```mermaid\n([\s\S]*?)```/)[1];
 const svg=await page.evaluate(async text=>{mermaid.initialize({startOnLoad:false,theme:'neutral'});return(await mermaid.render('pipeline',text)).svg;},graph);
 fs.writeFileSync(path.join(b,'assets/pipeline.svg'),svg);
 const markdown=source.replace(/```mermaid\n[\s\S]*?```/,'![Matrix and component configuration flow into pad emission, KiCad export and routing.](assets/pipeline.svg)');
 const md=new Markdown({html:false,linkify:true});
 const defaultLink=md.renderer.rules.link_open || ((tokens,idx,options,env,self)=>self.renderToken(tokens,idx,options));
 md.renderer.rules.link_open=(tokens,idx,options,env,self)=>{const token=tokens[idx];const href=token.attrGet('href');if(href&&href.startsWith('/')&&/:\d+$/.test(href)){const line=href.match(/:(\d+)$/)[1];token.attrSet('href','file://'+href.replace(/:\d+$/,''));token.attrSet('title','Source line '+line);}return defaultLink(tokens,idx,options,env,self);};
 const html=md.render(markdown);
 const doc='<!doctype html><html lang="en"><meta charset="utf-8"><title>PCB connectivity research</title><style>:root{--ink:#17212b;--muted:#526170;--line:#ccd5df;--paper:#fff;--code:#f0f3f6}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.6 system-ui,sans-serif}main{max-width:1060px;margin:40px auto;padding:0 32px}h1{font-size:34px;line-height:1.2}h2{margin-top:42px;font-size:25px;line-height:1.3;border-top:1px solid var(--line);padding-top:18px}h3{margin-top:30px;font-size:20px}p,li{overflow-wrap:anywhere}a{color:#165aad}table{width:100%;border-collapse:collapse;font-size:15px}td,th{padding:9px;border:1px solid var(--line);text-align:left;vertical-align:top}th{background:var(--code)}pre{padding:16px;background:var(--code);white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px}code{font-family:ui-monospace,monospace;font-size:.88em}img{max-width:100%;height:auto}li{margin:6px 0}</style><main>'+html+'</main></html>';
 fs.writeFileSync(path.join(b,'REPORT.html'),doc);
 await page.goto('file://'+path.join(b,'REPORT.html'));await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 const height=await page.evaluate(()=>document.documentElement.scrollHeight);const shots=[];
 for(let y=0,i=1;y<height;y+=950,i++){await page.evaluate(y=>scrollTo(0,y),y);const p=path.join(b,'assets',`report-${String(i).padStart(2,'0')}.png`);await page.screenshot({path:p});shots.push(path.relative(b,p));}
 const checks=await page.evaluate(()=>({horizontalOverflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,textLength:document.body.innerText.length}));
 fs.writeFileSync(path.join(b,'assets/render-manifest.json'),JSON.stringify({height,viewport:{width:1200,height:1000},screenshots:shots,checks,renderedAt:new Date().toISOString()},null,2));console.log({height,screenshots:shots.length,...checks});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
