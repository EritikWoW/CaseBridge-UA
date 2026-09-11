/* Pure, local matching. No case content is sent to a service. */
const HelpCatalog = (() => {
  const hosts = new Set(['legalaid.gov.ua','guide.diia.gov.ua','help.unhcr.org','osvita.diia.gov.ua','howareu.com']);
  const topics = new Set(['housing','documents','payments','work','safety','other','education','wellbeing','community']);
  const areas = {rights:['housing','documents','safety','other'],social:['payments','community'],learning:['education'],career:['work'],wellbeing:['wellbeing']};
  function safeUrl(value) {
    try { const u=new URL(value); return u.protocol==='https:' && hosts.has(u.hostname) && !u.username && !u.password && !u.port; } catch { return false; }
  }
  function validate(data) {
    if(!data || data.schema_version!==1 || !Array.isArray(data.sources) || !Array.isArray(data.entries) || data.sources.length>20 || data.entries.length>100) throw new Error('Invalid catalog');
    const ids=new Set();
    for(const s of data.sources) {
      if(typeof s.id!=='string' || ids.has(s.id) || !safeUrl(s.url) || typeof s.name!=='string' || !['available','not_checked','unavailable','blocked'].includes(s.status)) throw new Error('Invalid source');
      ids.add(s.id);
    }
    const entryIds=new Set();
    for(const e of data.entries) {
      if(typeof e.id!=='string' || entryIds.has(e.id) || !ids.has(e.source_id) || !safeUrl(e.url) || typeof e.approved!=='boolean' || !Array.isArray(e.topics) || !e.topics.every(t=>topics.has(t)) || !Array.isArray(e.audiences) || !Array.isArray(e.regions) || !['consultation','directory','information'].includes(e.kind)) throw new Error('Invalid entry');
      if(!/^\d{4}-\d{2}-\d{2}$/.test(e.reviewed_at) || !Number.isFinite(Date.parse(e.reviewed_at))) throw new Error('Invalid review date');
      if(e.phone!==null && !/^\+?[0-9]{8,15}$/.test(e.phone)) throw new Error('Invalid phone');
      for(const lang of ['uk','en']) for(const key of ['title','description','coverage']) if(typeof e[lang]?.[key]!=='string' || e[lang][key].length>700) throw new Error('Invalid translation');
      entryIds.add(e.id);
    }
    return data;
  }
  function match(data, intake, now=Date.now()) {
    validate(data);
    const topic=topics.has(intake.topic)?intake.topic:'other';
    const statuses=intake.statuses||[];
    return data.entries.filter(e=>e.approved && e.topics.includes(topic) && (!e.audiences.length || e.audiences.some(s=>statuses.includes(s))) && (!e.regions.length || e.regions.includes(intake.region)))
      .map(entry=>{
        const source=data.sources.find(s=>s.id===entry.source_id);
        const age=now-Date.parse(entry.reviewed_at+'T00:00:00Z');
        const checkAge=source.last_success_at?now-Date.parse(source.last_success_at):Infinity;
        const stale=age>30*86400000 || age<0;
        const needsCheck=stale || source.review_required===true || source.status!=='available' || !Number.isFinite(checkAge) || checkAge>7*86400000;
        const score=(entry.kind==='consultation'?4:1)+(entry.audiences.length?3:0)+(entry.regions.length?2:0)-(needsCheck?2:0);
        return {entry,source,needsCheck,stale,score};
      }).sort((a,b)=>b.score-a.score || a.entry.id.localeCompare(b.entry.id)).slice(0,4);
  }
  function browse(data, {query='',category='all',audience='all',saved=[]}={}, now=Date.now()) {
    validate(data);
    const words=String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return data.entries.filter(e => {
      if(!e.approved || (category!=='all' && !areas[category]?.some(t=>e.topics.includes(t))))return false;
      if(audience==='idp' && !e.audiences.includes('idp'))return false;
      if(audience==='saved' && !saved.includes(e.id))return false;
      const source=data.sources.find(s=>s.id===e.source_id);
      const synonyms={education:'навчання learning освіта skills',wellbeing:'добробут психологічна підтримка wellbeing mental health',community:'громада community',work:'робота праця career work',housing:'житло оренда housing rent',payments:'виплати payments',documents:'документи documents'};
      const haystack=[...Object.values(e.uk),...Object.values(e.en),source.name,source.name_en||'',...e.topics.map(t=>synonyms[t]||t),...e.audiences,e.audiences.includes('idp')?'ВПО IDP':''].join(' ').toLocaleLowerCase();
      return words.every(word=>haystack.includes(word));
    }).map(entry=>{
      const source=data.sources.find(s=>s.id===entry.source_id);
      const age=now-Date.parse(entry.reviewed_at+'T00:00:00Z');
      const checked=source.last_success_at?now-Date.parse(source.last_success_at):Infinity;
      return {entry,source,needsCheck:age>30*86400000 || age<0 || checked>7*86400000 || checked<0 || !Number.isFinite(checked) || source.status!=='available' || source.review_required===true};
    });
  }
  return {validate,match,browse,safeUrl,areas};
})();
if(typeof module!=='undefined' && module.exports) module.exports=HelpCatalog;
