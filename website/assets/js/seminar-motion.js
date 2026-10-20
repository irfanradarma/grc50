// Active-slide lifecycle for the evidence loop and read-only mobile views.
const stages=[
 ['Objective context reaches the risk owner','Targets, delivery dependencies and KPI trajectory establish what could prevent achievement.'],
 ['Risk priorities guide assurance','Exposure and control assumptions focus testing on the protection that matters.'],
 ['Assurance evidence returns to risk','An unsupported downside case challenges assumed protection. Management reviews the assessment.'],
 ['Management responds to protect the objective','An accountable owner agrees action, verifies effectiveness and reviews the KPI outlook. Then the loop repeats.']
];
let loopTimer=null;
function syncLoops(){
 clearInterval(loopTimer);loopTimer=null;
 document.querySelectorAll('[data-evidence-loop]').forEach(root=>root.classList.remove('is-playing'));
 const root=document.querySelector('.slide.active [data-evidence-loop]');
 if(document.body.classList.contains('deck-editing')||!root||root.dataset.enabled!=='true'||document.visibilityState==='hidden')return;
 let step=0;root.dataset.cycles='0';
 function paint(){
  root.dataset.step=String(step);
  const title=root.querySelector('[data-loop-title]'),detail=root.querySelector('[data-loop-detail]');
  const content=stages;
  if(title)title.textContent=String(step+1).padStart(2,'0')+' / '+content[step][0];
  if(detail)detail.textContent=content[step][1];

 }
 root.classList.add('is-playing');paint();loopTimer=setInterval(()=>{step=(step+1)%stages.length;if(step===0)root.dataset.cycles=String(Number(root.dataset.cycles)+1);paint();},2400);
}
document.querySelectorAll('[data-loop-toggle]').forEach(button=>button.addEventListener('click',()=>{
 const root=button.closest('[data-evidence-loop]'),enabled=root.dataset.enabled!=='true';root.dataset.enabled=String(enabled);button.setAttribute('aria-pressed',String(enabled));button.textContent=enabled?'Pause the loop':'Start the evidence loop';syncLoops();
}));


const frames=Array.from(document.querySelectorAll('[data-live-tour]'));
function send(frame,data){frame.contentWindow?.postMessage({type:'signal-tour',...data},new URL(frame.dataset.src).origin);}
function syncFrames(){
 frames.forEach(frame=>{
  const gallery=frame.closest('[data-tour-gallery]'),active=frame.closest('.slide').classList.contains('active')&&document.visibilityState!=='hidden';
  const paused=gallery.dataset.userPaused==='true'||document.body.classList.contains('deck-editing');
  if(active){if(!frame.getAttribute('src')||frame.getAttribute('src')==='about:blank'){gallery.dataset.ready='false';gallery.querySelector('.d-demo-loading').hidden=false;frame.src=frame.dataset.src;}send(frame,{paused});}
  else if(frame.getAttribute('src')&&frame.getAttribute('src')!=='about:blank'){frame.src='about:blank';gallery.dataset.ready='false';}
  gallery.querySelector('[data-tour-pause]').textContent=paused?'Play guide':'Pause guide';
 });
}
window.addEventListener('message',event=>{
 if(event.data?.type!=='signal-tour-state')return;
 const frame=frames.find(frame=>frame.contentWindow===event.source&&new URL(frame.dataset.src).origin===event.origin);
 if(!frame)return;
 const {step,total,title,paused}=event.data;
 if(!Number.isInteger(step)||!Number.isInteger(total)||step<0||step>=total||total>12||typeof title!=='string')return;
 const gallery=frame.closest('[data-tour-gallery]');gallery.dataset.ready='true';gallery.querySelector('.d-demo-loading').hidden=true;
 gallery.querySelector('[data-tour-status]').textContent=String(step+1).padStart(2,'0')+' / '+String(total).padStart(2,'0')+' / '+title;
 const progress=gallery.querySelector('[data-tour-progress]');progress.innerHTML=Array.from({length:total},(_,i)=>'<i class="'+(i===step?'active':'')+'"></i>').join('');
 progress.setAttribute('aria-label','Step '+(step+1)+' of '+total);
 const desired=gallery.dataset.userPaused==='true'||document.body.classList.contains('deck-editing');if(paused!==desired)send(frame,{paused:desired});
});
function sync(){syncLoops();syncFrames();}
frames.forEach(frame=>{
 const gallery=frame.closest('[data-tour-gallery]');gallery.dataset.userPaused='false';
 const resize=()=>{frame.style.transform='scale('+(frame.parentElement.clientWidth/1280)+')';};new ResizeObserver(resize).observe(frame.parentElement);resize();
 frame.addEventListener('load',syncFrames);
 gallery.querySelector('[data-tour-pause]').addEventListener('click',()=>{gallery.dataset.userPaused=String(gallery.dataset.userPaused!=='true');syncFrames();});
 for(const [selector,command] of [['[data-tour-prev]','previous'],['[data-tour-next]','next'],['[data-tour-replay]','replay']])gallery.querySelector(selector).addEventListener('click',()=>{gallery.dataset.userPaused=String(command!=='replay');send(frame,{command});syncFrames();});
});
document.addEventListener('signal:slidechange',sync);
document.addEventListener('signal:editmode',sync);
document.addEventListener('visibilitychange',sync);
sync();
