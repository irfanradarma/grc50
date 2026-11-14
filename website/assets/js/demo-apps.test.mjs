import {test} from 'node:test';
import assert from 'node:assert/strict';
import {demoAppIds,demoApps,demoAppPath,audienceDemoUrl} from './demo-apps.mjs';
test('all three demo applications have stable, separate participant and presenter routes',()=>{
 assert.deepEqual(demoAppIds,['signal','ams','continuous-risk']);
 for(const app of demoApps){
  const participant=new URL(audienceDemoUrl(app.id,'https://example.test/grc50'));
  assert.equal(participant.pathname,'/grc50/audience/');
  assert.equal(participant.searchParams.get('demoApp'),app.id);
  assert.equal(participant.searchParams.get('workspace'),app.workspace);
  assert(demoAppPath(app.id,'admin').startsWith('/admin/demo/?'));
  assert(!participant.href.includes('token'));assert(!participant.href.includes('/admin/'));
 }
 assert.equal(audienceDemoUrl('https://evil.test','https://example.test/grc50/'),'https://example.test/grc50/audience/?demoApp=signal');
});
