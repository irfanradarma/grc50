import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {auditContent,auditDesigns} from '../assets/keynote/audit-beyond.mjs';
import {composeModules} from '../assets/keynote/content-modules.mjs';
import {renderAssuranceStory,trustQualities} from '../assets/keynote/assurance-story.mjs';
import {renderNarrativeSlide} from '../assets/keynote/audit-story.mjs';
const material=JSON.parse(fs.readFileSync(new URL('../assets/keynote/audit-beyond-topic.json',import.meta.url),'utf8'));
test('audit topic follows familiar work, practical assistance, business AI assurance, connected AMS, then risk action',()=>{
 assert.equal(material.slides.length,44);
 assert.deepEqual(material.sections.map(s=>s.id),['capability','audit-object','assistant','ams','beyond']);
 const designs=auditDesigns(material,{appUrl:'https://example.test/grc50',assetsUrl:'https://example.test/assets/',preview:true});
 const original=JSON.parse(fs.readFileSync(new URL('../assets/keynote/reference.json',import.meta.url),'utf8'));
 const built=composeModules(auditContent(material),{...original,slides:[...original.slides,...designs.entries]},designs.renderers,{revision:8});
 assert.equal(built.reference.slides.length,44);assert(!built.reference.slides.some(s=>s.key==='cover'));
 for(const entry of built.reference.slides){const design=built.renderers[entry.key];assert(design.kind.includes('audit-beyond'));assert(!/undefined|NaN|\[object Object\]/.test(design.html),entry.key);assert(entry.note.length>80,entry.key);assert(design.html.includes('brand/rsm/logo.png'),entry.key);assert(design.html.includes('alt="RSM"'),entry.key);}
 for(const section of material.sections)assert.equal(material.slides.filter(s=>s.chapter===section.id&&s.kind==='section').length,1);
 assert(designs.renderers['aib-annual-planning'].html.includes('workspace=audit&amp;previewTopic=ai-audit-beyond'));
 assert(designs.renderers['aib-risk-demo'].html.includes('workspace=risk&amp;previewTopic=ai-audit-beyond'));
});

test('the concise refresher leads into auditing AI, using AI, useful products and continuous risk assurance',()=>{
 const pos=key=>material.slides.findIndex(s=>s.key===key);
 for(const [a,b] of [['aib-ai-modes','aib-document-journey'],['aib-general-safeguards','aib-section-audit-object'],['aib-trustworthy','aib-section-assistant'],['aib-human-authority','aib-idea-execution-usage'],['aib-annual-planning','aib-fieldwork-flow'],['aib-fieldwork-flow','aib-reporting-pack'],['aib-reporting-pack','aib-three-signals'],['aib-three-signals','aib-risk-demo']])assert(pos(a)>=0&&pos(a)<pos(b),a+' ? '+b);
 assert.equal(material.slides.filter(s=>s.chapter==='capability'&&s.kind!=='section').length,5);
 for(const s of material.slides){assert(s.narrative.question.length>10,s.key);assert(s.narrative.transition.length>10,s.key);}
 assert.deepEqual(auditContent(material).modules.slice(1).map(m=>m.id),material.sections.map(s=>s.id));
});

test('all teaching visuals render and describe human authority, evidence and the three signal sources',()=>{
 for(const s of material.slides.filter(s=>s.visual)){const html=renderAssuranceStory(s,{appUrl:'https://example.test',preview:true})??renderNarrativeSlide(s,{sections:material.sections});assert(html,s.key);assert(!/undefined|NaN/.test(html),s.key);}
 const trust=renderAssuranceStory(material.slides.find(s=>s.key==='aib-trustworthy'));assert.equal(trustQualities.length,7);assert.equal((trust.match(/data-trust-quality=/g)||[]).length,7);assert(trust.includes('Valid & reliable'));assert(trust.includes('Accountable & transparent'));
 const controls=renderAssuranceStory(material.slides.find(s=>s.key==='aib-general-safeguards'));assert(controls.includes('not a product screenshot'));assert(controls.includes('not sent online'));assert(controls.includes('where offered'));
 const risk=renderAssuranceStory(material.slides.find(s=>s.key==='aib-risk-demo'),{appUrl:'https://example.test',preview:true});assert(risk.includes('workspace=risk&amp;previewTopic=ai-audit-beyond'));assert(risk.includes('Issue the reviewed AMS report'));
 const framework=renderAssuranceStory(material.slides.find(s=>s.key==='aib-signal-framework'));assert.equal((framework.match(/HUMAN AUTHORITY/g)||[]).length,2);assert.equal((framework.match(/AI SUPPORT/g)||[]).length,4);
 const agenda=renderNarrativeSlide(material.slides.find(s=>s.key==='aib-journey'),{sections:material.sections});for(const section of material.sections)assert(agenda.includes('data-chapter="'+section.id+'"'));
});

test('statistics have primary sources, explicit populations and scope limits',()=>{
 for(const slide of material.slides.filter(s=>s.kind==='stats'||s.kind==='stat'))assert(slide.refs.length>0,slide.key);
 for(const s of material.slides)for(const id of s.refs){assert(material.sources[id]);assert.equal(new URL(material.sources[id].url).protocol,'https:');assert(material.sources[id].scope.length>50);}
 assert(material.sources.hbs.scope.includes('758'));assert(material.sources.rsm.scope.includes('1,030'));
 assert(material.sources.rsm.scope.includes('already using AI'));assert(material.sources.rsm.scope.includes('Indonesia'));
 assert(material.slides.find(s=>s.key==='aib-score').notes.includes('proyeksi'));
});
test('the idea-to-usage paradox is a visual metaphor rather than an invented survey chart',()=>{
 const s=material.slides.find(s=>s.key==='aib-idea-execution-usage'),html=renderAssuranceStory(s);
 assert(html.includes('Before AI'));assert(html.includes('With AI'));
 assert(html.includes('Can we build it?'));assert(html.includes('Who will actually use it?'));
 assert.equal((html.match(/class="as-crowd-drawing"/g)||[]).length,2);
 assert(html.includes('role="img"'));assert(html.includes('unresolved question of actual use'));
 assert(s.evidenceNote.includes('not survey counts'));assert(!html.includes('as-bottleneck'));
});
test('native visuals are restored while the RSM master backgrounds are retained',()=>{
 const {renderers}=auditDesigns(material,{assetsUrl:'https://example.test/assets/'});
 for(const slide of Object.values(renderers)){assert(!slide.html.includes('illustrations/rsm/'));assert(!slide.html.includes('rsm-scene-image'));assert(slide.kind.includes('rsm-template'));}
 for(const key of ['aib-cover','aib-section-ams','aib-closing'])assert.equal(renderers[key].tone,'night');
 for(const file of ['template-light.png','template-dark.png'])assert(fs.existsSync(new URL('../assets/brand/rsm/'+file,import.meta.url)));
 for(const key of ['aib-audit-objectives','aib-case','aib-ams-idea','aib-ams-demo','aib-continuous-loop'])assert(!material.slides.some(s=>s.key===key));
});
test('RSM speakers, recognised authorities and limits are integral to the narrative',()=>{
 const {renderers}=auditDesigns(material,{assetsUrl:'https://example.test/assets/'});
 assert.deepEqual(material.presenters.map(p=>p.name),['Dena Sucianandika','Teuku Raja Irfan Radarma']);
 for(const p of material.presenters){assert.equal(p.organisation,'RSM Indonesia');assert(renderers['aib-cover'].html.includes(p.name));assert(renderers['aib-speakers'].html.includes(p.name));assert(renderers['aib-closing'].html.includes(p.name));}
 for(const id of ['rsm','rsm-method','hbs','iia','gias','nist','iso','coso','pcaob','echoleak','rsm-ia'])assert(material.slides.some(s=>s.refs.includes(id)),id);
 assert(material.slides.find(s=>s.key==='aib-trustworthy').refs.includes('nist-trust'));
 assert(material.slides.find(s=>s.key==='aib-readiness').evidenceNote.includes('does not establish'));

 assert.equal(material.slides.at(-1).key,'aib-closing');
 const bibliography=new Set(material.slides.filter(s=>s.kind==='references').flatMap(s=>s.refs));
 for(const slide of material.slides)for(const id of slide.refs)assert(bibliography.has(id),id+' missing from reference appendix');
});
