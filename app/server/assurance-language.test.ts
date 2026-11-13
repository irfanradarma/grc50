import {test} from 'node:test';import assert from 'node:assert/strict';
import {initialAssurance,criteria,recommendPlan,approvePlan,createEngagement,auditors,draftProgram,approveProgram,exampleEvidence,patchProject,draftFinding,reviewFinding,generateOutputs} from '../shared/assurance';
import catalogue from '../../website/assets/keynote/audit-translations-id.json';
import {createDeckTranslator} from '../../website/assets/keynote/deck-language.js';
const t=createDeckTranslator(catalogue.strings);
test('the assurance catalogue translates seeded risks, objectives, owners and criteria without rewriting source identities',()=>{
 const s=initialAssurance();for(const r of s.risks)for(const text of [r.title,r.objective,r.owner])assert.notEqual(t(text,'id'),text,text);
 for(const u of s.universe)assert.notEqual(t(u.name,'id'),u.name,u.name);
 for(const c of criteria)for(const text of [c.title,c.text])assert.notEqual(t(text,'id'),text,text);
 for(const text of ['SIGNAL','RSM Indonesia','PT Aruna Distribusi Nusantara','2024 BCCRT 149','Client Alpha custom text'])assert.equal(t(text,'id'),text);
});
test('dynamic risk instructions preserve scores and explain tolerance in Indonesian',()=>{
 assert.equal(t('Your score 18 exceeds tolerance 12. Agree a response before finishing.','id'),'Skor Anda 18 melampaui toleransi 12. Sepakati respons sebelum menyelesaikan reviu.');
 assert.equal(t('Likelihood 3, impact 4','id'),'Kemungkinan 3, dampak 4');assert.equal(t('7 signals to review','id'),'7 sinyal perlu ditinjau');
 assert.equal(t('Decision history (12)','id'),'Riwayat keputusan (12)');assert.equal(t('Annual planning','en'),'Annual planning');
});
test('the generated report can be localised while retaining its facts, identifiers and evidence limitations',()=>{
 let s=initialAssurance();s.selected=recommendPlan(s).selected;s=approvePlan(s,'Owner','Review');let p=createEngagement(s,'u-credit',auditors[0]).projects[0];p.program=draftProgram(p);p.confirmedCriteria=[...new Set(p.program.flatMap(x=>x.criteria))];p=exampleEvidence(approveProgram(p));p=generateOutputs(reviewFinding(patchProject(p,draftFinding(p))));
 const id=t(p.report,'id');assert(id.includes('## Tujuan'));assert(id.includes('8 dari 40'));assert(id.includes('tidak membuktikan'));assert(id.includes('Kepala Kredit'));assert(id.includes(p.id));assert(id.includes('CR-04'));assert(!id.includes('## Objective'));assert.equal(t(p.report,'en'),p.report);
});
