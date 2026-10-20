import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/js/deck-audience.js',import.meta.url),'utf8').replace('export function','function');
function view(search=''){
 const classes=new Set(),handlers={},timers=new Map(),buttons=Object.fromEntries(['editDeck','reading','notes'].map(id=>[id,{hidden:false}]));
 const panel={hover:false,focused:false,matches(){return this.hover;},contains(){return this.focused;}};
 const document={body:{classList:{add(...items){items.forEach(v=>classes.add(v));},remove(v){classes.delete(v);}}},getElementById:id=>buttons[id]||panel,querySelector:selector=>selector==='dialog[open]'?null:panel,addEventListener:(type,fn)=>(handlers[type]??=[]).push(fn)};
 let id=0;const context={document,location:{search},URLSearchParams,matchMedia:()=>({matches:true}),setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:key=>timers.delete(key)};
 vm.runInNewContext(source+';globalThis.audience=setupAudienceView();',context);
 return {audience:context.audience,classes,buttons,panel,fire(type){for(const fn of handlers[type]||[])fn({target:panel});},idle(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());}};
}
test('audience fills the viewport, hides author tools and reveals chrome only on interaction',()=>{
 const v=view('?session=ABC234');assert.equal(v.audience,true);assert(v.classes.has('immersive'));assert(!v.classes.has('audience-chrome-visible'));
 assert(Object.values(v.buttons).every(b=>b.hidden));
 v.fire('pointermove');assert(v.classes.has('audience-chrome-visible'));v.idle();assert(!v.classes.has('audience-chrome-visible'));
 v.fire('pointerdown');v.panel.hover=true;v.idle();assert(v.classes.has('audience-chrome-visible'));
 v.panel.hover=false;v.idle();assert(!v.classes.has('audience-chrome-visible'));
 v.fire('keydown');v.panel.focused=true;v.idle();assert(v.classes.has('audience-chrome-visible'));
 v.fire('pointermove');v.idle();assert(!v.classes.has('audience-chrome-visible'),'mouse input must not pin chrome to a previously focused button');
});
test('presenter links retain their normal controls and view',()=>{
 const v=view('?session=ABC234&present=1');assert.equal(v.audience,false);assert.equal(v.classes.size,0);assert(Object.values(v.buttons).every(b=>!b.hidden));
});
