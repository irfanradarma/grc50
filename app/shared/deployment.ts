// One public frontend, with a separate API in production. No database secrets belong here.
import {resolveSeminarRoute} from './seminarRoutes';
const env=(import.meta as any).env||{};
export const basePath:string=env.BASE_URL||'/';
export const apiOrigin:string=(env.VITE_API_URL||'').replace(/\/$/,'');
export function browserPath(path:string){
 if(basePath==='/')return path;
 const match=path.match(/^\/(admin|audience)\/sessions\/([A-Z0-9]{6})$/);
 if(match)return basePath+match[1]+'/';
 return basePath+path.replace(/^\//,'').replace(/^(admin|audience|join-qr)$/,'$1/');
}
export function frontendRoute(){const url=new URL(location.href);if(basePath!=='/'&&url.pathname.startsWith(basePath))url.pathname='/'+url.pathname.slice(basePath.length);return resolveSeminarRoute(url);}
export const publicBase=()=>new URL(basePath,location.origin).href.replace(/\/$/,'');
export function authHeaders(admin=false):Record<string,string>{const token=admin?sessionStorage.getItem('signal-admin-token'):localStorage.getItem('signal-api-session');return token?{Authorization:'Bearer '+token}:{};}
export function saveApiSession(token?:string){if(token)localStorage.setItem('signal-api-session',token);}
export async function openDocument(path:string){
 const tab=window.open('about:blank','_blank');if(tab)tab.opener=null;
 const selectedSignal=new URLSearchParams(location.search).get('demoApp')==='signal';
 const documentPath=path+(selectedSignal?(path.includes('?')?'&':'?')+'demoApp=signal':'');
 const headers=frontendRoute().kind==='demo'?{Authorization:'Bearer '+(sessionStorage.getItem('signal-demo-token')||'')}:authHeaders();
 try{const response=await fetch(apiOrigin+'/api'+documentPath,{headers});if(!response.ok)throw Error('Document unavailable');
  const url=URL.createObjectURL(new Blob([await response.text()],{type:'text/html'}));if(tab)tab.location.href=url;setTimeout(()=>URL.revokeObjectURL(url),60000);
 }catch{if(tab)tab.document.body.textContent='Unable to open this document. Return to your workspace and try again.';}
}
