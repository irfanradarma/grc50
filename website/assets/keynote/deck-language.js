export function createDeckTranslator(strings) {
 const normal=value=>String(value).replace(/\s+/g,' ').trim();
 const dictionary=new Map(Object.entries(strings).map(([key,value])=>[normal(key),value]));
 const upper=new Map([...dictionary].map(([key,value])=>[key.toUpperCase(),value.toUpperCase()]));
 function translate(value,language='id') {
  if(language!=='id'||!String(value).trim())return value;
  const key=normal(value),exact=dictionary.get(key)??upper.get(key);
  if(exact!==undefined)return String(value).replace(/\S[\s\S]*\S|\S/,exact);
  if(String(value).includes('\n'))return String(value).split('\n').map(v=>translate(v,language)).join('\n');
  const heading=key.match(/^(#{1,6}\s+)(.+)$/);if(heading)return heading[1]+translate(heading[2],language);
  const units=key.match(/^(\d+) (objects|days|signals to review|accepted|declined)$/);if(units)return units[1]+' '+({objects:'objek',days:'hari','signals to review':'sinyal perlu ditinjau',accepted:'diterima',declined:'ditolak'}[units[2]]);
  const days=key.match(/^(\d+) \/ (\d+) days$/);if(days)return days[1]+' / '+days[2]+' hari';
  const events=key.match(/^Decision history \((\d+)\)$/);if(events)return 'Riwayat keputusan ('+events[1]+')';
  const score=key.match(/^Your score ([\d.]+) exceeds tolerance ([\d.]+)\. Agree a response before finishing\.$/);if(score)return 'Skor Anda '+score[1]+' melampaui toleransi '+score[2]+'. Sepakati respons sebelum menyelesaikan reviu.';
  const cell=key.match(/^Likelihood ([\d.]+), impact ([\d.]+)$/);if(cell)return 'Kemungkinan '+cell[1]+', dampak '+cell[2];
  const reduced=key.match(/^Expected reduction: likelihood ([\d.]+), impact ([\d.]+)\. Status: (\w+)\.$/);if(reduced)return 'Pengurangan yang diharapkan: kemungkinan '+reduced[1]+', dampak '+reduced[2]+'. Status: '+translate(reduced[3],language)+'.';
  const target=key.match(/^Target ([\d.]+)$/);if(target)return 'Target '+target[1].replace('.',',');
  const metadata=key.match(/^(Owner|Due|Engagement|Status|Criteria):\s*(.*)$/);if(metadata)return translate(metadata[1],language)+': '+translate(metadata[2],language);
  const version=key.match(/^(.+) \(([^()]*)\)(.*)$/);if(version)return translate(version[1],language)+' ('+translate(version[2],language)+')'+version[3];
  const approved=key.match(/^Annual plan (\d+) approved by (.+?)\. (.+)$/);if(approved)return 'Rencana tahunan '+approved[1]+' disetujui oleh '+translate(approved[2],language)+'. '+translate(approved[3],language);
  if(key.includes(' · '))return key.split(' · ').map(p=>translate(p,language)).join(' · ');
  if(key.includes(' — '))return key.split(' — ').map(p=>translate(p,language)).join(' — ');
  const record=key.match(/^((?:E|AP)-\d+:?\s*)(.+)$/);if(record)return record[1]+translate(record[2],language);
  const live=key.match(/^(Presenter now: |Slide )(\d+ \/ )(.*)$/);
  if(live)return (live[1]==='Presenter now: '?'Posisi presenter: ':'Slide ')+live[2]+translate(live[3],language);
  const slide=key.match(/^(Slide \d+[.:]?\s*)(.*)$/);
  if(slide)return slide[1]+translate(slide[2],language);
  const chapter=key.match(/^(\d{2} \/ )(.*)$/);
  if(chapter)return chapter[1]+translate(chapter[2],language);
  const linked=key.match(/^(.*?)(\s\u2197)$/);
  if(linked)return translate(linked[1],language)+linked[2];
  const source=key.match(/^Source for (.*)$/);
  if(source)return 'Sumber untuk '+source[1];
  const enlarged=key.match(/^Enlarge (.*) screenshot$/);
  if(enlarged)return 'Perbesar screenshot '+translate(enlarged[1],language);
  const before=key.match(/^(.*) before any signals are released$/);
  if(before)return translate(before[1],language)+' sebelum sinyal dirilis';
  const ordinal=key.match(/^of (\d+)$/);
  if(ordinal)return 'dari '+ordinal[1];
  return value;
 }
 return translate;
}

export function installDeckLanguage({catalogue,reference}) {
 const strings={...catalogue.strings};
 for(const research of Object.values(reference.research)){
  if(typeof research!=='object')continue;
  const scope=research.population||research.scope;
  if(scope&&research.limits)strings[scope+'. '+research.limits]=(strings[scope]||scope)+'. '+(strings[research.limits]||research.limits);
 }
 for(const entry of reference.slides){
  if(catalogue.notes[entry.key])strings[entry.note]=catalogue.notes[entry.key];
  if(catalogue.contexts?.[entry.key]){
   if(entry.referenceContext)strings[entry.referenceContext]=catalogue.contexts[entry.key].context;
   if(entry.narrativeConnection)strings[entry.narrativeConnection]=catalogue.contexts[entry.key].connection;
  }
  if(entry.section&&!strings[entry.section])strings[entry.section]=catalogue.notes[entry.key]?'CATATAN / '+(strings[entry.title]||entry.section):entry.section;
  for(const link of entry.links||[])if(link.label&&!strings[link.label])strings[link.label]='Rujukan: '+new URL(link.url).hostname;
 }
 const translate=createDeckTranslator(strings),textCache=new WeakMap(),attributeCache=new WeakMap();
 let language;
 try{language=localStorage.getItem('signal-deck-language-v1')==='id'?'id':'en';}catch{language='en';}
 const requested=new URLSearchParams(location.search).get('lang');
 if(requested==='id'||requested==='en')language=requested;
 function localize(root=document.body){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  for(let node=walker.nextNode();node;node=walker.nextNode()){
   if(node.parentElement?.closest('script,style,kbd,[data-language-fixed]'))continue;
   let record=textCache.get(node);
   if(!record||node.nodeValue!==record.last)record={original:node.nodeValue,last:node.nodeValue};
   const next=translate(record.original,language);
   if(next!==node.nodeValue)node.nodeValue=next;
   record.last=next;textCache.set(node,record);
  }
  for(const element of root.querySelectorAll('[aria-label],[title],[alt]')){
   if(element.closest('[data-language-fixed]'))continue;
   let records=attributeCache.get(element)||{};
   for(const attribute of ['aria-label','title','alt']){
    const value=element.getAttribute(attribute);if(!value)continue;
    let record=records[attribute];
    if(!record||value!==record.last)record={original:value,last:value};
    const next=translate(record.original,language);
    if(next!==value)element.setAttribute(attribute,next);
    record.last=next;records[attribute]=record;
   }
   attributeCache.set(element,records);
  }
 }
 function choose(next){
  language=next;document.documentElement.lang=next;
  try{localStorage.setItem('signal-deck-language-v1',next);}catch{}
  const url=new URL(location.href);
  if(url.searchParams.has('lang')){url.searchParams.set('lang',next);history.replaceState(null,'',url);}
  document.querySelectorAll('[data-deck-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.deckLanguage===next)));
  localize();
  for(const link of document.querySelectorAll('a[href]')){try{const dest=new URL(link.href);if(dest.origin===location.origin&&/\/(audience|modules)\//.test(dest.pathname)){dest.searchParams.set('lang',next);link.href=dest.href;}}catch{}}
  document.dispatchEvent(new CustomEvent('signal:languagechange',{detail:{language:next}}));
 }
 document.querySelectorAll('[data-deck-language]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.deckLanguage)));
 const observer=new MutationObserver(()=>localize());
 choose(language);
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt']});
 return {choose,get language(){return language;}};
}
