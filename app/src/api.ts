import {workspaceTemplate} from '../shared/workspaceTemplate';
import {createClient} from '@supabase/supabase-js';
import {randomContext,randomRisk} from './samples';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const cloudEnabled=Boolean(url&&key);
const db=cloudEnabled?createClient(url,key,{auth:{storageKey:'hori-cloud-session',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}):null;
type Row={id?:string;data:Record<string,any>;year?:number;created_at?:string};
const unpack=(r:Row)=>({...r.data,...(r.id?{id:r.id}:{}),...(r.year?{year:r.year}:{}),...(r.created_at?{createdAt:r.created_at}:{})});
async function result(query:PromiseLike<any>){const {data,error}=await query;if(error)throw new Error(error.message);return data;}
async function owner(){const {data,error}=await db!.auth.getUser();if(error||!data.user)throw new Error('Please enter a guest workspace.');return data.user.id;}
async function rows(table:string){return (await result(db!.from('hori_'+table).select('*').order('created_at',{ascending:false}))).map(unpack);}
async function record(table:string,id:string){const row=await result(db!.from('hori_'+table).select('*').eq('id',id).maybeSingle());if(!row)throw new Error('Record not found in your workspace.');return row;}
async function write(table:string,data:object,columns:object={},id?:string){const query=id?db!.from('hori_'+table).update({data,...columns}).eq('id',id):db!.from('hori_'+table).insert({data,workspace_id:await owner(),...columns});const saved=await result(query.select('*').single());return unpack(saved);}
async function cloud(path:string,method:string,body:any):Promise<any>{
 if(path==='/auth/guest'){const current=await db!.auth.getSession();if(!current.data.session){const {error}=await db!.auth.signInAnonymously();if(error)throw new Error(error.message.includes('disabled')?'Guest sign-in is not enabled in this Supabase project yet.':error.message);}const id=await owner();return result(db!.from('hori_workspaces').upsert({id},{onConflict:'id',ignoreDuplicates:true}).select('*').maybeSingle()).then(async row=>row??result(db!.from('hori_workspaces').select('*').eq('id',id).single()));}
 if(path==='/auth/logout'){const {error}=await db!.auth.signOut({scope:'local'});if(error)throw error;return;}
 const workspace=await owner();
 if(path==='/auth/me'){const row=await result(db!.from('hori_workspaces').select('*').eq('id',workspace).maybeSingle());if(!row)throw new Error('Please enter a guest workspace.');return row;}
 if(path==='/workspace/template'){if(body?.templateId!=='public-service-v1')throw new Error('Unknown template.');return result(db!.rpc('hori_seed_template',{bundle:workspaceTemplate()}));}
 if(path==='/context')return (await result(db!.from('hori_profiles').select('data').eq('workspace_id',workspace).maybeSingle()))?.data??null;
 if(path==='/profile'){await result(db!.from('hori_profiles').upsert({workspace_id:workspace,data:body,updated_at:new Date().toISOString()}));return body;}
 if(path==='/generate/context')return randomContext();
 if(path==='/generate/objective'){const profile=await cloud('/context','GET',null);if(!profile)throw new Error('Save your company profile first.');const title=profile.sector==='Education'?'Improve learning platform availability':profile.sector==='Logistics'?'Improve on-time delivery':['Improve service completion time','Strengthen digital service availability'][Math.floor(Math.random()*2)];return {year:body.year,title,metric:title.includes('availability')?'Service uptime':'Requests completed on time',target:title.includes('availability')?'At least 99% during operating hours':'At least 95% within five working days',owner:'Operations lead'};}
 if(path==='/generate/risk'){const profile=await cloud('/context','GET',null),objective=await record('objectives',body.objectiveId);return {...randomRisk({...profile,objective:objective.data.title+' - '+objective.data.target}),objectiveId:objective.id,objectiveYear:objective.year};}
 if(path==='/objectives'&&method==='GET')return rows('objectives');
 if(/^\/objectives(?:\/[^/]+)?$/.test(path)){const {year,id:_id,...data}=body;return write('objectives',data,{year},path.split('/')[2]);}
 if(path==='/risks'&&method==='GET')return rows('risks');
 if(/^\/risks(?:\/[^/]+)?$/.test(path)){const {id:_id,...data}=body;return write('risks',data,{objective_id:body.objectiveId},path.split('/')[2]);}
 if(path==='/workflow'){const tables=['kris','readings','sources','signals','reviews'];return Object.fromEntries(await Promise.all(tables.map(async t=>[t,await rows(t)])));}
 let match=path.match(/^\/risks\/([^/]+)\/kris$/);if(match)return write('kris',body,{risk_id:match[1]});
 match=path.match(/^\/kris\/([^/]+)$/);if(match)return write('kris',body,{},match[1]);
 match=path.match(/^\/kris\/([^/]+)\/readings$/);if(match)return write('readings',body,{kri_id:match[1]});
 if(/^\/trigger-sources(?:\/[^/]+)?$/.test(path)){const {id:_id,...data}=body;return write('sources',data,{objective_id:body.objectiveId,risk_id:body.riskId||null},path.split('/')[2]);}
 match=path.match(/^\/trigger-sources\/([^/]+)\/reports$/);if(match){const source=await record('sources',match[1]);return write('signals',{...body,sourceId:source.id,kind:source.data.kind,action:source.risk_id?'Reassess':'Identify',status:body.outcome==='Issue'?'Open':'Information'},{source_id:source.id,objective_id:source.objective_id,risk_id:source.risk_id});}
 match=path.match(/^\/trigger-sources\/([^/]+)\/capture$/);if(match){const {data,error}=await db!.functions.invoke('hori-news',{body:{sourceId:match[1]}});if(error){const details=await (error as any).context?.json?.().catch(()=>null);throw new Error(details?.error||error.message);}if(data.error)throw new Error(data.error);return data;}
 match=path.match(/^\/signals\/([^/]+)\/review$/);if(match){const signal=await record('signals',match[1]);return write('signals',{...signal.data,...body,status:'Reviewed',reviewedAt:new Date().toISOString()},{},match[1]);}
 match=path.match(/^\/risks\/([^/]+)\/reviews$/);if(match)return write('reviews',body,{risk_id:match[1]});
 throw new Error('This action is not available in cloud mode.');
}
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{
 if(db)return cloud(path,options.method||'GET',options.body?JSON.parse(String(options.body)):undefined) as Promise<T>;
 const response=await fetch('/api'+path,{...options,headers:{'Content-Type':'application/json','x-hori-request':'1',...options.headers}});
 if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||'The request could not be completed.');}
 return response.status===204?undefined as T:response.json();
}
