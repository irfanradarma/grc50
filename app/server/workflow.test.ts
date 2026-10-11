import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseNews,publicAddress} from './news.js';
import {severity} from './workflow.js';
process.env.NODE_ENV='test';
const {app}=await import('./index.js');
const {pool,tenant}=await import('./db.js');
test('news parsing and public-address restrictions',()=>{
 assert.equal(publicAddress('127.0.0.1'),false);assert.equal(publicAddress('10.20.30.40'),false);assert.equal(publicAddress('169.254.169.254'),false);assert.equal(publicAddress('::ffff:127.0.0.1'),false);assert.equal(publicAddress('8.8.8.8'),true);
 assert.equal(parseNews('<rss><channel><item><title>Supply disruption</title><link>https://example.com/news</link><description>Delay</description></item></channel></rss>','rss')[0].title,'Supply disruption');
 assert.equal(parseNews('<feed><entry><title>Event</title><link href="https://example.com/event"/></entry></feed>','rss')[0].url,'https://example.com/event');
 assert.equal(parseNews('{"articles":[{"title":"Event","url":"javascript:alert(1)"}]}','json')[0].url,'');
 assert.throws(()=>parseNews('<!DOCTYPE rss><rss/>','rss'));
 assert.equal(severity({direction:'Below',warning:95,critical:90},89),'Critical');
});
test('KRI monitoring and trigger review persist with tenant isolation',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const address=server.address();assert(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}/api`,workspaces:string[]=[];
 async function req(path:string,method='GET',cookie='',body?:unknown){return fetch(base+path,{method,headers:{Cookie:cookie,'x-hori-request':'1','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}
 try{
 const a=await req('/auth/guest','POST'),b=await req('/auth/guest','POST');const wa=await a.json(),wb=await b.json();workspaces.push(wa.id,wb.id);const ca=a.headers.get('set-cookie')!.split(';')[0],cb=b.headers.get('set-cookie')!.split(';')[0];
 const profile={name:'Workflow test',sector:'Logistics',description:'Delivery',stakeholders:'Customers',dependencies:'Suppliers',appetite:'Low'};await req('/profile','PUT',ca,profile);
 const objective=await (await req('/objectives','POST',ca,{year:2026,title:'Deliver on time',metric:'Delivery rate',target:'95%',owner:'Operations'})).json();
 const draft=await (await req('/generate/risk','POST',ca,{objectiveId:objective.id})).json();const risk=await (await req('/risks','POST',ca,draft)).json();
 const definition={name:'Late delivery',unit:'%',owner:'Operations',frequency:'Weekly',direction:'Above',warning:5,critical:10};
 const kri=await (await req('/risks/'+risk.id+'/kris','POST',ca,definition)).json();assert(kri.id);
 assert.equal((await req('/risks/'+risk.id+'/kris','POST',cb,definition)).status,404);
 assert.equal((await req('/risks/'+risk.id+'/kris','POST',ca,{...definition,critical:1})).status,400);
 assert.equal((await req('/kris/'+kri.id+'/readings','POST',cb,{value:12,observedAt:'2026-10-11',notes:'Delay'})).status,404);
 await req('/kris/'+kri.id+'/readings','POST',ca,{value:12,observedAt:'2026-10-11',notes:'Supplier delays'});
 let workflow=await (await req('/workflow','GET',ca)).json();assert.equal(workflow.signals[0].action,'Reassess');assert.equal(workflow.readings[0].status,'Critical');
 const source={name:'Supplier incident',kind:'manual_incident',objectiveId:objective.id,riskId:risk.id,rule:'Escalate supplier delays'};
 assert.equal((await req('/trigger-sources','POST',cb,source)).status,400);
 const saved=await (await req('/trigger-sources','POST',ca,source)).json();assert(saved.id);
 const report={title:'Supplier outage',details:'Delivery target exposed',observedAt:'2026-10-11',evidence:'Report 001',outcome:'Issue'};
 assert.equal((await req('/trigger-sources/'+saved.id+'/reports','POST',cb,report)).status,404);
 assert.equal((await req('/trigger-sources/'+saved.id+'/reports','POST',ca,report)).status,201);
 await req('/trigger-sources/'+saved.id+'/reports','POST',ca,{...report,title:'Normal report',outcome:'Normal'});
 const assurance=await (await req('/trigger-sources','POST',ca,{...source,name:'Daily delivery assurance',kind:'assurance',riskId:undefined,rule:'Flag late deliveries above 5%',cadence:'Daily'})).json();
 await req('/trigger-sources/'+assurance.id+'/reports','POST',ca,report);
 workflow=await (await req('/workflow','GET',ca)).json();assert(workflow.signals.some((s:any)=>s.action==='Identify'));assert(workflow.signals.some((s:any)=>s.status==='Information'));assert.equal(workflow.kris.length,1);
 const signal=workflow.signals.find((s:any)=>s.riskId===risk.id&&s.status==='Open');assert.equal((await req('/signals/'+signal.id+'/review','POST',cb,{decision:'Dismissed',notes:'Invalid'})).status,404);
 await req('/signals/'+signal.id+'/review','POST',ca,{decision:'Reassessment requested',notes:'Investigate supplier resilience'});
 await req('/risks/'+risk.id+'/reviews','POST',ca,{decision:'Further investigation',notes:'Validate alternative suppliers'});
 const news=await (await req('/trigger-sources','POST',ca,{...source,name:'Unsafe endpoint test',kind:'news',format:'json',endpoint:'https://127.0.0.1/private'})).json();
 assert.equal((await req('/trigger-sources/'+news.id+'/capture','POST',ca,{})).status,400);
 const other=await (await req('/workflow','GET',cb)).json();assert.deepEqual(other,{kris:[],readings:[],sources:[],signals:[],reviews:[]});
 assert.equal(await tenant(wb.id,async c=>(await c.query('SELECT * FROM risk_signals')).rowCount),0);
 workflow=await (await req('/workflow','GET',ca)).json();assert.equal(workflow.reviews.length,1);assert.equal(workflow.signals.find((s:any)=>s.id===signal.id).status,'Reviewed');
 }finally{for(const workspace of workspaces){await tenant(workspace,async c=>{for(const table of ['risk_signals','trigger_sources','risk_reviews','kri_readings','risk_kris','risks','annual_objectives','organization_contexts'])await c.query(`DELETE FROM ${table} WHERE workspace_id=$1`,[workspace]);});await pool.query('DELETE FROM guest_sessions WHERE workspace_id=$1',[workspace]);await pool.query('DELETE FROM workspaces WHERE id=$1',[workspace]);}await new Promise<void>(r=>server.close(()=>r()));await pool.end();}
});
