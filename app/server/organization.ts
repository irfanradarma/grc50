import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {tenant} from './db.js';
export const organization=Router();
const text=z.string().trim().max(3000),id=z.string().uuid();
const department=z.object({name:text.min(1),code:text.max(50).default(''),head:text.default(''),parentId:id.optional()});
const kpi=z.object({objectiveId:id,departmentId:id,name:text.min(1),definition:text.min(1),target:text.min(1),unit:text.default(''),frequency:z.enum(['Monthly','Quarterly','Annually','Weekly']),owner:text.min(1)});
organization.get('/departments',async(_req,res)=>res.json(await tenant(res.locals.workspace.id,async c=>(await c.query('SELECT id,data FROM organization_departments ORDER BY lower(data->>\'name\')')).rows.map(r=>({...r.data,id:r.id})))));
for(const method of ['post','put'] as const)organization[method]('/departments'+(method==='put'?'/:id':''),async(req,res)=>{
 const recordId=method==='put'?id.parse(req.params.id):randomUUID(),data=department.parse(req.body),w=res.locals.workspace.id;
 const result=await tenant(w,async c=>{await c.query('SELECT id FROM workspaces WHERE id=$1 FOR UPDATE',[w]);const rows=(await c.query('SELECT id,data FROM organization_departments')).rows;if(method==='put'&&!rows.some(r=>r.id===recordId))return 'missing';if(rows.some(r=>r.id!==recordId&&r.data.name.toLowerCase()===data.name.toLowerCase()))return 'duplicate';let parent=data.parentId;const visited=new Set([recordId]);while(parent){if(visited.has(parent))return 'cycle';visited.add(parent);const found=rows.find(r=>r.id===parent);if(!found)return 'parent';parent=found.data.parentId;}if(method==='put')await c.query('UPDATE organization_departments SET parent_id=$1,data=$2 WHERE id=$3',[data.parentId||null,data,recordId]);else await c.query('INSERT INTO organization_departments(id,workspace_id,parent_id,data) VALUES($1,$2,$3,$4)',[recordId,w,data.parentId||null,data]);return 'ok';});
 if(result!=='ok')return res.status(result==='missing'?404:result==='duplicate'?409:400).json({error:result==='duplicate'?'A department with this name already exists.':result==='cycle'?'A department cannot report to itself or its descendants.':'Select an existing department in your workspace.'});res.status(method==='post'?201:200).json({...data,id:recordId});
});
organization.get('/objective-kpis',async(_req,res)=>res.json(await tenant(res.locals.workspace.id,async c=>(await c.query('SELECT id,data FROM objective_kpis ORDER BY created_at')).rows.map(r=>({...r.data,id:r.id})))));
for(const method of ['post','put'] as const)organization[method]('/objective-kpis'+(method==='put'?'/:id':''),async(req,res)=>{
 const recordId=method==='put'?id.parse(req.params.id):randomUUID(),data=kpi.parse(req.body),w=res.locals.workspace.id;
 const result=await tenant(w,async c=>{if(method==='put'&&!(await c.query('SELECT 1 FROM objective_kpis WHERE id=$1',[recordId])).rowCount)return 'missing';if(!(await c.query('SELECT 1 FROM annual_objectives WHERE id=$1',[data.objectiveId])).rowCount||!(await c.query('SELECT 1 FROM organization_departments WHERE id=$1',[data.departmentId])).rowCount)return 'link';if(method==='put')await c.query('UPDATE objective_kpis SET objective_id=$1,department_id=$2,data=$3 WHERE id=$4',[data.objectiveId,data.departmentId,data,recordId]);else await c.query('INSERT INTO objective_kpis(id,workspace_id,objective_id,department_id,data) VALUES($1,$2,$3,$4,$5)',[recordId,w,data.objectiveId,data.departmentId,data]);return 'ok';});if(result!=='ok')return res.status(result==='missing'?404:400).json({error:'Select an objective and department from your workspace.'});res.status(method==='post'?201:200).json({...data,id:recordId});
});
