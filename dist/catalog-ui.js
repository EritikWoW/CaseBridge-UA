/* Fixed public catalog requests only; no intake text, identifiers or selections. */
const CatalogUI = (() => {
  let catalog=null, mode='loading', generation=0;
  const remote='https://raw.githubusercontent.com/EritikWoW/CaseBridge-UA/main/dist/data/catalog.json';
  const labels={
    uk:{title:'Куди можна звернутися',hint:'Добірка за обраною темою та статусом. Умови допомоги підтверджує організація.',loading:'Завантажуємо каталог…',local:'Збережений каталог',remote:'Каталог оновлено',error:'Каталог недоступний. Скористайтеся контактом БПД нижче.',open:'Відкрити джерело',call:'Зателефонувати',reviewed:'Опис перевірено',observed:'Сторінку перевірено автоматично',never:'Автоперевірка ще не виконана',check:'Уточніть актуальність',reason:'Відповідає обраній темі',idp:'Є інформація для ВПО',region:'Пошук бюро для області',sources:'Стан джерел',refresh:'Оновити каталог',available:'Сторінка доступна',unavailable:'Не вдалося перевірити',blocked:'Автозбір обмежено',not_checked:'Ще не перевірено',changed:'Зміни очікують перевірки',empty:'У каталозі поки немає відповідного варіанта. Контакт БПД наведено нижче.',privacy:'Каталог завантажується з публічного GitHub. Відповіді анкети залишаються у вашому браузері.',autoNote:'Автоперевірка підтверджує доступність сторінки, а не право на послугу.',none:'немає успішної перевірки'},
    en:{title:'Where you can get help',hint:'Matched to your selected topic and status. The provider confirms eligibility.',loading:'Loading the catalog…',local:'Saved catalog',remote:'Catalog updated',error:'Catalog unavailable. Use the Free Legal Aid contact below.',open:'Open source',call:'Call',reviewed:'Description reviewed',observed:'Page checked automatically',never:'No automated check yet',check:'Confirm current details',reason:'Matches your selected topic',idp:'Includes information for IDPs',region:'Office directory for region',sources:'Source status',refresh:'Refresh catalog',available:'Page available',unavailable:'Could not verify',blocked:'Automated collection restricted',not_checked:'Not checked yet',changed:'Changes awaiting review',empty:'No matching entry yet. The Free Legal Aid contact is below.',privacy:'The catalog is downloaded from public GitHub. Your intake answers stay in your browser.',autoNote:'An automated check confirms page availability, not eligibility for assistance.',none:'no successful check'}
  };
  function el(tag,text,className) {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
  function date(value,lang) {const d=new Date(value);return value && Number.isFinite(d.getTime())?d.toLocaleDateString(lang==='uk'?'uk-UA':'en-GB'):labels[lang].none;}
  function link(text,url,className) {const a=el('a',text,className);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function render() {
    const root=document.getElementById('helpCatalog'); if(!root)return;
    const lang=state.lang, l=labels[lang];root.replaceChildren();
    const heading=el('div',undefined,'catalog-heading');const copy=el('div');copy.append(el('h2',l.title),el('p',l.hint));
    const refresh=el('button',l.refresh,'quiet-button');refresh.type='button';refresh.disabled=mode==='loading';refresh.addEventListener('click',()=>load());heading.append(copy,refresh);root.append(heading);
    const live=el('p',l[mode],'catalog-status');live.setAttribute('role','status');root.append(live);
    if(catalog) {
      const matches=HelpCatalog.match(catalog,{topic:state.topic,statuses:selectedValues('status'),region:document.getElementById('region').value});
      const cards=el('div',undefined,'help-cards');
      for(const {entry,source,needsCheck} of matches) {
        const card=el('article',undefined,'help-card');const body=entry[lang];
        card.append(el('span',source.name,'help-provider'),el('h3',body.title),el('p',body.description),el('small',body.coverage));
        const reason=el('p',entry.audiences.includes('idp')?l.idp:l.reason,'match-reason');
        if(entry.kind==='directory' && document.getElementById('region').value && document.getElementById('region').value!=='За кордоном') reason.textContent=`${l.region}: ${document.getElementById('region').selectedOptions[0].textContent}`;
        card.append(reason);
        const status=el('div',undefined,'source-dates');status.append(el('span',`${l.reviewed}: ${date(entry.reviewed_at,lang)}`),el('span',source.last_success_at?`${l.observed}: ${date(source.last_success_at,lang)}`:l.never));
        if(needsCheck) status.append(el('b',source.review_required?l.changed:l.check,'source-warning'));
        card.append(status);const actions=el('div',undefined,'help-actions');actions.append(link(l.open+' ↗',entry.url,'text-link'));
        if(entry.phone) {const call=el('a',l.call,'call-link');call.href='tel:'+entry.phone;call.setAttribute('aria-label',`${l.call}: ${entry.phone}`);actions.append(call);}
        card.append(actions);cards.append(card);
      }
      root.append(matches.length?cards:el('p',l.empty));
      const details=el('details',undefined,'catalog-sources');details.append(el('summary',l.sources));
      const list=el('ul');for(const source of catalog.sources){const item=el('li');item.append(link(source.name,source.url),el('span',`${l[source.status]} · ${date(source.checked_at,lang)}`));list.append(item);}details.append(list,el('p',l.autoNote));root.append(details);
    }
    root.append(el('p',l.privacy,'input-note'));
  }
  async function read(url) {
    const response=await fetch(url,{method:'GET',credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw new Error('Catalog unavailable');
    const text=await response.text();if(text.length>250000)throw new Error('Catalog too large');return HelpCatalog.validate(JSON.parse(text));
  }
  async function load() {
    const current=++generation;mode='loading';render();
    if(!catalog)try {catalog=await read('./data/catalog.json');mode='local';if(current===generation)render();}catch{}
    try {const next=await read(remote);if(current!==generation)return;const incoming=Date.parse(next.updated_at),existing=Date.parse(catalog?.updated_at||'');if(Number.isFinite(incoming) && (!catalog || incoming>=existing)){catalog=next;mode='remote';}else{mode=catalog?'local':'error';}}
    catch {if(current!==generation)return;mode=catalog?'local':'error';}
    if(current===generation)render();
  }
  function exportText() {
    if(!catalog)return '';
    return HelpCatalog.match(catalog,{topic:state.topic,statuses:selectedValues('status'),region:document.getElementById('region').value}).map(({entry,source,needsCheck})=>`${entry[state.lang].title}\n${entry.url}\n${labels[state.lang].reviewed}: ${entry.reviewed_at}${needsCheck?' · '+labels[state.lang].check:''}\n${source.name}`).join('\n\n');
  }
  return {render,load,exportText};
})();
CatalogUI.load();
