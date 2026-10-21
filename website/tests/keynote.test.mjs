import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildKeynote} from './keynote-fixture.mjs';

test('primary live outline matches every Keynote frame and introduces the complete AI risk cycle before the GRC gap',async()=>{
 const {slides,reference}=await buildKeynote();
 const outline=JSON.parse(fs.readFileSync(new URL('../assets/data/deck-outline.json',import.meta.url),'utf8'));
 assert.equal(reference.slides.length,48);assert.equal(reference.deckId,outline.deckId);
 assert.equal(reference.slides.map(s=>s.key).join('|'),outline.slides.map(s=>s.key).join('|'));
 for(const entry of reference.slides){assert(slides[entry.key],entry.key);assert(!/undefined|NaN|\[object Object\]/.test(slides[entry.key].html),entry.key);}
 const keys=reference.slides.map(s=>s.key),start=keys.indexOf('section-disconnect');
 assert.equal(keys[start+1],'ai-risk-cycle');assert.equal(keys[start+2],'automation-is-not-integration');assert.equal(keys[start+3],'the-foundation');
 assert.deepEqual(Array.from(keys.slice(4,10)),['ai-and-supervision','bridging-auditing-ai','supervise-ai-risks','supervise-ai-oversight','bridging-audit-with-ai','supervisory-technology']);
 assert(slides['bridging-auditing-ai'].html.includes('Auditing<br>'));
 assert(slides['bridging-audit-with-ai'].html.includes('<em class="silver">with AI</em>'));
 reference.slides.forEach((entry,i)=>assert.equal(entry.index,i+1));
 const cycle=slides['ai-risk-cycle'].html;
 for(const phase of ['Identify','Assess','Treat','Monitor'])assert(cycle.includes(phase));
 assert(cycle.includes('Human<br>authority.'));assert(cycle.includes('Validate · approve · own'));
 assert.equal(reference.slides.filter(s=>slides[s.key].kind==='divider').length,5);
 for(let i=0;i<outline.chapters.length;i++){const entry=reference.slides.find(s=>s.chapter===outline.chapters[i].id);assert.equal(slides[entry.key].kind,'divider');assert(slides[entry.key].html.includes('SECTION 0'+(i+1)+' / 05'));}
});

test('SIPT uses conceptual material only; app screenshots and guides remain confined to the hands-on section',async()=>{
 const {slides,reference}=await buildKeynote();
 for(const entry of reference.slides){
  if(entry.chapter==='action')assert(!/<iframe|data-guide=|data-src=.*walkthrough/.test(slides[entry.key].html),entry.key);
  if(slides[entry.key].kind==='demo')assert.equal(entry.chapter,'practice',entry.key);
 }
 assert(slides['spit-integrated-framework'].html.includes('spit-framework-original.png'));
 assert(slides['continuous-assurance'].html.includes('Owner confirmation'));
 const keys=Array.from(reference.slides,s=>s.key),cmca=keys.indexOf('cmca-platform');
 assert.deepEqual(keys.slice(cmca,cmca+4),['cmca-platform','internal-evidence','continuous-assurance','ai-powered-sipt']);
 for(const text of ['Continuous Monitoring','Continuous Audit','Management tracks','Auditors repeatedly'])assert(slides['cmca-platform'].html.includes(text),text);
 assert(slides['risk-platform'].html.includes('foundation for continuous assurance'));
 for(const text of ['Owner approves','Act','Verify','Update &amp; monitor','control effectiveness'])assert(slides['sipt-worked-example'].html.includes(text),text);

 assert(slides['continuous-assurance'].html.includes('System interfaces are outside the scope'));
});

test('editorial archive retains its recorded original entry and outline',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('../assets/keynote/backup-manifest.json',import.meta.url),'utf8'));
 for(const record of manifest.files){const content=fs.readFileSync(new URL('../'+record.path,import.meta.url),'utf8').replace(/\r\n/g,'\n');assert.equal(createHash('sha256').update(content).digest('hex'),record.sha256,record.path);}
 assert.equal(manifest.commit,'e8195617c56d641e49e0a0d998d45350b3dfef2b');
});
