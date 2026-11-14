import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {demoAppIds,audienceDemoUrl,getDemoApp} from './demo-apps.mjs';
test('live modal links to each selected participant app and preserves dismissal until the next stream',async()=>{
 const nodes=[];
 const element=tag=>{const node={tag,children:[],classList:{add(){},remove(){}},append(...children){this.children.push(...children);},setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}};nodes.push(node);return node;};
 const stage=element('main'),body=element('body'),document={body,createElement:element,getElementById:()=>stage};
 const context=vm.createContext({document,window:{SIGNAL_HOSTING:{frontendUrl:'https://example.test/grc50'}},location:{origin:'https://example.test'},audienceDemoUrl,getDemoApp,mountLiveDemo:()=>()=>{}});
 const source=(await readFile(new URL('./live-demo-overlay.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'').replace('export function','function');
 vm.runInContext(source+';globalThis.overlay=createLiveDemoOverlay();',context);
 const dialog=nodes.find(n=>n.tag==='dialog'),link=nodes.find(n=>n.tag==='a'),back=nodes.find(n=>n.tag==='button');
 for(const appId of demoAppIds){
  context.overlay.update({active:true,streamId:appId,appId});
  assert.equal(link.href,audienceDemoUrl(appId,'https://example.test/grc50'));assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');assert(dialog.open);
  back.onclick();assert.equal(dialog.open,false);context.overlay.update({active:true,streamId:appId,appId});assert.equal(dialog.open,false);
 }
 context.overlay.update({active:false});assert.equal(link.href,undefined);assert.equal(stage.inert,false);
});
