import {z} from 'zod';
import reference from '../../website/assets/keynote/reference.json';

const id=z.string().regex(/^[a-z][a-z0-9-]{0,79}$/);
const line=z.string().trim().min(1).max(300);
const copy=z.string().max(12000);
export const demoSchema=z.object({
 title:line,description:copy,
 fields:z.array(z.object({id,label:line,type:z.enum(['text','number','select']),options:z.array(line).max(30).default([])})).min(1).max(20),
 rows:z.array(z.record(z.string(),z.string().max(2000))).max(100),
 steps:z.array(line).min(1).max(12)
}).strict().superRefine((demo,ctx)=>{
 if(new Set(demo.fields.map(f=>f.id)).size!==demo.fields.length)ctx.addIssue({code:'custom',message:'Field IDs must be unique'});
 if(demo.fields.some(f=>f.type==='select'&&!f.options.length))ctx.addIssue({code:'custom',message:'Select fields need options'});
});
export const slideSchema=z.object({key:id,enabled:z.boolean(),builtin:z.string().optional(),title:line,body:copy.default(''),notes:copy.default(''),layout:z.enum(['original','title','content','demo']),tone:z.enum(['day','night']).default('day')}).strict();
export const moduleSchema=z.object({id,title:line,description:copy.default(''),enabled:z.boolean(),slides:z.array(slideSchema).max(100),demo:z.discriminatedUnion('kind',[
 z.object({kind:z.literal('none')}),z.object({kind:z.literal('signal')}),z.object({kind:z.literal('sandbox'),config:demoSchema})
])}).strict();
export const contentSchema=z.object({schemaVersion:z.literal(1),title:line,modules:z.array(moduleSchema).min(1).max(30)}).strict().superRefine((value,ctx)=>{
 const moduleIds=value.modules.map(m=>m.id),keys=value.modules.flatMap(m=>m.slides.map(s=>s.key));
 if(new Set(moduleIds).size!==moduleIds.length||new Set(keys).size!==keys.length)ctx.addIssue({code:'custom',message:'Module IDs and slide keys must be unique'});
 const builtins=new Set(reference.slides.map(s=>s.key));
 for(const m of value.modules)for(const s of m.slides){
  if(s.builtin&&!builtins.has(s.builtin))ctx.addIssue({code:'custom',message:'Unknown built-in slide: '+s.builtin});
  if(s.layout==='original'&&!s.builtin)ctx.addIssue({code:'custom',message:'Original layout requires a built-in slide'});
  if(s.layout==='demo'&&m.demo.kind==='none')ctx.addIssue({code:'custom',message:'Demo slides need a demo in their module'});
 }
 if(!value.modules.some(m=>m.enabled&&m.slides.some(s=>s.enabled)))ctx.addIssue({code:'custom',message:'Keep at least one enabled slide'});
 if(value.modules.filter(m=>m.enabled&&m.demo.kind==='signal').length>1)ctx.addIssue({code:'custom',message:'Use one SIGNAL workspace module per seminar'});
});
export type ContentConfig=z.infer<typeof contentSchema>;
export type ContentModule=ContentConfig['modules'][number];
export type ContentSlide=ContentModule['slides'][number];
export type DemoConfig=z.infer<typeof demoSchema>;
export const defaultContent:ContentConfig={schemaVersion:1,title:'Beyond Compliance',modules:[
 {id:'opening',title:'Opening',description:'Access, speakers and agenda',enabled:true,slides:[],demo:{kind:'none'}},
 ...reference.chapters.map(ch=>({id:ch.id,title:ch.title,description:ch.caption,enabled:true,slides:[],demo:{kind:ch.id==='model'?'signal':'none'} as ContentModule['demo']}))
]};
for(const slide of reference.slides){const mod=defaultContent.modules.find(m=>m.id===(slide.chapter||'opening'))!;mod.slides.push({key:slide.key,builtin:slide.key,title:slide.title,notes:slide.note||'',body:'',enabled:true,layout:'original',tone:'day'});}
export const sandboxTemplate:DemoConfig={title:'Latihan keputusan',description:'Data simulasi. Edit konteks, isian, data contoh dan tahapan sesuai kebutuhan.',fields:[{id:'item',label:'Kasus',type:'text',options:[]},{id:'owner',label:'Penanggung jawab',type:'text',options:[]},{id:'score',label:'Skor',type:'number',options:[]}],rows:[{item:'Kasus contoh',owner:'Tim A',score:'12'}],steps:['Tinjau bukti','Tetapkan keputusan','Rencanakan tindakan','Verifikasi hasil']};
export function activeSlides(config:ContentConfig){return config.modules.filter(m=>m.enabled).flatMap(m=>m.slides.filter(s=>s.enabled).map(s=>({...s,moduleId:m.id,chapter:m.id==='opening'?null:m.id})));}
export function contentDeckId(revision:number){return revision?`${reference.deckId}-content-${revision}`:reference.deckId;}
