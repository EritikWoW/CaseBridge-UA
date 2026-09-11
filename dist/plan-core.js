/* Intentionally in-memory. No personal state is transmitted or auto-persisted. */
const PlanCore = (() => {
  const create=()=>({tasks:[],saved:[]});
  function validDate(value) {
    return value==='' || (typeof value==='string' && /^20\d{2}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value);
  }
  function add(plan, input) {
    if(!input || typeof input.id!=='string' || !input.id || !input.title || !['uk','en'].every(l=>typeof input.title[l]==='string' && input.title[l].trim().length>0 && input.title[l].length<=700) || !validDate(input.due||'')) throw new Error('Invalid task');
    if(plan.tasks.some(t=>t.id===input.id))return false;
    if(plan.tasks.length>=80)throw new Error('Task limit');
    plan.tasks.push({id:input.id,title:{uk:input.title.uk.trim(),en:input.title.en.trim()},due:input.due||'',done:false,resourceId:input.resourceId||null,demo:Boolean(input.demo)});
    return true;
  }
  function toggle(plan,id) {const task=plan.tasks.find(t=>t.id===id);if(task)task.done=!task.done;return task;}
  function remove(plan,id) {const index=plan.tasks.findIndex(t=>t.id===id);return index<0?null:{index,task:plan.tasks.splice(index,1)[0]};}
  function restore(plan,removed) {if(removed && plan.tasks.length<80 && !plan.tasks.some(t=>t.id===removed.task.id))plan.tasks.splice(Math.min(removed.index,plan.tasks.length),0,removed.task);}
  function stats(plan) {const done=plan.tasks.filter(t=>t.done).length,total=plan.tasks.length;return {done,total,percent:total?Math.round(done/total*100):0};}
  function dateStatus(value,today) {return !value?'none':value<today?'overdue':value===today?'today':'future';}
  function exportText(plan,lang,catalog,copy) {
    const approved=catalog?.entries.filter(e=>e.approved)||[];
    const tasks=plan.tasks.map(t=>`${t.done?'[x]':'[ ]'} ${t.demo?copy.demoPrefix+': ':''}${t.title[lang]}${t.due?' · '+t.due:''}`);
    const resources=plan.saved.map(id=>approved.find(e=>e.id===id)).filter(Boolean).map(e=>`${e[lang].title}\n${e.url}\n${copy.sourceReviewed}: ${e.reviewed_at}`);
    return ['CaseBridge UA',copy.myPlanTitle,'',...tasks,'',copy.savedResources,...resources,'',copy.ownDates].join('\n');
  }
  return {create,add,toggle,remove,restore,stats,validDate,dateStatus,exportText};
})();
if(typeof module!=='undefined' && module.exports) module.exports=PlanCore;
