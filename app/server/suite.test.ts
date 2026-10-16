import {test} from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='test';
const {app}=await import('./index.js');
const {pool,tenant}=await import('./db.js');
test('connected incident, audit and automated assurance workflows preserve ownership and evidence',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const address=server.address();assert(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}/api`,ids:string[]=[];
 async function req(path:string,cookie='',body?:unknown,method=body===undefined?'GET':'POST'){return fetch(base+path,{method,headers:{Cookie:cookie,'x-hori-request':'1','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}
 try{
 const a=await req('/auth/guest','',{}),b=await req('/auth/guest','',{});const wa=await a.json(),wb=await b.json();ids.push(wa.id,wb.id);const ca=a.headers.get('set-cookie')!.split(';')[0],cb=b.headers.get('set-cookie')!.split(';')[0];
 assert.equal((await req('/workspace/template',ca,{templateId:'public-service-v1'})).status,201);
 let data=await(await req('/suite',ca)).json();assert.equal(data.audit.length,3);assert.equal(data.check.length,6);assert.equal(data.anomaly.length,11);assert.equal(data.audit.filter((p:any)=>p.status==='Reported').length,2);
 assert.deepEqual(await(await req('/suite',cb)).json(),{incident:[],audit:[],check:[],anomaly:[]});
 const check=data.check[0],r=(await(await req('/risks',ca)).json()).find((r:any)=>r.id===check.riskId);const incident={title:'Delivery incident',riskId:r.id,details:'Operational evidence',observedAt:'2026-10-11',evidence:'IR-001',reporter:'Operations'};
 assert.equal((await req('/suite/incidents',cb,incident)).status,400);assert.equal((await req('/suite/incidents',ca,incident)).status,201);
 const source={name:'CA check',kind:'assurance',riskId:r.id,objectiveId:r.objectiveId,rule:'Exceptions above threshold'};
 assert.equal((await req('/trigger-sources',ca,source)).status,400);assert.equal((await req('/trigger-sources',ca,{...source,riskId:undefined,connection:'api',system:'Test',endpoint:'hori://test',eventTypes:'exception'})).status,400);
 const saved=await(await req('/trigger-sources',ca,{...source,connection:'api',system:'Test',endpoint:'hori://test',eventTypes:'exception'})).json();assert(saved.id);assert.equal((await req('/trigger-sources/'+saved.id+'/reports',ca,incident)).status,400);
 assert.equal((await(await req('/suite/checks/run',ca,{})).json()).added,0);
 const anomaly=data.anomaly.find((v:any)=>v.status==='Pending');assert.equal((await req('/suite/anomalies/'+anomaly.id+'/confirm',cb,{decision:'Confirmed',reason:'Verified',reviewer:'Owner'})).status,404);
 assert.equal((await req('/suite/anomalies/'+anomaly.id+'/confirm',ca,{decision:'Confirmed',reason:'',reviewer:'Owner'})).status,400);
 const confirmations=await Promise.all([req('/suite/anomalies/'+anomaly.id+'/confirm',ca,{decision:'Confirmed',reason:'Verified source record',reviewer:'Owner'}),req('/suite/anomalies/'+anomaly.id+'/confirm',ca,{decision:'Confirmed',reason:'Concurrent review',reviewer:'Owner'})]);assert.deepEqual(confirmations.map(r=>r.status).sort(),[200,409]);
 let workflow=await(await req('/workflow',ca)).json();const signals=workflow.signals.filter((s:any)=>s.evidence==='Synthetic assurance dataset / '+anomaly.id);assert.equal(signals.length,1);assert.equal(signals[0].riskId,anomaly.riskId);assert.equal(signals[0].status,'Open');
 assert.equal((await req('/suite/anomalies/'+anomaly.id+'/confirm',ca,{decision:'Resolved',reason:'Corrective action verified',reviewer:'Owner'})).status,200);
 const falsePositive=data.anomaly.find((v:any)=>v.status==='Pending'&&v.id!==anomaly.id);assert.equal((await req('/suite/anomalies/'+falsePositive.id+'/confirm',ca,{decision:'False positive',reason:'Comparison evidence outside tested dataset',reviewer:'Owner'})).status,200);
 workflow=await(await req('/workflow',ca)).json();assert.equal(workflow.signals.find((s:any)=>s.id===signals[0].id).status,'Reviewed');assert(!workflow.signals.some((s:any)=>s.evidence==='Synthetic assurance dataset / '+falsePositive.id));
 await req('/suite/checks/'+check.id,ca,{enabled:false},'PUT');data=await(await req('/suite',ca)).json();assert.equal(data.check.find((c:any)=>c.id===check.id).enabled,false);assert.equal((await req('/suite/checks/'+check.id,cb,{enabled:true},'PUT')).status,404);
 const project=data.audit.find((p:any)=>p.status!=='Reported');assert.equal((await req('/suite/audits/'+project.id+'/report',cb,{})).status,404);assert.equal((await req('/suite/audits/'+project.id+'/report',ca,{})).status,200);assert.equal((await req('/suite/audits/'+project.id+'/report',ca,{})).status,409);assert.equal((await req('/suite/audits/'+project.id,ca,project,'PUT')).status,409);
 const draft={title:'New audit',owner:'Auditor',riskIds:[r.id],scope:'Validate controls',program:[{id:'p1',procedure:'Inspect evidence',evidence:'',result:'',conclusion:''}],report:{summary:'',finding:'',recommendation:'',managementResponse:''}};
 assert.equal((await req('/suite/audits',cb,draft)).status,400);const created=await(await req('/suite/audits',ca,draft)).json();assert(created.id);assert.equal((await req('/suite/audits/'+created.id+'/report',ca,{})).status,409);
 assert.equal((await req('/suite/audits/'+created.id,ca,{...draft,program:[{id:'p1',procedure:'Inspect evidence',evidence:'WP-1',result:'Gap observed',conclusion:'Follow-up needed'}],report:{summary:'Summary',finding:'Gap',recommendation:'Correct control',managementResponse:'Agreed'}},'PUT')).status,200);assert.equal((await req('/suite/audits/'+created.id+'/report',ca,{})).status,200);
 assert.equal(await tenant(wb.id,async c=>(await c.query('SELECT * FROM suite_records')).rowCount),0);
 }finally{for(const id of ids){await tenant(id,async c=>{for(const table of ['objective_kpis','organization_departments','suite_records','risk_signals','trigger_sources','risk_reviews','kri_readings','risk_kris','risks','annual_objectives','organization_contexts'])await c.query(`DELETE FROM ${table} WHERE workspace_id=$1`,[id]);});await pool.query('DELETE FROM guest_sessions WHERE workspace_id=$1',[id]);await pool.query('DELETE FROM workspaces WHERE id=$1',[id]);}await new Promise<void>(r=>server.close(()=>r()));await pool.end();}
});
