import {test} from 'node:test';
import assert from 'node:assert/strict';
import {composeModules} from '../assets/keynote/content-modules.mjs';
const reference={deckId:'deck',chapters:[],slides:[{key:'cover',title:'Old',note:'Old notes',links:[]}]};
const designs={cover:{title:'Old',html:'<h1>Original artwork</h1>'}};
const slide={key:'cover',builtin:'cover',enabled:true,title:'Edited',body:'<script>alert(1)</script>',notes:'New notes',layout:'content',tone:'night'};
test('composed deck follows enabled module order and uses revisioned live identity',()=>{
 const modules=[{id:'off',title:'Off',enabled:false,slides:[slide],demo:{kind:'none'}},{id:'custom',title:'Custom',enabled:true,slides:[slide],demo:{kind:'none'}}];
 const result=composeModules({title:'Package',modules},reference,designs,{revision:3});
 assert.equal(result.reference.deckId,'deck-content-3');
 assert.equal(result.reference.slides.length,1);
 assert.equal(result.reference.slides[0].chapter,'custom');
 assert.equal(result.reference.slides[0].note,'New notes');
 assert(result.renderers.cover.html.includes('&lt;script&gt;'));
 assert(!result.renderers.cover.html.includes('<script>'));
 assert.equal(designs.cover.title,'Old');
});
test('original artwork survives while custom demo references its own module',()=>{
 const config={modules:[{id:'opening',title:'Opening',enabled:true,slides:[{...slide,layout:'original'}],demo:{kind:'none'}},{id:'practice',title:'Practice',enabled:true,slides:[{...slide,key:'practice-slide',layout:'demo'}],demo:{kind:'sandbox',config:{title:'Custom app'}}}]};
 const result=composeModules(config,reference,designs,{appUrl:'https://example.test/base'});
 assert(result.renderers.cover.html.includes('Original artwork'));
 assert(result.renderers['practice-slide'].html.includes('https://example.test/base/modules/?module=practice&amp;embedded=1'));
 assert.equal(result.reference.slides[1].index,2);
 assert.throws(()=>composeModules({modules:[]},reference,designs));
});

test('the intact original topic keeps its designed agenda and section separators',()=>{
 const original={deckId:'deck',chapters:[{id:'chapter',title:'Chapter'}],slides:[{key:'agenda',chapter:null,links:[]},{key:'section',chapter:'chapter',links:[]}]};
 const renderers={agenda:{title:'Agenda',html:'<div>Designed agenda</div>'},section:{title:'Chapter',kind:'divider',html:'<div>Designed separator</div>'}};
 const config={title:'Beyond Compliance',modules:[{id:'opening',enabled:true,slides:[{key:'agenda',builtin:'agenda',enabled:true,layout:'original',title:'Agenda'}],demo:{kind:'none'}},{id:'chapter',title:'Chapter',enabled:true,slides:[{key:'section',builtin:'section',enabled:true,layout:'original',title:'Chapter'}],demo:{kind:'none'}}]};
 const result=composeModules(config,original,renderers,{revision:4});assert.equal(result.renderers.agenda.html,renderers.agenda.html);assert.equal(result.renderers.section.html,renderers.section.html);
});
