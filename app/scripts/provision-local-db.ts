import {randomBytes} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import pg from 'pg';
const local=new URL('../.local/',import.meta.url);
await mkdir(local,{recursive:true});
let password:string;try{password=(await readFile(new URL('admin-password.txt',local),'utf8')).trim();}catch{password=randomBytes(32).toString('hex');await writeFile(new URL('admin-password.txt',local),password+'\n');}
execFileSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',fileURLToPath(new URL('./start-local-db.ps1',import.meta.url))],{stdio:'inherit'});
const admin=new pg.Client({host:'127.0.0.1',port:5433,user:'hori_admin',password,database:'postgres'});await admin.connect();
const appPassword=randomBytes(32).toString('hex');
if(!(await admin.query("SELECT 1 FROM pg_roles WHERE rolname='hori_app'")).rowCount)await admin.query(`CREATE ROLE hori_app LOGIN PASSWORD '${appPassword}' NOSUPERUSER NOBYPASSRLS`);else await admin.query(`ALTER ROLE hori_app PASSWORD '${appPassword}'`);
if(!(await admin.query("SELECT 1 FROM pg_database WHERE datname='hori_workspace'")).rowCount)await admin.query("CREATE DATABASE hori_workspace OWNER hori_app ENCODING 'UTF8' TEMPLATE template0");
await admin.query("ALTER DATABASE hori_workspace SET timezone TO 'Asia/Jakarta'");
await admin.end();await writeFile(new URL('../.env',import.meta.url),`PORT=3001\nDATABASE_URL=postgresql://hori_app:${appPassword}@127.0.0.1:5433/hori_workspace\n`);console.log('App-local PostgreSQL configured on loopback port 5433.');
