import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gradeHitl,hitlTargets} from './hitl.js';
import {hitlCards,type HitlPin} from '../shared/hitlDocuments.js';
const correct=():HitlPin[][]=>[[{page:0,x:.5,y:.63}],[{page:1,x:.5,y:.63}],[{page:0,x:.5,y:.28}],[],[]];
test('document practice has five artifacts, a three-page report, and exactly three flawed contents',()=>{assert.equal(hitlCards.length,5);assert.equal(hitlCards[1].pages.length,3);assert.equal(new Set(hitlTargets.map(t=>t.card)).size,3);for(const t of hitlTargets)assert(t.page<hitlCards[t.card].pages.length);});
test('coordinate grading uses document page, position, false positives and duplicate penalties',()=>{
 assert.equal(gradeHitl(correct()),100);assert.equal(gradeHitl([[],[],[],[],[]]),40);
 const wrongPage=correct();wrongPage[1][0].page=0;assert.equal(gradeHitl(wrongPage),80);
 const wrongArea=correct();wrongArea[2][0].x=.1;assert.equal(gradeHitl(wrongArea),80);
 const duplicate=correct();duplicate[0].push({...duplicate[0][0]});assert.equal(gradeHitl(duplicate),95);
 const falsePositive=correct();falsePositive[3].push({page:0,x:.5,y:.5});assert.equal(gradeHitl(falsePositive),95);
 const sprayed=correct();sprayed[4]=Array.from({length:12},()=>({page:0,x:.5,y:.5}));assert.equal(gradeHitl(sprayed),80);
});
