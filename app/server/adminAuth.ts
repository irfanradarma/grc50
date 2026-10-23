import {Router} from 'express';
import {createHash,randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {z} from 'zod';
import {pool} from './db.js';
import {sharedRoom,adminWorkspace} from './sharedRoom.js';
const derive=promisify(scrypt);
const hash=(v:string)=>createHash('sha256').update(v).digest('hex');
export const adminTokenPrefix=()=> 'signal_admin_'+hash(process.env.ADMIN_PASSWORD_HASH||'').slice(0,16)+'_';
export const currentAdminToken=(token:string)=>token.startsWith(adminTokenPrefix());
export const adminAuth=Router();
const attempts=new Map<string,{count:number;until:number}>();
adminAuth.post('/auth/admin/login',async(req,res)=>{
 const input=z.object({password:z.string().min(1).max(512)}).parse(req.body);
 const configured=process.env.ADMIN_PASSWORD_HASH||'';
 if(!/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(configured))return res.status(503).json({error:'Admin password is not configured on this server.'});
 const ip=req.ip||'unknown',now=Date.now();
 for(const [key,value] of attempts)if(value.until<now)attempts.delete(key);
 const attempt=attempts.get(ip)||{count:0,until:now+15*60_000};
 if(attempt.count>=10)return res.status(429).json({error:'Too many login attempts. Please wait 15 minutes.'});
 attempt.count++;attempts.set(ip,attempt);
 const [,salt,expected]=configured.split('$'),actual=await derive(input.password,salt,64) as Buffer;
 if(!timingSafeEqual(actual,Buffer.from(expected,'hex')))return res.status(401).json({error:'Incorrect admin password.'});
 attempts.delete(ip);await sharedRoom();
 const token=adminTokenPrefix()+randomBytes(32).toString('hex');
 await pool.query("INSERT INTO guest_sessions(token_hash,workspace_id,expires_at) VALUES($1,$2,now()+interval '8 hours')",[hash(token),adminWorkspace]);
 // Cross-origin Pages uses a bearer token kept only in this browser tab's session storage.
 res.json({token,expiresIn:8*3600});
});
export function requireAdmin(_req:any,res:any,next:any){if(!res.locals.admin)return res.status(403).json({error:'Admin login required.'});next();}
