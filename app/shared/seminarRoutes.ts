export type SeminarRoute = {kind:'admin'|'audience'|'qr'|'tour'|'notfound';code?:string;canonical?:string};
export function sessionPath(role:'admin'|'audience',_code?:string){return '/'+role;}
export function resolveSeminarRoute(url:URL):SeminarRoute{
 if(/^\/audience\/walkthrough\/(context|menus|capture|assessment|mitigation|protection|internal|ca|dashboard)\/?$/.test(url.pathname))return {kind:'tour'};
 const match=url.pathname.match(/^\/(admin|audience)(?:\/sessions\/([A-Z0-9]{6}))?\/?$/i);
 if(match){const kind=match[1].toLowerCase() as 'admin'|'audience';const canonical=sessionPath(kind);return {kind,canonical};}
 if(/^\/join-qr\/?$/.test(url.pathname))return {kind:'qr'};
 if(url.pathname!=='/')return {kind:'notfound'};
 return {kind:'audience',canonical:'/audience'};
}

export function audienceLink(base:string,_code?:string){return new URL('audience/',base.replace(/\/$/,'')+'/').href;}
export function presentationLinks(adminOrigin:string,audienceBase:string,_code?:string){
 return {presenter:new URL('admin/',adminOrigin.replace(/\/$/,'')+'/').href,audience:new URL('presentation/deck/',audienceBase.replace(/\/$/,'')+'/').href};
}
