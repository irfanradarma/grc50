import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dataHandlingKinds,evaluateDataUse,renderDataHandlingSlide,renderSweetSpotResult} from '../assets/keynote/data-handling.mjs';
const all={authority:true,terms:true,access:true,review:true};
const cleared={workflow:'cli',account:'approved',checks:all};

test('changing the work method changes the necessary context without claiming safety',()=>{
 assert.equal(evaluateDataUse({...cleared,task:'exceptions',payload:'template'}).state,'insufficient');
 const split=evaluateDataUse({...cleared,task:'exceptions',workflow:'split',payload:'template'});
 assert.equal(split.state,'candidate');assert.equal(split.minimum,'template');assert(split.why.includes('run it yourself'));
 assert.equal(evaluateDataUse({...cleared,task:'exceptions',workflow:'split',payload:'excerpt'}).state,'minimise');
 assert.equal(evaluateDataUse({...cleared,task:'finding',workflow:'split',payload:'template'}).state,'insufficient');
 for(const [task,payload] of [['structure','template'],['exceptions','excerpt'],['finding','excerpt']]){
  const result=evaluateDataUse({...cleared,task,payload});assert.equal(result.state,'candidate');assert(result.sufficient);assert(result.minimal);assert(result.message.includes('rules still apply'));
 }
});
test('paid personal accounts, unchecked controls and unreviewed packs are not cleared',()=>{
 for(const workflow of ['web','cli','split'])assert.equal(evaluateDataUse({...cleared,workflow,account:'unknown',task:'exceptions',payload:'excerpt'}).state,'pending');
 for(const task of ['structure','exceptions','finding'])assert.equal(evaluateDataUse({...cleared,task,payload:'full'}).state,'minimise');
 for(const key of Object.keys(all)){const r=evaluateDataUse({...cleared,task:'exceptions',payload:'excerpt',checks:{...all,[key]:false}});assert.equal(r.state,'pending');assert.equal(r.missing.length,1);}
 assert.notEqual(evaluateDataUse({...cleared,task:'exceptions',payload:'excerpt',checks:Object.fromEntries(Object.keys(all).map(k=>[k,'true']))}).state,'candidate');
 assert.doesNotThrow(()=>evaluateDataUse({task:'__proto__',payload:'toString',workflow:'constructor',account:'toString'}));
});
test('one location lesson refreshes chatbot and CLI use without retaining a six-slide tutorial',()=>{
 const material=JSON.parse(fs.readFileSync(new URL('../assets/keynote/audit-beyond-topic.json',import.meta.url),'utf8'));
 const lessons=material.slides.filter(s=>dataHandlingKinds.includes(s.kind));assert.equal(lessons.length,1);assert.equal(lessons[0].kind,'data-routes');
 const html=renderDataHandlingSlide(lessons[0]);assert.equal((html.match(/data-dh-route-choice=/g)||[]).length,2);assert(html.includes('data-dh-route-panel="cli" hidden'));assert(html.includes('A copy of your document'));assert(html.includes('Information the agent reads'));assert(html.includes('Original remains on your computer'));
 assert.equal(renderDataHandlingSlide({kind:'unrelated'}),null);
 assert(renderSweetSpotResult({...cleared,task:'exceptions',payload:'excerpt'}).html.includes('A possible sweet spot'));
});

test('location journeys distinguish the original from online copies and expose movement controls',()=>{
 const material=JSON.parse(fs.readFileSync(new URL('../assets/keynote/audit-beyond-topic.json',import.meta.url),'utf8'));
 for(const kind of ['data-chat-cli','data-agent-loop','data-local-workflow']){
  const html=renderDataHandlingSlide({kind,key:'test-'+kind});
  for(const label of ['ON YOUR COMPUTER','CLOUD / INTERNET','data-dh-motion-toggle','data-dh-motion-replay','dh-local-file','dh-cloud-copy'])assert(html.includes(label),kind+' '+label);
  assert(html.includes('does not identify a storage country'));
  assert(html.includes('not a public posting'));
 }
 const css=fs.readFileSync(new URL('../assets/keynote/data-handling.css',import.meta.url),'utf8');
 assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes('18s linear infinite'));
});
