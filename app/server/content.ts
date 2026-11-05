import {Router} from 'express';
import {z} from 'zod';
import {contentSchema,defaultContent,activeSlides,contentDeckId,type ContentConfig} from '../shared/content.js';
import {pool} from './db.js';
import {sharedRoom,roomCode} from './sharedRoom.js';
import {requireAdmin} from './adminAuth.js';
import {demoBroadcast} from './demoBroadcast.js';

export type ContentSnapshot={revision:number;config:ContentConfig};
export function publishedContent(data:any):ContentSnapshot{return data.content?.published||{revision:0,config:defaultContent};}
export const contentPublic=Router(),contentAdmin=Router();
contentPublic.get('/content',async(_req,res)=>res.json(publishedContent((await sharedRoom()).data)));
contentAdmin.get('/admin/content',requireAdmin,async(_req,res)=>{const data=(await sharedRoom()).data;res.json({draft:data.content?.draft||publishedContent(data).config,draftRevision:data.content?.draftRevision||0,published:publishedContent(data)});});
contentAdmin.put('/admin/content',requireAdmin,async(req,res)=>{
 const input=z.object({expectedRevision:z.number().int().min(0),config:contentSchema,publish:z.boolean().default(false)}).parse(req.body);
 await sharedRoom();const db=await pool.connect();
 try{await db.query('BEGIN');const row=(await db.query('SELECT data FROM seminar_sessions WHERE code=$1 FOR UPDATE',[roomCode])).rows[0];
 const data=row.data,previous=data.content||{},revision=previous.draftRevision||0;
 if(input.expectedRevision!==revision){await db.query('ROLLBACK');return res.status(409).json({error:'Materi berubah di admin lain. Muat ulang sebelum menyimpan.'});}
 if(input.publish&&(data.presentation?.presenting||demoBroadcast.status().active)){await db.query('ROLLBACK');return res.status(409).json({error:'Hentikan presentasi dan tayangan demo sebelum menerbitkan susunan materi.'});}
 const content={...previous,draft:input.config,draftRevision:revision+1};
 if(input.publish){const publishedRevision=(previous.published?.revision||0)+1;content.published={revision:publishedRevision,config:input.config};const slides=activeSlides(input.config);const key=slides.some(s=>s.key===data.presentation?.slideKey)?data.presentation.slideKey:slides[0].key;
 data.presentation={slideKey:key,presenting:false,revision:(data.presentation?.revision||0)+1,updatedAt:new Date().toISOString()};}
 await db.query("UPDATE seminar_sessions SET data=data || $1::jsonb WHERE code=$2",[JSON.stringify({content,...(input.publish?{presentation:data.presentation}:{})}),roomCode]);
 await db.query('COMMIT');res.json({draft:content.draft,draftRevision:content.draftRevision,published:content.published||publishedContent(data)});
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
});
export function presentationOutline(data:any){const snapshot=publishedContent(data);return {deckId:contentDeckId(snapshot.revision),slides:activeSlides(snapshot.config)};}
