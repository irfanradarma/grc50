import {test} from 'node:test';
import assert from 'node:assert/strict';
import {schema,validateEdits,createHistory} from './deck-editor-model.mjs';
const doc=objects=>({schema,version:'1234abcd',objects});
test('text is declarative and only bounded appearance values survive import',()=>{
 const result=validateEdits(doc({'slide-1:2':{text:'<script>alert(1)</script>',x:3,y:-2,fontSize:40,color:'#abcdef',fontWeight:'800',onclick:'alert(1)',backgroundImage:'url(x)'}}));
 assert.equal(result.objects['slide-1:2'].text,'<script>alert(1)</script>');
 assert.equal(result.objects['slide-1:2'].onclick,undefined);assert.equal(result.objects['slide-1:2'].backgroundImage,undefined);assert.equal(result.version,'1234abcd');
});
test('malformed, excessive and executable style input is rejected',()=>{
 for(const input of [null,{},doc([]),doc({'__proto__x':{}}),doc({'slide-1:1':{x:Infinity}}),doc({'slide-1:1':{fontSize:500}}),doc({'slide-1:1':{color:'url(javascript:x)'}}),doc({'slide-1:1':{width:0}}),doc({'slide-1:1':{text:1}}),{...doc({}),version:'../bad'}])assert.throws(()=>validateEdits(input));
});
test('undo, redo, branch replacement and reset remain isolated snapshots',()=>{
 const h=createHistory(doc({}));h.push(doc({'slide-1:1':{text:'A'}}));h.push(doc({'slide-1:1':{text:'B'}}));assert.equal(h.undo().objects['slide-1:1'].text,'A');assert.equal(h.redo().objects['slide-1:1'].text,'B');h.undo();h.push(doc({'slide-1:1':{text:'C'}}));assert.equal(h.canRedo,false);const snapshot=h.current;snapshot.objects['slide-1:1'].text='mutated';assert.equal(h.current.objects['slide-1:1'].text,'C');h.push(doc({}));assert.deepEqual(h.current.objects,{});assert.equal(h.undo().objects['slide-1:1'].text,'C');
});
