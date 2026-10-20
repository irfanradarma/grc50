import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tours,tourBeatMs} from '../shared/walkthrough.js';
import {resolveSeminarRoute} from '../shared/seminarRoutes.js';

test('every desktop guide has a paced sequence and explicit focus targets',()=>{
 assert.equal(Object.keys(tours).length,9);
 assert.equal(tourBeatMs,2800);
 for(const [key,steps] of Object.entries(tours)){
  assert.equal(resolveSeminarRoute(new URL('http://localhost:5173/audience/walkthrough/'+key)).kind,'tour');
  assert.equal(steps.length,4,key);
  assert.equal(new Set(steps.map(step=>step.title)).size,steps.length,key);
  for(const step of steps){assert(step.title&&step.instruction&&step.target);assert(!/undefined|NaN/.test(JSON.stringify(step)));}
 }
 assert(tours.capture[2].instruction.includes('optional'));
 assert(tours.assessment[2].instruction.includes('your own score'));
 assert(tours.protection[2].instruction.includes('never reduces'));
 assert(tours.ca[2].instruction.includes('denominator'));
});
