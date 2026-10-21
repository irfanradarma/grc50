import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/js/deck-audience.js',import.meta.url),'utf8').replace('export function','function');
function view(search=''){
 const classes=new Set(),handlers={},timers=new Map(),buttons=Object.fromEntries(['editDeck','reading','notes'].map(id=>[id,{hidden:false}]));
 const makePanel=()=>({hover:false,focused:false,matches(){return this.hover;},contains(target){return target===this||this.focused;}});
 const panel=makePanel(),bottom=makePanel();
 const document={body:{classList:{add(...items){items.forEach(v=>classes.add(v));},remove(v){classes.delete(v);},contains:v=>classes.has(v)}},getElementById:id=>buttons[id]||panel,querySelector:selector=>selector==='dialog[open]'?null:selector==='.controls'?bottom:panel,addEventListener:(type,fn)=>(handlers[type]??=[]).push(fn)};
 let id=0;const context={document,window:{innerHeight:900},location:{search},URLSearchParams,matchMedia:()=>({matches:true}),setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:key=>timers.delete(key)};
 vm.runInNewContext(source+';globalThis.audience=setupAudienceView();',context);
 return {audience:context.audience,classes,buttons,panel,bottom,fire(type,event={}){for(const fn of handlers[type]||[])fn({target:{},clientY:450,...event});},idle(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());}};
}
test('only edge proximity reveals its corresponding panel; central movement and slide keys do not',()=>{
 const v=view('?session=ABC234');assert.equal(v.audience,true);assert(v.classes.has('immersive'));
 assert(Object.values(v.buttons).every(b=>b.hidden));
 for(const type of ['pointermove','pointerdown'])v.fire(type);
 for(const key of ['ArrowRight','ArrowLeft','PageDown','PageUp',' ','Home','End'])v.fire('keydown',{key});
 assert(!v.classes.has('audience-top-visible'));assert(!v.classes.has('audience-bottom-visible'));
 v.fire('pointermove',{clientY:20});assert(v.classes.has('audience-top-visible'));assert(!v.classes.has('audience-bottom-visible'));
 v.fire('pointermove');v.idle();assert(!v.classes.has('audience-top-visible'));
 v.fire('pointerdown',{clientY:890});assert(v.classes.has('audience-bottom-visible'));assert(!v.classes.has('audience-top-visible'));
 v.fire('pointermove',{target:v.bottom,clientY:850});v.bottom.hover=true;v.idle();assert(v.classes.has('audience-bottom-visible'));
 v.bottom.hover=false;v.idle();assert(!v.classes.has('audience-bottom-visible'));
});
test('Tab retains keyboard access without leaving panels pinned after switching to the mouse',()=>{
 const v=view();v.fire('keydown',{key:'Tab'});v.panel.focused=true;v.idle();assert(v.classes.has('audience-top-visible'));
 v.fire('pointermove');v.idle();assert(!v.classes.has('audience-top-visible'));
});
test('presenter links retain their normal controls and view',()=>{
 const v=view('?session=ABC234&present=1');assert.equal(v.audience,false);assert.equal(v.classes.size,0);assert(Object.values(v.buttons).every(b=>!b.hidden));
});
