import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {root,buildSlides} from './deck-fixture.mjs';
import {validateEdits} from '../assets/js/deck-editor-model.mjs';

test('SIGNAL migrates browser sessions and edit backups without overwriting newer choices',()=>{
 const values={'hori-host-v3':'ABC123','hori-language-v2':'id','signal-language-v2':'en','hori-deck-edits-v1-previous-revision':'backup'};
 const storage={...values,getItem(key){return this[key]??null;},setItem(key,value){this[key]=value;}};
 const source=fs.readFileSync(path.join(root,'website/assets/js/brand-storage.js'),'utf8');
 vm.runInNewContext(source,{localStorage:storage});
 assert.equal(storage['signal-host-v3'],'ABC123');assert.equal(storage['signal-language-v2'],'en');
 assert.equal(storage['signal-deck-edits-v1-previous-revision'],'backup');assert.equal(storage['hori-host-v3'],'ABC123');
 vm.runInNewContext(source,{localStorage:storage});assert.equal(storage['signal-host-v3'],'ABC123');
 assert.doesNotThrow(()=>vm.runInNewContext(source,{get localStorage(){throw Error('Unavailable');}}));
 assert.equal(validateEdits({schema:'hori-deck-edits/v1',objects:{}}).schema,'signal-deck-edits/v1');
});

test('SIGNAL branding reaches the deck and loops are enabled on first entry',async()=>{
 const slides=await buildSlides();
 assert(slides[0].html.includes('SIGNAL / Evidence. Judgment. Action.'));
 assert(slides[0].html.includes('Memaksimalkan Potensi AI dalam<br>Mengawal Strategi dan Risiko Organisasi'));
 const pain=slides.find(s=>s.section==='OUR PAIN POINT');
 assert(pain.html.includes('data-enabled="true"'));assert(pain.html.includes('Pause the loop'));
 const framework=fs.readFileSync(path.join(root,'website/assets/js/seminar-framework.js'),'utf8');
 assert(framework.includes('let playing=true'));
 const motion=fs.readFileSync(path.join(root,'website/assets/js/seminar-motion.js'),'utf8');
 assert(motion.includes("gallery.dataset.userPaused='false'"));assert(motion.includes("type:'signal-tour'"));
 for(const slide of slides)assert(!/\bHORI\b|\bhori\./.test(slide.html));
});
