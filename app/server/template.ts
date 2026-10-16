import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {tenant} from './db.js';
import {workspaceTemplate} from '../shared/workspaceTemplate.js';
import {seedSuite,seedAdditionalAssurance} from './suite.js';
import {severity} from './workflow.js';
export const templateRouter=Router();
templateRouter.post('/workspace/template',async(req,res)=>{
 if(req.body?.templateId!=='public-service-v1')return res.status(400).json({error:'Unknown workspace template.'});
 const workspace=res.locals.workspace.id,t=workspaceTemplate();
 const seeded=await tenant(workspace,async c=>{
  await c.query('SELECT id FROM workspaces WHERE id=$1 FOR UPDATE',[workspace]);
  if((await c.query('SELECT 1 FROM organization_contexts WHERE workspace_id=$1 UNION ALL SELECT 1 FROM annual_objectives WHERE workspace_id=$1 UNION ALL SELECT 1 FROM risks WHERE workspace_id=$1',[workspace])).rowCount)return false;
  const objectives=new Map<string,string>(),risks=new Map<string,string>(),kris=new Map<string,string>(),sources=new Map<string,string>();
  await c.query('INSERT INTO organization_contexts(workspace_id,data) VALUES($1,$2)',[workspace,t.profile]);
  await c.query('UPDATE workspaces SET name=$1 WHERE id=$2',[t.profile.name,workspace]);
  for(const {key,year,...data} of t.objectives){const id=randomUUID();objectives.set(key,id);await c.query('INSERT INTO annual_objectives(id,workspace_id,year,data) VALUES($1,$2,$3,$4)',[id,workspace,year,data]);}
  for(const {key,objectiveKey,...data} of t.risks){const id=randomUUID(),o=t.objectives.find(o=>o.key===objectiveKey)!;risks.set(key,id);await c.query('INSERT INTO risks(id,workspace_id,data) VALUES($1,$2,$3)',[id,workspace,{...data,objectiveId:objectives.get(objectiveKey),objectiveYear:o.year,objective:o.title+' - '+o.target}]);}
  for(const {key,riskKey,...data} of t.kris){const id=randomUUID(),riskId=risks.get(riskKey)!;kris.set(key,id);await c.query('INSERT INTO risk_kris(id,workspace_id,risk_id,data) VALUES($1,$2,$3,$4)',[id,workspace,riskId,{...data,riskId}]);}
  for(const {kriKey,...data} of t.readings){const id=randomUUID(),k=t.kris.find(k=>k.key===kriKey)!,kriId=kris.get(kriKey)!,riskId=risks.get(k.riskKey)!,r=t.risks.find(r=>r.key===k.riskKey)!,status=severity(k,data.value);await c.query('INSERT INTO kri_readings(id,workspace_id,kri_id,data) VALUES($1,$2,$3,$4)',[id,workspace,kriId,{...data,kriId,status}]);if(status!=='Normal')await c.query('INSERT INTO risk_signals(id,workspace_id,data,dedupe_key) VALUES($1,$2,$3,$4)',[randomUUID(),workspace,{title:`${k.name}: ${status.toLowerCase()} threshold breached`,details:`${data.value} ${k.unit}. ${data.notes}`,observedAt:data.observedAt,riskId,objectiveId:objectives.get(r.objectiveKey),kind:'kri',action:'Reassess',status:'Open',kriId,readingId:id},'kri:'+id]);}
  for(const entry of t.sources){const {key,objectiveKey,...rest}=entry;const riskKey='riskKey' in rest?rest.riskKey:undefined;const {riskKey:_key,...data}=rest as typeof rest&{riskKey?:string};const id=randomUUID();sources.set(key,id);await c.query('INSERT INTO trigger_sources(id,workspace_id,data) VALUES($1,$2,$3)',[id,workspace,{...data,objectiveId:objectives.get(objectiveKey),riskId:riskKey?risks.get(riskKey):undefined}]);}
  for(const {sourceKey,...data} of t.reports){const source=t.sources.find(s=>s.key===sourceKey)!;const riskKey='riskKey' in source?source.riskKey:undefined;await c.query('INSERT INTO risk_signals(id,workspace_id,data) VALUES($1,$2,$3)',[randomUUID(),workspace,{...data,sourceId:sources.get(sourceKey),kind:source.kind,objectiveId:objectives.get(source.objectiveKey),riskId:riskKey?risks.get(riskKey):undefined,action:riskKey?'Reassess':'Identify',status:data.outcome==='Issue'?'Open':'Information'}]);}
  for(const {sourceKey,objectiveKey,riskKey,...data} of t.news){await c.query('INSERT INTO risk_signals(id,workspace_id,data) VALUES($1,$2,$3)',[randomUUID(),workspace,{...data,sourceId:sources.get(sourceKey),objectiveId:objectives.get(objectiveKey),riskId:riskKey?risks.get(riskKey):undefined}]);}
  for(const {riskKey,...data} of t.reviews){const riskId=risks.get(riskKey)!;await c.query('INSERT INTO risk_reviews(id,workspace_id,risk_id,data) VALUES($1,$2,$3,$4)',[randomUUID(),workspace,riskId,{...data,riskId,reviewedAt:new Date().toISOString()}]);}
  const deptIds=Array.from({length:7},()=>randomUUID());
  for(const [i,name] of ['Operasional','Teknologi Informasi','Keamanan Informasi','Layanan Pelanggan','Keuangan & Pengadaan','SDM & Umum','Kepatuhan & Manajemen Risiko'].entries())await c.query('INSERT INTO organization_departments(id,workspace_id,data) VALUES($1,$2,$3)',[deptIds[i],workspace,{name,code:['OPS','TI','SEC','CS','FIN','HR','GRC'][i],head:['Direktur Operasional','Kepala Teknologi','Kepala Keamanan Informasi','Manajer Layanan Pelanggan','Manajer Keuangan','Manajer SDM','Manajer Risiko'][i]}]);
  for(const [i,o] of t.objectives.entries())await c.query('UPDATE annual_objectives SET data=data || $1::jsonb WHERE id=$2',[JSON.stringify({departmentId:deptIds[i]}),objectives.get(o.key)]);
  const measures=[{objectiveKey:'service',dept:0,name:'Pengiriman tepat waktu',definition:'Kiriman tiba sesuai SLA dibagi total kiriman eligible, dikali 100.',target:'Minimal 95%',unit:'%'},{objectiveKey:'service',dept:0,name:'Keberhasilan pengiriman pertama',definition:'Kiriman berhasil pada percobaan pertama dibagi total kiriman eligible, dikali 100.',target:'Minimal 98%',unit:'%'},{objectiveKey:'digital',dept:1,name:'Ketersediaan pelacakan',definition:'Waktu layanan pelacakan tersedia dibagi waktu layanan yang dijanjikan, dikali 100.',target:'Minimal 99,5%',unit:'%'},{objectiveKey:'trust',dept:2,name:'Penyelesaian temuan akses kritis',definition:'Temuan akses kritis selesai dalam tujuh hari dibagi total temuan kritis jatuh tempo, dikali 100.',target:'100% dalam tujuh hari',unit:'%'}];
  for(const m of measures){const {objectiveKey,dept,...data}=m;const objectiveId=objectives.get(objectiveKey),departmentId=deptIds[dept];await c.query('INSERT INTO objective_kpis(id,workspace_id,objective_id,department_id,data) VALUES($1,$2,$3,$4,$5)',[randomUUID(),workspace,objectiveId,departmentId,{...data,objectiveId,departmentId,frequency:'Monthly',owner:['Direktur Operasional','Kepala Teknologi','Kepala Keamanan Informasi'][dept]}]);}
  for(const [i,r] of t.risks.entries()){const deadline=new Date();deadline.setUTCDate(deadline.getUTCDate()+(i===0?-5:14+i*7));const mitigation={likelihoodReduction:.5,impactReduction:i===1?.5:0,id:randomUUID(),title:r.response||'Review and strengthen controls',details:'Synthetic mitigation example: '+r.controls,owner:r.owner,deadline:deadline.toISOString().slice(0,10),status:i===1?'Done':'Not done',completionNotes:i===1?'Sample evidence: configuration reviewed and tested.':''};await c.query('UPDATE risks SET data=data || $1::jsonb WHERE id=$2',[JSON.stringify({mitigations:[mitigation]}),risks.get(r.key)]);}
  await seedSuite(c,workspace);
  await seedAdditionalAssurance(c,workspace);
  return true;
 });
 if(!seeded)return res.status(409).json({error:'Templates can only be applied to an empty workspace. Your existing data was preserved.'});
 res.status(201).json({saved:true,templateId:t.id});
});
