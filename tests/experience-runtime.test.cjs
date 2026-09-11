/* Controller smoke tests using lightweight test doubles, not a browser/rendering test. */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const PlanCore=require('../dist/plan-core.js'),HelpCatalog=require('../dist/catalog-core.js'),ExperienceCopy=require('../dist/experience-copy.js');
const catalog=require('../dist/data/catalog.json');

function harness(systemReduced=false) {
 const nodes=new Map(),special=new Map(),frames=new Map(),winEvents={},docEvents={};let frameId=0,draws=0;
 const kebab=s=>s.replace(/-([a-z])/g,(_,x)=>x.toUpperCase());
 const match=(el,s)=>s[0]==='#'?el.id===s.slice(1):s.startsWith('[data-')?(()=>{const m=s.match(/^\[data-([^=\]]+)(?:="([^"]+)")?\]$/);return m&&kebab(m[1]) in el.dataset&&(m[2]===undefined||el.dataset[kebab(m[1])]===m[2]);})():false;
 let document;
 class Element {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attrs={};this.events={};this.value='';this.checked=false;this.hidden=false;this.className='';this.style={setProperty:(k,v)=>this.style[k]=v};this._text='';this.id='';this.classList={contains:k=>this.className.split(' ').includes(k),toggle:(k,v)=>{const set=new Set(this.className.split(' ').filter(Boolean));const on=v===undefined?!set.has(k):v;on?set.add(k):set.delete(k);this.className=[...set].join(' ');return on;}};}
  append(...kids){this.children.push(...kids);}
  replaceChildren(...kids){this.children=kids;this._text='';}
  set textContent(v){this._text=String(v);this.children=[];}
  get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  setAttribute(k,v){this.attrs[k]=String(v);}
  removeAttribute(k){delete this.attrs[k];}
  addEventListener(k,f){(this.events[k]??=[]).push(f);}
  fire(k){for(const fn of this.events[k]||[])fn({target:this,preventDefault(){}});}
  focus(){document.activeElement=this;}
  scrollIntoView(){} remove(){} reset(){} click(){this.fire('click');}
  querySelectorAll(s){const found=[];function walk(e){for(const ch of e.children){if(match(ch,s))found.push(ch);walk(ch);}}walk(this);return found;}
  getBoundingClientRect(){return {width:900,height:300,left:0,top:0};}
 }
 const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8');
 for(const [,id] of html.matchAll(/\bid="([^"]+)"/g)){const e=new Element();e.id=id;nodes.set(id,e);}
 const nav=['discover','plan','wizard'].map(id=>{const b=new Element('button');b.dataset.view=id;return b;});
 for(const s of ['.brand','.theme-icon','.form-step.active h1','meta[name="theme-color"]'])special.set(s,new Element());
 const query=s=>s.startsWith('#')?(nodes.get(s.slice(1))||[...nodes.values()].flatMap(n=>n.querySelectorAll(s))[0]):special.get(s)||[...nodes.values()].flatMap(n=>n.querySelectorAll(s))[0]||null;
 const queryAll=s=>s==='[data-view]'||s==='.main-nav [data-view]'?nav:[...nodes.values()].flatMap(n=>n.querySelectorAll(s));
 document={body:new Element('body'),activeElement:null,hidden:false,querySelector:query,querySelectorAll:queryAll,createElement:tag=>new Element(tag),addEventListener:(k,f)=>{docEvents[k]=f;}};
 nodes.get('ambientCanvas').getContext=()=>({setTransform(){},clearRect(){draws++;},createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),fillRect(){},beginPath(){},arc(){},fill(){},moveTo(){},lineTo(){},stroke(){}});
 nodes.get('audienceFilter').value='all';nodes.get('deadline').value='none';
 const reduced={matches:systemReduced,addEventListener(){}};
 const window={matchMedia:s=>s.includes('reduced-motion')?reduced:{matches:false},addEventListener:(k,f)=>{(winEvents[k]??=[]).push(f);}};
 const context={document,window,state:{lang:'uk',topic:'housing'},PlanCore,HelpCatalog,ExperienceCopy,CatalogUI:{snapshot:()=>catalog,status:()=>'local',load(){}},URL,Blob,Event,Date,devicePixelRatio:1,showToast(){},setTimeout(){},routeActions:lang=>lang==='uk'?['Крок один','Крок два']:['Step one','Step two'],requestAnimationFrame:fn=>{const id=++frameId;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),ResizeObserver:class{observe(){}disconnect(){}},IntersectionObserver:class{observe(){}disconnect(){}}};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/experience.js'),'utf8'),context);
 return {context,nodes,nav,frames,draws:()=>draws,emit:k=>(winEvents[k]||[]).forEach(fn=>fn())};
}
test('controller starts on discovery, filters, adds resources and completes a task',()=>{
 const h=harness();assert.equal(h.nodes.get('viewWizard').hidden,true);assert.equal(h.nodes.get('directoryCards').children.length,9);
 const search=h.nodes.get('resourceSearch');search.value='резюме';search.fire('input');assert.equal(h.nodes.get('directoryCards').children.length,1);
 h.nodes.get('directoryCards').querySelectorAll('[data-save]')[0].click();assert.equal(h.nodes.get('planBadge').textContent,'1');
 h.nav[1].click();assert.equal(h.nodes.get('viewPlan').hidden,false);assert.equal(h.frames.size,0);
 h.nodes.get('planTasks').querySelectorAll('[data-task-check]')[0].fire('change');assert.equal(h.nodes.get('planPercent').textContent,'100%');
 h.context.state.lang='en';h.emit('casebridge:language');assert.match(h.nodes.get('planTasks').textContent,/Check details and contact options/);
 h.context.state.lang='uk';h.emit('casebridge:language');assert.match(h.nodes.get('planTasks').textContent,/Переглянути умови/);
});
test('one animation loop survives theme toggles; pause and focus stop it',()=>{
 const h=harness();assert.equal(h.frames.size,1);const initial=h.draws();
 for(let i=0;i<4;i++)h.nodes.get('themeToggle').click();assert.equal(h.frames.size,1);assert.ok(h.draws()>initial);
 h.nodes.get('motionToggle').click();assert.equal(h.frames.size,0);assert.ok(h.context.document.body.classList.contains('no-motion'));
 h.nodes.get('motionToggle').click();assert.equal(h.frames.size,1);
 h.nodes.get('focusToggle').click();assert.equal(h.frames.size,0);h.nodes.get('focusToggle').click();assert.equal(h.frames.size,1);
});
test('system reduced motion still repaints when switching themes, without a loop',()=>{
 const h=harness(true);assert.equal(h.frames.size,0);assert.equal(h.nodes.get('motionToggle').disabled,true);const first=h.draws();
 h.nodes.get('themeToggle').click();assert.ok(h.draws()>first);assert.equal(h.frames.size,0);
});
