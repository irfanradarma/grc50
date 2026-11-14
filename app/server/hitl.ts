import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {pool} from './db.js';
import {sharedRoom} from './sharedRoom.js';
import {requireAdmin} from './adminAuth.js';
import {hitlCards} from '../shared/hitl.js';
const key=[[1],[],[1],[],[1]];
export function gradeHitl(answers:number[][]){return key.reduce((score,expected,i)=>score+(JSON.stringify([...answers[i]].sort())===JSON.stringify(expected)?20:0),0);}
export const hitl=Router();
async function change(fn:(state:any)=>any){const room=await sharedRoom(),db=await pool.connect();try{await db.query('BEGIN');const row=(await db.query('SELECT data FROM seminar_sessions WHERE id=$1 FOR UPDATE',[room.id])).rows[0];const result=fn(row.data.hitl||null);if(result?.save)await db.query("UPDATE seminar_sessions SET data=jsonb_set(data,'{hitl}',$1::jsonb) WHERE id=$2",[JSON.stringify(result.save),room.id]);await db.query('COMMIT');return result.value;}catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}}
function view(s:any,id:string,admin=false){return {id:s?.id,open:!!s?.open,cards:hitlCards,me:s?.players?.[id]||null,...(!s?.open?{leaderboard:Object.values(s?.players||{}).filter((p:any)=>p.finished).sort((a:any,b:any)=>b.score-a.score||a.elapsed-b.elapsed).map((p:any)=>({name:p.name,score:p.score,elapsed:p.elapsed})),explanations:['Anggaran belum disetujui; jaminan 100% tidak didukung.','Tidak ada slop: kesimpulan dibatasi pada sampel.','Seharusnya 75%: 60 dari 80 faktur dibayar.','Tidak ada slop: instruksi sesuai kebijakan.','Korelasi bukan bukti sebab; volume pelanggan juga turun.']}:{}),...(admin?{joined:Object.keys(s?.players||{}).length,finished:Object.values(s?.players||{}).filter((p:any)=>p.finished).length}:{})};}
for(const prefix of ['/hitl','/admin/hitl']){
 if(prefix.startsWith('/admin'))hitl.use(prefix,requireAdmin);
 hitl.get(prefix,async(_req,res)=>res.json(await change(s=>({value:view(s,res.locals.workspace.id,res.locals.admin)}))));
}
hitl.post('/admin/hitl/start',requireAdmin,async(_req,res)=>res.json(await change(s=>{if(s?.open)return {value:view(s,res.locals.workspace.id,true)};const next={id:randomUUID(),open:true,players:{}};return {save:next,value:view(next,res.locals.workspace.id,true)};})));
hitl.post('/admin/hitl/close',requireAdmin,async(_req,res)=>res.json(await change(s=>{if(s)s.open=false;return {save:s,value:view(s,res.locals.workspace.id,true)};})));
hitl.post('/hitl/join',async(req,res)=>{const input=z.object({name:z.string().trim().min(1).max(60),sessionId:z.string().uuid()}).parse(req.body);const value=await change(s=>{if(!s?.open||s.id!==input.sessionId)return {value:null};const id=res.locals.workspace.id;if(!s.players[id]){if(Object.keys(s.players).length>=1000)return {value:null};s.players[id]={name:input.name,started:Date.now(),finished:false};}return {save:s,value:view(s,id)};});res.status(value?200:409).json(value||{error:'Sesi tidak aktif.'});});
hitl.post('/hitl/finish',async(req,res)=>{const input=z.object({sessionId:z.string().uuid(),answers:z.array(z.array(z.number().int().min(0).max(2)).max(3).refine(v=>new Set(v).size===v.length)).length(5)}).parse(req.body);const value=await change(s=>{const p=s?.players?.[res.locals.workspace.id];if(!s?.open||s.id!==input.sessionId||!p||p.finished)return {value:null};Object.assign(p,{finished:true,score:gradeHitl(input.answers),elapsed:Date.now()-p.started});return {save:s,value:view(s,res.locals.workspace.id)};});res.status(value?200:409).json(value||{error:'Sesi ditutup atau jawaban sudah dikirim.'});});
