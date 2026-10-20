import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {allowedOrigins,cloudCors,sessionToken} from './cloud.js';
import {audienceLink,presentationLinks,resolveSeminarRoute} from '../shared/seminarRoutes.js';
test('Pages session links, deck links and QR joins retain the repository base path',()=>{
 const base='https://irfanradarma.github.io/grc50';
 assert.equal(audienceLink(base,'ABC234'),base+'/audience/?session=ABC234');
 const links=presentationLinks(base,base,'ABC234');
 assert.equal(new URL(links.presenter).pathname,'/grc50/presentation/deck/');
 assert.equal(new URL(links.presenter).searchParams.get('join'),base+'/audience/?session=ABC234');
 assert.equal(resolveSeminarRoute(new URL('https://example.com/join-qr/')).kind,'qr');
});
test('only configured cross-origin frontends pass preflight; bearer authentication is independent of cookies',async()=>{
 const origin='https://irfanradarma.github.io';allowedOrigins.add(origin);
 const server=express().use(cloudCors).get('/test',(_req,res)=>res.json({ok:true})).listen(0,'127.0.0.1');
 await new Promise<void>(resolve=>server.on('listening',resolve));
 const port=(server.address() as any).port;
 try{
  const good=await fetch(`http://127.0.0.1:${port}/test`,{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Headers':'authorization,x-signal-request'}});
  assert.equal(good.status,204);assert.equal(good.headers.get('access-control-allow-origin'),origin);
  assert.match(good.headers.get('access-control-allow-headers')||'',/Authorization/);
  assert.match(good.headers.get('access-control-allow-methods')||'',/PATCH/);
  const bad=await fetch(`http://127.0.0.1:${port}/test`,{headers:{Origin:'https://untrusted.example'}});assert.equal(bad.status,403);
  assert.equal(sessionToken({get:()=> 'Bearer private-session',cookies:{signal_session:'different-cookie'}} as any),'private-session');
 }finally{allowedOrigins.delete(origin);server.close();}
});
