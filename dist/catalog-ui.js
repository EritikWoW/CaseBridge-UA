/* Fixed public catalog requests only; no intake text, identifiers or selections. */
const CatalogUI = (() => {
  let catalog=null, mode='loading', generation=0;
  const remote='https://raw.githubusercontent.com/EritikWoW/CaseBridge-UA/main/dist/data/catalog.json';
  const sourceLogos={
    bpd:{type:'img',src:'https://legalaid.gov.ua/wp-content/themes/legalaidTheme/assets/img/icons/logo_2.svg'},
    diia:{type:'img',src:'https://guide.diia.gov.ua/static/img/logo-diia-black.svg'},
    unhcr:{type:'img',src:'https://help.unhcr.org/ukraine/wp-content/themes/help-v2/images/help-logo-en-en.png'},
    howareu:{type:'img',src:'https://howareu.com/static-objects/howareu/media/Logo.svg'},
    osvita:{type:'path',path:'M 20.009 0.5 c 5.315 0 8.736 0.133 11.144 0.586 c 2.444 0.46 3.873 1.255 5.189 2.57 c 1.325 1.325 2.121 2.753 2.579 5.194 c 0.45 2.404 0.579 5.82 0.579 11.131 c 0 5.313 -0.128 8.728 -0.58 11.132 c -0.457 2.44 -1.253 3.868 -2.577 5.192 c -1.315 1.325 -2.743 2.13 -5.188 2.597 c -2.408 0.46 -5.83 0.598 -11.146 0.598 c -5.315 0 -8.736 -0.133 -11.144 -0.586 c -2.443 -0.46 -3.873 -1.255 -5.19 -2.57 c -1.333 -1.333 -2.134 -2.766 -2.594 -5.21 C 0.628 28.729 0.5 25.313 0.5 20 s 0.133 -8.727 0.586 -11.132 c 0.46 -2.44 1.256 -3.868 2.57 -5.192 l 0.001 -0.001 C 4.982 2.35 6.416 1.55 8.862 1.088 C 11.272 0.632 14.694 0.5 20.01 0.5 Z m -9.974 17.875 c 0 1.034 -0.09 1.963 -0.246 2.734 c -0.153 0.762 -0.377 1.408 -0.67 1.846 l -0.148 0.223 h -0.525 v 2.582 h 0.552 v -2.124 h 6.874 v 2.124 h 0.552 v -2.582 h -1.127 v -8.254 h -5.262 Z m 8.77 -1.17 l 1.496 -0.013 l 0.669 -0.006 l -0.185 0.643 l -1.402 4.904 a 0.86 0.86 0 0 0 0.126 0.758 c 0.141 0.186 0.387 0.33 0.74 0.33 c 0.216 0 0.419 -0.046 0.69 -0.216 l 2.107 -1.43 l -0.215 -0.319 l -1.987 1.346 l -0.27 0.183 l -0.275 -0.173 l -0.149 -0.092 l -0.318 -0.2 l 0.103 -0.361 l 1.647 -5.789 h -2.653 Z m 8.483 -0.453 c -0.666 0 -1.194 0.216 -1.55 0.554 c -0.355 0.335 -0.573 0.818 -0.573 1.42 c 0 0.944 0.521 1.616 1.36 1.866 l 0.644 0.191 l -0.368 0.562 l -1.488 2.272 h 0.578 l 1.662 -2.543 l 0.148 -0.226 h 2.193 v 2.77 h 0.588 v -6.866 Z M 14.69 15.438 v 7.721 H 9.423 l 0.46 -0.76 c 0.167 -0.275 0.352 -0.802 0.493 -1.534 c 0.14 -0.72 0.23 -1.597 0.23 -2.546 v -2.881 Z m 15.166 1.699 V 20.5 h -2.902 v -0.084 a 1.6 1.6 0 0 1 -0.722 -0.406 c -0.316 -0.313 -0.48 -0.742 -0.48 -1.21 c 0 -0.469 0.165 -0.895 0.484 -1.204 s 0.75 -0.46 1.218 -0.46 Z m -8.221 -3.857 c -0.343 0 -0.466 0.069 -0.509 0.108 c -0.032 0.028 -0.1 0.114 -0.1 0.408 c 0 0.268 0.065 0.345 0.095 0.371 c 0.045 0.04 0.172 0.107 0.514 0.107 c 0.354 0 0.478 -0.07 0.518 -0.105 c 0.027 -0.024 0.09 -0.098 0.09 -0.373 c 0 -0.294 -0.068 -0.38 -0.1 -0.408 c -0.042 -0.04 -0.166 -0.108 -0.508 -0.108 Z'}
  };
  const labels={
    uk:{title:'Куди можна звернутися',hint:'Добірка за обраною темою та статусом. Умови допомоги підтверджує організація.',loading:'Завантажуємо каталог…',local:'Збережений каталог',remote:'Каталог оновлено',error:'Каталог недоступний. Скористайтеся контактом БПД нижче.',open:'Відкрити джерело',call:'Зателефонувати',reviewed:'Опис перевірено',observed:'Сторінку перевірено автоматично',never:'Автоперевірка ще не виконана',check:'Уточніть актуальність',reason:'Відповідає обраній темі',idp:'Є інформація для ВПО',region:'Пошук бюро для області',sources:'Стан джерел',refresh:'Оновити каталог',available:'Сторінка доступна',unavailable:'Не вдалося перевірити',blocked:'Автозбір обмежено',not_checked:'Ще не перевірено',changed:'Зміни очікують перевірки',empty:'У каталозі поки немає відповідного варіанта. Контакт БПД наведено нижче.',privacy:'Каталог завантажується з публічного GitHub. Відповіді анкети залишаються у вашому браузері.',autoNote:'Автоперевірка підтверджує доступність сторінки, а не право на послугу.',none:'немає успішної перевірки'},
    en:{title:'Where you can get help',hint:'Matched to your selected topic and status. The provider confirms eligibility.',loading:'Loading the catalog…',local:'Saved catalog',remote:'Catalog updated',error:'Catalog unavailable. Use the Free Legal Aid contact below.',open:'Open source',call:'Call',reviewed:'Description reviewed',observed:'Page checked automatically',never:'No automated check yet',check:'Confirm current details',reason:'Matches your selected topic',idp:'Includes information for IDPs',region:'Office directory for region',sources:'Source status',refresh:'Refresh catalog',available:'Page available',unavailable:'Could not verify',blocked:'Automated collection restricted',not_checked:'Not checked yet',changed:'Changes awaiting review',empty:'No matching entry yet. The Free Legal Aid contact is below.',privacy:'The catalog is downloaded from public GitHub. Your intake answers stay in your browser.',autoNote:'An automated check confirms page availability, not eligibility for assistance.',none:'no successful check'}
  };
  function el(tag,text,className) {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
  function date(value,lang) {const d=new Date(value);return value && Number.isFinite(d.getTime())?d.toLocaleDateString(lang==='uk'?'uk-UA':'en-GB'):labels[lang].none;}
  function link(text,url,className) {const a=el('a',text,className);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function logo(source,compact=false) {
    const spec=sourceLogos[source.id];
    const wrap=el('span',undefined,'source-logo');
    wrap.style.cssText=`width:${compact?'34px':'48px'};height:${compact?'34px':'48px'};min-width:${compact?'34px':'48px'};display:inline-flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;border-radius:${compact?'9px':'12px'};background:#fff;overflow:hidden;padding:${compact?'5px':'7px'};box-shadow:0 3px 10px rgba(7,27,51,.06)`;
    if(!spec) return wrap;
    if(spec.type==='img') {
      const img=document.createElement('img');img.src=spec.src;img.alt='';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.style.cssText='display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain';wrap.append(img);
    } else {
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 40 40');svg.setAttribute('aria-hidden','true');svg.style.cssText='display:block;width:100%;height:100%;fill:#111;stroke:none';const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',spec.path);svg.append(path);wrap.append(svg);
    }
    return wrap;
  }
  function provider(source,lang) {
    const row=el('div',undefined,'help-provider-row');row.style.cssText='display:flex;align-items:center;gap:11px;margin-bottom:11px';
    const name=el('span',lang==='en'?(source.name_en||source.name):source.name,'help-provider');name.style.margin='0';
    row.append(logo(source),name);return row;
  }
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
        card.append(provider(source,lang),el('h3',body.title),el('p',body.description),el('small',body.coverage));
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
      const list=el('ul');for(const source of catalog.sources){const item=el('li');item.style.cssText='display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center';item.append(logo(source,true),link(lang==='en'?(source.name_en||source.name):source.name,source.url),el('span',`${l[source.status]} · ${date(source.checked_at,lang)}`));list.append(item);}details.append(list,el('p',l.autoNote));root.append(details);
    }
    root.append(el('p',l.privacy,'input-note'));
    window.dispatchEvent(new Event('casebridge:catalog'));
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
  return {render,load,exportText,snapshot:()=>catalog,status:()=>mode};
})();
CatalogUI.load();
