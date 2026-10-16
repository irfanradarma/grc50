import 'dotenv/config';
import pg from 'pg';
import {readFile} from 'node:fs/promises';
export const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:10});
export async function migrate(){await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));const workspaces=(await pool.query('SELECT id FROM workspaces')).rows;for(const w of workspaces)await tenant(w.id,c=>c.query("UPDATE risks SET data=data-'status' WHERE data ? 'status'"));}
export async function tenant<T>(workspace:string,fn:(client:pg.PoolClient)=>Promise<T>){const c=await pool.connect();try{await c.query('BEGIN');await c.query("SELECT set_config('app.workspace_id',$1,true)",[workspace]);const result=await fn(c);await c.query('COMMIT');return result;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
