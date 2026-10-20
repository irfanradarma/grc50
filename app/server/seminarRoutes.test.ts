import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveSeminarRoute,sessionPath,presentationLinks} from '../shared/seminarRoutes.js';
const route=(path:string)=>resolveSeminarRoute(new URL(path,'http://localhost'));

test('mobile walkthroughs use dedicated read-only routes, separate from session roles',()=>{
 for(const key of ['context','menus','capture','assessment','mitigation','protection','internal','ca','dashboard'])assert.equal(route('/audience/walkthrough/'+key).kind,'tour');
 assert.equal(route('/admin/walkthrough/assessment').kind,'notfound');
 assert.equal(route('/audience/walkthrough/unknown').kind,'notfound');
});
test('admin and audience are separate paths and cannot be switched by query flags',()=>{
 assert.equal(route('/admin?mode=participant&view=dashboard').kind,'admin');
 assert.equal(route('/audience?mode=presenter&view=dashboard').kind,'audience');
 assert.equal(route('/admin/sessions/abc234').canonical,'/admin/sessions/ABC234');
 assert.equal(route('/audience/sessions/ABC234').code,'ABC234');
 assert.equal(route('/admin/sessions/bad').kind,'notfound');
 assert.equal(route('/unknown').kind,'notfound');
 assert.equal(sessionPath('audience','abc234'),'/audience/sessions/ABC234');
});
test('root entry uses the audience route; query flags do not open admin controls',()=>{
 assert.equal(route('/').canonical,'/audience');
 assert.equal(route('/?mode=presenter&session=ABC234').canonical,'/audience/sessions/ABC234');
 assert.equal(route('/?view=dashboard').canonical,'/audience');
 assert.equal(route('/join-qr?join=https%3A%2F%2Fexample.com%2Faudience').kind,'qr');
});

test('presenter links retain Admin cookies while audience links use the reachable LAN host',()=>{
 const links=presentationLinks('http://localhost','http://192.168.0.190','ABC234');
 assert.equal(new URL(links.presenter).origin,'http://localhost');assert.equal(new URL(links.presenter).searchParams.get('present'),'1');
 assert.equal(new URL(links.presenter).searchParams.get('join'),'http://192.168.0.190/audience/sessions/ABC234');
 assert.equal(new URL(links.audience).origin,'http://192.168.0.190');assert.equal(new URL(links.audience).searchParams.get('present'),null);
});
