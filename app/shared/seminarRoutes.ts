export type SeminarRoute = {kind:'admin'|'audience'|'qr'|'tour'|'notfound';code?:string;canonical?:string};
const sessionCode=(value:string|null)=>value&&/^[A-Z0-9]{6}$/i.test(value)?value.toUpperCase():undefined;
export function sessionPath(role:'admin'|'audience',code?:string){return '/'+role+(code?'/sessions/'+code.toUpperCase():'');}
export function resolveSeminarRoute(url:URL):SeminarRoute{
 if(/^\/audience\/walkthrough\/(context|menus|capture|assessment|mitigation|protection|internal|ca|dashboard)\/?$/.test(url.pathname))return {kind:'tour'};
 const match=url.pathname.match(/^\/(admin|audience)(?:\/sessions\/([A-Z0-9]{6}))?\/?$/i);
 if(match){const kind=match[1].toLowerCase() as 'admin'|'audience',code=sessionCode(match[2]||url.searchParams.get('session'));const canonical=sessionPath(kind,code);return {kind,code,canonical};}
 if(url.pathname==='/join-qr')return {kind:'qr'};
 if(url.pathname!=='/')return {kind:'notfound'};
 return {kind:'audience',code:sessionCode(url.searchParams.get('session')),canonical:sessionPath('audience',sessionCode(url.searchParams.get('session')))};
}

// The presenter stays on the Admin origin so its host-only session cookie is retained.
export function presentationLinks(adminOrigin:string,audienceBase:string,code:string){
 const join=new URL(sessionPath('audience',code),audienceBase).href;
 const presenter=new URL('/presentation/deck/',adminOrigin);presenter.searchParams.set('session',code);presenter.searchParams.set('present','1');presenter.searchParams.set('join',join);
 const audience=new URL('/presentation/deck/',audienceBase);audience.searchParams.set('session',code);
 return {presenter:presenter.href,audience:audience.href};
}
