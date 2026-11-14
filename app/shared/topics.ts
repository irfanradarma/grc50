import {z} from 'zod';
import {auditTopicContent,auditTopicId} from './auditTopic.js';
import {contentSchema,defaultContent,type ContentConfig} from './content.js';
export const topicInput=z.object({title:z.string().trim().min(1).max(300),description:z.string().max(4000).default(''),config:contentSchema});
export type Topic={id:string;title:string;description:string;draft:ContentConfig;published:ContentConfig|null;publishedDescription?:string;applicationRevision?:number};
export type TopicLibrary={revision:number;liveRevision:number;activeTopicId:string;topics:Topic[]};
export function topicLibrary(data:any):TopicLibrary{
 if(data.topicLibrary){const library=structuredClone(data.topicLibrary) as TopicLibrary;if(!library.topics.some(t=>t.id===auditTopicId))library.topics.push(auditDraft());const audit=library.topics.find(t=>t.id===auditTopicId);if(audit)for(const config of [audit.draft,audit.published]){if(!config||config.modules.some(m=>m.slides.some(s=>s.key==='aib-hitl-practice')))continue;const module=config.modules.find(m=>m.slides.some(s=>s.key==='aib-human-authority'));const source=auditTopicContent().modules.flatMap(m=>m.slides).find(s=>s.key==='aib-hitl-practice');if(module&&source)module.slides.splice(module.slides.findIndex(s=>s.key==='aib-human-authority')+1,0,structuredClone(source));}return library;}
 const published=data.content?.published?.config||defaultContent;
 return {revision:0,liveRevision:data.content?.published?.revision||0,activeTopicId:'beyond-compliance',topics:[{id:'beyond-compliance',title:'Beyond Compliance',description:'Memaksimalkan Potensi AI dalam Mengawal Strategi dan Risiko Organisasi. Deck lengkap dan aplikasi SIGNAL.',draft:data.content?.draft||published,published},auditDraft()]};
}
export function topicApplication(config:ContentConfig){return config.modules.find(m=>m.enabled&&m.demo.kind!=='none')?.demo||{kind:'none' as const};}
export function newTopicContent(title:string):ContentConfig{return {schemaVersion:1,title,modules:[{id:'opening',title:'Pembukaan',description:'',enabled:true,demo:{kind:'none'},slides:[{key:'cover',title,body:'',notes:'',enabled:true,layout:'title',tone:'day'}]}]};}

function auditDraft():Topic{return {id:auditTopicId,title:"AI in Audit and Beyond",description:"RSM Indonesia: Dena Sucianandika and Teuku Raja Irfan Radarma. AI capability, auditing AI, audit assistance, an assurance workspace and dynamic risk management.",draft:auditTopicContent(),published:null};}
