import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {createDeckTranslator} from '../assets/keynote/deck-language.js';
import {trustQualities} from '../assets/keynote/assurance-story.mjs';
const m=JSON.parse(fs.readFileSync(new URL('../assets/keynote/audit-beyond-topic.json',import.meta.url),'utf8'));
const c=JSON.parse(fs.readFileSync(new URL('../assets/keynote/audit-translations-id.json',import.meta.url),'utf8'));const t=createDeckTranslator(c.strings);
test('every active RSM slide has both languages, including line-broken titles, leads and presenter notes',()=>{
 for(const s of m.slides){for(const value of [s.title,...s.title.split('\n'),s.lead]){if(value==='SIGNAL'||value==='RSM Indonesia')continue;assert.notEqual(t(value,'id'),value,s.key+' '+value);assert.equal(t(value,'en'),value);}assert(s.notesEn.length>80,s.key);assert.equal(c.notes[s.key],s.notes);}
});
test('all seven NIST questions and evidence explanations translate, including panels opened after language selection',()=>{
 for(const row of trustQualities)for(const value of row.slice(0,3))assert.notEqual(t(value,'id'),value,value);
});
test('reference contexts have Indonesian counterparts while source URLs and numerical facts remain stable',()=>{
 for(const [id,s] of Object.entries(m.sources))assert.notEqual(t(s.scope,'id'),s.scope,id);
 for(const value of ['69%','30%','86%','36%','SIGNAL','2024 BCCRT 149','https://www.nist.gov'])assert.equal(t(value,'id'),value);
});
