import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
export async function buildKeynote(){
 const file=new URL('../assets/keynote/keynote.js',import.meta.url);
 const source=fs.readFileSync(file,'utf8').split('const stage=document.getElementById')[0]
  .replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.url',JSON.stringify(file.href));
 const reference=JSON.parse(fs.readFileSync(new URL('../assets/keynote/reference.json',import.meta.url),'utf8'));
 const context={URL,URLSearchParams,location:{search:'',hostname:'example.test',origin:'https://example.test',port:''},window:{SIGNAL_HOSTING:{frontendUrl:'https://example.test'}},document:{body:{classList:{toggle(){}}},querySelectorAll:()=>[]},fetch:async()=>({ok:true,json:async()=>structuredClone(reference)})};
 return vm.runInNewContext('(async()=>{'+source+';return {slides,reference};})()',context);
}
