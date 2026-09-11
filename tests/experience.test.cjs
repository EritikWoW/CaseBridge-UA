const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const catalog=require('../dist/data/catalog.json');
const help=require('../dist/catalog-core.js');
const plan=require('../dist/plan-core.js');
const copy=require('../dist/experience-copy.js');
const read=file=>fs.readFileSync(path.join(__dirname,'../dist',file),'utf8');

test('discovery works without an intake and filters real reviewed resources',()=>{
 assert.equal(help.browse(catalog).length,9);
 assert.equal(help.browse(catalog,{category:'learning'}).length,3);
 assert.equal(help.browse(catalog,{category:'wellbeing'}).length,2);
 assert.equal(help.browse(catalog,{audience:'idp'}).length,2);
 assert.ok(help.browse(catalog,{query:'резюме'}).some(m=>m.entry.id==='osvita-career'));
 assert.ok(help.browse(catalog,{query:'mental health'}).some(m=>m.entry.id==='howareu-online'));
 assert.equal(help.browse(catalog,{query:'unfindable-catalog-term'}).length,0);
 assert.equal(help.browse(catalog,{audience:'saved',saved:['osvita-courses']})[0].entry.id,'osvita-courses');
 const altered=structuredClone(catalog);altered.entries[0].approved=false;
 assert.ok(!help.browse(altered).some(m=>m.entry.id===catalog.entries[0].id));
});
test('bilingual tasks retain custom text, reject bad input, and deduplicate safely',()=>{
 const data=plan.create();const input={id:'task-1',title:{uk:'Мій власний крок',en:'Мій власний крок'},due:'2026-09-12'};
 assert.equal(plan.add(data,input),true);assert.equal(plan.add(data,input),false);
 assert.equal(data.tasks[0].title.en,'Мій власний крок');
 for(const bad of ['2026-02-30','2026-13-01','no-date','1900-01-01'])assert.equal(plan.validDate(bad),false);
 assert.throws(()=>plan.add(data,{id:'bad',title:{uk:'a',en:''}}));
 assert.throws(()=>plan.add(data,{id:'bad',title:{uk:'a',en:'b'},due:'2026-02-30'}));
});
test('check, remove and undo preserve task state and progress',()=>{
 const data=plan.create();for(let i=0;i<3;i++)plan.add(data,{id:String(i),title:{uk:'Крок '+i,en:'Step '+i}});
 plan.toggle(data,'1');assert.deepEqual(plan.stats(data),{done:1,total:3,percent:33});
 const removed=plan.remove(data,'1');assert.equal(plan.stats(data).done,0);
 plan.restore(data,removed);assert.equal(data.tasks[1].id,'1');assert.equal(data.tasks[1].done,true);
 plan.restore(data,removed);assert.equal(data.tasks.length,3);
 assert.equal(plan.dateStatus('2026-09-10','2026-09-11'),'overdue');
 assert.equal(plan.dateStatus('2026-09-11','2026-09-11'),'today');
});
test('export contains actual selected tasks and approved source links',()=>{
 const data=plan.create();plan.add(data,{id:'1',title:{uk:'Мій крок',en:'My step'},due:'2026-09-12'});plan.toggle(data,'1');data.saved=['osvita-courses'];
 const text=plan.exportText(data,'en',catalog,copy.en);
 assert.match(text,/\[x\] My step · 2026-09-12/);assert.match(text,/https:\/\/osvita.diia.gov.ua\/courses/);assert.match(text,/not legal deadlines/);
 const withdrawn=structuredClone(catalog);withdrawn.entries.find(e=>e.id==='osvita-courses').approved=false;
 assert.doesNotMatch(plan.exportText(data,'en',withdrawn,copy.en),/https:\/\/osvita.diia.gov.ua\/courses/);
});
test('new text has both locales and all authored scripts parse',()=>{
 assert.deepEqual(Object.keys(copy.uk).sort(),Object.keys(copy.en).sort());
 for(const file of ['experience.js','experience-copy.js','plan-core.js','catalog-ui.js','catalog-core.js'])new vm.Script(read(file));
 const html=read('index.html'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 for(const match of read('experience.js').matchAll(/q\(['"]#([a-zA-Z][\w-]*)['"]\)/g))if(match[1]!=='undoTask')assert.ok(ids.includes(match[1]),`Missing ${match[1]}`);
});
test('motion stays above its own stage, supports pause, and does not resize each frame',()=>{
 const code=read('experience.js'),css=read('experience.css');
 assert.match(css,/#ambientCanvas\s*\{[^}]*z-index:0/);
 assert.match(css,/\.welcome-scene\s*\{[^}]*isolation:isolate/);
 assert.match(code,/cancelAnimationFrame\(frame\)/);assert.match(code,/document\.hidden/);assert.match(code,/IntersectionObserver/);assert.match(code,/ResizeObserver/);
 assert.doesNotMatch(code.slice(code.indexOf('function tick(now)'),code.indexOf('function canRun()')),/resize\(/);
 assert.match(css,/\.no-motion/);assert.match(css,/prefers-reduced-motion/);
});
test('discovery and plans make no network, storage, or HTML injection calls',()=>{
 for(const file of ['experience.js','plan-core.js'])assert.doesNotMatch(read(file),/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB)\b|\.innerHTML\s*=/);
});
