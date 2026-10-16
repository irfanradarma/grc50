import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectRisk} from '../shared/riskProjection.js';
test('mitigation projections preserve initial score, combine fractional effects and respect scale bounds',()=>{
 assert.deepEqual(projectRisk(3,4,[]),{initialScore:12,residualLikelihood:3,residualImpact:4,residualScore:12});
 const p=projectRisk(3,4,[{likelihoodReduction:.5},{likelihoodReduction:.5,impactReduction:.5}]);
 assert.deepEqual(p,{initialScore:12,residualLikelihood:2,residualImpact:3.5,residualScore:7});
 assert.equal(projectRisk(2,2,[{likelihoodReduction:4,impactReduction:4}]).residualScore,1);
});
