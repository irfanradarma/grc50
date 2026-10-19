import {Router} from 'express';
import {z} from 'zod';
import {pool} from './db.js';
import {scenarioVersion} from '../shared/workshop.js';
import outline from '../../website/assets/data/deck-outline.json';

const sessionCode=z.string().regex(/^[A-Z0-9]{6}$/);
const slideKeys=new Set(outline.slides.map(slide=>slide.key));
export const presentationPublic=Router();
export const presentationHost=Router();

// Read-only viewer state is public by session link. No participant records are returned.
presentationPublic.get('/presentation/:code',async(req,res)=>{
 const code=sessionCode.parse(req.params.code);
 const row=(await pool.query("SELECT data->'presentation' AS presentation FROM seminar_sessions WHERE code=$1 AND data->>'version'=$2",[code,String(scenarioVersion)])).rows[0];
 if(!row)return res.status(404).json({error:'Presentation session not found.'});
 res.json({deckId:outline.deckId,slideKey:row.presentation?.slideKey||'cover',updatedAt:row.presentation?.updatedAt||null,published:!!row.presentation});
});

// Mounted after authentication; the query enforces session ownership independently of UI flags.
presentationHost.put('/workshop/host/:code/presentation',async(req,res)=>{
 const code=sessionCode.parse(req.params.code);
 const input=z.object({deckId:z.string(),slideKey:z.string().refine(key=>slideKeys.has(key),'Unknown slide')}).parse(req.body);
 if(input.deckId!==outline.deckId)return res.status(409).json({error:'Reload the presentation to use the current deck version.'});
 const presentation={slideKey:input.slideKey,updatedAt:new Date().toISOString()};
 const saved=await pool.query("UPDATE seminar_sessions SET data=jsonb_set(data,'{presentation}',$1::jsonb) WHERE code=$2 AND owner_id=$3 AND data->>'version'=$4 RETURNING id",[JSON.stringify(presentation),code,res.locals.workspace.id,String(scenarioVersion)]);
 if(!saved.rowCount)return res.status(404).json({error:'Presenter session not found in your workspace.'});
 res.json({deckId:outline.deckId,...presentation,published:true});
});
