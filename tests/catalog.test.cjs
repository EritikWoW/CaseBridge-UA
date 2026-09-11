const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../dist/catalog-core.js');
const original=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/data/catalog.json'),'utf8'));
const now=Date.parse('2026-09-10T16:00:00Z');
test('catalog is bilingual, source-bound and valid',()=>assert.equal(core.validate(original),original));
test('IDP housing case includes relevant partner and public services',()=>{
 const matches=core.match(original,{topic:'housing',statuses:['idp']},now).map(m=>m.entry.id);
 assert.ok(matches.includes('unhcr-legal'));assert.ok(matches.includes('diia-idp'));
});
test('general employment case does not imply IDP eligibility',()=>{
 const matches=core.match(original,{topic:'work',statuses:[]},now);
 assert.ok(matches.length>0);assert.ok(matches.every(m=>m.entry.source_id==='bpd'));
});
test('unapproved, expired and source-changed records cannot appear as current',()=>{
 const data=structuredClone(original);data.entries[0].approved=false;
 data.sources.forEach(s=>{s.status='available';s.last_success_at='2026-09-10T12:00:00Z';s.review_required=true;});
 const matches=core.match(data,{topic:'housing',statuses:['idp']},now);
 assert.ok(matches.every(m=>m.entry.id!=='bpd-consultation'));assert.ok(matches.every(m=>m.needsCheck));
 assert.ok(core.match(original,{topic:'work',statuses:[]},now+45*86400000).every(m=>m.stale));
});
test('malicious URLs and broken foreign keys rejected',()=>{
 for(const url of ['javascript:alert(1)','https://legalaid.gov.ua.attacker.com','https://name:secret@legalaid.gov.ua/']){
  const data=structuredClone(original);data.entries[0].url=url;assert.throws(()=>core.validate(data));
 }
 const data=structuredClone(original);data.entries[0].source_id='missing';assert.throws(()=>core.validate(data));
});
test('remote requests are fixed GETs without intake fields',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../dist/catalog-ui.js'),'utf8');
 assert.match(code,/credentials:'omit'/);assert.match(code,/referrerPolicy:'no-referrer'/);
 assert.doesNotMatch(code,/JSON\.stringify\(.*(?:state|story)|method:'POST'|localStorage/);
});
