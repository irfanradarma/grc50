import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildKeynote} from './keynote-fixture.mjs';

test('four-section narrative connects the survey evidence to SIGNAL hands-on, AI assurance and SIPT',async()=>{
 const {slides,reference}=await buildKeynote();
 const outline=JSON.parse(fs.readFileSync(new URL('../assets/data/deck-outline.json',import.meta.url),'utf8'));
 assert.equal(reference.slides.length,46);assert.equal(reference.deckId,outline.deckId);
 assert.equal(reference.slides.map(s=>s.key).join('|'),outline.slides.map(s=>s.key).join('|'));
 for(const entry of reference.slides){assert(slides[entry.key],entry.key);assert(!/undefined|NaN|\[object Object\]/.test(slides[entry.key].html),entry.key);}
 const keys=reference.slides.map(s=>s.key),start=keys.indexOf('section-disconnect');
 assert.equal(keys[start+1],'the-foundation');assert(keys.indexOf('evidence-risk-management')<keys.indexOf('section-model'));assert.equal(keys[10],'section-model');assert.equal(keys[11],'ai-risk-cycle');assert.equal(keys[keys.indexOf('ai-risk-cycle')+1],'automation-is-not-integration');
 assert.deepEqual(Array.from(keys.slice(keys.indexOf('ai-and-supervision'),keys.indexOf('ai-and-supervision')+6)),['ai-and-supervision','bridging-auditing-ai','supervise-ai-risks','supervise-ai-oversight','bridging-audit-with-ai','supervisory-technology']);
 assert(slides['bridging-auditing-ai'].html.includes('Auditing<br>'));
 assert(slides['bridging-audit-with-ai'].html.includes('<em class="silver">with AI</em>'));
 reference.slides.forEach((entry,i)=>assert.equal(entry.index,i+1));
 assert.deepEqual(Array.from(reference.chapters,c=>c.id),['disconnect','model','ai-assurance','action']);
 assert(!keys.includes('section-practice'));
 assert(keys.indexOf('what-changed')<keys.indexOf('section-ai-assurance'));
 assert(keys.indexOf('suptech-in-practice')<keys.indexOf('section-action'));
 assert(!keys.includes('the-practical-test'));
 const overview=slides['the-solution-framework'].html;
 assert.equal((overview.match(/<article class="signal-color-/g)||[]).length,6);
 assert(!overview.includes('data-loop'));assert(!overview.includes('data-phase='));
 for(const key of ['evidence-risk-management','evidence-assurance','evidence-how-the-gap-happens']){const entry=reference.slides.find(s=>s.key===key);assert(entry.referenceContext);assert(entry.narrativeConnection);}
 const cycle=slides['ai-risk-cycle'].html;
 for(const phase of ['Identify','Assess','Treat','Monitor'])assert(cycle.includes(phase));
 assert(cycle.includes('Human<br>authority.'));assert(cycle.includes('Validate &#183; approve &#183; own'));assert.equal((cycle.match(/<aside class="cycle-note/g)||[]).length,4);assert(!cycle.includes('data-cycle-loop'));
 assert.equal(reference.slides.filter(s=>slides[s.key].kind==='divider').length,4);
 for(let i=0;i<outline.chapters.length;i++){const entry=reference.slides.find(s=>s.chapter===outline.chapters[i].id);assert.equal(slides[entry.key].kind,'divider');assert(slides[entry.key].html.includes('SECTION 0'+(i+1)+' / 04'));}
});

test('SIPT uses conceptual material only; app screenshots and guides remain confined to the hands-on section',async()=>{
 const {slides,reference}=await buildKeynote();
 for(const entry of reference.slides){
  if(entry.chapter==='action')assert(!/<iframe|data-guide=|data-src=.*walkthrough/.test(slides[entry.key].html),entry.key);
  if(['demo','still-guide','app-overview'].includes(slides[entry.key].kind))assert.equal(entry.chapter,'model',entry.key);
 }
 assert(slides['spit-integrated-framework'].html.includes('spit-framework-original.png'));
 assert(slides['continuous-assurance'].html.includes('Owner confirmation'));
 const keys=Array.from(reference.slides,s=>s.key),cmca=keys.indexOf('cmca-platform');
 assert.deepEqual(keys.slice(cmca,cmca+3),['cmca-platform','continuous-assurance','ai-powered-sipt']);
 for(const text of ['Continuous Monitoring','Continuous Audit','Management tracks','Auditors repeatedly'])assert(slides['cmca-platform'].html.includes(text),text);
 assert(slides['risk-platform'].html.includes('foundation for continuous assurance'));
 assert(!keys.includes('internal-evidence'));assert(!keys.includes('sipt-worked-example'));

 assert(slides['continuous-assurance'].html.includes('System interfaces are outside the scope'));
});

test('editorial archive retains its recorded original entry and outline',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('../assets/keynote/backup-manifest.json',import.meta.url),'utf8'));
 for(const record of manifest.files){const content=fs.readFileSync(new URL('../'+record.path,import.meta.url),'utf8').replace(/\r\n/g,'\n');assert.equal(createHash('sha256').update(content).digest('hex'),record.sha256,record.path);}
 assert.equal(manifest.commit,'e8195617c56d641e49e0a0d998d45350b3dfef2b');
});


test('orientation precedes the news; the alert opens only after exposure is explained',async()=>{
 const {slides,reference}=await buildKeynote(),keys=Array.from(reference.slides,s=>s.key);
 assert.equal(keys[18],'app-overview');
 assert.deepEqual(keys.slice(19,23),['one-real-event','same-event-different-exposure','your-starting-position','the-first-human-decision']);
 for(const menu of ['dashboard','monitoring','trigger'])assert(slides['app-overview'].html.includes('overview-'+menu+'.png'));
 assert(!slides['app-overview'].html.includes('monitoring.png" alt="Open the risk'));
 for(const key of ['your-starting-position','the-first-human-decision','reassessment','a-response-you-can-own','expected-protection','what-changed']){
  const html=slides[key].html;assert.equal((html.match(/class="guide-mark gm-/g)||[]).length,3,key);assert(!html.includes('<iframe'),key);
  const source=html.match(/<image href="([^"]+)"/)[1];assert(fs.existsSync(new URL(source)),key);
 }
});


test('the second slide explains access, desktop and touch navigation without promising audience presenter tools',async()=>{
 const {slides,reference}=await buildKeynote();assert.equal(reference.slides[1].key,'using-the-deck');
 const html=slides['using-the-deck'].html;
 for(const text of ['s.kemenkeu.go.id/signal','COMPUTER','PHONE OR TABLET','Contents','Fullscreen','Presenter mode:','Return to live','data-details','EN / ID','Bahasa Indonesia'])assert(html.includes(text),text);
});
