import {test} from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='test';
const {app}=await import('./index.js');
const {pool,tenant}=await import('./db.js');
test('template creates a complete independent workspace once and preserves existing data',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const address=server.address();assert(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}/api`,ids:string[]=[];
 async function req(path:string,cookie='',body?:unknown){return fetch(base+path,{method:body===undefined?'GET':'POST',headers:{Cookie:cookie,'x-hori-request':'1','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}
 try{
 assert.equal((await req('/workspace/template','',{templateId:'public-service-v1'})).status,401);
 const a=await req('/auth/guest','',{}),b=await req('/auth/guest','',{});const wa=await a.json(),wb=await b.json();ids.push(wa.id,wb.id);const ca=a.headers.get('set-cookie')!.split(';')[0],cb=b.headers.get('set-cookie')!.split(';')[0];
 assert.equal((await req('/workspace/template',ca,{templateId:'unknown'})).status,400);
 const attempts=await Promise.all([req('/workspace/template',ca,{templateId:'public-service-v1'}),req('/workspace/template',ca,{templateId:'public-service-v1'})]);assert.deepEqual(attempts.map(r=>r.status).sort(),[201,409]);
 const risks=await (await req('/risks',ca)).json(),objectives=await (await req('/objectives',ca)).json(),workflow=await (await req('/workflow',ca)).json();assert.equal(risks.length,4);assert.equal(objectives.length,3);assert.equal(workflow.kris.length,5);assert.equal(workflow.readings.length,5);assert.equal(workflow.sources.length,4);assert.equal(workflow.signals.length,5);assert.equal(workflow.reviews.length,1);
 assert(risks.every((r:any)=>objectives.some((o:any)=>o.id===r.objectiveId)));assert(workflow.kris.every((k:any)=>risks.some((r:any)=>r.id===k.riskId)));assert(workflow.signals.some((s:any)=>s.status==='Information'));
 assert.deepEqual(await (await req('/risks',cb)).json(),[]);assert.equal((await req('/workspace/template',cb,{templateId:'public-service-v1'})).status,201);const other=await (await req('/risks',cb)).json();assert(other.every((r:any)=>!risks.some((a:any)=>a.id===r.id)));
 assert.equal((await req('/workspace/template',ca,{templateId:'public-service-v1'})).status,409);assert.deepEqual(await (await req('/risks',ca)).json(),risks);
 }finally{for(const id of ids){await tenant(id,async c=>{for(const table of ['risk_signals','trigger_sources','risk_reviews','kri_readings','risk_kris','risks','annual_objectives','organization_contexts'])await c.query(`DELETE FROM ${table} WHERE workspace_id=$1`,[id]);});await pool.query('DELETE FROM guest_sessions WHERE workspace_id=$1',[id]);await pool.query('DELETE FROM workspaces WHERE id=$1',[id]);}await new Promise<void>(r=>server.close(()=>r()));await pool.end();}
});
