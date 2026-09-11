// Exercise the actual capture and applyLanguage code without a browser renderer.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
test('actual UI translation restores Ukrainian text and placeholders over repeated switches',()=>{
 const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
 const nodes=[
  {dataset:{i18n:'situationTitle'},textContent:'Опишіть, що сталося'},
  {dataset:{i18n:'storyLabel'},textContent:'Ваша ситуація'},
  {dataset:{i18n:'draftTitle'},textContent:'Чернетка звернення'},
  {dataset:{i18n:'replaceTitle'},textContent:'Замінити поточні відповіді?'}
 ];
 const placeholders=[{dataset:{i18nPlaceholder:'storyPlaceholder'},placeholder:'Опишіть ситуацію українською'}];
 const toggle={innerHTML:'',setAttribute(){}};
 const context=vm.createContext({document:{documentElement:{},title:''},state:{lang:'uk',step:1},
  $:()=>toggle,$$:selector=>selector.includes('placeholder')?placeholders:nodes,
  renderRegions(){},renderDemos(){},refreshActionLabel(){},updateProgress(){},buildResult(){}
 });
 const declaration=app.slice(app.indexOf('const translations ='),app.indexOf('const topicSamples ='));
 const capture=app.slice(app.indexOf('function t(key)'),app.indexOf('const regions ='));
 const apply=app.slice(app.indexOf('function applyLanguage()'),app.indexOf('function updateProgress()'));
 vm.runInContext(declaration+capture+apply,context);
 const original=nodes.map(n=>n.textContent);
 for(let i=0;i<3;i++) {
  context.state.lang='en';vm.runInContext('applyLanguage()',context);
  assert.equal(nodes[0].textContent,'Tell us what happened');
  assert.notEqual(placeholders[0].placeholder,'Опишіть ситуацію українською');
  context.state.lang='uk';vm.runInContext('applyLanguage()',context);
  assert.deepEqual(nodes.map(n=>n.textContent),original);
  assert.equal(placeholders[0].placeholder,'Опишіть ситуацію українською');
  assert.equal(context.document.documentElement.lang,'uk');
 }
});
