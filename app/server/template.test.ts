import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {visibleInMonitoring} from '../shared/newsReview.js';
process.env.NODE_ENV='test';
const {app}=await import('./index.js');
const {pool,tenant}=await import('./db.js');
test('template creates a complete independent workspace once and preserves existing data',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const address=server.address();assert(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}/api`,ids:string[]=[];
 async function req(path:string,cookie='',body?:unknown,method=body===undefined?'GET':'POST'){return fetch(base+path,{method,headers:{Cookie:cookie,'x-hori-request':'1','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}
 try{
 assert.equal((await req('/workspace/template','',{templateId:'public-service-v1'})).status,401);
 const a=await req('/auth/guest','',{}),b=await req('/auth/guest','',{});const wa=await a.json(),wb=await b.json();ids.push(wa.id,wb.id);const ca=a.headers.get('set-cookie')!.split(';')[0],cb=b.headers.get('set-cookie')!.split(';')[0];
 assert.equal((await req('/workspace/template',ca,{templateId:'unknown'})).status,400);
 const attempts=await Promise.all([req('/workspace/template',ca,{templateId:'public-service-v1'}),req('/workspace/template',ca,{templateId:'public-service-v1'})]);assert.deepEqual(attempts.map(r=>r.status).sort(),[201,409]);
 const risks=await (await req('/risks',ca)).json(),objectives=await (await req('/objectives',ca)).json(),workflow=await (await req('/workflow',ca)).json();assert.equal(risks.length,4);assert.equal(objectives.length,3);assert.equal(workflow.kris.length,5);assert.equal(workflow.readings.length,5);assert.equal(workflow.sources.length,15);assert.equal(workflow.signals.length,21);assert.equal(workflow.reviews.length,1);
 const departments=await (await req('/departments',ca)).json(),kpis=await (await req('/objective-kpis',ca)).json();assert.equal(departments.length,7);assert.equal(kpis.length,4);assert(risks.every((r:any)=>r.mitigations.length&&r.mitigations[0].deadline));assert(kpis.every((k:any)=>objectives.some((o:any)=>o.id===k.objectiveId)&&departments.some((d:any)=>d.id===k.departmentId)));assert(objectives.some((o:any)=>kpis.filter((k:any)=>k.objectiveId===o.id).length===2));
 assert(risks.every((r:any)=>objectives.some((o:any)=>o.id===r.objectiveId)));assert(workflow.kris.every((k:any)=>risks.some((r:any)=>r.id===k.riskId)));assert(workflow.signals.some((s:any)=>s.status==='Information'));
 const news=workflow.signals.filter((s:any)=>s.kind==='news');assert.equal(news.length,7);assert.equal(news.filter((s:any)=>s.newsState==='Pending').length,3);assert.equal(news.filter((s:any)=>s.newsState==='Captured').length,3);assert.equal(news.filter((s:any)=>s.newsState==='Neglected').length,1);assert(news.every((s:any)=>s.sample&&workflow.sources.some((source:any)=>source.id===s.sourceId)));assert.equal(news.filter(visibleInMonitoring).length,3);assert(news.filter((s:any)=>s.newsState==='Captured').every((s:any)=>s.notes&&objectives.some((o:any)=>o.id===s.objectiveId)));assert(news.some((s:any)=>s.newsState==='Captured'&&!s.riskId));
 assert.deepEqual(await (await req('/risks',cb)).json(),[]);assert.equal((await req('/workspace/template',cb,{templateId:'public-service-v1'})).status,201);const other=await (await req('/risks',cb)).json();assert(other.every((r:any)=>!risks.some((a:any)=>a.id===r.id)));
 assert.equal((await req('/workspace/template',ca,{templateId:'public-service-v1'})).status,409);assert.deepEqual(await (await req('/risks',ca)).json(),risks);
 const r=risks[0],plan=r.mitigations[0],patch={status:'Done',completionNotes:'Verified delivery routing controls.'};
 assert.equal((await req(`/risks/${r.id}/mitigations/${plan.id}`,cb,patch,'PATCH')).status,404);
 assert.equal((await req(`/risks/${r.id}/mitigations/${plan.id}`,ca,{...patch,status:'Invalid'},'PATCH')).status,400);
 assert.equal((await req(`/risks/${r.id}/mitigations/${plan.id}`,ca,patch,'PATCH')).status,200);
 const updated=(await (await req('/risks',ca)).json()).find((v:any)=>v.id===r.id);assert.equal(updated.mitigations[0].status,'Done');assert.equal(updated.mitigations[0].completionNotes,patch.completionNotes);assert.equal(updated.likelihood,r.likelihood);assert.equal(updated.impactScore,r.impactScore);assert.equal(updated.response,r.response);
 assert.equal((await req(`/risks/${r.id}/mitigations/${plan.id}`,ca,{...patch,status:'Not done'},'PATCH')).status,200);
 const second={...plan,id:randomUUID(),title:'Second action',status:'Not done',likelihoodReduction:.5,impactReduction:.5};
 assert.equal((await req(`/risks/${r.id}/mitigations/${second.id}`,cb,second,'PUT')).status,404);assert.equal((await req(`/risks/${r.id}/mitigations/${second.id}`,ca,{...second,likelihoodReduction:.25},'PUT')).status,400);assert.equal((await req(`/risks/${r.id}/mitigations/${second.id}`,ca,second,'PUT')).status,200);assert.equal((await req(`/risks/${r.id}/mitigations/${second.id}`,ca,{...second,title:'Updated second action'},'PUT')).status,200);assert.equal((await (await req('/risks',ca)).json()).find((v:any)=>v.id===r.id).mitigations.length,2);
 assert.equal((await req(`/risks/${r.id}`,ca,{...r,mitigations:[plan,second]},'PUT')).status,200);
 assert.equal((await req(`/risks/${r.id}`,ca,{...r,mitigations:[{...plan,deadline:'2026-02-30'}]},'PUT')).status,400);
 assert.equal((await req(`/risks/${r.id}/mitigations/${second.id}`,ca,patch,'PATCH')).status,200);
 const multiple=(await (await req('/risks',ca)).json()).find((v:any)=>v.id===r.id);assert.equal(multiple.mitigations.length,2);assert.equal(multiple.mitigations[0].status,plan.status);assert.equal(multiple.mitigations[1].status,'Done');assert.equal(multiple.mitigations[1].likelihoodReduction,.5);assert.equal(multiple.mitigations[1].impactReduction,.5);


 }finally{for(const id of ids){await tenant(id,async c=>{for(const table of ['objective_kpis','organization_departments','suite_records','risk_signals','trigger_sources','risk_reviews','kri_readings','risk_kris','risks','annual_objectives','organization_contexts'])await c.query(`DELETE FROM ${table} WHERE workspace_id=$1`,[id]);});await pool.query('DELETE FROM guest_sessions WHERE workspace_id=$1',[id]);await pool.query('DELETE FROM workspaces WHERE id=$1',[id]);}await new Promise<void>(r=>server.close(()=>r()));await pool.end();}
});
