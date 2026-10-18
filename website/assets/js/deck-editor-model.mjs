// Only declarative text and bounded appearance values may be imported.
export const schema='hori-deck-edits/v1';
const ranges={fontSize:[8,160],x:[-100,100],y:[-100,100],width:[1,100],height:[1,100],opacity:[.1,1]};
const colors=['color','backgroundColor','fill','stroke'];
export function validateEdits(input){
 if(!input||input.schema!==schema||!input.objects||typeof input.objects!=='object'||Array.isArray(input.objects))throw Error('Choose a HORI deck edits JSON file.');
 if(Object.keys(input.objects).length>5000)throw Error('Too many edited objects.');
 if(input.version!==undefined&&!/^[0-9a-f]{8}$/.test(input.version))throw Error('Invalid deck version.');
 const objects={};
 for(const [id,value] of Object.entries(input.objects)){
  if(!/^slide-\d+:\d+$/.test(id)||!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid object record.');
  const clean={};
  if(value.text!==undefined){if(typeof value.text!=='string'||value.text.length>20000)throw Error('Invalid object text.');clean.text=value.text;}
  for(const [key,[min,max]] of Object.entries(ranges))if(value[key]!==undefined){if(typeof value[key]!=='number'||!Number.isFinite(value[key])||value[key]<min||value[key]>max)throw Error('Invalid '+key+'.');clean[key]=value[key];}
  for(const key of colors)if(value[key]!==undefined){if(typeof value[key]!=='string'||!/^#[0-9a-f]{6}$/i.test(value[key]))throw Error('Invalid color.');clean[key]=value[key];}
  for(const [key,allowed] of Object.entries({fontWeight:['400','500','600','700','800','900'],fontStyle:['normal','italic'],textAlign:['left','center','right']}))if(value[key]!==undefined){if(!allowed.includes(value[key]))throw Error('Invalid '+key+'.');clean[key]=value[key];}
  objects[id]=clean;
 }
 return {schema,...(input.version?{version:input.version}:{}),objects};
}
export function createHistory(initial={schema,objects:{}}){
 let states=[structuredClone(validateEdits(initial))],index=0;
 return {
  get current(){return structuredClone(states[index]);},get canUndo(){return index>0;},get canRedo(){return index<states.length-1;},
  push(next){next=validateEdits(next);if(JSON.stringify(next)===JSON.stringify(states[index]))return false;states=states.slice(0,index+1);states.push(structuredClone(next));if(states.length>100)states.shift();index=states.length-1;return true;},
  undo(){if(index>0)index--;return this.current;},redo(){if(index<states.length-1)index++;return this.current;}
 };
}
