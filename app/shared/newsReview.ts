/** A collection is evidence for review, never an automatic risk escalation. */
export type NewsItem={id:string;title:string;details:string;kind:string;status:string;newsState?:string;sample?:boolean;publisher?:string;objectiveId:string;riskId?:string;sourceId?:string;evidence?:string;publishedAt?:string;observedAt:string;notes?:string;decision?:string};
export function newsState(item:NewsItem){return item.newsState||(item.status==='Open'?'Pending':'Archived');}
export function visibleInMonitoring(item:{kind:string;newsState?:string;status:string}){return item.kind!=='news'||item.newsState==='Captured'||(!item.newsState&&item.status==='Reviewed');}
type ContextRisk={id?:string;title:string;objectiveId?:string;cause?:string;event?:string;impact?:string};
type Goal={id?:string;title:string;target:string};
const normalize=(s:string)=>s.toLowerCase().normalize('NFKC');
const hits=(text:string,terms:string[])=>terms.filter(t=>new RegExp('(^|[^\\p{L}])'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^\\p{L}]|$)','u').test(text));
const themes=[
 {key:'routes',terms:['delivery','logistics','shipment','shipping','fleet','transport','route','pengiriman','kiriman','logistik','armada','transportasi','pelabuhan','jalan','rute','distribusi'],hazards:['banjir','flood','longsor','landslide','macet','kemacetan','kecelakaan','penutupan','tertutup','terhambat','terkendala','keterlambatan','disruption','delay','tertahan']},
 {key:'cloud',terms:['cloud','aws','azure','gcp','pusat data','data center','tracking','pelacakan','uptime'],hazards:['gangguan','outage','disruption','failure','down','tidak tersedia','padam']},
 {key:'security',terms:['privacy','security','access','cyber','data pelanggan','siber','keamanan','akses','kebocoran data','data pribadi','akun','credentials','kredensial'],hazards:['serangan','attack','breach','kebocoran','bocor','dicuri','ransomware','phishing']},
 {key:'cost',terms:['fuel','budget','bbm','bahan bakar','anggaran','biaya','tarif'],hazards:['kenaikan','naik','kelangkaan','shortage','melonjak','krisis','price increase']},
];
const places=['afrika selatan','south africa','pakistan','bangladesh','korea','iran','israel','jateng','jawa tengah','jatim','jawa timur','sulsel','sulawesi selatan','jakarta','semarang','surabaya','makassar','medan','padang','aceh','bandung','banten','bekasi','tangerang','bogor','depok','cirebon','yogyakarta','solo','bali','denpasar','palembang','lampung','pekanbaru','pontianak','balikpapan','samarinda','manado','jayapura','jawa','sumatra','sumatera','sulawesi','kalimantan','papua','nepal','india','china','tiongkok','malaysia','singapura','singapore','amerika','united states','jepang','japan','australia','thailand','vietnam','filipina'];
export function operatingLocations(profile:Record<string,unknown>|null){return hits(normalize(Object.values(profile||{}).filter(v=>typeof v==='string').join(' ')),places);}
export function contextNewsQuery(profile:Record<string,unknown>|null){const locations=operatingLocations(profile);return '(banjir OR pelabuhan OR gangguan OR distribusi OR logistik)'+(locations.length?' ('+locations.join(' OR ')+')':' Indonesia');}
/** Conservative, inspectable screening; never an AI confidence score or confirmed impact. */
export function assessNews(item:NewsItem,profile:Record<string,unknown>|null,goals:Goal[],risks:ContextRisk[],now=Date.now()){
 const publisher=item.publisher||item.title.match(/\s-\s([^-]+)$/)?.[1]||'';
 const clean=(value:string)=>publisher&&value.toLowerCase().endsWith(publisher.toLowerCase())?value.slice(0,-publisher.length).replace(/\s-\s$/,''):value;
 const text=normalize(clean(item.title)+' '+clean(item.details)),context=normalize(Object.values(profile||{}).filter(v=>typeof v==='string').join(' '));
 const locations=operatingLocations(profile),zones=[{cities:['semarang','solo'],names:['jateng','jawa tengah']},{cities:['surabaya'],names:['jatim','jawa timur']},{cities:['makassar'],names:['sulsel','sulawesi selatan']}];const relatedZones=zones.filter(z=>z.cities.some(c=>locations.includes(c))).flatMap(z=>z.names);
 const mentioned=hits(text,places),matchedLocations=mentioned.filter(p=>locations.includes(p)||relatedZones.includes(p));
 const mismatch=locations.length>0&&mentioned.length>0&&!matchedLocations.length;
 const date=item.publishedAt?Date.parse(item.publishedAt):NaN,stale=Number.isFinite(date)&&now-date>14*86400000,future=Number.isFinite(date)&&date>now+86400000;
 const headlineYears=(item.title.match(/\b20\d{2}\b/g)||[]).map(Number),oldEvent=headlineYears.some(y=>y<new Date(now).getUTCFullYear()-1);
 const promotional=hits(text,['award','awards','penghargaan','anniversary','ulang tahun','sabet','raih penghargaan']).length>0;
 const indexPage=/^(berita terkini|kumpulan berita|pencarian\s)/i.test(item.title);
 const activeIncident=hits(text,['terhambat','tertutup','terendam','lumpuh','hanyut','jebol','outage','terganggu','kebocoran','bocor','melanda','landa']).length>0;
 const mitigated=(hits(text,['mitigasi','antisipasi','simulasi bencana','latihan evakuasi','sabo dam','pencegahan','penghargaan','tangani','penanganan','rencana','solusi']).length>0)&&!activeIncident;
 const months=['januari','februari','maret','april','mei','juni','juli','agustus','september','oktober','november','desember'];
 const forecastDate=text.match(/\b(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(20\d{2})\b/);
 const forecastExpired=Boolean(forecastDate&&hits(text,['waspada','prakiraan','prediksi','peringatan']).length&&!activeIncident&&Date.UTC(Number(forecastDate[3]),months.indexOf(forecastDate[2]),Number(forecastDate[1]))+86400000<now);
 const active=themes.map(t=>({...t,words:hits(text,t.terms),changes:hits(text,t.hazards).filter(term=>{const pattern=new RegExp('(^|[^\\p{L}])'+term+'(?=[^\\p{L}]|$)','gu');return [...text.matchAll(pattern)].some(m=>!/(?:tak|tidak|belum|bukan|no|not|without|tanpa)\s+(?:[\p{L}]+\s+){0,2}$/u.test(text.slice(Math.max(0,(m.index||0)-45),(m.index||0)+m[1].length)));})})).filter(t=>t.words.length||(t.key==='routes'&&hits(text,['banjir','flood','longsor','landslide','kecelakaan','macet']).length));
 const qualified=active.filter(t=>t.changes.length&&hits(context,t.terms).length);
 const rank=(s:string)=>active.reduce((sum,t)=>sum+(hits(normalize(s),t.terms).length?1:0)+(t.changes.length&&hits(normalize(s),t.hazards).length?3:0),0);
 const candidates=risks.map(r=>({...r,score:rank([r.title,r.cause,r.event,r.impact].filter(Boolean).join(' '))})).sort((a,b)=>b.score-a.score);
 const dominant=qualified.sort((a,b)=>b.changes.length-a.changes.length)[0];
 // Costs must not be silently linked to a generic route risk just because both mention logistics.
 const risk=candidates.find(r=>r.score>0&&(!dominant||hits(normalize([r.title,r.cause,r.event,r.impact].join(' ')),dominant.key==='routes'?[...dominant.terms,...dominant.hazards]:dominant.terms).length));
 const goal=goals.map(g=>({...g,score:rank(g.title+' '+g.target)})).sort((a,b)=>b.score-a.score).find(g=>g.score>0);
 const localOrDependency=dominant?.key==='routes'?matchedLocations.length>0:dominant?.key==='cost'?(!mismatch&&hits(text,['indonesia','nasional','bbm','bahan bakar']).length>0):dominant?.key==='security'?(!mismatch&&hits(text,['logistik','data pelanggan','data pribadi','akun','kredensial','ransomware','phishing']).length>0):dominant?.key==='cloud'?(!mismatch&&hits(text,['cloud','aws','azure','gcp','pusat data','data center']).length>0):false;
 const overlap=active.some(t=>hits(context,t.terms).length)||Boolean(risk||goal);
 const level=indexPage?'Low relevance':Number.isFinite(date)&&!stale&&!future&&!oldEvent&&!forecastExpired&&!promotional&&!mitigated&&!mismatch&&qualified.length&&localOrDependency?'Potential impact':overlap&&!mismatch?'Context only':'Low relevance';
 const reason=indexPage?'This result looks like a search/category page, not a specific published event.':stale?'Publication is over 14 days old; verify the event date.':future?'Publication date is in the future; verify the feed timestamp.':oldEvent?'The headline refers to an earlier year; a recent feed timestamp may be republication.':forecastExpired?'The explicitly dated forecast has expired. Verify a current advisory or actual disruption before escalating.':promotional?'Award or promotional coverage does not establish adverse exposure.':mitigated?'Preparedness or mitigation coverage does not establish an active disruption.':mismatch?`Reported location (${mentioned.join(', ')}) does not overlap the saved operating locations (${locations.join(', ')}). Check indirect dependencies before escalating.`:level==='Potential impact'?`An adverse change (${dominant?.changes.slice(0,3).join(', ')}) overlaps ${matchedLocations.length?'a saved operating location':'a named dependency type'}. This is a candidate for investigation, not verified company impact.`:level==='Context only'?'Sector overlap exists, but an affected location or specific dependency has not been established.':'No clear objective or dependency overlap was found.';
 const checks=[{label:'Adverse change',passed:qualified.length>0&&!mitigated&&!promotional,detail:qualified.flatMap(t=>t.changes).join(', ')||'Not established'}, {label:'Organization connection',passed:Boolean(localOrDependency&&!mismatch),detail:mismatch?'Outside saved locations':matchedLocations.join(', ')|| (localOrDependency?'Dependency type overlaps; verify the actual provider/partner':'No affected location or dependency established')},{label:'Current evidence',passed:!stale&&!future&&!oldEvent&&!forecastExpired&&Number.isFinite(date),detail:!Number.isFinite(date)?'Publication date unavailable':stale||future||oldEvent||forecastExpired?'Date needs verification':'Publication within screening window'}];
 const objectiveId=risk?.objectiveId||goal?.id||item.objectiveId;
 return {level,reason,stale,unknownDate:!Number.isFinite(date),objectiveId,riskId:level==='Low relevance'?undefined:risk?.id,terms:[...new Set(active.flatMap(t=>[...t.words,...t.changes]))].slice(0,7),order:level==='Potential impact'?2:level==='Context only'?1:0,checks,locations:matchedLocations,nextStep:level==='Potential impact'?'Verify affected operations or partners, corroborate the event, then decide whether to reassess or identify a risk.':'Establish an objective or dependency connection before creating a monitoring signal.',version:'context-screen-v2'};
}
export function focusedWatches(profile:Record<string,unknown>|null,goals:Goal[]){
 const context=normalize(Object.values(profile||{}).filter(v=>typeof v==='string').join(' ')),locations=operatingLocations(profile);
 const service=goals.find(g=>hits(normalize(g.title),['pengiriman','delivery','layanan','service']).length)||goals[0];
 const digital=goals.find(g=>hits(normalize(g.title),['platform','pelacakan','availability','ketersediaan']).length)||service;
 const watches:Array<{key:string;name:string;domain:string;query:string;objectiveId?:string}>=[];
 if(hits(context,['bbm','bahan bakar','fuel']).length)watches.push({key:'fuel_watch',name:'ANTARA / Biaya BBM',domain:'antaranews.com',query:'harga BBM nonsubsidi naik',objectiveId:service?.id});
 if(locations.length)watches.push({key:'route_watch',name:'detik / Gangguan rute',domain:'detik.com',query:locations.includes('semarang')?'banjir rob Jateng':'banjir '+locations[0],objectiveId:service?.id});
 if(hits(context,['cloud','pelacakan','tracking']).length)watches.push({key:'cloud_watch',name:'CNN / Ketergantungan cloud',domain:'cnnindonesia.com',query:'gangguan cloud',objectiveId:digital?.id});
 return watches;
}
export function canonicalNewsUrl(value:string){try{const u=new URL(value);u.hash='';for(const key of [...u.searchParams.keys()])if(/^utm_|^(fbclid|gclid|oc)$/i.test(key))u.searchParams.delete(key);return u.href;}catch{return '';}}
export const publishers=[{id:'detik',name:'detik.com',domain:'detik.com'},{id:'cnn',name:'CNN Indonesia',domain:'cnnindonesia.com'},{id:'kompas',name:'Kompas.com',domain:'kompas.com'},{id:'antara',name:'ANTARA',domain:'antaranews.com'}];
export function publisherFeed(domain:string,query:string){const params=new URLSearchParams({q:`site:${domain} (${query.trim()||'Indonesia'}) when:7d`,hl:'id',gl:'ID',ceid:'ID:id'});return 'https://news.google.com/rss/search?'+params.toString();}
