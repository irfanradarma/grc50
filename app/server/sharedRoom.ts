import {randomUUID} from 'node:crypto';
import {pool} from './db.js';
import {featured,scenarioVersion} from '../shared/workshop.js';

// An internal identifier only. Audience links never need a room code.
export const roomCode=process.env.NODE_ENV==='test'?'TSTSIG':'SIGNAL';
export const adminWorkspace=process.env.NODE_ENV==='test'?'b2be9b8b-5725-4b83-aa5c-f3557e6e7ad2':'b2be9b8b-5725-4b83-aa5c-f3557e6e7ad1';
function validate(row:any){if(row.owner_id!==adminWorkspace||row.data.version!==scenarioVersion)throw Error('Shared room requires an explicit version migration');return row;}
export async function sharedRoom(){
 const existing=(await pool.query('SELECT * FROM seminar_sessions WHERE code=$1',[roomCode])).rows[0];
 if(existing)return validate(existing);
 const db=await pool.connect();
 try{
  await db.query('BEGIN');
  await db.query('INSERT INTO workspaces(id,name) VALUES($1,$2) ON CONFLICT DO NOTHING',[adminWorkspace,'SIGNAL seminar control']);
  await db.query('INSERT INTO seminar_sessions(id,code,owner_id,data) VALUES($1,$2,$3,$4) ON CONFLICT(code) DO NOTHING',[randomUUID(),roomCode,adminWorkspace,{version:scenarioVersion,title:'Beyond Compliance',exerciseDate:featured.exerciseDate,released:[],news:[],sourceHealth:[]}]);
  const row=(await db.query('SELECT * FROM seminar_sessions WHERE code=$1',[roomCode])).rows[0];
  validate(row);
  await db.query('COMMIT');return row;
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
}
