import {randomUUID,createHash} from 'node:crypto';
import {Router} from 'express';
import {z} from 'zod';
import {requireAdmin} from './adminAuth.js';
import {pool} from './db.js';
export type DemoEvent={type:number;timestamp:number;data:any};
const ownerKey=(token:string)=>createHash('sha256').update(token).digest('hex');
export class DemoBroadcast{
 private room:any=null;private meta:DemoEvent|null=null;private events:DemoEvent[]=[];private bytes=0;
 private listeners=new Set<(data:any)=>void>();
 constructor(private now=()=>Date.now()){}
 status(){if(this.room&&this.now()-this.room.heartbeat>20_000)this.stop();return this.room?{active:true,streamId:this.room.id,width:this.room.width,height:this.room.height}:{active:false,streamId:null};}
 mine(token:string){return !!this.room&&this.room.owner===ownerKey(token);}
 start(token:string){this.status();if(this.room&&!this.mine(token))return null;if(this.room)return this.status();this.room={id:randomUUID(),owner:ownerKey(token),width:1280,height:800,heartbeat:this.now()};this.meta=null;this.events=[];this.bytes=0;this.emit({kind:'start',...this.status()});return this.status();}
 stop(token?:string){if(token&&!this.mine(token))return;this.room=null;this.meta=null;this.events=[];this.bytes=0;this.emit({kind:'stop'});}
 append(token:string,id:string,events:DemoEvent[]){this.status();if(!this.room||!this.mine(token)||id!==this.room.id)return false;this.room.heartbeat=this.now();
  for(const event of events){if(event.type===4){this.meta=event;this.room.width=Math.max(320,Math.min(3840,Number(event.data?.width)||1280));this.room.height=Math.max(240,Math.min(2160,Number(event.data?.height)||800));}
   if(event.type===2){this.events=this.meta?[this.meta]:[];this.bytes=JSON.stringify(this.events).length;}
   if(this.events.length||event.type===2){this.events.push(event);this.bytes+=JSON.stringify(event).length;}
   if(this.bytes>8_000_000){this.stop();return false;}
  }
  if(events.length)this.emit({kind:'events',streamId:id,events});return true;
 }
 bootstrap(){return {kind:'bootstrap',...this.status(),events:this.events};}
 subscribe(fn:(data:any)=>void){this.listeners.add(fn);return()=>{this.listeners.delete(fn);};}
 private emit(data:any){for(const listener of this.listeners){try{listener(data);}catch{this.listeners.delete(listener);}}}
}
export const demoBroadcast=new DemoBroadcast();
export const demoPublic=Router(),demoAdmin=Router();
demoPublic.get('/demo/stream',(req,res)=>{
 res.set({'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.flushHeaders();
 let blocked=false,pending:string[]=[],pendingBytes=0;
 const send=(data:any)=>{if(res.destroyed||res.writableEnded)return;const message='data: '+JSON.stringify(data)+'\n\n';if(blocked){pendingBytes+=message.length;if(pendingBytes>1_000_000){res.end();return;}pending.push(message);}else blocked=!res.write(message);};
 res.on('drain',()=>{blocked=false;while(pending.length&&!blocked&&!res.writableEnded){const message=pending.shift()!;pendingBytes-=message.length;blocked=!res.write(message);}});
 send(demoBroadcast.bootstrap());const unsubscribe=demoBroadcast.subscribe(send);
 const timer=setInterval(()=>{demoBroadcast.status();if(!blocked&&!res.writableEnded)blocked=!res.write(': heartbeat\n\n');},5000);
 res.on('close',()=>{clearInterval(timer);unsubscribe();});
});
demoAdmin.get('/admin/demo/status',requireAdmin,(_req,res)=>res.json({...demoBroadcast.status(),mine:demoBroadcast.mine(res.locals.sessionToken)}));
demoAdmin.post('/admin/demo/start',requireAdmin,(_req,res)=>{const result=demoBroadcast.start(res.locals.sessionToken);if(!result)return res.status(409).json({error:'Another admin is presenting. Stop the current demo before starting yours.'});res.json({...result,mine:true});});
demoAdmin.post('/admin/demo/stop',requireAdmin,(req,res)=>{const input=z.object({streamId:z.string().uuid().optional()}).parse(req.body||{});if(input.streamId&&input.streamId!==demoBroadcast.status().streamId)return res.status(409).json({error:'This demonstration has already ended.'});demoBroadcast.stop();res.json({active:false});});
const event=z.object({type:z.number().int().min(0).max(6),timestamp:z.number().finite(),data:z.any()}).passthrough();
demoAdmin.post('/admin/demo/events',requireAdmin,(req,res)=>{const input=z.object({streamId:z.string().uuid(),events:z.array(event).max(1000)}).parse(req.body);if(!demoBroadcast.append(res.locals.sessionToken,input.streamId,input.events as DemoEvent[]))return res.status(409).json({error:'Demo broadcast ended or belongs to another admin.'});res.json({saved:true});});
demoAdmin.post('/admin/demo/workspace',requireAdmin,async(_req,res)=>{
 const {randomBytes}=await import('node:crypto'),id=randomUUID(),token=randomBytes(32).toString('hex'),db=await pool.connect();
 try{await db.query('BEGIN');await db.query('INSERT INTO workspaces(id,name) VALUES($1,$2)',[id,'SIGNAL presenter demonstration']);await db.query("INSERT INTO guest_sessions(token_hash,workspace_id,expires_at) VALUES($1,$2,now()+interval '30 days')",[ownerKey(token),id]);await db.query('COMMIT');res.json({token});}catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
});
