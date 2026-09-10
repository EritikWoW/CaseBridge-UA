const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const context=vm.createContext({});
vm.runInContext(read('dist/case-data.js')+';globalThis.data=CaseData;',context);
const data=context.data;
test('three complete, fictional, bilingual cases with distinct topics',()=>{
 assert.equal(data.demos.length,3);
 assert.equal(new Set(data.demos.map(d=>d.topic)).size,3);
 for(const demo of data.demos){
  for(const lang of ['uk','en']){
   const validated=data.validateIntake({situation:demo[lang].story,topic:demo.topic,region:demo.region});
   assert.equal(validated.topic,demo.topic);
   assert.ok(demo[lang].title && demo[lang].subtitle && demo[lang].detail);
  }
  assert.ok(demo.evidence.every(key=>Object.hasOwn(data.materialKeys,key)));
 }
});
test('input boundaries and invalid types are rejected before state updates',()=>{
 for(const input of [null,[],{}, {situation:'too short'},{situation:'x'.repeat(1201)},{situation:'x'.repeat(30),danger:'false'},{situation:'x'.repeat(30),topic:'__proto__'},{situation:'x'.repeat(30),region:5},{situation:'x'.repeat(30),extra:true}]) {
  assert.throws(()=>data.validateIntake(input));
 }
 assert.equal(data.validateIntake({situation:'x'.repeat(20)}).situation.length,20);
 assert.equal(data.validateIntake({situation:'x'.repeat(1200)}).situation.length,1200);
});
test('safe defaults do not mark a regular case as an emergency',()=>{
 const intake=data.validateIntake({situation:'A situation with enough information.'});
 assert.equal(intake.topic,'other');assert.equal(intake.danger,false);assert.equal(intake.region,'');
 assert.equal(data.validateIntake({situation:'Immediate safety concern described here.',danger:true}).danger,true);
});
test('every topic has bilingual preparation guidance',()=>{
 for(const value of Object.values(data.topicNotes)) {assert.equal(value.length,2);assert.ok(value.every(text=>text.length>30));}
});
test('HTML has unique ids and all local assets exist',()=>{
 const html=read('dist/index.html');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size);
 for(const match of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) assert.ok(fs.existsSync(path.join(root,'dist',match[1])));
 for(const match of html.matchAll(/<use href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]));
 const app=read('dist/app.js');
 for(const match of app.matchAll(/\$\(['"]#([a-zA-Z][\w-]*)['"]\)/g)) assert.ok(ids.includes(match[1]),`Missing ${match[1]}`);
});
test('privacy: application has no network or persistent browser storage calls',()=>{
 const app=read('dist/app.js');assert.doesNotMatch(app,/\b(fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB)\b/);
 assert.match(app,/navigator\.clipboard\.writeText/);assert.match(app,/URL\.revokeObjectURL/);
});
test('CSS preserves hidden semantics, reduced motion, print and keyboard focus',()=>{
 const css=read('dist/styles.css');
 for(const pattern of [/\[hidden\]\s*\{\s*display:none !important/,/prefers-reduced-motion/,/@media print/,/:focus-visible/]) assert.match(css,pattern);
});
test('all local scripts parse',()=>{
 new vm.Script(read('dist/app.js'));new vm.Script(read('dist/case-data.js'));
});
