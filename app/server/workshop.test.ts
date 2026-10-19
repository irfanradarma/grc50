import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setupParticipant,guidedSignals,internalEvidence,materialize,proposed,projection,featured,organizations,screenArticle,scenarioVersion} from '../shared/workshop.js';
process.env.NODE_ENV='test';
import strategicNews from '../../website/assets/data/strategic-news.json';
import deckOutline from '../../website/assets/data/deck-outline.json';
const {app}=await import('./index.js');
const {pool,tenant,migrate}=await import('./db.js');
await migrate();

test('strategic signals distinguish exposure, uncertainty, opportunities and historical dates',()=>{
 const participants=organizations.map(o=>setupParticipant(o.id,o.objectives.map(v=>v.id),'',featured.exerciseDate));
 const [logistics,food,digital]=participants;
 const article=(id:string)=>strategicNews.find(n=>n.id===id)!;
 assert(screenArticle(article('trade-response'),logistics,featured.exerciseDate).riskIds.includes('L1-R1'));
 assert(screenArticle(article('trade-response'),food,featured.exerciseDate).riskIds.includes('P1-R1'));
 assert.deepEqual(screenArticle(article('trade-response'),digital,featured.exerciseDate).riskIds,[]);
 assert(screenArticle(article('fx-pressure'),food,featured.exerciseDate).riskIds.includes('P1-R2'));
 assert(screenArticle(article('budget-priorities'),digital,featured.exerciseDate).riskIds.includes('D1-R2'));
 assert(screenArticle(article('ai-competition'),digital,featured.exerciseDate).riskIds.includes('D1-R1'));
 assert(screenArticle(article('data-policy'),digital,featured.exerciseDate).riskIds.includes('D2-R1'));
 for(const p of participants){
  const opportunity=screenArticle(article('market-diversification'),p,featured.exerciseDate);assert.equal(opportunity.adverse,false);
  assert.equal(screenArticle(article('fx-pressure'),p,featured.exerciseDate).adverse,false);
  for(const n of strategicNews)assert.equal(screenArticle(n,p,featured.exerciseDate).stale,false);
 }
 assert.equal(screenArticle(article('trade-response'),logistics,'2026-10-18').stale,true);
 assert.equal(screenArticle({...article('trade-response'),publishedAt:'2026-01-01'},logistics,featured.exerciseDate).stale,true);
 // AS is an Indonesian abbreviation for the US, not a substring of pasar.
 assert.deepEqual(screenArticle({title:'Tarif pasar lokal',summary:'',publishedAt:featured.publishedAt},logistics,featured.exerciseDate).riskIds,[]);
 // An overseas policy can matter to an Indonesian export strategy.
 assert(screenArticle({title:'US tariff on American trade',summary:'',publishedAt:featured.publishedAt},logistics,featured.exerciseDate).riskIds.length>0);
 assert(guidedSignals(setupParticipant('logistics',['L2'],'',featured.exerciseDate))[0].riskIds.includes('L2-R2'));
 assert(guidedSignals(setupParticipant('food',['P2'],'',featured.exerciseDate))[0].riskIds.includes('P2-R2'));
});

test('all strategic CA checks reconcile with their denominators and shared assumptions',()=>{
 let count=0;
 for(const o of organizations){const p=setupParticipant(o.id,o.objectives.map(v=>v.id),'',featured.exerciseDate),items=internalEvidence(p,featured.exerciseDate);
  for(const r of p.risks){const related=items.filter(s=>s.riskIds.includes(r.id)),ca=related.find(s=>s.type==='ca')!;count++;
   assert.equal(related.length,3);assert.equal(new Set(related.map(s=>s.eventId)).size,1);
   assert.equal(ca.check!.value,ca.check!.numerator!/ca.check!.denominator!*100);
   assert.equal(ca.check!.records.length,ca.check!.numerator);assert(ca.check!.value>ca.check!.threshold);
   assert(ca.document!.includes('Strategic objective:'));assert(r.response&&r.evidenceHint);
  }
 }
 assert.equal(count,12);
});
test('three contexts, selected objectives and non-cumulative assessment proposals',()=>{
 const logistics=setupParticipant('logistics',['L1'],'Logistics',featured.exerciseDate),food=setupParticipant('food',['P1'],'Food',featured.exerciseDate),digital=setupParticipant('digital',['D1'],'Digital',featured.exerciseDate);
 assert.equal(guidedSignals(logistics)[0].riskIds[0],'L1-R1');assert.equal(guidedSignals(food)[0].riskIds[0],'P1-R1');assert.equal(guidedSignals(digital)[0].riskIds.length,0);
 assert.throws(()=>setupParticipant('food',['D1'],'',featured.exerciseDate));
 assert.equal(setupParticipant('logistics',['L1','L2'],'',featured.exerciseDate).risks.length,4);
 materialize(logistics,{released:['guided'],exerciseDate:featured.exerciseDate});materialize(logistics,{released:['guided'],exerciseDate:featured.exerciseDate});assert.equal(logistics.signals.length,1);
 logistics.signals[0].decision='Capture';const r=logistics.risks[0];assert.equal(proposed(logistics,r).likelihood,4);r.likelihood=4;assert.equal(proposed(logistics,r).likelihood,4);
 assert.equal(internalEvidence(digital,featured.exerciseDate).find(v=>v.type==='ca')?.check?.value,35);
 assert.equal(projection(r,logistics.plans).likelihood,4);
});
test('complete workshop: private organizations, guided case, mitigation, external/internal evidence, sources and ownership',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const address=server.address();assert(address&&typeof address==='object');const base='http://127.0.0.1:'+address.port+'/api';const workspaces:string[]=[];let sessionId='';
 async function req(path:string,method='GET',cookie='',body?:unknown){return fetch(base+path,{method,headers:{Cookie:cookie,'x-signal-request':'1','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}
 try{
 assert.equal((await req('/auth/me')).status,401);
 assert.equal((await fetch(base+'/auth/guest',{method:'POST'})).status,403);
 const guests=await Promise.all([0,1,2,3].map(()=>req('/auth/guest','POST')));const cookies=guests.map(r=>r.headers.get('set-cookie')!.split(';')[0]);for(const r of guests)workspaces.push((await r.json()).id);
 assert(cookies[0].startsWith('signal_session='));
 const legacyCookie=await req('/auth/me','GET',cookies[0].replace('signal_session=','hori_session='));
 assert.equal(legacyCookie.status,200);assert.equal((await legacyCookie.json()).id,workspaces[0]);
 assert(legacyCookie.headers.get('set-cookie')?.startsWith('signal_session='));
 const [host,a,b,d]=cookies;const {code}=await(await req('/workshop/sessions','POST',host)).json();sessionId=(await pool.query('SELECT id FROM seminar_sessions WHERE code=$1',[code])).rows[0].id;
 const original=(await pool.query('SELECT data FROM seminar_sessions WHERE id=$1',[sessionId])).rows[0].data;
 const legacy={...original,version:2};await pool.query('UPDATE seminar_sessions SET data=$1 WHERE id=$2',[legacy,sessionId]);
 assert.equal((await req('/workshop/join','POST',a,{code})).status,404);
 assert.equal((await req('/workshop/host/'+code,'GET',host)).status,404);
 assert.deepEqual((await pool.query('SELECT data FROM seminar_sessions WHERE id=$1',[sessionId])).rows[0].data,legacy);
 await pool.query('UPDATE seminar_sessions SET data=$1 WHERE id=$2',[original,sessionId]);
 assert.equal((await req('/workshop/host/'+code,'GET',a)).status,404);
 // Read-only deck viewers need no guest account, but only this session owner can lead.
 const liveState=()=>req('/presentation/'+code);
 assert.equal((await liveState()).status,200);assert.equal((await(await liveState()).json()).published,false);
 const publish=(cookie:string,slideKey:string,deckId=deckOutline.deckId)=>req('/workshop/host/'+code+'/presentation','PUT',cookie,{slideKey,deckId});
 assert.equal((await publish(a,'agenda')).status,404);assert.equal((await publish('','agenda')).status,401);
 assert.equal((await publish(host,'unknown-slide')).status,400);assert.equal((await publish(host,'agenda','old-deck')).status,409);
 assert.equal((await publish(host,'agenda')).status,200);
 assert.equal((await(await liveState()).json()).slideKey,'agenda');
 assert.equal((await publish(host,'the-foundation')).status,200);
 const publicDeck=await(await liveState()).json();assert.equal(publicDeck.slideKey,'the-foundation');assert.equal(publicDeck.published,true);
 assert.deepEqual(Object.keys(publicDeck).sort(),['deckId','published','slideKey','updatedAt']);

 for(const cookie of [a,b,d])assert.equal((await req('/workshop/join','POST',cookie,{code})).status,200);
 const privateRows=await tenant(workspaces[1],c=>c.query('SELECT workspace_id FROM seminar_participants WHERE session_id=$1',[sessionId]));assert.equal(privateRows.rowCount,1);assert.equal(privateRows.rows[0].workspace_id,workspaces[1]);
 const setup=(cookie:string,organizationId:string,objectiveIds:string[])=>req('/workshop/'+code+'/setup','PUT',cookie,{organizationId,objectiveIds,company:'',sourceIds:['antara','detik','cnn','kompas']});
 assert.equal((await setup(a,'logistics',['P1'])).status,400);
 assert.equal((await setup(a,'logistics',['L1','L2'])).status,200);assert.equal((await setup(b,'food',['P1'])).status,200);assert.equal((await setup(d,'digital',['D1'])).status,200);
 const release=(stage:string,cookie=host)=>req('/workshop/host/'+code+'/release','POST',cookie,{stage});
 assert.equal((await release('guided',a)).status,404);assert.equal((await release('internal')).status,409);assert.equal((await release('guided')).status,200);assert.equal((await release('guided')).status,200);
 assert.equal((await(await liveState()).json()).slideKey,'the-foundation','Signal releases must preserve live presentation state');
 const state=async(cookie:string)=>(await(await req('/workshop/'+code+'/state','GET',cookie)).json()).participant;
 const pa=await state(a),pb=await state(b),pd=await state(d);assert.equal(pa.signals.length,1);assert.equal(pa.risks.length,4);assert.equal(pb.risks.length,2);assert.deepEqual(pd.signals[0].riskIds,[]);
 const signal=pa.signals[0];const decide=(cookie:string,id:string,riskIds:string[],decision='Capture',confirmed=false)=>req('/workshop/'+code+'/signals/'+id+'/decision','POST',cookie,{decision,riskIds,confirmed,notes:'Verify recorded dependency and protection.'});
 assert.equal((await decide(d,signal.id,['L1-R1'])).status,409);
 assert.equal((await decide(a,signal.id,['L1-R1'])).status,200);assert.equal((await decide(a,signal.id,['L1-R1'])).status,409);
 assert.equal((await decide(d,pd.signals[0].id,[],'Neglect')).status,200);
 assert.equal((await state(a)).risks[0].likelihood,3);
 const reassess=(cookie:string,riskId:string,choice='Update',likelihood=4)=>req('/workshop/'+code+'/reassess','POST',cookie,{riskId,choice,likelihood,impact:4,notes:'New evidence challenges our strategic growth assumption.'});
 assert.equal((await reassess(a,'L1-R1')).status,200);assert.equal((await reassess(a,'L1-R1')).status,409);
 const plan={riskId:'L1-R1',title:'Rebase the export growth case',owner:'Commercial Director',dueDate:'2025-04-22',likelihoodReduction:.5,impactReduction:0,notes:'Validate customer commitments and downside forecast.'};
 assert.equal((await req('/workshop/'+code+'/plans','POST',b,plan)).status,409);
 assert.equal((await req('/workshop/'+code+'/plans','POST',a,plan)).status,200);
 assert.equal((await req('/workshop/'+code+'/plans','POST',a,{...plan,title:'Approve gated diversification funding'})).status,200);
 const afterPlan=await state(a);assert.equal(afterPlan.risks[0].likelihood,4);assert.equal(projection(afterPlan.risks[0],afterPlan.plans).likelihood,3.5);
 const planId=afterPlan.plans.find((v:any)=>v.signalIds.length).id;assert.equal((await req('/workshop/'+code+'/plans/'+planId,'PATCH',a,{status:'Done',evidence:''})).status,409);
 assert.equal((await req('/workshop/'+code+'/plans/'+planId,'PATCH',a,{status:'Done',evidence:'Revised growth case approved; customers confirmed volumes.'})).status,200);
 assert.equal((await state(a)).risks[0].likelihood,4);
 assert.equal((await req('/workshop/'+code+'/sources','PUT',a,{sourceIds:['antara']})).status,200);
 await pool.query('UPDATE seminar_sessions SET data=data || $1::jsonb WHERE id=$2',[JSON.stringify({news:[{id:'a1',eventId:'event-1',sourceId:'antara',title:'Tarif AS menekan ekspor Indonesia',summary:'Review the export growth assumptions',publisher:'ANTARA',url:featured.url,publishedAt:new Date().toISOString()},{id:'a2',eventId:'event-1',sourceId:'antara',title:'Corroborating report',summary:'Same event',publisher:'ANTARA',url:featured.url,publishedAt:new Date().toISOString()},{id:'b1',eventId:'event-2',sourceId:'detik',title:'Kebijakan perdagangan berubah',summary:'Source disabled for a',publisher:'detik',url:'https://example.invalid/test',publishedAt:new Date().toISOString()}]}),sessionId]);
 assert.equal((await req('/workshop/host/'+code+'/prepare','POST',a,{mode:'curated'})).status,404);
 const prepared=await req('/workshop/host/'+code+'/prepare','POST',host,{mode:'curated'});assert.equal(prepared.status,200);assert.equal((await prepared.json()).articles,8);
 const pack=await(await req('/workshop/host/'+code,'GET',host)).json();assert.equal(pack.externalMode,'curated');assert.equal(pack.version,scenarioVersion);assert(pack.news.every((n:any)=>Date.parse(n.publishedAt)<=Date.parse(featured.knowledgeCutoff)));assert.equal(pack.sourceHealth.find((v:any)=>v.sourceId==='cnn').count,0);
 // Keep the source-filter/event-grouping fixture for this participant isolation check.
 await pool.query("UPDATE seminar_sessions SET data=jsonb_set(data,'{news}',$1::jsonb) WHERE id=$2",[JSON.stringify([{id:'a1',eventId:'event-1',sourceId:'antara',title:'Tarif AS menekan ekspor Indonesia',summary:'Review the growth assumption',publisher:'ANTARA',url:featured.url,publishedAt:featured.publishedAt,mode:'Historical case replay'},{id:'a2',eventId:'event-1',sourceId:'antara',title:'Corroborating report',summary:'Same event',publisher:'ANTARA',url:featured.url,publishedAt:featured.publishedAt,mode:'Historical case replay'},{id:'b1',eventId:'event-2',sourceId:'detik',title:'Kebijakan perdagangan berubah',summary:'Source disabled for a',publisher:'detik',url:'https://example.invalid/test',publishedAt:featured.publishedAt,mode:'Historical case replay'}]),sessionId]);
 assert.equal((await release('external')).status,200);let ext=await state(a);assert.equal(ext.signals.filter((v:any)=>v.stage==='external').length,1);
 assert.equal((await release('internal')).status,200);const internal=await state(a);assert.equal(internal.signals.filter((v:any)=>v.stage==='internal'&&!v.id.startsWith('implementation-')).length,12);
 const ca=internal.signals.find((v:any)=>v.type==='ca');assert.equal((await decide(a,ca.id,ca.riskIds)).status,409);assert.equal((await decide(a,ca.id,ca.riskIds,'Capture',true)).status,200);
 assert.equal((await reassess(a,ca.riskIds[0],'Keep')).status,200);
 const doc=await req('/workshop/'+code+'/document/'+ca.id,'GET',a);assert.equal(doc.status,200);assert((await doc.text()).includes('Teaching case evidence'));
 assert.equal((await req('/workshop/'+code+'/document/'+ca.id,'GET',d)).status,404);
 const stats=await(await req('/workshop/host/'+code,'GET',host)).json();assert.equal(stats.progress.length,3);assert.equal(stats.progress.find((v:any)=>v.organizationId==='logistics').plans,2);assert.equal(stats.preview.length,3);assert(!JSON.stringify(stats.progress).includes('notes'));
 const implementation=(await state(a)).signals.find((v:any)=>v.id.startsWith('implementation-'));assert(implementation);assert.equal((await decide(a,implementation.id,['L1-R1'])).status,200);assert.equal((await reassess(a,'L1-R1','Update',3)).status,200);const replay=await state(a);assert.equal(replay.risks[0].likelihood,3);assert(replay.plans.some((v:any)=>v.status==='Done'));assert(replay.reviews.length>=2);
 }finally{
 if(sessionId){for(const w of workspaces)await tenant(w,c=>c.query('DELETE FROM seminar_participants WHERE session_id=$1 AND workspace_id=$2',[sessionId,w]));await pool.query('DELETE FROM seminar_sessions WHERE id=$1',[sessionId]);}
 for(const w of workspaces){await pool.query('DELETE FROM guest_sessions WHERE workspace_id=$1',[w]);await pool.query('DELETE FROM workspaces WHERE id=$1',[w]);}
 await new Promise<void>((r,e)=>server.close(err=>err?e(err):r()));await pool.end();
 }
});
