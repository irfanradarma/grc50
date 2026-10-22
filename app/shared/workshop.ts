import {organizations} from './strategicScenario';
export {organizations};
export const scenarioVersion=3;
import featured from '../../website/assets/data/seminar-case.json';
export {featured};
export type Copy={en:string;id:string};
export const c=(en:string,id:string):Copy=>({en,id});
export const tx=(v:Copy|string|undefined,lang='en')=>typeof v==='string'?v:v?.[lang==='id'?'id':'en']||'';
export const publishers=[{id:'antara',name:'ANTARA',domain:'antaranews.com'},{id:'detik',name:'detik',domain:'detik.com'},{id:'kompas',name:'Kompas',domain:'kompas.com'},{id:'cnn',name:'CNN Indonesia',domain:'cnnindonesia.com'}];
export type Goal={id:string;title:Copy;target:Copy;query:string};
export type Risk={id:string;objectiveId:string;title:Copy;dependency:Copy;effect:Copy;control:Copy;owner:Copy;terms:string[];likelihood:number;impact:number;baseline:number;topic:string;reviewed:string[];responseDeclinedFor?:string;completedResponses?:string[];matchGroups?:string[][];response?:Copy;responseDetail?:Copy;evidenceHint?:Copy;reportObservation?:Copy;auditObservation?:Copy;indicator?:{metric:Copy;numerator:number;denominator:number;threshold:number}};
export const stages=['guided','external','internal'] as const;
export type Stage=typeof stages[number];
export type Signal={organizationId?:string;id:string;eventId:string;stage:Stage;type:'news'|'social'|'report'|'audit'|'ca';title:Copy|string;summary:Copy|string;sourceId:string;publisher:string;publishedAt:string;receivedAt?:string;url?:string;mode?:string;corroborating?:{title:string;url:string;publisher:string;publishedAt:string}[];document?:string;check?:{value:number;threshold:number;unit:string;records:string[];period:string;numerator?:number;denominator?:number;metric?:Copy};riskIds:string[];reason:Copy;adverse:boolean;stale?:boolean;decision?:'Capture'|'Neglect';riskDecisions?:Record<string,'Capture'|'Neglect'>;notes?:string;decidedAt?:string;actor?:string;confirmation?:string};
export type Plan={id:string;riskId:string;title:string|Copy;owner:string|Copy;dueDate:string;status:'Open'|'Done';likelihoodReduction:number;impactReduction:number;evidence:string;notes:string;createdAt:string;signalIds:string[]};
export type Review={id:string;riskId:string;choice:'Keep'|'Update';before:{likelihood:number;impact:number};after:{likelihood:number;impact:number};signalIds:string[];eventIds:string[];notes:string;at:string;actor:string};
export type Participant={ready:boolean;company:string;organizationId:string;objectiveIds:string[];sourceIds:string[];risks:Risk[];signals:Signal[];plans:Plan[];reviews:Review[];materialized:string[]};
export const freshParticipant=():Participant=>({ready:false,company:'',organizationId:'',objectiveIds:[],sourceIds:publishers.map(p=>p.id),risks:[],signals:[],plans:[],reviews:[],materialized:[]});
export const due=(date:string,days:number)=>new Date(Date.parse(date)+days*86400000).toISOString().slice(0,10);
export function setupParticipant(orgId:string,objectiveIds:string[],company:string,exerciseDate:string):Participant{
 const org=organizations.find(o=>o.id===orgId);if(!org||!objectiveIds.length||objectiveIds.some(id=>!org.objectives.some(o=>o.id===id)))throw new Error('Select objectives belonging to your organization.');
 const p=freshParticipant();Object.assign(p,{ready:true,organizationId:orgId,company:company.trim()||org.name,objectiveIds:[...new Set(objectiveIds)],risks:structuredClone(org.risks.filter(r=>objectiveIds.includes(r.objectiveId)))});
 p.plans=p.risks.map((r,i)=>({id:'initial-'+r.id,riskId:r.id,title:c('Validate the baseline business case: '+tx(r.title),'Validasi rencana bisnis awal: '+tx(r.title,'id')),owner:r.owner,dueDate:due(exerciseDate,14+i*7),status:'Open',likelihoodReduction:0,impactReduction:0,evidence:'',notes:tx(r.responseDetail),createdAt:exerciseDate,signalIds:[]}));
 return p;
}
export function guidedSignals(p:Participant):Signal[]{
 const risks=p.risks.filter(r=>featured.riskTopics.includes(r.topic));
 return [{...featured,title:featured.title,summary:featured.summary,type:'news',stage:'guided',eventId:featured.id,riskIds:risks.map(r=>r.id),adverse:risks.length>0,reason:risks.length?c('The growth case depends on US-bound goods demand. Check product coverage, buyer responses and the planning assumptions before reassessing. The headline does not quantify this company’s loss.','Rencana pertumbuhan bergantung pada permintaan barang tujuan AS. Periksa cakupan produk, respons pembeli, dan asumsi rencana sebelum menilai ulang. Judul berita tidak menghitung kerugian perusahaan.'):c('No direct exposure to tariffs on US-bound goods is established for these selected objectives. Verify indirect customer or supplier dependencies before linking the signal.','Belum terbukti ada eksposur langsung terhadap tarif barang tujuan AS untuk tujuan yang dipilih. Verifikasi ketergantungan tidak langsung pada pelanggan atau pemasok sebelum mengaitkan sinyal.')}];
}
const normalize=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function hasTerm(text:string,term:string){const escaped=normalize(term).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(?:^|[^a-z0-9])'+escaped+'(?=$|[^a-z0-9])','i').test(text);}
export function screenArticle(article:any,p:Participant,asOf?:string):Signal{
 const text=normalize([tx(article.title),tx(article.title,'id'),tx(article.summary),tx(article.summary,'id')].join(' ')),published=Date.parse(article.publishedAt||''),reference=asOf?Date.parse(asOf+'T23:59:59Z'):Date.now();
 const stale=!Number.isFinite(published)||published>reference+86400000||reference-published>90*86400000;
 const matches=stale?[]:p.risks.filter(r=>r.matchGroups?r.matchGroups.every(group=>group.some(term=>hasTerm(text,term))):r.terms.filter(term=>hasTerm(text,term)).length>=2);
 const adverse=article.direction?article.direction==='adverse':!/(peluang|kesepakatan|penurunan tarif|tarif turun|tanpa dampak)/.test(text)&&/(tarif|tekanan|persaingan|efisiensi|melemah|ketidakpastian|larangan|pembatasan|murah)/.test(text);
 return {...article,type:'news',stage:'external',stale,riskIds:matches.map(r=>r.id),adverse:!stale&&matches.length>0&&adverse,reason:stale?c('Outside the review window or publication date invalid. Verify the event date and continuing exposure.','Di luar periode penelaahan atau tanggal terbit tidak valid. Verifikasi waktu kejadian dan eksposur yang masih berlangsung.'):matches.length?c('A strategic driver and a recorded exposure both match. Verify the market, planning horizon, actual contracts and assumptions. Relevance does not prove a numerical loss.','Pendorong strategis dan eksposur tercatat sama-sama cocok. Verifikasi pasar, periode rencana, kontrak, dan asumsi. Relevansi belum membuktikan kerugian numerik.'):c('No selected strategic dependency is established. A broad economic headline alone is insufficient; link manually only after confirming exposure.','Belum terbukti ada ketergantungan strategis yang dipilih. Judul ekonomi umum saja tidak cukup; kaitkan manual setelah eksposur dikonfirmasi.')};
}
export function internalEvidence(p:Participant,date:string):Signal[]{
 return p.risks.flatMap(r=>(['report','audit','ca'] as const).map(type=>{
  const indicator=r.indicator!;const value=indicator.numerator/indicator.denominator*100;
  const exceptions=Array.from({length:indicator.numerator},(_,n)=>r.id+'-CASE-'+String(n+1).padStart(3,'0'));
  const title=type==='report'?c('Strategy review: assumptions need revalidation','Reviu strategi: asumsi perlu divalidasi ulang'):type==='audit'?c('Assurance finding: strategic business case not evidenced','Temuan asurans: rencana bisnis strategis belum didukung bukti'):c('Strategic planning indicator exceeds review threshold','Indikator perencanaan strategis melewati ambang reviu');
  const summary=type==='report'?r.reportObservation!:type==='audit'?r.auditObservation!:c(value+'%: '+tx(indicator.metric)+'. Review threshold '+indicator.threshold+'%. Confirm the underlying cases before drawing a risk conclusion.',value+'%: '+tx(indicator.metric,'id')+'. Ambang reviu '+indicator.threshold+'%. Konfirmasikan kajian pendukung sebelum menyimpulkan risiko.');
  const id=type+'-'+r.id,reference=type.toUpperCase()+'/'+r.id+'/'+date,goal=organizations.find(o=>o.id===p.organizationId)!.objectives.find(o=>o.id===r.objectiveId)!;
  return {id,eventId:'assumption-'+r.id,stage:'internal' as const,type,title:c(tx(title)+' — '+tx(r.title),tx(title,'id')+' — '+tx(r.title,'id')),summary,sourceId:type,publisher:type==='audit'?'Internal Audit':tx(r.owner),publishedAt:date,riskIds:[r.id],adverse:true,reason:c('Evidence challenges a strategic assumption supporting this objective. Review with other evidence about the same assumption; do not add a score point for every document.','Bukti menantang asumsi strategis yang menopang tujuan ini. Tinjau bersama bukti lain tentang asumsi yang sama; jangan menambah poin untuk setiap dokumen.'),document:[p.company,reference,date,type==='audit'?'Author: Internal Audit':'Author: '+tx(r.owner),'Teaching case evidence for this fictional organization.','Strategic objective: '+tx(goal.title),'Target: '+tx(goal.target),'Risk: '+tx(r.title),'Planning dependency: '+tx(r.dependency),'Observation: '+tx(summary),'Implication: '+tx(r.effect),'Response for management review: '+tx(r.response),'Evidence required: '+tx(r.evidenceHint),'Scope: selected objective '+r.objectiveId+'; no claim that a KPI miss has already occurred.'].join('\n'),...(type==='ca'?{check:{value,threshold:indicator.threshold,unit:'%',metric:indicator.metric,numerator:indicator.numerator,denominator:indicator.denominator,period:date,records:exceptions}}:{})};
 }));
}
export function materialize(p:Participant,s:any){
 if(!p.ready)return;
 for(const stage of s.released as Stage[]){
 if(p.materialized.includes(stage))continue;
 let items:Signal[]=stage==='guided'?guidedSignals(p):stage==='internal'?internalEvidence(p,s.exerciseDate):(s.news||[]).filter((a:any)=>p.sourceIds.includes(a.sourceId)).map((a:any)=>screenArticle(a,p,a.mode==='Historical case replay'?s.exerciseDate:undefined)).sort((a:Signal,b:Signal)=>b.riskIds.length-a.riskIds.length);
 if(stage==='external'){const related=items.filter(a=>a.riskIds.length||a.organizationId===p.organizationId||!a.organizationId);const contrast=items.find(a=>!related.includes(a));items=contrast?[...related,contrast]:related;}
 // One event record carries corroborating sources; do not inflate the assessment for repeated coverage.
 if(stage==='external'){const groups=new Map<string,Signal>();for(const item of items){const prior=groups.get(item.eventId);if(prior){(prior.corroborating??=[]).push({title:tx(item.title),url:item.url||'',publisher:item.publisher,publishedAt:item.publishedAt});}else groups.set(item.eventId,item);}items=[...groups.values()].slice(0,24);}
 p.signals.push(...items.map(a=>({...a,id:stage+'-'+a.id,receivedAt:new Date().toISOString()})));p.materialized.push(stage);
 }
}
export function decisionForRisk(s:Signal,riskId:string){return s.riskDecisions?s.riskDecisions[riskId]:s.decision;}
export function pendingFor(p:Participant,riskId:string){return p.signals.filter(s=>decisionForRisk(s,riskId)==='Capture'&&s.riskIds.includes(riskId)&&!p.risks.find(r=>r.id===riskId)?.reviewed.includes(s.id));}
export function proposed(p:Participant,r:Risk){
 const signals=pendingFor(p,r.id),oldEvents=new Set(p.reviews.filter(v=>v.riskId===r.id).flatMap(v=>v.eventIds)),newAdverse=signals.some(s=>s.adverse&&!oldEvents.has(s.eventId));
 // Absolute review target avoids repeated +1 escalation for corroborating or later evidence.
 const start=organizations.flatMap(o=>o.risks).find(v=>v.id===r.id)!;
 const likelihood=newAdverse?Math.max(r.likelihood,Math.min(5,start.likelihood+1)):r.likelihood;
 return {likelihood:newAdverse?Math.max(r.likelihood,Math.min(5,start.likelihood+1)):r.likelihood,impact:r.impact,signalIds:signals.map(s=>s.id),eventIds:[...new Set(signals.map(s=>s.eventId))],reason:c(newAdverse?`New adverse evidence challenges the recorded dependency: ${tx(r.dependency)} Suggested likelihood ${r.likelihood} to ${likelihood}; impact remains ${r.impact}. Revalidate the assumptions and existing controls. This is an ordinal review proposal, not a measured loss or probability.`:`No new independent adverse event justifies automatic escalation. Suggested likelihood ${likelihood}, impact ${r.impact}. Verify whether the evidence changes the existing control assumptions; corroborating reports do not add extra points.`,newAdverse?`Bukti baru yang merugikan menantang ketergantungan tercatat: ${tx(r.dependency,'id')} Usulan kemungkinan ${r.likelihood} menjadi ${likelihood}; dampak tetap ${r.impact}. Verifikasi kembali asumsi dan pengendalian. Ini usulan penilaian ordinal, bukan pengukuran kerugian atau probabilitas.`:`Belum ada kejadian merugikan baru yang independen untuk menaikkan skor secara otomatis. Usulan kemungkinan ${likelihood}, dampak ${r.impact}. Periksa apakah bukti mengubah asumsi pengendalian; laporan penguat tidak otomatis menambah poin.`)};
}
export function projection(r:Risk,plans:Plan[]){const own=plans.filter(p=>p.riskId===r.id);return {likelihood:Math.max(1,r.likelihood-Math.max(0,...own.map(p=>p.likelihoodReduction))),impact:Math.max(1,r.impact-Math.max(0,...own.map(p=>p.impactReduction)))};}
