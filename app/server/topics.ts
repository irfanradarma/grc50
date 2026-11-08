import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {pool} from './db.js';
import {sharedRoom,roomCode} from './sharedRoom.js';
import {requireAdmin} from './adminAuth.js';
import {demoBroadcast} from './demoBroadcast.js';
import {topicLibrary,topicInput,topicApplication} from '../shared/topics.js';
import {activeSlides} from '../shared/content.js';
import {invalidatePresentation} from './presentation.js';
export const topicAdmin=Router();topicAdmin.use('/admin/topics',requireAdmin);
topicAdmin.get('/admin/topics',async(_req,res)=>res.json(topicLibrary((await sharedRoom()).data)));
topicAdmin.post('/admin/topics',async(req,res)=>save(req,res,'create'));
topicAdmin.put('/admin/topics/:id',async(req,res)=>save(req,res,'edit'));
topicAdmin.post('/admin/topics/:id/activate',async(req,res)=>save(req,res,'activate'));
async function save(req:any,res:any,action:string){
 const expected=z.number().int().min(0).parse(req.body.expectedRevision),input=action==='activate'?null:topicInput.parse(req.body.topic);
 if(input&&req.params.id!=='beyond-compliance'&&input.config.modules.some(m=>m.enabled&&m.demo.kind==='signal'))return res.status(400).json({error:'Aplikasi SIGNAL terikat pada topik Beyond Compliance.'});
 if(input&&input.config.modules.filter(m=>m.enabled&&m.demo.kind!=='none').length>1)return res.status(400).json({error:'Satu topik hanya memiliki satu aplikasi latihan.'});
 await sharedRoom();const db=await pool.connect();
 try{await db.query('BEGIN');const row=(await db.query('SELECT data FROM seminar_sessions WHERE code=$1 FOR UPDATE',[roomCode])).rows[0],data=row.data,library=structuredClone(topicLibrary(data));
 if(library.revision!==expected){await db.query('ROLLBACK');return res.status(409).json({error:'Library berubah di admin lain. Muat ulang sebelum melanjutkan.'});}
 let topic=library.topics.find(t=>t.id===req.params.id);
 if(action==='create'){if(library.topics.length>=50){await db.query('ROLLBACK');return res.status(400).json({error:'Maksimal 50 topik.'});}topic={id:'topic-'+randomUUID(),title:input!.title,description:input!.description,draft:{...input!.config,title:input!.title},published:null};library.topics.push(topic);}
 else if(!topic){await db.query('ROLLBACK');return res.status(404).json({error:'Topik tidak ditemukan.'});}
 else if(action==='edit'){topic!.publishedDescription??=topic!.description;Object.assign(topic,{title:input!.title,description:input!.description,draft:{...input!.config,title:input!.title}});}
 if(action==='activate'){
  if(data.presentation?.presenting||demoBroadcast.status().active){await db.query('ROLLBACK');return res.status(409).json({error:'Hentikan presentasi dan tayangan aplikasi sebelum mengganti topik aktif.'});}
  // Deck-only edits must not reset the browser's versioned exercise workspace.
  if(JSON.stringify(topic!.published?topicApplication(topic!.published):{kind:'none'})!==JSON.stringify(topicApplication(topic!.draft)))topic!.applicationRevision=(topic!.applicationRevision||0)+1;topic!.publishedDescription=topic!.description;topic!.published=structuredClone(topic!.draft);library.activeTopicId=topic!.id;library.liveRevision++;
  data.presentation={slideKey:activeSlides(topic!.published)[0].key,presenting:false,revision:(data.presentation?.revision||0)+1,updatedAt:new Date().toISOString()};
 }
 library.revision++;await db.query('UPDATE seminar_sessions SET data=data || $1::jsonb WHERE code=$2',[JSON.stringify({topicLibrary:library,...(action==='activate'?{presentation:data.presentation}:{})}),roomCode]);await db.query('COMMIT');invalidatePresentation();res.json(library);
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
}
