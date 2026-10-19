import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {buildSlides,root} from './deck-fixture.mjs';

test('the final seminar retains its story, research and strategic exercise',async()=>{
 const slides=await buildSlides();assert.equal(slides.length,28);
 assert.equal(slides[0].title,'Beyond Compliance');assert(slides[0].html.includes('d-simple-cover'));
 assert.equal(slides.filter(s=>s.type.includes('d-research-slide')).length,3);
 assert(!slides.some(s=>/CARILLION|WHAT WAS MISSING/.test(s.section)));
 for(const slide of slides)assert(!/Carillion|\b\d+[-\u2013]?\d* (minutes?|min)\b|data-countdown/i.test(slide.html+slide.section+slide.note));
 const framework=slides.find(slide=>slide.section==='THE SOLUTION FRAMEWORK');assert(framework.html.includes('data-signal-framework'));
 assert.equal((framework.html.match(/data-framework-select=/g)||[]).length,6);
 assert(!framework.html.includes('<dialog'));
 assert(slides.find(slide=>slide.section==='ONE REAL EVENT').html.includes('antara-tariff-2025.jpg'));
 assert(slides.find(slide=>slide.section==='SAME EVENT, DIFFERENT EXPOSURE').html.includes('45%')&&slides.find(slide=>slide.section==='SAME EVENT, DIFFERENT EXPOSURE').html.includes('60%'));
 assert.equal(slides.filter(s=>s.html.includes('data-live-tour')).length,9);
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

test('agenda, chapter outline and live slide keys describe the same deck',async()=>{
 const slides=await buildSlides(),outline=JSON.parse(fs.readFileSync(path.join(root,'website/assets/data/deck-outline.json'),'utf8'));
 assert.equal(slides[1].section,'THE ROUTE AHEAD');assert.equal(outline.chapters.length,4);assert.equal(outline.slides.length,slides.length);
 assert.equal(new Set(outline.slides.map(slide=>slide.key)).size,slides.length);
 assert.deepEqual(outline.slides.map(slide=>slide.section),slides.map(slide=>slide.section));
 assert(outline.chapters.every(chapter=>!('minutes' in chapter)));
 for(const slide of outline.slides)if(slide.chapter)assert(outline.chapters.some(chapter=>chapter.id===slide.chapter));
 assert(slides[0].html.includes('jakarta-cover.jpg'));
 assert(slides.find(slide=>slide.section==='THE PRACTICAL TEST').html.includes('d-boundary-chain'));
 assert(slides.find(slide=>slide.section==='EVIDENCE / RISK MANAGEMENT').title.includes('89%'));
 assert(slides.find(slide=>slide.section==='EVIDENCE / ASSURANCE').title.includes('49%'));
});
