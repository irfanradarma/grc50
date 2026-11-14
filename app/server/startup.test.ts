import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkDatabase} from './startup.js';
test('startup tolerates temporary capacity exhaustion but is bounded',async()=>{
 let calls=0,waits=0;
 await checkDatabase(async()=>{if(++calls<3)throw {code:'53300'};},async()=>{waits++;});
 assert.equal(calls,3);assert.equal(waits,2);
 await assert.rejects(checkDatabase(async()=>{throw new Error('wrong schema');},async()=>{assert.fail('must not retry configuration errors');}));
 calls=0;await assert.rejects(checkDatabase(async()=>{calls++;throw {code:'53300'};},async()=>{},2));assert.equal(calls,2);
});
