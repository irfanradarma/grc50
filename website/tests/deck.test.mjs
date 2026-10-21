import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {buildSlides,root} from './deck-fixture.mjs';

test('the archived editorial seminar retains its story, research and strategic exercise',async()=>{
 const slides=await buildSlides();assert.equal(slides.length,44);
 assert.equal(slides[1].section,'YOUR SPEAKERS');
 assert(slides[1].html.indexOf('alt="Reza Rizky Pratama"')<slides[1].html.indexOf('alt="Teuku Raja Irfan Radarma"'));
 assert(slides[1].html.includes('reza-rizky-pratama-cutout.png'));
 assert(slides[1].html.includes('Teuku Raja')&&slides[1].html.includes('Irfan Radarma')&&slides[1].html.includes('Reza Rizky')&&slides[1].html.includes('Pratama'));
 assert.equal(slides[0].title,'Beyond Compliance');assert(slides[0].html.includes('d-simple-cover'));assert(slides[0].html.includes('https://s.kemenkeu.go.id/signal'));assert(slides[0].html.includes('HORI) KE-80'));assert(slides[0].html.includes('Living Side by Side with AI:'));assert(slides[0].html.includes('The Good and The Bad'));
 assert.equal(slides.filter(s=>s.type.includes('d-research-slide')).length,3);
 assert(!slides.some(s=>/CARILLION|WHAT WAS MISSING/.test(s.section)));
 for(const slide of slides)assert(!/Carillion|\b\d+[-\u2013]?\d* (minutes?|min)\b|data-countdown/i.test(slide.html+slide.section+slide.note));
 const framework=slides.find(slide=>slide.section==='THE SOLUTION FRAMEWORK');assert(framework.html.includes('data-signal-framework'));
 assert.equal((framework.html.match(/data-framework-select=/g)||[]).length,6);
 assert(!framework.html.includes('<dialog'));
 for(const image of ['antara-news-headline.jpg','antara-news-body.jpg'])assert(slides.find(s=>s.section==='ONE REAL EVENT').html.includes(image));
 assert(slides.find(slide=>slide.section==='SAME EVENT, DIFFERENT EXPOSURE').html.includes('45%')&&slides.find(slide=>slide.section==='SAME EVENT, DIFFERENT EXPOSURE').html.includes('60%'));
 assert.equal(slides.filter(s=>s.html.includes('data-live-tour')).length,9);
 assert(slides.find(s=>s.section==='SPIT / INTEGRATED CONTROL FRAMEWORK').html.includes('spit-framework-original.png'));
 assert(!slides.find(s=>s.section==='SPIT / INTEGRATED CONTROL FRAMEWORK').html.includes('Adapted from'));
 for(const slide of slides.filter(s=>s.html.includes('data-live-tour')))assert(slide.html.includes('Desktop app walkthrough:'));
 for(const slide of slides.filter(s=>s.html.includes('data-live-tour')))for(const control of ['data-tour-prev','data-tour-next','data-tour-replay','data-tour-progress'])assert(slide.html.includes(control));
 for(const slide of slides){assert(!/undefined|NaN|\[object Object\]/.test(slide.html),slide.title);assert(!/Bekasi|late dispatch|data-tour-video/.test(slide.html),slide.title);}
});

test('every local asset used by the final deck exists after cleanup',async()=>{
 const slides=await buildSlides(),files=['website/deck/index.html',...fs.readdirSync(path.join(root,'website/assets/css')).map(name=>'website/assets/css/'+name)];
 let checked=0;
 for(const slide of slides)for(const match of slide.html.matchAll(/(?:src|href|poster|data-src)="(\.\.\/assets\/[^"?]+)(?:\?[^" ]*)?"/g)){assert(fs.existsSync(path.resolve(root,'website/deck',match[1])),match[1]);checked++;}
 for(const name of files){const file=path.join(root,name),text=fs.readFileSync(file,'utf8');
  for(const match of text.matchAll(/(?:src|href)="(\.\.\/assets\/[^"?]+)(?:\?[^" ]*)?"/g))assert(fs.existsSync(path.resolve(path.dirname(file),match[1])),match[1]);
  if(name.endsWith('.css'))for(const match of text.matchAll(/@import\s+["']([^"']+)["']/g))assert(fs.existsSync(path.resolve(path.dirname(file),match[1])),match[1]);
 }
 assert(checked>20);
});

test('archived agenda, chapter outline and slide keys describe the same deck',async()=>{
 const slides=await buildSlides(),outline=JSON.parse(fs.readFileSync(path.join(root,'website/assets/data/deck-outline-legacy.json'),'utf8'));
 assert.equal(slides[2].section,'THE ROUTE AHEAD');assert.equal(outline.chapters.length,5);
 assert.equal(outline.chapters[0].id,'ai-assurance');
 for(const section of ['AI AND SUPERVISION','SUPERVISORY TECHNOLOGY','SUPTECH IN PRACTICE','OUR USE CASE / RISK'])assert.equal(outline.slides.find(s=>s.section===section).chapter,'ai-assurance');assert.equal(outline.slides.length,slides.length);
 assert.equal(new Set(outline.slides.map(slide=>slide.key)).size,slides.length);
 assert.deepEqual(outline.slides.map(slide=>slide.section),slides.map(slide=>slide.section));
 assert(outline.chapters.every(chapter=>!('minutes' in chapter)));
 for(const slide of outline.slides)if(slide.chapter)assert(outline.chapters.some(chapter=>chapter.id===slide.chapter));
 assert(slides[0].html.includes('jakarta-cover.jpg'));
 assert(slides.find(slide=>slide.section==='THE PRACTICAL TEST').html.includes('d-boundary-chain'));
 assert(slides.find(slide=>slide.section==='EVIDENCE / RISK MANAGEMENT').title.includes('89%'));
 assert(slides.find(slide=>slide.section==='EVIDENCE / ASSURANCE').title.includes('49%'));
});


test('each agenda section opens with exactly one dedicated separator',async()=>{
 const slides=await buildSlides(),outline=JSON.parse(fs.readFileSync(path.join(root,'website/assets/data/deck-outline-legacy.json'),'utf8'));
 const dividers=slides.filter(slide=>slide.type.includes('d-section-divider'));assert.equal(dividers.length,5);
 for(const chapter of outline.chapters){const first=outline.slides.findIndex(slide=>slide.chapter===chapter.id);assert(slides[first].type.includes('d-section-divider'));assert.equal(slides[first].title,chapter.title);assert.equal(outline.slides[first].key,'section-'+chapter.id);assert.equal(outline.slides[first+1].chapter,chapter.id);}
});


test('release continues directly to SIPT without a timed audience break',async()=>{
 const slides=await buildSlides(),outline=JSON.parse(fs.readFileSync(path.join(root,'website/assets/data/deck-outline-legacy.json'),'utf8'));
 const release=slides.findIndex(s=>s.section==='A BUSIER INFORMATION ENVIRONMENT');
 assert.equal(slides[release-1].section,'WHAT CHANGED?');assert.equal(slides[release+1].section,'SECTION 05 OF 05');assert.equal(slides[release+2].section,'BACK TO KEMENKEU');
 assert.equal(release,31);
 assert.equal(slides[release].title,'More signals. Better risk decisions.');
 for(const phrase of ['YOUR ROLE / RISK MANAGER','Dynamic','Responsive','Connected','Accountable','This is the direction of SPIT.'])assert(slides[release].html.includes(phrase));
 assert(!slides.some(s=>['THE NEXT 30 DAYS','YOUR COMMITMENT','COMPARE THE REASONS'].includes(s.section)));
 assert(outline.chapters.at(-1).title.includes('SIPT'));
 for(const section of ['SPIT / INTEGRATED CONTROL FRAMEWORK','RISK PLATFORM','CMCA PLATFORM','AI-POWERED SIPT','EARLY WARNING SYSTEM','SHARED RESPONSIBILITY'])assert(slides.some(s=>s.section===section));
 assert.equal(outline.slides.find(s=>s.section==='INTERNAL EVIDENCE').chapter,'action');
 assert.equal(outline.slides.find(s=>s.section==='CONTINUOUS ASSURANCE').chapter,'action');
 const framework=slides.find(s=>s.section==='AI-POWERED SIPT');assert(framework.html.includes('ACCOUNTABLE HUMAN REVIEW'));assert(framework.html.includes('Approved updates'));assert(framework.html.includes('direction described by the presenter'));
});
