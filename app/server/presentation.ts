import {Router} from 'express';
import {z} from 'zod';
import {pool} from './db.js';
import {sharedRoom,roomCode} from './sharedRoom.js';
import {requireAdmin} from './adminAuth.js';
import {demoBroadcast} from './demoBroadcast.js';
import outline from '../../website/assets/data/deck-outline.json';
const slideKeys=new Set(outline.slides.map(slide=>slide.key));
export const presentationPublic=Router(),presentationHost=Router();
function state(p:any){const key=slideKeys.has(p?.slideKey)?p.slideKey:'cover';return {deckId:outline.deckId,slideKey:key,slideNumber:outline.slides.findIndex(s=>s.key===key)+1,total:outline.slides.length,revision:p?.revision||0,updatedAt:p?.updatedAt||null,published:!!p};}
let snapshot:Promise<any>|undefined,snapshotUntil=0;
presentationPublic.get('/presentation/:code',async(req,res)=>{
 if(!['live',roomCode].includes(String(req.params.code)))return res.status(404).json({error:'Presentation not found.'});
 if(!snapshot||Date.now()>snapshotUntil){snapshotUntil=Date.now()+200;snapshot=sharedRoom().then(room=>state(room.data.presentation)).catch(error=>{snapshot=undefined;throw error;});}
 res.json({...await snapshot,demo:demoBroadcast.status()});
});
async function save(req:any,res:any,navigate=false){
 if(demoBroadcast.status().active)return res.status(409).json({error:'Hide the live app before changing slides.'});
 const input=navigate?z.object({direction:z.enum(['next','previous'])}).parse(req.body):z.object({deckId:z.string(),slideKey:z.string().refine(key=>slideKeys.has(key),'Unknown slide'),expectedRevision:z.number().int().min(0)}).parse(req.body);
 if('deckId' in input&&input.deckId!==outline.deckId)return res.status(409).json({error:'Reload the presentation to use the current deck version.'});
 await sharedRoom();const db=await pool.connect();
 try{
  await db.query('BEGIN');
  const row=(await db.query('SELECT data FROM seminar_sessions WHERE code=$1 FOR UPDATE',[roomCode])).rows[0];
  const current=state(row.data.presentation);
  if('expectedRevision' in input&&input.expectedRevision!==current.revision){await db.query('ROLLBACK');return res.status(409).json({error:'Another admin moved the deck. The latest position has been restored.',...current});}
  const slideKey='direction' in input?outline.slides[Math.max(0,Math.min(outline.slides.length-1,current.slideNumber-1+(input.direction==='next'?1:-1)))].key:input.slideKey;
  const next={slideKey,revision:current.revision+1,updatedAt:new Date().toISOString()};
  await db.query("UPDATE seminar_sessions SET data=jsonb_set(data,'{presentation}',$1::jsonb) WHERE code=$2",[JSON.stringify(next),roomCode]);
  await db.query('COMMIT');snapshot=undefined;res.json(state(next));
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
}
presentationHost.put('/admin/presentation',requireAdmin,(req,res)=>save(req,res));
presentationHost.post('/admin/presentation/navigate',requireAdmin,(req,res)=>save(req,res,true));
presentationHost.put('/workshop/host/:code/presentation',requireAdmin,(req,res)=>save(req,res));
