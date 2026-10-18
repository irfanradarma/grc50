const slides=[];
function add(section,title,html,note,type=''){slides.push({section,title,html,note,type});}
await window.buildHoriSeminar({add});

const deck=document.getElementById('deck');
deck.innerHTML=slides.map((s,i)=>`<section class="slide ${s.type}" id="slide-${i+1}" aria-label="Slide ${i+1}: ${s.title.replace(/<br>/g,' ')}"><span class="eyebrow">${s.section}</span><${s.type==='divider'?'h1':'h2'}>${s.title}</${s.type==='divider'?'h1':'h2'}><div class="body">${s.html}</div><div class="foot">HORI / Beyond Compliance / Signals to decisions</div></section>`).join('');
let current=0;
function show(index){current=Math.max(0,Math.min(slides.length-1,index));document.querySelectorAll('.slide').forEach((el,i)=>el.classList.toggle('active',i===current));document.getElementById('counter').textContent=`${String(current+1).padStart(2,'0')} / ${slides.length}`;document.getElementById('sectionLabel').textContent=document.querySelector('.slide.active > .eyebrow').textContent;document.getElementById('progressFill').style.width=`${(current+1)/slides.length*100}%`;document.getElementById('noteText').textContent=slides[current].note;document.getElementById('prev').disabled=current===0;document.getElementById('next').disabled=current===slides.length-1;if(document.body.classList.contains('reading'))document.getElementById(`slide-${current+1}`).scrollIntoView({block:'start'});document.dispatchEvent(new CustomEvent('hori:slidechange',{detail:{index:current}}));}
function go(i){const n=Math.max(0,Math.min(slides.length-1,i));if(location.hash===`#slide-${n+1}`)show(n);else location.hash=`slide-${n+1}`;}
function fromHash(){const m=location.hash.match(/^#slide-(\d+)$/);show(m?Number(m[1])-1:0);}
window.addEventListener('hashchange',fromHash);fromHash();
document.getElementById('next').onclick=()=>go(current+1);document.getElementById('prev').onclick=()=>go(current-1);
document.getElementById('notes').onclick=e=>{const on=document.body.classList.toggle('with-notes');document.getElementById('notesPanel').hidden=!on;e.currentTarget.setAttribute('aria-pressed',String(on));};
document.getElementById('reading').onclick=e=>{const on=document.body.classList.toggle('reading');e.currentTarget.setAttribute('aria-pressed',String(on));e.currentTarget.textContent=on?'Presentation view':'Reading view';show(current);};
let savedView=null;
function setImmersive(on){
 document.body.classList.toggle('immersive',on);
 const control=document.getElementById('fullscreen');control.textContent=on?'Exit fullscreen':'Fullscreen';control.setAttribute('aria-pressed',String(on));
 if(on&&!savedView){savedView={reading:document.body.classList.contains('reading'),notes:document.body.classList.contains('with-notes')};document.body.classList.remove('reading','with-notes');document.getElementById('notesPanel').hidden=true;}
 else if(!on&&savedView){document.body.classList.toggle('reading',savedView.reading);document.body.classList.toggle('with-notes',savedView.notes);document.getElementById('notesPanel').hidden=!savedView.notes;savedView=null;}
 show(current);
}
async function toggleFullscreen(){
 const on=!document.body.classList.contains('immersive');setImmersive(on);
 try{if(on)await document.documentElement.requestFullscreen();else if(document.fullscreenElement)await document.exitFullscreen();}catch{/* Immersive viewport remains available when native fullscreen is restricted. */}
}
document.getElementById('fullscreen').onclick=toggleFullscreen;
document.addEventListener('fullscreenchange',()=>setImmersive(!!document.fullscreenElement));
let touchStart=null;
deck.addEventListener('touchstart',e=>{if(e.target.closest('button,a,input,select,textarea'))return;touchStart={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});
deck.addEventListener('touchend',e=>{if(!touchStart||!document.body.classList.contains('immersive'))return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)go(current+(dx<0?1:-1));},{passive:true});
const toc=document.getElementById('toc');document.getElementById('tocList').innerHTML=slides.map((s,i)=>`<button data-slide="${i}"><span>${String(i+1).padStart(2,'0')}</span>${s.title.replace(/<br>/g,' ')}</button>`).join('');document.getElementById('contents').onclick=()=>toc.showModal();document.getElementById('closeToc').onclick=()=>toc.close();toc.addEventListener('click',e=>{const b=e.target.closest('[data-slide]');if(b){toc.close();go(Number(b.dataset.slide));}});
document.addEventListener('keydown',e=>{if(document.body.classList.contains('deck-editing'))return;if(document.querySelector('dialog[open]')||/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))return;if(e.key===' '&&/BUTTON|A|SUMMARY/.test(document.activeElement.tagName))return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(current+1);}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1);}if(e.key==='Home'){e.preventDefault();go(0);}if(e.key==='End'){e.preventDefault();go(slides.length-1);}if(e.key==='Escape'&&document.body.classList.contains('immersive')){setImmersive(false);return;}if(e.key.toLowerCase()==='f'){e.preventDefault();toggleFullscreen();}if(e.key.toLowerCase()==='n'&&!document.body.classList.contains('immersive'))document.getElementById('notes').click();});
await import('./seminar-workshop-interactions.js?v=signal-10');

await import('./deck-editor.js?v=signal-10');
