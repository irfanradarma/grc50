import {test} from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='test';
const {app}=await import('./index.js');
const {pool,tenant}=await import('./db.js');
test('departments and multiple objective KPIs persist with workspace isolation and acyclic structure',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const address=server.address();assert(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}/api`,ids:string[]=[];
 const req=(path:string,cookie='',body?:unknown,method=body===undefined?'GET':'POST')=>fetch(base+path,{method,headers:{Cookie:cookie,'x-hori-request':'1','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 try{
  assert.equal((await req('/departments')).status,401);
  const a=await req('/auth/guest','',{}),b=await req('/auth/guest','',{});ids.push((await a.json()).id,(await b.json()).id);const ca=a.headers.get('set-cookie')!.split(';')[0],cb=b.headers.get('set-cookie')!.split(';')[0];
  const d=await (await req('/departments',ca,{name:'Operations',head:'Director'})).json(),child=await (await req('/departments',ca,{name:'Delivery',parentId:d.id})).json(),foreign=await (await req('/departments',cb,{name:'External'})).json();
  assert.equal((await req('/departments',ca,{name:'operations'})).status,409);
  assert.equal((await req('/departments/'+d.id,ca,{name:'Operations',parentId:child.id},'PUT')).status,400);
  assert.equal((await req('/departments',ca,{name:'Invalid',parentId:foreign.id})).status,400);
  assert.equal((await req('/departments/'+d.id,cb,{name:'Changed'},'PUT')).status,404);
  await req('/profile',ca,{name:'Test organization',sector:'Logistics',description:'Demo',stakeholders:'Customers',dependencies:'Delivery',appetite:'Low'},'PUT');
  const objective=await (await req('/objectives',ca,{year:2026,title:'Reliable delivery',metric:'',target:'95% on time',owner:'Director',departmentId:d.id})).json();assert(objective.id);
  const measure={objectiveId:objective.id,departmentId:d.id,name:'On-time delivery',definition:'On-time deliveries divided by all deliveries',target:'95',unit:'%',frequency:'Monthly',owner:'Director'};
  assert.equal((await req('/objective-kpis',ca,measure)).status,201);assert.equal((await req('/objective-kpis',ca,{...measure,name:'First attempt success',departmentId:child.id})).status,201);
  assert.equal((await req('/objective-kpis',cb,measure)).status,400);assert.equal((await req('/objective-kpis',ca,{...measure,departmentId:foreign.id})).status,400);
  const saved=await (await req('/objective-kpis',ca)).json();assert.equal(saved.length,2);assert(saved.every((k:any)=>k.objectiveId===objective.id));assert.deepEqual(await (await req('/objective-kpis',cb)).json(),[]);
  assert.equal((await req('/objective-kpis/'+saved[0].id,cb,measure,'PUT')).status,404);
  assert.equal((await req('/departments/'+d.id,ca,{name:'Operations renamed'},'PUT')).status,200);assert.equal((await (await req('/objective-kpis',ca)).json())[0].departmentId,d.id);
  await assert.rejects(tenant(ids[0],c=>c.query('INSERT INTO objective_kpis(id,workspace_id,objective_id,department_id,data) VALUES(gen_random_uuid(),$1,$2,$3,$4)',[ids[0],objective.id,foreign.id,measure])),/foreign key/);
 }finally{for(const id of ids){await tenant(id,async c=>{for(const table of ['objective_kpis','organization_departments','annual_objectives','organization_contexts'])await c.query(`DELETE FROM ${table} WHERE workspace_id=$1`,[id]);});await pool.query('DELETE FROM guest_sessions WHERE workspace_id=$1',[id]);await pool.query('DELETE FROM workspaces WHERE id=$1',[id]);}await new Promise<void>(r=>server.close(()=>r()));await pool.end();}
});
