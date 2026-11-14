import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gradeHitl} from './hitl.js';
test('three flawed outputs and two sound outputs require exact markings',()=>{
 assert.equal(gradeHitl([[1],[],[1],[],[1]]),100);
 assert.equal(gradeHitl([[],[],[],[],[]]),40);
 assert.equal(gradeHitl([[0,1,2],[0,1,2],[0,1,2],[0,1,2],[0,1,2]]),0);
 assert.equal(gradeHitl([[0,1],[],[1],[],[1]]),80);
});
