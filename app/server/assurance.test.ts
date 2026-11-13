import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialAssurance,rankUniverse,recommendPlan,approvePlan,createEngagement,auditors,draftProgram,approveProgram,exampleEvidence,draftFinding,patchProject,reviewFinding,generateOutputs,issueReport,exampleSignals,suggestedAssessment,finishRiskReview,projectedScore,slidesHtml,restoreAssurance} from '../shared/assurance';

function approved(){const s=initialAssurance();s.selected=recommendPlan(s).selected;return approvePlan(s,'Audit Manager','Include mandatory work and review exposures within capacity.');}
function reviewed(){let s=createEngagement(approved(),'u-credit',auditors[0]);let p=s.projects[0];p.program=draftProgram(p);p.confirmedCriteria=[...new Set(p.program.flatMap(t=>t.criteria))];p=exampleEvidence(approveProgram(p));p=reviewFinding(patchProject(p,draftFinding(p)));s.projects=[generateOutputs(p)];return s;}

test('annual planning makes risk aggregation and capacity constraints enforceable',()=>{
 const s=initialAssurance(),credit=rankUniverse(s).find(u=>u.id==='u-credit')!;
 assert.equal(credit.meanRisk,12);assert.equal(credit.priority,67.4);
 const proposal=recommendPlan(s);assert(proposal.selected.includes('u-data'));assert(proposal.selected.includes('u-credit'));assert(proposal.used<=s.capacity);
 assert.throws(()=>recommendPlan({...s,capacity:10}),/mandatory/);
 assert.throws(()=>rankUniverse({...s,weights:{...s.weights,risk:60}}),/100/);
 assert.throws(()=>approvePlan({...s,capacity:-1},'Owner','Reason'),/capacity/);
 assert.throws(()=>rankUniverse({...s,year:0}),/year/);
 assert.throws(()=>approvePlan({...s,selected:['u-credit']},'Owner','Reason'),/Mandatory/);
 assert.throws(()=>createEngagement(s,'u-credit',auditors[0]),/approved/);
 const opened=createEngagement(approved(),'u-credit',auditors[0]);assert.throws(()=>createEngagement(opened,'u-credit',auditors[0]),/already/);
});

test('workpapers, reference validation and human review gate generated outputs',()=>{
 let p=createEngagement(approved(),'u-credit',auditors[0]).projects[0];p.program=draftProgram(p);
 assert.throws(()=>approveProgram(p),/criteria/);assert.throws(()=>exampleEvidence(p),/Approve/);assert.throws(()=>generateOutputs(p),/Approve/);
 p.confirmedCriteria=['CR-04','GIAS-14'];p=approveProgram(p);
 assert.throws(()=>draftFinding(p),/evidence/);p=exampleEvidence(p);p=patchProject(p,draftFinding(p));
 assert.match(p.condition,/does not establish/);assert.match(p.cause,/Not established/);
 assert.throws(()=>reviewFinding({...p,due:'2027-02-31'}),/valid action/);
 p=generateOutputs(reviewFinding(p));assert.equal(p.slides.length,6);assert.match(p.report,/8 of 40/);assert.match(p.report,/population|bounded/);
 const changed=patchProject(p,{condition:'Changed conclusion'});assert.equal(changed.reviewed,false);assert.equal(changed.report,'');assert.deepEqual(changed.slides,[]);
 const html=slidesHtml({...p,name:'<script>alert(1)</script>',slides:[{title:'<b>Title</b>',body:'<img src=x onerror=alert(1)>'}]});assert(!html.includes('<script>'));assert(html.includes('&lt;img'));
});

test('issuing a reviewed report sends its actual finding to linked registered risks',()=>{
 const s=reviewed(),next=issueReport(s,s.projects[0].id);assert.equal(next.signals.length,1);assert.equal(next.signals[0].summary,s.projects[0].condition);assert.deepEqual(next.signals[0].riskIds,['credit','collections']);
 assert.equal(issueReport(next,s.projects[0].id).signals.length,1);assert.equal(s.signals.length,0);
 assert.throws(()=>issueReport(initialAssurance(),'missing'),/review/);
});

test('signal review commits decisions, score and planned response together without counting headlines as probability',()=>{
 const s=initialAssurance();s.signals=exampleSignals();const r=s.risks.find(r=>r.id==='collections')!;
 assert.equal(suggestedAssessment(r,s.signals.filter(x=>!x.verified)).likelihood,3);
 assert.equal(suggestedAssessment(r,s.signals).likelihood,4);
 assert.equal(suggestedAssessment(r,[...s.signals,...s.signals]).likelihood,4);
 const input={riskId:r.id,revision:0,decisions:Object.fromEntries(s.signals.map(x=>[x.id,'accept' as const])),likelihood:4,impact:4,reason:'Reviewed evidence challenges the collection assumption.'};
 assert.throws(()=>finishRiskReview(s,{...input,decisions:{}}),/every signal/);
 assert.throws(()=>finishRiskReview(s,input),/response/);assert.equal(s.risks.find(x=>x.id===r.id)!.likelihood,3);assert.deepEqual(s.signals[0].decisions,{});
 assert.throws(()=>finishRiskReview(s,{...input,reason:''}),/reasoning/);
 const next=finishRiskReview(s,{...input,mitigation:{action:'Reconcile commitments and independently approve limits.',owner:'Credit lead',due:'2027-03-31',likelihoodReduction:1,impactReduction:0}}),updated=next.risks.find(x=>x.id===r.id)!;
 assert.equal(updated.likelihood*updated.impact,16);assert.equal(projectedScore(updated),12);assert.equal(updated.mitigations[0].status,'planned');assert.equal(updated.revision,1);
 assert.equal(projectedScore({...updated,mitigations:[...updated.mitigations,{...updated.mitigations[0],id:'overlapping-plan'}]}),12,'Overlapping proposed effects are not silently added together.');
 assert.throws(()=>finishRiskReview(next,input),/changed/);
 const declines={...input,decisions:Object.fromEntries(s.signals.map(x=>[x.id,'decline' as const]))};assert.throws(()=>finishRiskReview(s,declines),/keep the current/);
 const kept=finishRiskReview(s,{...declines,likelihood:3});assert.equal(kept.risks.find(x=>x.id===r.id)!.likelihood,3);
});

test('existing project-only browser work is migrated and malformed stores do not crash the workspace',()=>{
 const migrated=restoreAssurance([{id:'old',name:'Preserved engagement',program:['Inspect approval'],condition:'Saved finding',evidence:'Saved evidence',issued:true,history:['Old event']}]);
 assert.equal(migrated.projects[0].condition,'Saved finding');assert.equal(migrated.projects[0].program[0].evidence,'Saved evidence');assert.equal(migrated.projects[0].reviewed,false);assert(migrated.projects[0].history.includes('Old event'));
 assert.deepEqual(restoreAssurance({...initialAssurance(),risks:[null]}),initialAssurance());
 assert.deepEqual(restoreAssurance(initialAssurance()),initialAssurance());
});
