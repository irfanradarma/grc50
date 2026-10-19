import {schema,validateEdits,createHistory} from './deck-editor-model.mjs?v=signal-editor-6';
const deck=document.querySelector('#deck'),toggle=document.querySelector('#editDeck');
const storageKey='signal-deck-edits-v1',selector='h1,h2,h3,p,li,dt,dd,th,td,figcaption,.eyebrow,.foot,a,img,[data-edit-object],svg,svg text,svg rect,svg circle,svg path';
const objects=new Map(),originals=new Map();
const live='[data-framework-panel],[data-framework-position],[data-loop-title],[data-loop-detail],[data-live-stats],[data-session-status],[data-workshop-url-status],[data-countdown],[data-residual]';
for(const slide of deck.querySelectorAll('.slide')){
 let index=1;const slideId=slide.id+':0';slide.dataset.editId=slideId;objects.set(slideId,slide);originals.set(slideId,{html:slide.innerHTML,style:slide.getAttribute('style')});
 for(const element of slide.querySelectorAll(selector)){
  if(element.closest(live)||element.closest('button')||element.closest('video'))continue;
  const id=slide.id+':'+index++;element.dataset.editId=id;objects.set(id,element);originals.set(id,{html:element.innerHTML,style:element.getAttribute('style')});
 }
}
let hash=2166136261;
for(const [id,element] of objects){if(element.classList.contains('slide'))continue;const value=id+'|'+element.localName+'|'+(isText(element)?element.textContent:element.getAttribute('src')||'graphic');for(const char of value)hash=Math.imul(hash^char.charCodeAt(0),16777619);}
const version=(hash>>>0).toString(16).padStart(8,'0');
let previousEdits='';
let loadMessage='Select an object to edit it.',initial={schema,version,objects:{}};
try{const saved=localStorage.getItem(storageKey);if(saved){const loaded=validateEdits(JSON.parse(saved));if(loaded.version===version)initial=loaded;else{previousEdits=saved;try{localStorage.setItem(storageKey+'-archive-'+(loaded.version||'legacy'),saved);localStorage.setItem(storageKey+'-previous-revision',saved);}catch{}loadMessage='An older revision’s edits were preserved. Use Export previous revision edits for a backup. They were not applied to the revised slide structure.';}}}catch{loadMessage='Saved edits could not be loaded. Your source deck is intact.';}
if(!previousEdits)try{previousEdits=localStorage.getItem(storageKey+'-previous-revision')||'';}catch{}
const history=createHistory(initial);let edits=history.current,selected=null,editing=false,dirty=false,drag=null;
const panel=document.createElement('aside');panel.id='deckEditor';panel.hidden=true;panel.setAttribute('aria-label','Slide object editor');
panel.innerHTML=`<div class="de-head"><h2>Deck editor</h2><button type="button" data-done>Done</button></div>
<div class="de-actions"><button data-undo>Undo</button><button data-redo>Redo</button><button data-save>Save</button></div>
<p class="de-status" role="status" aria-live="polite"></p>
<p class="de-selected">Select text, an image, a diagram or a shape.</p>
<label>Object text<textarea data-text rows="4" placeholder="Double-click text on the slide to type directly."></textarea></label>
<div class="de-row"><label>Font size<input data-field="fontSize" type="number" min="8" max="160" step="1"></label><label>Weight<select data-field="fontWeight"><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option><option value="800">Extra bold</option><option value="900">Black</option></select></label></div>
<div class="de-row"><label>Text color<input data-field="color" type="color"></label><label>Background<input data-field="backgroundColor" type="color"></label></div>
<div class="de-row"><label>Alignment<select data-field="textAlign"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label><label>Style<select data-field="fontStyle"><option value="normal">Normal</option><option value="italic">Italic</option></select></label></div>
<div class="de-row"><label>Shape fill<input data-field="fill" type="color"></label><label>Shape stroke<input data-field="stroke" type="color"></label></div>
<div class="de-row"><label>X offset (%)<input data-field="x" type="number" min="-100" max="100" step=".1"></label><label>Y offset (%)<input data-field="y" type="number" min="-100" max="100" step=".1"></label></div>
<div class="de-row"><label>Width (% of slide)<input data-field="width" type="number" min="1" max="100" step=".1"></label><label>Height (% of slide)<input data-field="height" type="number" min="1" max="100" step=".1"></label></div>
<button data-reset-object>Reset selected object</button><button data-slide-background>Select slide background</button>
<details><summary>Slide objects</summary><div class="de-object-list"></div></details>
<div class="de-files"><button data-export>Export edits</button><label class="de-import">Import edits<input data-import type="file" accept="application/json,.json"></label></div>
<button data-export-previous hidden>Export previous revision edits</button><p class="de-help">Click to select. Double-click text to type. Drag the top handle to move; drag the corner to resize. Edits save in this browser. Export a JSON backup to transfer them. Links, clips and slide controls work in Presentation mode.</p>`;
document.body.append(panel);
const outline=document.createElement('div');outline.id='deckSelection';outline.hidden=true;outline.innerHTML='<button class="de-move" aria-label="Move selected object">Move</button><button class="de-resize" aria-label="Resize selected object"></button>';document.body.append(outline);
const previousButton=panel.querySelector('[data-export-previous]');previousButton.hidden=!previousEdits;previousButton.onclick=()=>{const url=URL.createObjectURL(new Blob([previousEdits],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='signal-deck-edits-previous-revision.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
const status=message=>panel.querySelector('.de-status').textContent=message;
function isText(element){return !['img','svg','rect','circle','path'].includes(element.localName)&&!element.querySelector('img,svg,video,iframe,input,button,a,[data-edit-id]');}
function isShape(element){return element.namespaceURI==='http://www.w3.org/2000/svg'&&element.localName!=='svg';}
function writeText(element,text){
 if(element.namespaceURI==='http://www.w3.org/2000/svg'){element.textContent=text;return;}
 const fragment=document.createDocumentFragment();text.split('\n').forEach((line,index)=>{if(index)fragment.append(document.createElement('br'));fragment.append(document.createTextNode(line));});element.replaceChildren(fragment);
}
function readText(element){return element.namespaceURI==='http://www.w3.org/2000/svg'?element.textContent:element.innerText;}
function apply(id,patch){
 const element=objects.get(id);if(!element)return;
 if(patch.text!==undefined&&isText(element)&&!element.isContentEditable)writeText(element,patch.text);
 for(const key of ['fontWeight','fontStyle','color','backgroundColor','textAlign','fill','stroke','opacity'])if(patch[key]!==undefined)element.style[key]=String(patch[key]);
 if(patch.fontSize!==undefined)element.style.fontSize=patch.fontSize+'px';
 const slide=element.closest('.slide');
 if(patch.x!==undefined||patch.y!==undefined)element.style.translate=(patch.x||0)*slide.clientWidth/100+'px '+(patch.y||0)*slide.clientHeight/100+'px';
 if(patch.width!==undefined)element.style.width=patch.width*slide.clientWidth/100+'px';
 if(patch.height!==undefined)element.style.height=patch.height*slide.clientHeight/100+'px';
}
function restore(id){const element=objects.get(id),original=originals.get(id);if(!element)return;if(isText(element))element.innerHTML=original.html;original.style===null?element.removeAttribute('style'):element.setAttribute('style',original.style);}
function refreshLabels(){
 for(const [index,slide] of Array.from(deck.querySelectorAll('.slide')).entries()){
  const title=slide.querySelector(':scope > h1,:scope > h2')?.textContent||'';slide.setAttribute('aria-label','Slide '+(index+1)+': '+title);
  const entry=document.querySelector('#tocList [data-slide="'+index+'"]');if(entry){const number=entry.querySelector('span');entry.replaceChildren(...(number?[number]:[]),document.createTextNode(title));}
 }
 const label=document.querySelector('#sectionLabel'),eyebrow=deck.querySelector('.slide.active > .eyebrow');if(label&&eyebrow)label.textContent=eyebrow.textContent;
}
function applyAll(){for(const [id] of objects){restore(id);if(edits.objects[id])apply(id,edits.objects[id]);}refreshLabels();locate();}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(edits));dirty=false;status('Saved in this browser. Export edits for a backup.');}catch{status('Browser storage unavailable or full. Export edits to keep your changes.');}refreshHistory();}
function commit(){history.push(edits);dirty=true;save();}
function update(patch,remember=true){if(!selected)return;const id=selected.dataset.editId;edits.objects[id]={...edits.objects[id],...patch};apply(id,edits.objects[id]);if(remember)commit();refreshLabels();locate();}
function colorHex(value){const match=value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);return match?'#'+match.slice(1,4).map(v=>Number(v).toString(16).padStart(2,'0')).join(''):/^#[0-9a-f]{6}$/i.test(value)?value:'#ffffff';}
function refreshHistory(){panel.querySelector('[data-undo]').disabled=!history.canUndo;panel.querySelector('[data-redo]').disabled=!history.canRedo;}
function inspect(){
 const enabled=!!selected;panel.querySelectorAll('[data-field],[data-text],[data-reset-object]').forEach(el=>el.disabled=!enabled);
 if(!selected){panel.querySelector('.de-selected').textContent='Select an object on this slide.';panel.querySelector('[data-text]').value='';return;}
 const style=getComputedStyle(selected),patch=edits.objects[selected.dataset.editId]||{},rect=selected.getBoundingClientRect(),slide=selected.closest('.slide');
 panel.querySelector('.de-selected').textContent=selected.localName.toUpperCase()+' · '+(selected.textContent||selected.getAttribute('alt')||'Graphic').trim().slice(0,75);
 panel.querySelector('[data-text]').disabled=!isText(selected);panel.querySelector('[data-text]').value=isText(selected)?readText(selected):'';
 for(const field of panel.querySelectorAll('[data-field]')){
  const key=field.dataset.field;
  const defaults={fontSize:Math.round(parseFloat(style.fontSize)),fontWeight:style.fontWeight,fontStyle:style.fontStyle,textAlign:style.textAlign==='start'?'left':style.textAlign,x:0,y:0,width:Math.round(rect.width/slide.clientWidth*1000)/10,height:Math.round(rect.height/slide.clientHeight*1000)/10};
  field.value=patch[key]??(field.type==='color'?colorHex(style[key]||''):defaults[key]);
  if(['fill','stroke'].includes(key))field.disabled=!isShape(selected);
  if(['width','height'].includes(key))field.disabled=isShape(selected);
 }
 if(selected.classList.contains('slide'))panel.querySelectorAll('[data-field]').forEach(field=>field.disabled=field.dataset.field!=='backgroundColor');
 outline.querySelector('.de-resize').hidden=isShape(selected)||selected.classList.contains('slide');outline.querySelector('.de-move').hidden=selected.classList.contains('slide');refreshHistory();
}
function locate(){if(!editing||!selected||!selected.closest('.slide').classList.contains('active')){outline.hidden=true;return;}const r=selected.getBoundingClientRect();outline.hidden=false;Object.assign(outline.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});}
function select(element){if(selected&&selected!==element)finishTyping();selected?.classList.remove('de-selected-object');selected=element;selected?.classList.add('de-selected-object');inspect();locate();}
function listObjects(){const list=panel.querySelector('.de-object-list');list.replaceChildren();for(const [id,element] of objects){if(!element.closest('.slide').classList.contains('active'))continue;const button=document.createElement('button');button.textContent=element.localName+' · '+(element.textContent||element.getAttribute('alt')||'Graphic').trim().slice(0,55);button.addEventListener('click',()=>select(element));list.append(button);}}
function finishTyping(){const target=deck.querySelector('[contenteditable="true"]');if(!target)return;target.removeAttribute('contenteditable');target.classList.remove('de-typing');if(target===selected){update({text:readText(target)});inspect();}}
function setEditing(on){
 if(on&&document.body.classList.contains('immersive')){status('Exit fullscreen before editing.');return;}
 finishTyping();editing=on;document.body.classList.toggle('deck-editing',on);panel.hidden=!on;toggle.setAttribute('aria-pressed',String(on));toggle.textContent=on?'Presentation mode':'Edit deck';
 if(on&&document.body.classList.contains('reading'))document.querySelector('#reading').click();
 document.querySelector('#reading').disabled=on;document.querySelector('#notes').disabled=on;
 if(on){listObjects();inspect();status(loadMessage);}else{select(null);if(dirty)save();}
 document.dispatchEvent(new CustomEvent('signal:editmode'));requestAnimationFrame(()=>{for(const [id,patch] of Object.entries(edits.objects))apply(id,patch);locate();});
}
toggle.addEventListener('click',()=>setEditing(!editing));panel.querySelector('[data-done]').onclick=()=>setEditing(false);
deck.addEventListener('click',event=>{if(!editing)return;if(event.target.closest('[contenteditable="true"]')){event.stopImmediatePropagation();return;}event.preventDefault();event.stopImmediatePropagation();const element=event.target.closest('[data-edit-id]');if(element)select(element);},true);
deck.addEventListener('dblclick',event=>{if(!editing)return;const element=event.target.closest('[data-edit-id]');if(!element||!isText(element)||element.isContentEditable)return;event.preventDefault();select(element);if(element.namespaceURI==='http://www.w3.org/2000/svg'){panel.querySelector('[data-text]').focus();return;}element.setAttribute('contenteditable','true');element.classList.add('de-typing');element.focus();},true);
deck.addEventListener('input',event=>{if(editing&&event.target.isContentEditable&&event.target===selected){update({text:readText(selected)},false);dirty=true;} });
deck.addEventListener('focusout',event=>{if(event.target.matches('[contenteditable="true"]'))finishTyping();});
deck.addEventListener('paste',event=>{if(!editing||!event.target.isContentEditable)return;event.preventDefault();const selection=getSelection();if(!selection?.rangeCount)return;const range=selection.getRangeAt(0);range.deleteContents();const text=document.createTextNode(event.clipboardData.getData('text/plain'));range.insertNode(text);range.setStartAfter(text);range.collapse(true);selection.removeAllRanges();selection.addRange(range);update({text:readText(selected)},false);dirty=true;});
panel.querySelector('[data-text]').addEventListener('input',event=>{if(!selected)return;update({text:event.target.value},false);dirty=true;});
panel.querySelector('[data-text]').addEventListener('change',commit);
for(const field of panel.querySelectorAll('[data-field]'))field.addEventListener('change',()=>{if(!selected||field.value==='')return;const key=field.dataset.field,value=field.type==='number'?Number(field.value):field.value;try{validateEdits({schema,objects:{[selected.dataset.editId]:{[key]:value}}});update({[key]:value});inspect();}catch(error){status(error.message);inspect();}});
panel.querySelector('[data-slide-background]').onclick=()=>select(deck.querySelector('.slide.active'));
panel.querySelector('[data-save]').onclick=()=>{finishTyping();commit();};
panel.querySelector('[data-undo]').onclick=()=>{finishTyping();edits=history.undo();applyAll();save();inspect();};panel.querySelector('[data-redo]').onclick=()=>{finishTyping();edits=history.redo();applyAll();save();inspect();};
panel.querySelector('[data-reset-object]').onclick=()=>{if(!selected)return;const id=selected.dataset.editId;restore(id);delete edits.objects[id];commit();inspect();locate();};
panel.querySelector('[data-export]').onclick=()=>{finishTyping();commit();const blob=new Blob([JSON.stringify(edits,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='signal-deck-edits.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Exported edits. Keep this JSON file with your seminar materials.');};
panel.querySelector('[data-import]').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('Choose an edits file smaller than 2 MB.');const imported=validateEdits(JSON.parse(await file.text()));if(imported.version!==version)throw Error('This file belongs to a different deck revision.');const unknown=Object.keys(imported.objects).filter(id=>!objects.has(id));if(unknown.length)throw Error('This file contains objects from a different deck version.');finishTyping();edits=imported;commit();applyAll();inspect();status('Imported and saved in this browser. Undo is available.');}catch(error){status('Import failed: '+error.message);}event.target.value='';});
for(const handle of outline.querySelectorAll('button'))handle.addEventListener('pointerdown',event=>{
 if(!selected)return;event.preventDefault();finishTyping();const rect=selected.getBoundingClientRect(),slide=selected.closest('.slide'),patch=edits.objects[selected.dataset.editId]||{};
 drag={pointer:event.pointerId,target:handle,resize:handle.classList.contains('de-resize'),clientX:event.clientX,clientY:event.clientY,x:patch.x||0,y:patch.y||0,width:rect.width,height:rect.height,slideWidth:slide.clientWidth,slideHeight:slide.clientHeight};handle.setPointerCapture(event.pointerId);
});
outline.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;const dx=event.clientX-drag.clientX,dy=event.clientY-drag.clientY,clamp=(value,min,max)=>Math.min(max,Math.max(min,value));update(drag.resize?{width:clamp((drag.width+dx)/drag.slideWidth*100,1,100),height:clamp((drag.height+dy)/drag.slideHeight*100,1,100)}:{x:clamp(drag.x+dx/drag.slideWidth*100,-100,100),y:clamp(drag.y+dy/drag.slideHeight*100,-100,100)},false);dirty=true;});
function endDrag(){if(!drag)return;drag=null;commit();inspect();}outline.addEventListener('pointerup',endDrag);outline.addEventListener('pointercancel',endDrag);
document.addEventListener('keydown',event=>{if(!editing)return;if(event.key==='Escape'){finishTyping();select(null);return;}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();finishTyping();commit();}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'&&!event.target.isContentEditable&&!/INPUT|TEXTAREA/.test(event.target.tagName)){event.preventDefault();panel.querySelector(event.shiftKey?'[data-redo]':'[data-undo]').click();}});
document.addEventListener('signal:slidechange',()=>{if(editing){finishTyping();select(null);listObjects();}for(const [id,patch] of Object.entries(edits.objects))apply(id,patch);requestAnimationFrame(locate);});
window.addEventListener('resize',()=>{for(const [id,patch] of Object.entries(edits.objects))apply(id,patch);requestAnimationFrame(locate);});document.addEventListener('scroll',locate,true);
applyAll();inspect();

document.querySelector('#fullscreen').addEventListener('click',()=>{if(editing)setEditing(false);});
window.addEventListener('pagehide',()=>{if(dirty){finishTyping();commit();}});
