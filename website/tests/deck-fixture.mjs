import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

export const root=fileURLToPath(new URL('../../',import.meta.url));
export async function buildSlides(){
 const slides=[],context={window:{},location:{pathname:'/presentation/deck/',origin:'http://localhost:5173'},fetch:async url=>{
  const target=path.resolve(root,'website/deck',url);
  if(!target.startsWith(path.join(root,'website','assets','data')+path.sep))throw Error('Unexpected deck data path');
  return {ok:true,json:async()=>JSON.parse(fs.readFileSync(target,'utf8'))};
 }};
 vm.createContext(context);
 for(const file of ['seminar-depth.js','seminar-research.js','seminar-framework-content.js','seminar-workshop.js'])vm.runInContext(fs.readFileSync(path.join(root,'website/assets/js',file),'utf8'),context);
 await context.window.buildHoriSeminar({add:(section,title,html,note,type)=>slides.push({section,title,html,note,type})});
 return slides;
}
