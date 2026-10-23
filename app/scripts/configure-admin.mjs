import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs/promises';
const local=new URL('../.local/',import.meta.url),env=new URL('../.env',import.meta.url);
await fs.mkdir(local,{recursive:true});
const passwordFile=new URL('admin-password.txt',local),hashFile=new URL('admin-password-hash.txt',local);
let password=await fs.readFile(passwordFile,'utf8').catch(error=>{if(error.code==='ENOENT')return null;throw error;});
if(password===null){password=randomBytes(18).toString('base64url');await fs.writeFile(passwordFile,password+'\n',{mode:0o600});}
password=password.replace(/^\uFEFF/,'').replace(/\r?\n$/,'');
if(!password||password.length>512||/[\r\n]/.test(password))throw Error('admin-password.txt must contain one non-empty password line, maximum 512 characters.');
let encoded=(await fs.readFile(hashFile,'utf8').catch(()=> '')).trim();
if(!/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(encoded)||!timingSafeEqual(scryptSync(password,encoded.split('$')[1],64),Buffer.from(encoded.split('$')[2],'hex'))){const salt=randomBytes(16).toString('hex');encoded='scrypt$'+salt+'$'+scryptSync(password,salt,64).toString('hex');}
const original=await fs.readFile(env,'utf8').catch(()=> '');
await fs.writeFile(env,original.replace(/^ADMIN_PASSWORD_HASH=.*(?:\r?\n|$)/gm,'').trimEnd()+'\nADMIN_PASSWORD_HASH="'+encoded+'"\n');
await fs.writeFile(hashFile,encoded+'\n',{mode:0o600});
console.log('Admin password loaded from the private file. Local configuration and the private Render-ready hash file are synchronized. No password was printed.');
