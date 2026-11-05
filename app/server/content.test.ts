import {test} from 'node:test';
import assert from 'node:assert/strict';
import {contentSchema,defaultContent,activeSlides,sandboxTemplate,contentDeckId} from '../shared/content.js';

test('default package preserves the live 45-slide contract and SIGNAL exercise',()=>{
 const value=contentSchema.parse(defaultContent);
 assert.equal(activeSlides(value).length,45);
 assert.equal(activeSlides(value)[0].key,'cover');
 assert.equal(value.modules.filter(m=>m.demo.kind==='signal').length,1);
 assert.equal(contentDeckId(0),'signal-beyond-compliance-v4-keynote');
 assert.notEqual(contentDeckId(1),contentDeckId(2));
});
test('modules can be removed, reordered and extended with editable dummy apps',()=>{
 const config=structuredClone(defaultContent);
 config.modules.find(m=>m.id==='model')!.enabled=false;
 config.modules.unshift({id:'custom',title:'New material',description:'',enabled:true,slides:[{key:'custom-slide',enabled:true,title:'Practice',body:'Sample',notes:'',layout:'demo',tone:'day'}],demo:{kind:'sandbox',config:structuredClone(sandboxTemplate)}});
 const value=contentSchema.parse(config),slides=activeSlides(value);
 assert.equal(slides[0].key,'custom-slide');
 assert(!slides.some(s=>s.moduleId==='model'));
 assert.equal(defaultContent.modules.find(m=>m.id==='model')!.enabled,true);
});
test('invalid packages cannot publish dangling demos, duplicates or an empty deck',()=>{
 const reject=(change:(config:typeof defaultContent)=>void)=>{const config=structuredClone(defaultContent);change(config);assert.equal(contentSchema.safeParse(config).success,false);};
 reject(c=>c.modules.forEach(m=>m.enabled=false));
 reject(c=>c.modules[0].slides[0].builtin='unknown');
 reject(c=>c.modules[0].slides[0].layout='demo');
 reject(c=>c.modules[1].slides[0].key='cover');
 reject(c=>c.modules[0].id=c.modules[1].id);
 reject(c=>{c.modules[0].demo={kind:'sandbox',config:{...sandboxTemplate,fields:[{id:'x',label:'X',type:'select',options:[]}]}};});
 reject(c=>{c.modules[0].demo={kind:'signal'};});
});
