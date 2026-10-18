import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {buildSlides,root} from './deck-fixture.mjs';

test('the final seminar retains its story, research and strategic exercise',async()=>{
 const slides=await buildSlides();assert.equal(slides.length,31);
 assert.equal(slides[0].title,'Beyond Compliance');assert(slides[0].html.includes('d-simple-cover'));
 assert.equal(slides.filter(s=>s.type.includes('d-research-slide')).length,3);
 assert.equal(slides.filter(s=>s.section.includes('CARILLION')).length,3);
 assert(slides[11].html.includes('data-signal-framework'));
 assert.equal((slides[11].html.match(/data-framework-select=/g)||[]).length,6);
 assert(!slides[11].html.includes('<dialog'));
 assert(slides[16].html.includes('antara-tariff-2025.jpg'));
 assert(slides[17].html.includes('45%')&&slides[17].html.includes('60%'));
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
