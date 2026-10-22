import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {completeRiskResponse,responseInput} from './riskResponse.js';
import {setupParticipant,materialize,featured,pendingFor,decisionForRisk,projection} from '../shared/workshop.js';

function fixture(){
 const p=setupParticipant('logistics',['L1'],'Response test',featured.exerciseDate);
 materialize(p,{released:['guided'],exerciseDate:featured.exerciseDate});
 const r=p.risks[0];
 const input={responseId:randomUUID(),baseline:{likelihood:r.likelihood,impact:r.impact,reviewed:[...r.reviewed]},decisions:[{id:p.signals[0].id,decision:'Capture' as const}],assessment:{likelihood:4,impact:4,notes:''},plan:{title:'Validate customer demand and revise growth commitments',owner:'Commercial Director',dueDate:'2025-04-22',likelihoodReduction:1,impactReduction:0,notes:'Verify signed commitments.'}};
 return {p,r,input};
}

test('finish commits signal decisions, score and mitigation together; retry is idempotent',()=>{
 const {p,r,input}=fixture();assert.equal(completeRiskResponse(p,r.id,responseInput.parse(input),'owner').saved,true);
 assert.equal(p.signals[0].decision,'Capture');assert.equal(p.risks[0].likelihood*p.risks[0].impact,16);
 assert.equal(p.reviews.length,1);assert.equal(pendingFor(p,r.id).length,0);
 const residual=projection(p.risks[0],p.plans);assert.equal(residual.likelihood*residual.impact,12);assert.equal(p.reviews[0].after.likelihood*p.reviews[0].after.impact,16);
 const plan=p.plans.find(v=>v.title===input.plan.title)!;assert(plan);assert.deepEqual(plan.signalIds,[p.signals[0].id]);
 assert.equal(completeRiskResponse(p,r.id,input,'owner').replayed,true);assert.equal(p.reviews.length,1);
});

test('missing mitigation, partial decisions and stale assessments never persist half a response',()=>{
 for(const change of ['plan','decisions','baseline'] as const){const {p,r,input}=fixture(),before=structuredClone(p);const payload:any=structuredClone(input);
  if(change==='plan')delete payload.plan;if(change==='decisions')payload.decisions=[];if(change==='baseline')payload.baseline.likelihood=1;
  assert(completeRiskResponse(p,r.id,payload,'owner').error);assert.deepEqual(p,before);
 }
});

test('custom scores require reasoning; within-tolerance review does not require a mitigation',()=>{
 const {p,r,input}=fixture();const payload={...input,assessment:{likelihood:3,impact:4,notes:''},plan:undefined};
 assert(completeRiskResponse(p,r.id,payload,'owner').error);payload.assessment.notes='The signed order book supports retaining current likelihood.';
 assert.equal(completeRiskResponse(p,r.id,payload,'owner').saved,true);assert.equal(p.risks[0].likelihood*p.risks[0].impact,12);assert.equal(p.plans.length,2);
});

test('declining all signals keeps the score and plans unchanged; unknown or duplicate signal IDs fail',()=>{
 const {p,r,input}=fixture(),plans=p.plans.length;
 assert(completeRiskResponse(p,r.id,{...input,decisions:[{id:'unknown',decision:'Capture'}]},'owner').error);
 assert(completeRiskResponse(p,r.id,{...input,decisions:[...input.decisions,...input.decisions]},'owner').error);
 assert.equal(completeRiskResponse(p,r.id,{...input,decisions:[{id:p.signals[0].id,decision:'Neglect'}],assessment:undefined,plan:undefined},'owner').saved,true);
 assert.equal(p.signals[0].decision,'Neglect');assert.equal(p.risks[0].likelihood*p.risks[0].impact,12);assert.equal(p.reviews.length,0);assert.equal(p.plans.length,plans);
});

test('CA evidence requires explicit confirmation and duplicate plan titles roll back the entire response',()=>{
 const {p,r,input}=fixture();p.signals[0].type='ca';const before=structuredClone(p);
 assert(completeRiskResponse(p,r.id,input,'owner').error);assert.deepEqual(p,before);
 const payload={...input,decisions:[{...input.decisions[0],confirmed:true}],plan:{...input.plan,title:typeof p.plans[0].title==='string'?p.plans[0].title:p.plans[0].title.en}};
 assert(completeRiskResponse(p,r.id,payload,'owner').error);assert.deepEqual(p,before);
 assert.equal(completeRiskResponse(p,r.id,{...input,decisions:[{...input.decisions[0],confirmed:true}]},'owner').saved,true);
 assert.equal(p.signals[0].confirmation,'Confirmed');
});

test('a shared signal can be accepted for one risk and declined for another',()=>{
 const {p,r,input}=fixture(),other=p.risks[1];p.signals[0].riskIds.push(other.id);
 assert.equal(completeRiskResponse(p,r.id,input,'owner').saved,true);
 assert.equal(decisionForRisk(p.signals[0],r.id),'Capture');
 assert.equal(decisionForRisk(p.signals[0],other.id),undefined);
 assert.equal(completeRiskResponse(p,other.id,{responseId:randomUUID(),baseline:{likelihood:other.likelihood,impact:other.impact,reviewed:[]},decisions:[{id:p.signals[0].id,decision:'Neglect'}]},'owner').saved,true);
 assert.equal(decisionForRisk(p.signals[0],other.id),'Neglect');assert.equal(p.reviews.length,1);
});
