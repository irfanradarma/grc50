import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {auditContent,auditDesigns} from '../assets/keynote/audit-beyond.mjs';
import {composeModules} from '../assets/keynote/content-modules.mjs';
import {renderNarrativeSlide} from '../assets/keynote/audit-story.mjs';
const material=JSON.parse(fs.readFileSync(new URL('../assets/keynote/audit-beyond-topic.json',import.meta.url),'utf8'));
test('audit topic follows familiar work, practical assistance, business AI assurance, connected AMS, then risk action',()=>{
 assert.equal(material.slides.length,53);
 assert.deepEqual(material.sections.map(s=>s.id),['capability','assistant','audit-object','ams','beyond']);
 const designs=auditDesigns(material,{appUrl:'https://example.test/grc50',assetsUrl:'https://example.test/assets/',preview:true});
 const original=JSON.parse(fs.readFileSync(new URL('../assets/keynote/reference.json',import.meta.url),'utf8'));
 const built=composeModules(auditContent(material),{...original,slides:[...original.slides,...designs.entries]},designs.renderers,{revision:8});
 assert.equal(built.reference.slides.length,53);assert(!built.reference.slides.some(s=>s.key==='cover'));
 for(const entry of built.reference.slides){const design=built.renderers[entry.key];assert(design.kind.includes('audit-beyond'));assert(!/undefined|NaN|\[object Object\]/.test(design.html),entry.key);assert(entry.note.length>80,entry.key);assert(design.html.includes('brand/rsm/logo.png'),entry.key);assert(design.html.includes('alt="RSM"'),entry.key);}
 for(const section of material.sections)assert.equal(material.slides.filter(s=>s.chapter===section.id&&s.kind==='section').length,1);
 assert(designs.renderers['aib-ams-demo'].html.includes('workspace=audit&amp;previewTopic=ai-audit-beyond'));
 assert(designs.renderers['aib-risk-demo'].html.includes('workspace=risk&amp;previewTopic=ai-audit-beyond'));
});

test('the practical story precedes business AI assurance and returns to the same goal',()=>{
 const pos=key=>material.slides.findIndex(s=>s.key===key);
 assert(pos('aib-section-assistant')<pos('aib-section-audit-object'));
 assert(pos('aib-branches')<pos('aib-case'));
 assert(pos('aib-case')<pos('aib-finding'));
 assert(pos('aib-finding')<pos('aib-ams-demo'));
 assert(pos('aib-ams-demo')<pos('aib-endpoint'));
 assert(pos('aib-endpoint')<pos('aib-risk-demo'));
 for(const s of material.slides){assert(s.narrative.question.length>10,s.key);assert(s.narrative.transition.length>10,s.key);}
 const chapters=auditContent(material).modules;
 assert.deepEqual(chapters.slice(1).map(m=>m.id),material.sections.map(s=>s.id));
 assert(material.narrative.limits.includes('no automatic transfer'));
});

test('teaching drawings preserve sample uncertainty, source checks and distinct demo routes',()=>{
 const scenes=material.slides.filter(s=>s.visual);assert(scenes.length>=25);
 for(const s of scenes){const html=renderNarrativeSlide(s,{sections:material.sections,appUrl:'https://example.test',preview:true});assert(html,s.key);assert(!/undefined|NaN/.test(html),s.key);}
 const sample=renderNarrativeSlide(material.slides.find(s=>s.key==='aib-finding'));
 assert.equal((sample.match(/class="as-missing"/g)||[]).length,8);
 assert.equal((sample.match(/aria-label="Sample /g)||[]).length,40);
 assert(sample.includes('whether the record is held elsewhere'));
 const prompt=material.slides.find(s=>s.key==='aib-prompt');assert(prompt.items.some(row=>row[1].includes('missing record proves no approval')));
 const risk=renderNarrativeSlide(material.slides.find(s=>s.key==='aib-risk-demo'),{appUrl:'https://example.test',preview:true});
 assert(risk.includes('workspace=risk&amp;previewTopic=ai-audit-beyond'));
 assert(risk.includes('not transferred automatically'));
 const agenda=renderNarrativeSlide(material.slides.find(s=>s.key==='aib-journey'),{sections:material.sections});
 for(const section of material.sections)assert(agenda.includes('data-chapter="'+section.id+'"'));
});
test('statistics have primary sources, explicit populations and scope limits',()=>{
 for(const slide of material.slides.filter(s=>s.kind==='stats'||s.kind==='stat'))assert(slide.refs.length>0,slide.key);
 for(const s of material.slides)for(const id of s.refs){assert(material.sources[id]);assert.equal(new URL(material.sources[id].url).protocol,'https:');assert(material.sources[id].scope.length>50);}
 assert(material.sources.hbs.scope.includes('758'));assert(material.sources.rsm.scope.includes('1,030'));
 assert(material.sources.rsm.scope.includes('already using AI'));assert(material.sources.rsm.scope.includes('Indonesia'));
 assert(material.slides.find(s=>s.key==='aib-score').notes.includes('proyeksi'));
});
test('RSM speakers, recognised authorities and limits are integral to the narrative',()=>{
 const {renderers}=auditDesigns(material,{assetsUrl:'https://example.test/assets/'});
 assert.deepEqual(material.presenters.map(p=>p.name),['Dena Sucianandika','Teuku Raja Irfan Radarma']);
 for(const p of material.presenters){assert.equal(p.organisation,'RSM Indonesia');assert(renderers['aib-cover'].html.includes(p.name));assert(renderers['aib-speakers'].html.includes(p.name));assert(renderers['aib-closing'].html.includes(p.name));}
 for(const id of ['rsm','rsm-method','hbs','iia','gias','nist','iso','coso','pcaob','air-canada'])assert(material.slides.some(s=>s.refs.includes(id)),id);
 assert(material.slides.find(s=>s.key==='aib-govern').kind==='risk-framework');
 assert(material.slides.find(s=>s.key==='aib-govern').notes.includes('lintas fungsi'));
 assert(material.slides.find(s=>s.key==='aib-readiness').evidenceNote.includes('does not establish'));
 assert(material.slides.find(s=>s.key==='aib-calibration').notes.includes('16%'));
 assert.equal(material.slides.at(-1).key,'aib-closing');
 const bibliography=new Set(material.slides.filter(s=>s.kind==='references').flatMap(s=>s.refs));
 for(const slide of material.slides)for(const id of slide.refs)assert(bibliography.has(id),id+' missing from reference appendix');
});
