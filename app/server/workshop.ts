import {Router} from 'express';
import {networkInterfaces} from 'node:os';
import {randomUUID,randomInt,createHash} from 'node:crypto';
import {z} from 'zod';
import {pool,tenant} from './db.js';
import strategicNews from '../../website/assets/data/strategic-news.json';
import {captureNews} from './news.js';
import {organizations,publishers,featured,c,stages,scenarioVersion,freshParticipant,setupParticipant,materialize,proposed,pendingFor,tx,type Participant} from '../shared/workshop.js';
export const workshop=Router();
const code=z.string().regex(/^[A-Z0-9]{6}$/),text=z.string().trim().min(1).max(1500);
const sourceIds=z.array(z.enum(['antara','detik','kompas','cnn'])).max(4).refine(a=>new Set(a).size===a.length);
const active=new Map<string,Promise<any>>();
const find=async(c:string)=>(await pool.query("SELECT * FROM seminar_sessions WHERE code=$1 AND data->>'version'='3'",[c])).rows[0];
async function own(c:string,w:string){const s=await find(c);return s?.owner_id===w?s:null;}
async function participant(c:string,w:string,fn:(p:Participant,s:any)=>any){
 const s=await find(c);if(!s)return null;
 return tenant(w,async db=>{const row=(await db.query('SELECT data FROM seminar_participants WHERE session_id=$1 AND workspace_id=$2 FOR UPDATE',[s.id,w])).rows[0];if(!row)return null;const before=JSON.stringify(row.data);materialize(row.data,s.data);const result=await fn(row.data,s);if(before!==JSON.stringify(row.data))await db.query('UPDATE seminar_participants SET data=$1,updated_at=now() WHERE session_id=$2 AND workspace_id=$3',[row.data,s.id,w]);return result;});
}
const payload=(p:Participant,s:any)=>({participant:p,session:{code:s.code,released:s.data.released,exerciseDate:s.data.exerciseDate,mode:'Historical case replay',preparedAt:s.data.preparedAt,sourceHealth:s.data.sourceHealth||[],externalMode:s.data.externalMode||'curated'},organizations,publishers,featured});
const respond=(res:any,out:any)=>!out?res.status(404).json({error:'Session or private workspace not found. Join a current session.'}):res.status(out.error?409:200).json(out);
workshop.get('/workshop/access',(_req,res)=>res.json({addresses:Object.values(networkInterfaces()).flatMap(v=>v||[]).filter(v=>v.family==='IPv4'&&!v.internal&&!v.address.startsWith('169.254.')).map(v=>'http://'+v.address+':5173')}));
workshop.post('/workshop/sessions',async(_req,res)=>{
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<6;i++)c+=alphabet[randomInt(alphabet.length)];
 await pool.query('INSERT INTO seminar_sessions(id,code,owner_id,data) VALUES($1,$2,$3,$4)',[randomUUID(),c,res.locals.workspace.id,{version:scenarioVersion,title:'Beyond Compliance',exerciseDate:featured.exerciseDate,released:[],news:[],sourceHealth:[]}]);res.status(201).json({code:c});
});
workshop.post('/workshop/join',async(req,res)=>{const c=code.parse(String(req.body.code).toUpperCase()),s=await find(c);if(!s)return res.status(404).json({error:'Session not found. Ask the presenter for the current code.'});await tenant(res.locals.workspace.id,db=>db.query('INSERT INTO seminar_participants(session_id,workspace_id,data) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[s.id,res.locals.workspace.id,freshParticipant()]));res.json({code:c});});
workshop.get('/workshop/:code/state',async(req,res)=>respond(res,await participant(code.parse(req.params.code),res.locals.workspace.id,payload)));
workshop.put('/workshop/:code/setup',async(req,res)=>{const input=z.object({organizationId:text,objectiveIds:z.array(text).min(1).max(2),company:z.string().trim().max(100),sourceIds}).parse(req.body);let p:Participant;try{p=setupParticipant(input.organizationId,input.objectiveIds,input.company,featured.exerciseDate);}catch{return res.status(400).json({error:'Choose at least one objective from your selected organization.'});}respond(res,await participant(code.parse(req.params.code),res.locals.workspace.id,(data,s)=>{if(data.ready)return {error:'Organization already configured. Start another session to change context.'};Object.assign(data,p,{sourceIds:input.sourceIds});materialize(data,s.data);return payload(data,s);}));});
workshop.put('/workshop/:code/sources',async(req,res)=>{const input=sourceIds.parse(req.body.sourceIds);respond(res,await participant(code.parse(req.params.code),res.locals.workspace.id,p=>{p.sourceIds=input;return {saved:true};}));});
workshop.get('/workshop/host/:code',async(req,res)=>{
 const s=await own(code.parse(req.params.code),res.locals.workspace.id);if(!s)return res.status(404).json({error:'Presenter session not found in your workspace.'});
 const rows=await tenant(res.locals.workspace.id,async db=>(await db.query('SELECT data FROM seminar_participants WHERE session_id=$1',[s.id])).rows);
 const progress=rows.map(row=>{const p=row.data as Participant;materialize(p,s.data);return {organizationId:p.organizationId,ready:p.ready,signals:p.signals.length,decided:p.signals.filter(v=>v.decision).length,captured:p.signals.filter(v=>v.decision==='Capture').length,reviews:p.reviews.length,updated:p.reviews.filter(v=>v.choice==='Update').length,plans:p.plans.filter(v=>v.signalIds.length).length};});
 const preview=organizations.map(org=>{const p=setupParticipant(org.id,org.objectives.map(v=>v.id),org.name,s.data.exerciseDate);materialize(p,s.data);return {organizationId:org.id,name:org.name,signals:p.signals.map(v=>({id:v.id,title:v.title,type:v.type,stage:v.stage,riskIds:v.riskIds,reason:v.reason}))};});
 res.json({code:s.code,...s.data,featured,progress,preview});
});
async function prepare(s:any,mode:'curated'|'live'){
 if(mode==='curated'){
  const news=structuredClone(strategicNews);
  const sourceHealth=publishers.map(source=>({organizationId:'all',sourceId:source.id,name:source.name,count:news.filter(item=>item.sourceId===source.id).length,status:news.some(item=>item.sourceId===source.id)?'Case pack ready':'Not in case pack'}));
  await pool.query('UPDATE seminar_sessions SET data=data || $1::jsonb WHERE id=$2',[JSON.stringify({news,sourceHealth,externalMode:mode,preparedAt:new Date().toISOString()}),s.id]);return {articles:news.length,sourceHealth,mode};
 }

 const news:any[]=[],sourceHealth:any[]=[];
 await Promise.allSettled(organizations.flatMap(org=>publishers.map(async source=>{
 try{const queries:Record<string,string>={logistics:'(tarif OR ekspor OR perdagangan OR diversifikasi OR investasi) (Indonesia OR Amerika)',food:'(tarif OR ekspor OR diversifikasi OR kurs) (Indonesia OR pangan OR perikanan)',digital:'(AI OR DeepSeek OR anggaran OR regulasi OR data) (Indonesia OR platform OR perusahaan)'};const endpoint='https://news.google.com/rss/search?q='+encodeURIComponent('site:'+source.domain+' '+queries[org.id]+' when:30d')+'&hl=id&gl=ID&ceid=ID:id';
 const items=(await captureNews(endpoint,'rss')).filter(a=>a.url&&a.publishedAt&&Number.isFinite(Date.parse(a.publishedAt))).slice(0,4);
 sourceHealth.push({organizationId:org.id,sourceId:source.id,name:source.name,count:items.length,status:items.length?'Ready':'Empty'});
 news.push(...items.map(a=>({id:createHash('sha256').update(a.url).digest('hex').slice(0,20),eventId:'news-'+createHash('sha256').update(a.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')).digest('hex').slice(0,16),title:a.title,summary:a.details&&a.details!==a.title?a.details:'RSS headline only. Open the original source to verify scope and dependency.',url:a.url,sourceId:source.id,publisher:a.publisher||source.name,publishedAt:a.publishedAt,mode:'Live news',organizationId:org.id})));
 }catch(e){sourceHealth.push({organizationId:org.id,sourceId:source.id,name:source.name,count:0,status:'Unavailable',error:e instanceof Error?e.message:'Capture failed'});}
 })));
 const diverse:any[]=[];for(let rank=0;rank<4;rank++)for(const org of organizations)for(const source of publishers){const item=news.filter(n=>n.organizationId===org.id&&n.sourceId===source.id)[rank];if(item&&!diverse.some(v=>v.url===item.url))diverse.push(item);}const unique=diverse.slice(0,24);
 // Near-identical headlines share an event ID, preserving each article as evidence without repeated escalation.
 const words=(s:string)=>new Set(s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(w=>w.length>3));
 for(let i=0;i<unique.length;i++)for(let j=0;j<i;j++){const a=words(unique[i].title),b=words(unique[j].title);if([...a].filter(v=>b.has(v)).length/Math.max(1,new Set([...a,...b]).size)>.58){unique[i].eventId=unique[j].eventId;break;}}
 await pool.query("UPDATE seminar_sessions SET data=data || $1::jsonb WHERE id=$2",[JSON.stringify({news:unique,sourceHealth,externalMode:mode,preparedAt:new Date().toISOString()}),s.id]);return {articles:unique.length,sourceHealth};
}
workshop.post('/workshop/host/:code/prepare',async(req,res)=>{const c=code.parse(req.params.code),s=await own(c,res.locals.workspace.id);if(!s)return res.status(404).json({error:'Presenter session not found.'});if(s.data.released.includes('external'))return res.status(409).json({error:'The released batch is fixed. Create another session for a new batch.'});const mode=z.enum(['curated','live']).parse(req.body?.mode||'curated');let p=active.get(c);if(!p){p=prepare(s,mode).finally(()=>active.delete(c));active.set(c,p);}res.json(await p);});
workshop.post('/workshop/host/:code/release',async(req,res)=>{
 const c=code.parse(req.params.code),stage=z.enum(stages).parse(req.body.stage),db=await pool.connect();
 try{await db.query('BEGIN');const s=(await db.query("SELECT * FROM seminar_sessions WHERE code=$1 AND owner_id=$2 AND data->>'version'='3' FOR UPDATE",[c,res.locals.workspace.id])).rows[0];if(!s){await db.query('ROLLBACK');return res.status(404).json({error:'Presenter session not found.'});}
 if(s.data.released.includes(stage)){await db.query('COMMIT');return res.json({saved:true});}
 if(stage!==stages[s.data.released.length]){await db.query('ROLLBACK');return res.status(409).json({error:'Release the guided case, external batch, then internal evidence.'});}
 if(stage==='external'&&(!s.data.news.length||active.has(c))){await db.query('ROLLBACK');return res.status(409).json({error:'Capture and inspect real news before releasing the batch.'});}
 s.data.released.push(stage);await db.query('UPDATE seminar_sessions SET data=$1 WHERE id=$2',[s.data,s.id]);await db.query('COMMIT');res.json({saved:true});
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
});
workshop.post('/workshop/:code/signals/:id/decision',async(req,res)=>{
 const input=z.object({decision:z.enum(['Capture','Neglect']),riskIds:z.array(text).max(4),notes:text,confirmed:z.boolean().optional()}).parse(req.body);
 respond(res,await participant(code.parse(req.params.code),res.locals.workspace.id,p=>{
 const signal=p.signals.find(s=>s.id===req.params.id);if(!signal||signal.decision)return {error:'Signal unavailable or already decided.'};
 if(input.decision==='Capture'&&(!input.riskIds.length||input.riskIds.some(id=>!p.risks.some(r=>r.id===id))))return {error:'Link capture to your registered risks.'};
 if(input.decision==='Capture'&&signal.type==='ca'&&!input.confirmed)return {error:'Confirm the strategic indicator exception before capture.'};
 Object.assign(signal,{decision:input.decision,notes:input.notes,...(input.decision==='Capture'?{riskIds:[...new Set(input.riskIds)]}:{}),decidedAt:new Date().toISOString(),actor:res.locals.workspace.id,...(signal.type==='ca'?{confirmation:input.confirmed?'Confirmed':'Not confirmed'}:{})});return {saved:true};
 }));
});
workshop.post('/workshop/:code/reassess',async(req,res)=>{
 const input=z.object({riskId:text,choice:z.enum(['Keep','Update']),likelihood:z.number().int().min(1).max(5),impact:z.number().int().min(1).max(5),notes:text}).parse(req.body);
 respond(res,await participant(code.parse(req.params.code),res.locals.workspace.id,p=>{
 const r=p.risks.find(v=>v.id===input.riskId);if(!r)return {error:'Risk not found.'};const pr=proposed(p,r);
 if(!pr.signalIds.length)return {error:'Capture new evidence before reassessment.'};
 const before={likelihood:r.likelihood,impact:r.impact},after=input.choice==='Update'?{likelihood:input.likelihood,impact:input.impact}:before;
 p.reviews.push({id:randomUUID(),riskId:r.id,choice:input.choice,before,after,signalIds:pr.signalIds,eventIds:pr.eventIds,notes:input.notes,at:new Date().toISOString(),actor:res.locals.workspace.id});
 Object.assign(r,after);r.reviewed.push(...pr.signalIds);return {saved:true};
 }));
});
const planInput=z.object({riskId:text,title:text,owner:text,dueDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v),likelihoodReduction:z.number().min(0).max(4).multipleOf(.5),impactReduction:z.number().min(0).max(4).multipleOf(.5),notes:z.string().max(1500)});
workshop.post('/workshop/:code/plans',async(req,res)=>{const input=planInput.parse(req.body);respond(res,await participant(code.parse(req.params.code),res.locals.workspace.id,p=>{const r=p.risks.find(r=>r.id===input.riskId);if(!r)return {error:'Risk not found.'};if(p.plans.length>=100)return {error:'Maximum 100 plans.'};const signalIds=[...new Set(p.reviews.filter(v=>v.riskId===r.id).flatMap(v=>v.signalIds))];if(!signalIds.length)return {error:'Review captured evidence before adding a response plan.'};if(p.plans.some(v=>v.riskId===r.id&&v.title===input.title))return {error:'This response plan already exists.'};p.plans.push({...input,id:randomUUID(),signalIds,status:'Open',evidence:'',createdAt:new Date().toISOString()});return {saved:true};}));});
workshop.patch('/workshop/:code/plans/:id',async(req,res)=>{const input=z.object({status:z.enum(['Open','Done']),evidence:z.string().trim().max(1500)}).parse(req.body);respond(res,await participant(code.parse(req.params.code),res.locals.workspace.id,p=>{const plan=p.plans.find(v=>v.id===req.params.id);if(!plan)return {error:'Plan not found.'};if(input.status==='Done'&&!input.evidence)return {error:'Record implementation and effectiveness evidence before marking done.'};Object.assign(plan,input);
 const evidenceId='implementation-'+plan.id;
 if(input.status==='Done'&&!p.signals.some(v=>v.id===evidenceId))p.signals.push({id:evidenceId,eventId:evidenceId,stage:'internal',type:'report',title:c('Implementation evidence: '+tx(plan.title),'Bukti pelaksanaan: '+tx(plan.title,'id')),summary:input.evidence,publisher:tx(plan.owner),sourceId:'report',publishedAt:new Date().toISOString(),receivedAt:new Date().toISOString(),riskIds:[plan.riskId],adverse:false,reason:c('Management reports completed action. Verify its effectiveness before changing current risk.','Manajemen melaporkan tindakan selesai. Verifikasi efektivitas sebelum mengubah risiko saat ini.'),document:p.company+'\nImplementation evidence\n'+input.evidence+'\nReported by: '+tx(plan.owner)});
 return {saved:true};}));});
workshop.get('/workshop/:code/document/:id',async(req,res)=>{
 const out=await participant(code.parse(req.params.code),res.locals.workspace.id,p=>p.signals.find(s=>s.id===req.params.id)?.document||null);if(!out)return res.status(404).send('Document not found in your workspace.');
 const escape=(s:string)=>s.replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]!));
 res.type('html').send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Evidence document</title><body style="font:18px/1.8 system-ui;max-width:800px;margin:40px auto;padding:20px"><h1>Evidence document</h1><pre style="white-space:pre-wrap;font:inherit">'+escape(out)+'</pre></body></html>');
});
