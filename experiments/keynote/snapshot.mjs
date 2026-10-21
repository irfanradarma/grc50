import fs from 'node:fs/promises';
import {buildSlides} from '../../website/tests/deck-fixture.mjs';
const outline=JSON.parse(await fs.readFile(new URL('../../website/assets/data/deck-outline.json',import.meta.url),'utf8'));
const research=JSON.parse(await fs.readFile(new URL('../../website/assets/data/seminar-research.json',import.meta.url),'utf8'));
const slides=await buildSlides();
const entries=slides.map((slide,i)=>{
 const links=[...slide.html.matchAll(/href="(https?:[^"<>]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(m=>({url:m[1].replace(/&amp;/g,'&'),label:m[2].replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim()}));
 return {...outline.slides[i],index:i+1,title:slide.title.replace(/<[^>]*>/g,' '),note:slide.note,links:[...new Map(links.map(link=>[link.url,link])).values()]};
});
await fs.writeFile(new URL('./reference.json',import.meta.url),JSON.stringify({deckId:outline.deckId,chapters:outline.chapters,research,slides:entries},null,2)+'\n');
console.log('Local design reference saved: '+entries.length+' slides');
