import material from '../../website/assets/keynote/audit-beyond-topic.json';
import type {ContentConfig} from './content';
export const auditTopicId=material.id;
export function auditTopicContent():ContentConfig{return {schemaVersion:1,title:material.title,modules:[
 {id:'opening',title:'Opening',description:'The journey',enabled:true,demo:{kind:'none' as const},slides:[]},
 ...material.sections.map(section=>({id:section.id,title:section.title,description:section.caption,enabled:true,demo:section.id==='ams'?{kind:'audit-suite' as const}:{kind:'none' as const},slides:[]}))
].map(module=>({...module,slides:material.slides.filter(s=>(s.chapter||'opening')===module.id).map(s=>({key:s.key,builtin:s.key,title:s.title,body:'',notes:s.notes,layout:'original' as const,tone:'day' as const,enabled:true}))}))};}
