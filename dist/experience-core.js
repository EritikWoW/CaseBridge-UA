/* Discovery and personal action workspace. Sensitive state lives only in this tab. */
(() => {
  const q=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
  const plan=PlanCore.create();
  let view='discover', category='all', removed=null, sequence=0;
  const categories=[['all','categoryAll'],['rights','categoryRights'],['social','categorySocial'],['learning','categoryLearning'],['career','categoryCareer'],['wellbeing','categoryWellbeing']];
  const c=key=>ExperienceCopy[state.lang][key]||key;
  const make=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
  const button=(text,action,cls='quiet-button')=>{const node=make('button',text,cls);node.type='button';node.addEventListener('click',action);return node;};
  function sourceLink(text,url) {const a=make('a',text);a.href=url;a.rel='noopener noreferrer';a.target='_blank';return a;}
  function formatDate(value) {return value?new Date(value+'T12:00:00').toLocaleDateString(state.lang==='uk'?'uk-UA':'en-GB'):c('noDate');}
  function today() {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function showView(next,focus=true) {
    if(!['discover','plan','wizard'].includes(next))return;
    view=next;
    q('#viewDiscover').hidden=next!=='discover';q('#viewPlan').hidden=next!=='plan';q('#viewWizard').hidden=next!=='wizard';q('#wizardJourney').hidden=next!=='wizard';
    all('.main-nav [data-view]').forEach(b=>{if(b.dataset.view===next)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    if(next==='plan')renderPlan();
    if(focus) {const title=next==='plan'?q('#planHeading'):next==='wizard'?q('.form-step.active h1'):q('#welcomeTitle');title.setAttribute('tabindex','-1');title.focus({preventScroll:true});q('#workspace').scrollIntoView({block:'start',behavior:'auto'});}
    sky.update();
  }
  all('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
  q('.brand').addEventListener('click',()=>showView('discover',false));
  all('[data-start-search]').forEach(b=>b.addEventListener('click',()=>{q('#resourceSearch').focus();q('#resourceSearch').scrollIntoView({block:'center',behavior:motionOff()?'auto':'smooth'});}));
  all('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;renderDirectory();q('#categoryFilters').scrollIntoView({block:'center',behavior:motionOff()?'auto':'smooth'});}));
  function filterOptions() {return {category,query:q('#resourceSearch').value,audience:q('#audienceFilter').value,saved:plan.saved};}
  function renderFilters(data) {
    const focused=document.activeElement?.dataset.filter;
    q('#categoryFilters').replaceChildren(...categories.map(([id,label])=>{
      const b=button('',()=>{category=id;renderDirectory();q(`[data-filter="${id}"]`)?.focus({preventScroll:true});},'');b.dataset.filter=id;b.setAttribute('aria-pressed',String(category===id));b.append(make('span',c(label)));
      if(data)b.append(make('small',String(HelpCatalog.browse(data,{...filterOptions(),category:id}).length)));
      return b;
    }));
    if(focused)q(`[data-filter="${focused}"]`)?.focus({preventScroll:true});
  }
  function card({entry,source,needsCheck},index=0) {
    const node=make('article',undefined,'resource-card');node.dataset.source=source.id;node.style.setProperty('--card-index',String(Math.min(index,8)));
    const top=make('div',undefined,'resource-card-top');
    const marks={bpd:'БПД',diia:'Дія',unhcr:'UN',osvita:'Aa',howareu:'♡'};
    top.append(make('div',marks[source.id]||'↗','resource-emblem'),make('span',state.lang==='en'?(source.name_en||source.name):source.name,'resource-tag'));node.append(top);
    const body=entry[state.lang];node.append(make('h3',body.title),make('p',body.description),make('span',body.coverage,'coverage'));
    const detail=make('details',undefined,'source-disclosure');detail.append(make('summary',c('sourceDetails')));
    detail.append(sourceLink(new URL(entry.url).hostname,entry.url),make('p',`${c('sourceReviewed')}: ${formatDate(entry.reviewed_at)}`));
    detail.append(make('p',source.last_success_at?`${c('sourceObserved')}: ${formatDate(source.last_success_at.slice(0,10))}`:c('sourcePending')));
    if(entry.phone){const tel=make('a',entry.phone);tel.href='tel:'+entry.phone;detail.append(tel);}
    node.append(detail);
    if(needsCheck)node.append(make('span',c(source.review_required?'sourceChanged':'sourceWarning'),'freshness-warning'));
    const actions=make('div',undefined,'resource-actions');const saved=plan.saved.includes(entry.id);
    const open=sourceLink(c('openResource')+' ↗',entry.url);open.setAttribute('aria-label',`${c('openResource')}: ${body.title}`);
    const save=button((saved?'✓ ':'+ ')+c(saved?'savedResource':'saveResource'),()=>toggleResource(entry.id),'');save.dataset.save=entry.id;save.setAttribute('aria-pressed',String(saved));save.setAttribute('aria-label',`${c(saved?'removeResource':'saveResource')}: ${body.title}`);
    actions.append(open,save);node.append(actions);
    node.addEventListener('pointermove',event=>{if(motionOff())return;const rect=node.getBoundingClientRect();node.style.setProperty('--pointer-x',`${event.clientX-rect.left}px`);node.style.setProperty('--pointer-y',`${event.clientY-rect.top}px`);});
    return node;
  }
  function renderDirectory() {
    const data=CatalogUI.snapshot(),mode=CatalogUI.status();renderFilters(data);
    q('#directoryStatus').textContent=c({loading:'catalogLoading',local:'catalogLocal',remote:'catalogRemote',error:'catalogError'}[mode]);
    q('#directoryRefresh').disabled=mode==='loading';q('#directoryCards').setAttribute('aria-busy',String(mode==='loading'));
    const matches=data?HelpCatalog.browse(data,filterOptions()):[];
    q('#directoryCount').textContent=data?`${matches.length} ${c('resourceCount')} · ${data.sources.length} ${c('sourceCount')}`:'';
    q('#directoryCards').replaceChildren(...matches.map(card));
    q('#directoryEmpty').hidden=!data||matches.length>0;
  }
  function toggleResource(id) {
    const entry=CatalogUI.snapshot()?.entries.find(e=>e.id===id && e.approved);if(!entry)return;
    if(plan.saved.includes(id)) {plan.saved=plan.saved.filter(x=>x!==id);showToast(c('resourceRemoved'));}
    else {
      try {PlanCore.add(plan,{id:'resource:'+id,title:{uk:ExperienceCopy.uk.reviewResource+': '+entry.uk.title,en:ExperienceCopy.en.reviewResource+': '+entry.en.title},resourceId:id});}
      catch {showToast(c('taskLimit'));return;}
      plan.saved.push(id);showToast(c('resourceSaved'));
    }
    refreshAll();
    const root=view==='plan'?q('#savedResources'):q('#directoryCards');[...root.querySelectorAll('[data-save]')].find(b=>b.dataset.save===id)?.focus({preventScroll:true});
  }
  function renderPlan() {
    const {done,total,percent}=PlanCore.stats(plan);
    q('#planBadge').textContent=String(total-done);q('#sidebarPlanProgress').style.width=`${percent}%`;
    q('#sidebarPlanLabel').textContent=total?`${done} / ${total} ${c('completed')}`:c('noTasks');
    q('#planPercent').textContent=percent+'%';q('#planDial').style.setProperty('--plan-angle',`${percent*3.6}deg`);q('#planDial').setAttribute('aria-valuenow',String(percent));
    q('#planSummary').textContent=total?`${done} / ${total} ${c('steps')} ${c('completed')}`:c('noTasks');
    q('#exportPlan').disabled=!total&&!plan.saved.length;
    const list=q('#planTasks');list.replaceChildren();
    for(const task of plan.tasks) {
      const row=make('div',undefined,'plan-task'+(task.done?' is-done':''));
      const checkLabel=make('label',undefined,'task-checkbox'),check=make('input');check.type='checkbox';check.checked=task.done;check.dataset.taskCheck=task.id;check.setAttribute('aria-label',c('taskDone')+': '+task.title[state.lang]);
      check.addEventListener('change',()=>{PlanCore.toggle(plan,task.id);renderPlan();all('[data-task-check]').find(b=>b.dataset.taskCheck===task.id)?.focus({preventScroll:true});});checkLabel.append(check);
      const title=make('div',undefined,'task-title');title.append(make('span',(task.demo?c('demoPrefix')+': ':'')+task.title[state.lang]));
      const status=PlanCore.dateStatus(task.due,today());title.append(make('small',task.done?c('taskDone'):status==='overdue'?c('overdue'):status==='today'?c('dueToday'):task.due?formatDate(task.due):c('noDate')));
      const date=make('input',undefined,'task-date');date.type='date';date.value=task.due;date.min='2000-01-01';date.max='2099-12-31';date.dataset.taskDate=task.id;date.setAttribute('aria-label',c('targetDate')+': '+task.title[state.lang]);
      date.addEventListener('change',()=>{if(PlanCore.validDate(date.value)){task.due=date.value;renderPlan();all('[data-task-date]').find(b=>b.dataset.taskDate===task.id)?.focus({preventScroll:true});}});
      const del=button('×',()=>{removed=PlanCore.remove(plan,task.id);renderPlan();q('#undoTask')?.focus({preventScroll:true});},'task-delete');del.setAttribute('aria-label',c('taskRemove')+': '+task.title[state.lang]);
      row.append(checkLabel,title,date,del);list.append(row);
    }
    if(!total)list.append(make('p',c('taskEmpty'),'directory-empty'));
    if(removed){const bar=make('div',undefined,'undo-bar');bar.setAttribute('role','status');const undo=button(c('undo'),()=>{PlanCore.restore(plan,removed);removed=null;renderPlan();});undo.id='undoTask';bar.append(make('span',c('taskRemoved')),undo);list.append(bar);}
    const data=CatalogUI.snapshot();const saved=data?HelpCatalog.browse(data,{audience:'saved',saved:plan.saved}):[];
    q('#savedResources').replaceChildren(...(saved.length?saved.map(card):[make('p',c('savedEmpty'),'input-note')]));
  }
  function refreshAll() {renderDirectory();renderPlan();updateControls();}
  q('#resourceSearch').addEventListener('input',renderDirectory);q('#audienceFilter').addEventListener('change',renderDirectory);
  q('#resetFilters').addEventListener('click',()=>{category='all';q('#resourceSearch').value='';q('#audienceFilter').value='all';renderDirectory();q('#resourceSearch').focus();});
  q('#directoryRefresh').addEventListener('click',()=>CatalogUI.load());
  document.addEventListener('keydown',event=>{const tag=document.activeElement?.tagName;if(event.key==='/' && view==='discover' && !['INPUT','TEXTAREA','SELECT'].includes(tag) && !document.activeElement?.isContentEditable){event.preventDefault();q('#resourceSearch').focus();}});
  q('#taskDate').min='2000-01-01';q('#taskDate').max='2099-12-31';
  q('#taskForm').addEventListener('submit',event=>{
    event.preventDefault();const title=q('#taskTitle').value.trim(),due=q('#taskDate').value;
    if(!title||title.length>160||!PlanCore.validDate(due)){q('#taskTitle').focus();return;}
    try {PlanCore.add(plan,{id:'custom:'+(++sequence),title:{uk:title,en:title},due});}catch{showToast(c('taskLimit'));return;}
    q('#taskForm').reset();renderPlan();q('#taskTitle').focus();showToast(c('taskAdded'));
  });
  q('#loadPlanDemo').addEventListener('click',()=>{
    if(plan.tasks.length>77){showToast(c('taskLimit'));return;}
    let added=0;
    ['demoExplore','demoPrepare','demoContact'].forEach((key,i)=>{if(PlanCore.add(plan,{id:'demo:'+key,title:{uk:ExperienceCopy.uk[key],en:ExperienceCopy.en[key]},due:i===0?today():'',demo:true}))added++;});
    renderPlan();showToast(c(added?'demoPlanAdded':'demoPlanExists'));
  });
  q('#routeToPlan').addEventListener('click',()=>{
    const actions=routeActions('uk'),english=routeActions('en');
    if(plan.tasks.length+actions.length>80){showToast(c('taskLimit'));return;}
    let added=0;
    actions.forEach((text,i)=>{const id=`route:${state.topic}:${q('#danger').checked}:${q('#deadline').value}:${i}`;if(PlanCore.add(plan,{id,title:{uk:text,en:english[i]}}))added++;});
    showView('plan');showToast(c(added?'routeAdded':'routeAlready'));
  });
  q('#exportPlan').addEventListener('click',()=>{
    const text=PlanCore.exportText(plan,state.lang,CatalogUI.snapshot(),ExperienceCopy[state.lang]);
    const url=URL.createObjectURL(new Blob(['\uFEFF',text],{type:'text/plain;charset=utf-8'}));const a=make('a');a.href=url;a.download='casebridge-my-plan.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast(c('planExported'));
  });
  // Respect system accessibility preferences; pause control is always available.
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let paused=false;
  function motionOff(){return reduced.matches||paused||document.body.classList.contains('focus-mode');}
  function updateControls(){
    const night=document.body.classList.contains('night');document.body.classList.toggle('no-motion',motionOff());
    q('#themeLabel').textContent=c(night?'dayMode':'nightMode');q('.theme-icon').textContent=night?'☾':'☼';q('#themeToggle').setAttribute('aria-pressed',String(night));q('#themeToggle').setAttribute('aria-label',q('#themeLabel').textContent);
    q('#motionToggle').textContent=c(reduced.matches?'motionSystem':paused?'resumeMotion':'pauseMotion');q('#motionToggle').setAttribute('aria-pressed',String(motionOff()));q('#motionToggle').disabled=reduced.matches;
    q('#focusToggle').setAttribute('aria-pressed',String(document.body.classList.contains('focus-mode')));q('#sceneCaption').textContent=c(night?'nightCaption':'dayCaption');
    document.querySelector('meta[name="theme-color"]').content=night?'#091726':'#eef2f7';
  }
  const hour=new Date().getHours();document.body.classList.toggle('night',window.matchMedia('(prefers-color-scheme: dark)').matches||hour<7||hour>=19);
  q('#themeToggle').addEventListener('click',()=>{document.body.classList.toggle('night');updateControls();sky.update();});
  q('#motionToggle').addEventListener('click',()=>{paused=!paused;updateControls();sky.update();});
  q('#focusToggle').addEventListener('click',()=>{document.body.classList.toggle('focus-mode');updateControls();sky.update();});
  reduced.addEventListener('change',()=>{updateControls();sky.update();});

  // A single, bounded canvas loop. Size changes never reset the canvas each frame.
  const sky=(()=>{
    const canvas=q('#ambientCanvas'),context=canvas.getContext('2d');
    if(!context)return {update(){}};
    let width=1,height=1,frame=0,clock=0,last=0,visible=true,pointer={x:.72,y:.5};
    const points=Array.from({length:85},(_,i)=>({x:((i*73+23)%997)/997,y:((i*137+31)%991)/991,r:.7+(i%5)*.32,phase:i*.8}));
    function resize(){const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;const ratio=Math.min(devicePixelRatio||1,2);width=rect.width;height=rect.height;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);context.setTransform(ratio,0,0,ratio,0,0);draw();}
    function draw(){
      context.clearRect(0,0,width,height);const night=document.body.classList.contains('night');
      const glow=context.createRadialGradient(width*.82,height*.18,0,width*.82,height*.18,width*.45);
      glow.addColorStop(0,night?'rgba(87,144,224,.30)':'rgba(255,245,202,.95)');glow.addColorStop(1,'rgba(175,202,247,0)');context.fillStyle=glow;context.fillRect(0,0,width,height);
      for(const p of points){
        const x=((p.x*width+clock*(night?1.8:8)+(pointer.x-.5)*8)%width+width)%width;
        const y=p.y*height+Math.sin(clock*.35+p.phase)*(night?2:9)+(pointer.y-.5)*5;
        const opacity=night?.45+.5*Math.sin(clock*.8+p.phase)**2:.32+.18*Math.sin(clock*.4+p.phase)**2;
        context.fillStyle=night?`rgba(220,237,255,${opacity})`:`rgba(255,255,255,${opacity})`;context.beginPath();context.arc(x,y,night?p.r:p.r*2,0,Math.PI*2);context.fill();
      }
      // Luminous ribbons drift across the day; a slow meteor occasionally crosses the night.
      if(!night){for(let i=0;i<3;i++){context.beginPath();context.strokeStyle=`rgba(255,255,255,${.12+i*.035})`;context.lineWidth=20-i*5;for(let x=0;x<=width;x+=8){const y=height*.24+i*height*.23+Math.sin(x/width*4+clock*.25+i)*30;x===0?context.moveTo(x,y):context.lineTo(x,y);}context.stroke();}}
      else if(!motionOff()&&clock%12<2.5){const t=(clock%12)/2.5,x=width*(.55+t*.34),y=height*(.04+t*.46);const trail=context.createLinearGradient(x-70,y-30,x,y);trail.addColorStop(0,'rgba(190,223,255,0)');trail.addColorStop(1,'rgba(230,244,255,.7)');context.strokeStyle=trail;context.lineWidth=1.3;context.beginPath();context.moveTo(x-70,y-30);context.lineTo(x,y);context.stroke();}
    }
    function tick(now){frame=0;if(!canRun()){draw();return;}const elapsed=last?Math.min((now-last)/1000,.06):0;last=now;clock+=elapsed;draw();frame=requestAnimationFrame(tick);}
    function canRun(){return !motionOff()&&!document.hidden&&visible&&view==='discover';}
    function update(){cancelAnimationFrame(frame);frame=0;last=0;draw();if(canRun())frame=requestAnimationFrame(tick);}
    const observer=new ResizeObserver(resize);observer.observe(q('#welcomeScene'));
    const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();});visibility.observe(q('#welcomeScene'));
    q('#welcomeScene').addEventListener('pointermove',event=>{if(motionOff())return;const r=canvas.getBoundingClientRect();pointer={x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};},{passive:true});
    document.addEventListener('visibilitychange',update);window.addEventListener('resize',resize,{passive:true});
    window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();},{once:true});
    resize();return {update};
  })();
  window.addEventListener('casebridge:catalog',()=>{renderDirectory();renderPlan();});
  window.addEventListener('casebridge:language',refreshAll);
  window.addEventListener('casebridge:route',()=>showView('wizard'));
  refreshAll();showView('discover',false);
})();
