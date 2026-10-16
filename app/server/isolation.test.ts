import {test} from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='test';
const {app}=await import('./index.js');
const {pool,tenant}=await import('./db.js');
test('guest sessions persist private context and risks; foreign writes and direct RLS access fail',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const address=server.address();assert(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}/api`;const ids:string[]=[];
 async function request(path:string,method='GET',cookie='',body?:unknown){return fetch(base+path,{method,headers:{'x-hori-request':'1','Content-Type':'application/json',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});}
 try{
 assert.equal((await request('/context')).status,401);
 const a=await request('/auth/guest','POST'),b=await request('/auth/guest','POST');assert.equal(a.status,201);assert.equal(b.status,201);const wa=await a.json(),wb=await b.json();ids.push(wa.id,wb.id);assert.notEqual(wa.id,wb.id);const ca=a.headers.get('set-cookie')!.split(';')[0],cb=b.headers.get('set-cookie')!.split(';')[0];assert(a.headers.get('set-cookie')!.includes('HttpOnly'));
 assert.equal((await request('/risks','POST',ca,{})).status,400);
 const context=await (await request('/generate/context','POST',ca)).json();context.name='Isolation test organization';assert.equal((await request('/context','PUT',ca,context)).status,200);assert.equal(await (await request('/context','GET',cb)).json(),null);
 const risk=await (await request('/generate/risk','POST',ca)).json();assert.equal(risk.objective,context.objective);const saved=await (await request('/risks','POST',ca,risk)).json();assert(saved.id);assert.equal((await (await request('/risks','GET',ca)).json()).length,1);assert.deepEqual(await (await request('/risks','GET',cb)).json(),[]);
 assert.equal((await request('/risks/'+saved.id,'PUT',cb,{...risk,title:'Forbidden overwrite'})).status,404);
 assert.equal(await tenant(wb.id,async c=>(await c.query('SELECT * FROM risks WHERE id=$1',[saved.id])).rowCount),0);
 await assert.rejects(tenant(wb.id,c=>c.query('INSERT INTO organization_contexts(workspace_id,data) VALUES($1,$2)',[wa.id,context])));
 const role=(await pool.query('SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user')).rows[0];assert.equal(role.rolsuper,false);assert.equal(role.rolbypassrls,false);
 assert.equal((await request('/risks/'+saved.id,'PUT',ca,{...risk,status:'Active'})).status,200);
 assert.equal((await (await request('/risks','GET',ca)).json())[0].status,undefined);
 const migrated=await (await request('/objectives','GET',ca)).json();assert.equal(migrated.length,1);assert.equal(migrated[0].year,2026);assert.equal(migrated[0].title,context.objective);assert.equal((await (await request('/objectives','GET',ca)).json()).length,1);
 const annual={year:2027,title:'Improve service delivery',metric:'Timely completion',target:'At least 97%',owner:'Operations'};
 const objective=await (await request('/objectives','POST',ca,annual)).json();assert(objective.id);assert.deepEqual(await (await request('/objectives','GET',cb)).json(),[]);
 assert.equal((await request('/objectives/'+objective.id,'PUT',cb,annual)).status,404);
 assert.equal(await tenant(wb.id,async c=>(await c.query('SELECT * FROM annual_objectives WHERE id=$1',[objective.id])).rowCount),0);
 assert.equal((await request('/generate/risk','POST',cb,{objectiveId:objective.id})).status,409);
 assert.equal((await request('/profile','PUT',ca,{...context,name:'Updated static profile'})).status,200);assert.equal((await (await request('/objectives','GET',ca)).json()).length,2);
 const linked=await (await request('/generate/risk','POST',ca,{objectiveId:objective.id})).json();assert.equal(linked.objectiveYear,2027);assert.equal(linked.objectiveId,objective.id);assert(linked.objective.includes(annual.target));assert.equal((await request('/risks','POST',ca,linked)).status,201);
 const foreign=await (await request('/context','PUT',cb,context)).json();assert(foreign.name);assert.equal((await request('/generate/risk','POST',cb,{objectiveId:objective.id})).status,400);assert.equal((await request('/risks','POST',cb,linked)).status,400);
 assert.equal((await request('/auth/logout','POST',ca)).status,204);assert.equal((await request('/context','GET',ca)).status,401);
 }finally{for(const id of ids){await tenant(id,async c=>{await c.query('DELETE FROM risks WHERE workspace_id=$1',[id]);await c.query('DELETE FROM annual_objectives WHERE workspace_id=$1',[id]);await c.query('DELETE FROM organization_contexts WHERE workspace_id=$1',[id]);});await pool.query('DELETE FROM guest_sessions WHERE workspace_id=$1',[id]);await pool.query('DELETE FROM workspaces WHERE id=$1',[id]);}await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await pool.end();}
});
