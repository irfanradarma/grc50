export type Risk={id:string;title:string;objective:string;owner:string;likelihood:number;impact:number;tolerance:number;revision:number;mitigations:Mitigation[]};
export type Mitigation={id:string;action:string;owner:string;due:string;likelihoodReduction:number;impactReduction:number;status:'planned'|'verified'};
export type Universe={id:string;name:string;riskIds:string[];change:number;coverageGap:number;importance:number;days:number;mandatory:boolean};
export type Weights={risk:number;change:number;coverage:number;strategy:number};
export type Criterion={id:string;title:string;version:string;text:string;url?:string};
export type Procedure={id:string;task:string;criteria:string[];auditor:string;evidence:string;result:'not-started'|'supported'|'exception'|'inconclusive'};
export type Project={id:string;universeId:string;planYear:number;name:string;objective:string;riskIds:string[];scope:string;lead:string;program:Procedure[];confirmedCriteria:string[];programApproved:boolean;condition:string;cause:string;effect:string;action:string;owner:string;due:string;reviewed:boolean;issued:boolean;report:string;slides:{title:string;body:string}[];version:number;history:string[]};
export type Signal={id:string;type:'audit'|'internal'|'news';title:string;summary:string;why:string;riskIds:string[];evidence:string;url?:string;date:string;verified:boolean;eventId:string;decisions:Record<string,'accept'|'decline'>};
export type AssuranceState={schemaVersion:2;risks:Risk[];universe:Universe[];year:number;capacity:number;weights:Weights;selected:string[];planApproved:boolean;approvedBy:string;planReason:string;projects:Project[];signals:Signal[];history:string[]};
export const auditors=['Alya Putri · Audit lead','Bima Prakoso · Technology auditor','Citra Wulandari · Data auditor'];
export const criteria:Criterion[]=[
 {id:'CR-04',title:'Credit-limit approval',version:'Aruna policy · teaching version 2026',text:'Independent approval and an approval reference are required before a recommended customer credit limit is overridden.'},
 {id:'AI-06',title:'Model release and monitoring',version:'Aruna policy · teaching version 2026',text:'Test a model version before release; assign an owner to performance warnings and document the business response.'},
 {id:'DP-02',title:'Information access and sharing',version:'Aruna policy · teaching version 2026',text:'Use approved accounts and recipients. Restrict customer information to the minimum required for the authorised purpose.'},
 {id:'OP-01',title:'Transaction control and follow-up',version:'Aruna policy · teaching version 2026',text:'Maintain evidence of authorisation, reconcile exceptions and assign responsibility for corrective action.'},
 {id:'GIAS-14',title:'Evidence and evaluation of findings',version:'The IIA · Global Internal Audit Standards 2024',text:'Reference for obtaining and evaluating evidence and developing findings. The actual Standards and the engagement context determine the requirements.',url:'https://www.theiia.org/globalassets/site/standards/globalinternalauditstandards_2024january9.pdf'},
 {id:'NIST-TRUST',title:'Trustworthy AI characteristics',version:'NIST AI RMF 1.0 · 2023, section 3',text:'Valid and reliable; safe; secure and resilient; accountable and transparent; explainable and interpretable; privacy-enhanced; fair with harmful bias managed. Select and test criteria appropriate to the use case.',url:'https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/'}
];
const objective='Grow credit sales while protecting timely cash collection';
export function initialAssurance():AssuranceState{
 const risks:Risk[]=[
  {id:'credit',title:'Credit exposure exceeds approved limits',objective,owner:'Head of Credit',likelihood:3,impact:4,tolerance:12,revision:0,mitigations:[]},
  {id:'collections',title:'Export-linked customers delay payment',objective,owner:'Finance Director',likelihood:3,impact:4,tolerance:12,revision:0,mitigations:[]},
  {id:'model',title:'AI credit recommendations become unreliable',objective,owner:'Model Risk Lead',likelihood:3,impact:5,tolerance:12,revision:0,mitigations:[]},
  {id:'privacy',title:'Customer information is shared without authority',objective:'Maintain customer trust and protect information',owner:'Data Protection Lead',likelihood:3,impact:5,tolerance:10,revision:0,mitigations:[]},
  {id:'procurement',title:'Purchases bypass approval and value checks',objective:'Maintain dependable and efficient supply',owner:'Procurement Head',likelihood:3,impact:3,tolerance:12,revision:0,mitigations:[]},
  {id:'operations',title:'Transaction exceptions remain unresolved',objective:'Deliver and invoice accurately',owner:'Operations Head',likelihood:2,impact:4,tolerance:12,revision:0,mitigations:[]}
 ];
 const universe:Universe[]=[
  {id:'u-credit',name:'Customer credit & collections',riskIds:['credit','collections'],change:4,coverageGap:5,importance:5,days:30,mandatory:false},
  {id:'u-model',name:'AI model governance',riskIds:['model','credit'],change:5,coverageGap:4,importance:5,days:25,mandatory:false},
  {id:'u-data',name:'Customer information protection',riskIds:['privacy'],change:4,coverageGap:3,importance:4,days:20,mandatory:true},
  {id:'u-procurement',name:'Procurement & supplier management',riskIds:['procurement'],change:3,coverageGap:4,importance:4,days:25,mandatory:false},
  {id:'u-billing',name:'Billing & transaction reconciliation',riskIds:['collections','operations'],change:2,coverageGap:2,importance:4,days:20,mandatory:false},
  {id:'u-branches',name:'Branch operations',riskIds:['operations'],change:2,coverageGap:3,importance:3,days:15,mandatory:false}
 ];
 return {schemaVersion:2,risks,universe,year:2027,capacity:80,weights:{risk:55,change:20,coverage:15,strategy:10},selected:['u-data'],planApproved:false,approvedBy:'',planReason:'',projects:[],signals:[],history:[]};
}
export function rankUniverse(s:AssuranceState){
 if(!Number.isInteger(s.year)||s.year<2026||s.year>2100||!Number.isFinite(s.capacity)||s.capacity<=0)throw Error('Enter a valid plan year and positive audit-day capacity.');
 if(s.universe.some(u=>!u.riskIds.length||u.riskIds.some(id=>!s.risks.some(r=>r.id===id))||![u.change,u.coverageGap,u.importance].every(v=>Number.isFinite(v)&&v>=1&&v<=5)||!Number.isFinite(u.days)||u.days<=0))throw Error('Audit objects need linked risks, valid 1–5 parameters and positive audit days.');
 const w=s.weights;if(Object.values(w).some(v=>!Number.isFinite(v)||v<0)||Object.values(w).reduce((a,b)=>a+b,0)!==100)throw Error('Weights must be non-negative and total 100%.');
 return s.universe.map(u=>{const scores=u.riskIds.map(id=>s.risks.find(r=>r.id===id)).filter((r):r is Risk=>!!r).map(r=>r.likelihood*r.impact);const mean=scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0;
  const score=mean/25*w.risk+u.change/5*w.change+u.coverageGap/5*w.coverage+u.importance/5*w.strategy;
  return {...u,meanRisk:mean,priority:Math.round(score*10)/10};
 }).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
}
export function recommendPlan(s:AssuranceState){
 const ranked=rankUniverse(s);if(!Number.isFinite(s.capacity)||s.capacity<=0)throw Error('Enter a positive audit-day capacity.');
 const mandatory=ranked.filter(u=>u.mandatory),selected=mandatory.map(u=>u.id);let used=mandatory.reduce((n,u)=>n+u.days,0);
 if(used>s.capacity)throw Error('Capacity does not cover the mandatory work. Adjust capacity before approving a plan.');
 for(const u of ranked.filter(u=>!u.mandatory))if(used+u.days<=s.capacity){selected.push(u.id);used+=u.days;}
 return {selected,used,unused:s.capacity-used};
}
export function approvePlan(s:AssuranceState,by:string,reason:string):AssuranceState{
 rankUniverse(s);if(!by.trim()||!reason.trim())throw Error('Enter the approver and the planning rationale.');
 if(!s.selected.length||new Set(s.selected).size!==s.selected.length||s.selected.some(id=>!s.universe.some(u=>u.id===id)))throw Error('Select valid audit objects.');
 if(s.universe.some(u=>u.mandatory&&!s.selected.includes(u.id)))throw Error('Mandatory audit objects must remain in the plan.');
 if(s.universe.filter(u=>s.selected.includes(u.id)).reduce((n,u)=>n+u.days,0)>s.capacity)throw Error('The selected work exceeds audit-day capacity.');
 return {...s,planApproved:true,approvedBy:by.trim(),planReason:reason.trim(),history:[...s.history,`Annual plan ${s.year} approved by ${by.trim()}. ${reason.trim()}`]};
}
export function createEngagement(s:AssuranceState,universeId:string,lead:string):AssuranceState{
 if(!s.planApproved||!s.selected.includes(universeId))throw Error('Create fieldwork from an approved annual-plan object.');
 if(!auditors.includes(lead))throw Error('Assign a lead auditor.');
 const u=s.universe.find(u=>u.id===universeId)!;if(s.projects.some(p=>p.universeId===u.id&&p.planYear===s.year))throw Error('This annual-plan object already has an engagement.');
 const id=`ADN-${s.year}-${u.id}`,risk=s.risks.find(r=>u.riskIds.includes(r.id))!;
 const project:Project={id,universeId:u.id,planYear:s.year,name:u.name,objective:risk.objective,riskIds:[...u.riskIds],scope:'Confirm the process, period, criteria and evidence before starting.',lead,program:[],confirmedCriteria:[],programApproved:false,condition:'',cause:'Not established; seek confirmation.',effect:'',action:'',owner:risk.owner,due:`${s.year}-06-30`,reviewed:false,issued:false,report:'',slides:[],version:1,history:[`Created from approved ${s.year} plan; lead ${lead}.`]};
 return {...s,projects:[...s.projects,project]};
}
export function draftProgram(p:Project):Procedure[]{
 const ref=p.universeId==='u-model'?'AI-06':p.universeId==='u-data'?'DP-02':p.universeId==='u-credit'?'CR-04':'OP-01';
 const tasks=ref==='CR-04'?['Compare sampled credit-limit changes with the approved policy.','Trace overrides to independent approval records.','Inspect unresolved exceptions and the response owner.']:ref==='AI-06'?['Inspect testing and approval of the deployed model version.','Evaluate selected trustworthy-AI criteria against evidence.','Trace monitoring warnings to an assigned response.']:ref==='DP-02'?['Compare user access with the approved purpose.','Inspect permitted recipients, data settings and sharing.','Test selected blocked access and deletion requirements.']:['Trace selected transactions to approval and source records.','Reconcile exception records with the operating procedure.','Inspect corrective actions and responsible owners.'];
 return tasks.map((task,i)=>({id:'AP-'+(i+1),task,criteria:i===1&&ref==='AI-06'?[ref,'NIST-TRUST','GIAS-14']:[ref,'GIAS-14'],auditor:auditors[i%auditors.length],evidence:'',result:'not-started'}));
}
export function patchProject(p:Project,patch:Partial<Project>,event='Work revised'):Project{return {...p,...patch,reviewed:false,issued:false,report:'',slides:[],version:p.version+1,history:[...p.history,event]};}
export function approveProgram(p:Project):Project{
 if(!p.program.length||p.program.some(t=>!t.task.trim()||!auditors.includes(t.auditor)||!t.criteria.length||t.criteria.some(id=>!criteria.some(c=>c.id===id)||!p.confirmedCriteria.includes(id))))throw Error('Confirm applicable criteria and assign every procedure before approving.');
 return {...p,programApproved:true,reviewed:false,issued:false,report:'',slides:[],version:p.version+1,history:[...p.history,'Programme and applicable criteria approved by the reviewer.']};
}
export function exampleEvidence(p:Project):Project{
 if(!p.programApproved)throw Error('Approve the programme first.');
 const credit=p.universeId==='u-credit',model=p.universeId==='u-model';
 const texts=credit?['E-01: Credit policy CR-04 requires an approval reference for overrides.','E-02: 40 sampled override files; 8 have no approval record in this evidence pack.','E-03: Credit team is checking whether the missing records are held elsewhere.']:model?['E-04: Release 2.3 has a test report and release approval.','E-05: One performance warning has no assigned response owner.','E-06: Model team is confirming the escalation record.']:['E-07: Selected records and the applicable teaching policy have been inspected.','E-08: One exception requires confirmation with the process owner.','E-09: Follow-up evidence has been requested.'];
 return patchProject(p,{program:p.program.map((t,i)=>({...t,evidence:texts[i%texts.length],result:i===1?'exception':i===2?'inconclusive':'supported'}))},'Teaching evidence loaded for review.');
}
export function draftFinding(p:Project):Partial<Project>{
 if(!p.programApproved||p.program.some(t=>!t.evidence.trim()||t.result==='not-started'))throw Error('Complete the evidence and test results before drafting the finding.');
 const credit=p.universeId==='u-credit';
 return {condition:credit?'8 of 40 sampled files have no approval record in the evidence pack. This does not establish that approval never occurred.':p.program.find(t=>t.result==='exception'||t.result==='inconclusive')?.evidence||'No exception is proposed from the recorded tests; confirm completeness before concluding.',cause:'Not established. Confirm the explanation with the process owner.',effect:credit?'Approval discipline could be weaker than assumed, putting credit exposure and collections at risk. Sample results do not estimate population error.':'The recorded exception may weaken the linked control; assess its relevance and business consequence.',action:credit?'Reconcile the missing records; require an independent approval reference before processing an override; monitor unresolved exceptions.':'Confirm the exception, assign an owner and verify the corrective action.'};
}
export function reviewFinding(p:Project):Project{
 if(!p.programApproved||p.program.some(t=>!t.evidence.trim()||t.result==='not-started')||[p.condition,p.cause,p.effect,p.action,p.owner,p.due].some(v=>!v.trim()))throw Error('Complete the evidence, finding and accountable action before approval.');
 if(!validDate(p.due))throw Error('Enter a valid action due date.');
 return {...p,reviewed:true,history:[...p.history,'Finding, evidence limitations and management response reviewed.']};
}
export function generateOutputs(p:Project):Project{
 if(!p.reviewed)throw Error('Approve the finding before generating the reporting pack.');
 const refs=[...new Set(p.program.flatMap(t=>t.criteria))];
 const report=`# ${p.name}\n\nEngagement: ${p.id}\n\n## Objective\n${p.objective}\n\n## Scope\n${p.scope}\n\n## Evidence\n${p.program.map(t=>`${t.id} — ${t.evidence}`).join('\n\n')}\n\n## Finding\n${p.condition}\n\n## Cause\n${p.cause}\n\n## Risk implication\n${p.effect}\n\n## Management response\n${p.action}\n\nOwner: ${p.owner}\nDue: ${p.due}\n\n## Criteria checked\n${refs.map(id=>{const c=criteria.find(c=>c.id===id)!;return `${c.id} — ${c.title} (${c.version})${c.url?' '+c.url:''}`;}).join('\n')}\n\n## Limitation\nTeaching records. Conclusions are bounded by the recorded scope and sample. A planned action does not prove achieved risk reduction.`;
 const slides=[{title:p.name,body:p.objective},{title:'What we examined',body:p.scope},{title:'What the evidence supports',body:p.condition},{title:'What remains to confirm',body:p.cause},{title:'Why it matters',body:p.effect},{title:'The response and its owner',body:`${p.action}\n${p.owner} · ${p.due}`}];
 return {...p,report,slides,history:[...p.history,'Report and six presentation slides generated from the reviewed finding.']};
}
export function issueReport(s:AssuranceState,id:string):AssuranceState{
 const p=s.projects.find(p=>p.id===id);if(!p||!p.reviewed||!p.report||!p.slides.length)throw Error('Generate and review the reporting pack before issuing.');
 const signalId=`audit-${p.id}-v${p.version}`;
 const signal:Signal={id:signalId,type:'audit',title:p.name,summary:p.condition,why:p.effect,riskIds:p.riskIds,evidence:p.report,date:String(p.planYear),verified:true,eventId:p.id,decisions:{}};
 return {...s,projects:s.projects.map(x=>x.id===id?{...x,issued:true,history:[...x.history,'Report issued; an audit signal is available for the linked risk owner.']}:x),signals:s.signals.some(x=>x.id===signalId)?s.signals:[...s.signals,signal]};
}
export function exampleSignals():Signal[]{return [
 {id:'memo-collections',type:'internal',title:'Collections review: customer payments are slowing',summary:'Finance reports delayed payments among export-linked customers and asks Credit to review outstanding limits.',why:'The case organisation supplies export manufacturers. Slower customer receipts could increase the risk to timely collections.',riskIds:['credit','collections'],evidence:'Aruna internal memo MEM-07 (teaching record). Finance and Credit should reconcile ageing records, customer commitments and approval references. This memo is an early warning, not proof of default.',date:'2027-02-12',verified:true,eventId:'collection-pressure',decisions:{}},
 {id:'news-tariff',type:'news',title:'Indonesia siapkan langkah strategis respons kebijakan tarif resiprokal AS',summary:'ANTARA reported the policy response to the US tariff announcement. This is a historical article, not a current forecast.',why:'In the Aruna scenario, some customers are export manufacturers. Verify their actual exposure and payment commitments before assuming an effect on collections.',riskIds:['collections'],evidence:'Historical news published 3 April 2025. The application replays it as contextual evidence; it does not establish that a particular Aruna customer is affected.',url:'https://jatim.antaranews.com/berita/902409/indonesia-siapkan-langkah-strategis-respons-kebijakan-tarif-resiprokal-as',date:'2025-04-03',verified:true,eventId:'trade-policy',decisions:{}},
 {id:'social-lead',type:'news',title:'Social-media lead: alleged delivery cancellations',summary:'An unverified teaching example of a public post. No real person or account is attributed.',why:'It may be a lead for verification. It is not sufficient evidence on its own to raise a risk score.',riskIds:['collections'],evidence:'Teaching social post: “Some export orders may be delayed.” Verify the original account, date, corroborating news and customer records. Do not treat the claim as established.',date:'Unverified example',verified:false,eventId:'social-lead',decisions:{}}
 ];}
export function suggestedAssessment(r:Risk,signals:Signal[]){const credible=signals.filter(s=>s.verified&&s.riskIds.includes(r.id));return {likelihood:credible.length?Math.max(r.likelihood,4):r.likelihood,impact:r.impact,reason:credible.length?'Verified-source signals challenge the existing control or collection assumption. Review the proposed likelihood; this is an illustration, not a statistical estimate.':'No corroborated accepted evidence supports a score increase. Keep the assessment or document a justified alternative.'};}
export function finishRiskReview(s:AssuranceState,input:{riskId:string;revision:number;decisions:Record<string,'accept'|'decline'>;likelihood:number;impact:number;reason:string;mitigation?:Omit<Mitigation,'id'|'status'>}):AssuranceState{
 const r=s.risks.find(r=>r.id===input.riskId);if(!r||r.revision!==input.revision)throw Error('The assessment changed. Reopen the review.');
 const pending=s.signals.filter(x=>x.riskIds.includes(r.id)&&!x.decisions[r.id]);if(!pending.length||pending.some(x=>!['accept','decline'].includes(input.decisions[x.id]))||Object.keys(input.decisions).some(id=>!pending.some(x=>x.id===id)))throw Error('Decide every signal in this risk review.');
 if(![input.likelihood,input.impact].every(n=>Number.isFinite(n)&&n>=1&&n<=5)||!input.reason.trim())throw Error('Select a score and record the reasoning.');
 const accepted=pending.filter(x=>input.decisions[x.id]==='accept');
 if(!accepted.length&&(input.likelihood!==r.likelihood||input.impact!==r.impact))throw Error('No accepted signal: keep the current assessment for this review.');
 const m=input.mitigation;
 if(accepted.length&&input.likelihood*input.impact>r.tolerance&&!m)throw Error('A response is required above tolerance.');
 if(m&&([m.action,m.owner,m.due].some(v=>!v.trim())||!validDate(m.due)||![m.likelihoodReduction,m.impactReduction].every(v=>Number.isFinite(v)&&v>=0&&v<=4)))throw Error('Complete the response, owner, valid due date and expected effect.');
 const mitigation=m?{...m,id:'mitigation-'+r.id+'-'+(r.revision+1),status:'planned' as const}:null;
 return {...s,risks:s.risks.map(x=>x.id===r.id?{...x,likelihood:input.likelihood,impact:input.impact,revision:x.revision+1,mitigations:mitigation?[...x.mitigations,mitigation]:x.mitigations}:x),signals:s.signals.map(x=>pending.some(p=>p.id===x.id)?{...x,decisions:{...x.decisions,[r.id]:input.decisions[x.id]}}:x),history:[...s.history,`${r.title}: assessment reviewed. ${input.reason.trim()}`]};
}
export function projectedScore(r:Risk){return Math.min(r.likelihood*r.impact,...r.mitigations.filter(m=>m.status==='planned').map(m=>Math.max(1,r.likelihood-m.likelihoodReduction)*Math.max(1,r.impact-m.impactReduction)));}
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function slidesHtml(p:Project,logo=''){return `<!doctype html><html lang="en"><meta charset="utf-8"><title>${escape(p.name)}</title><style>body{margin:0;font:24px Arial;color:#00153d;background:#edf3f7}section{box-sizing:border-box;min-height:100vh;background:white;padding:7vw;page-break-after:always;border-top:8px solid #009cde}img{width:110px;float:right}h1{font-size:52px;max-width:1000px}p{line-height:1.5;white-space:pre-wrap}small{font-size:14px;color:#52657b}</style>${p.slides.map((s,i)=>`<section>${logo?`<img src="${escape(logo)}" alt="RSM">`:''}<small>${escape(p.id)} · ${i+1}/${p.slides.length}</small><h1>${escape(s.title)}</h1><p>${escape(s.body)}</p><small>RSM Indonesia · Reviewed audit finding · ${escape(p.owner)}</small></section>`).join('')}</html>`;}
export function restoreAssurance(raw:unknown):AssuranceState{
 const base=initialAssurance();
 if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&(raw as AssuranceState).schemaVersion===2){const v=raw as AssuranceState;
  try{if(Array.isArray(v.projects)&&Array.isArray(v.risks)&&v.risks.length&&v.risks.every(r=>r&&typeof r.id==='string'&&typeof r.title==='string'&&typeof r.objective==='string'&&typeof r.owner==='string'&&[r.likelihood,r.impact].every(n=>Number.isFinite(n)&&n>=1&&n<=5)&&Number.isFinite(r.tolerance)&&Number.isInteger(r.revision)&&Array.isArray(r.mitigations))&&Array.isArray(v.universe)&&Array.isArray(v.signals)&&v.signals.every(x=>x&&['audit','internal','news'].includes(x.type)&&typeof x.id==='string'&&Array.isArray(x.riskIds)&&x.decisions&&typeof x.decisions==='object')&&Array.isArray(v.history)&&v.weights&&['risk','change','coverage','strategy'].every(k=>Number.isFinite(v.weights[k as keyof Weights]))&&Array.isArray(v.selected)&&v.projects.every(p=>p&&typeof p.id==='string'&&Array.isArray(p.riskIds)&&Array.isArray(p.confirmedCriteria)&&Array.isArray(p.program)&&p.program.every(t=>typeof t.task==='string'&&typeof t.evidence==='string'&&Array.isArray(t.criteria))&&Array.isArray(p.slides)&&Array.isArray(p.history)))return v;}catch{/* Invalid browser state is not trusted. */}
 }
 // Migrate the previously released project-only browser store without discarding the user's work.
 if(Array.isArray(raw))base.projects=raw.filter(v=>v&&typeof v.id==='string'&&typeof v.name==='string'&&Array.isArray(v.program)).slice(0,20).map((v,i)=>({id:v.id,universeId:i?'u-model':'u-credit',planYear:2026,name:v.name,objective:v.objective||objective,riskIds:[i?'model':'credit'],scope:v.scope||'',lead:auditors[0],program:v.program.map((task:string,j:number)=>({id:'AP-'+(j+1),task,criteria:[i?'AI-06':'CR-04'],auditor:auditors[j%auditors.length],evidence:v.evidence||'',result:'inconclusive'})),confirmedCriteria:[],programApproved:false,condition:v.condition||'',cause:v.cause||'',effect:v.effect||'',action:v.action||'',owner:v.owner||'',due:v.due||'',reviewed:false,issued:!!v.issued,report:v.issued?`Previously issued report: ${v.condition||''}\n${v.action||''}`:'',slides:[],version:1,history:[...(v.history||[]),'Migrated from the earlier project workspace; revalidate criteria before new reporting.']}));
 return base;
}
function validDate(value:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;}
