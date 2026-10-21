// Audience decks fill the viewport without requiring a browser fullscreen gesture.
export function setupAudienceView(){
 const audience=new URLSearchParams(location.search).get('present')!=='1';
 if(!audience)return false;
 document.body.classList.add('audience-deck','immersive');
 for(const id of ['editDeck','reading','notes'])document.getElementById(id).hidden=true;
 const groups=[
  {name:'top',panels:[document.querySelector('.toolbar'),document.getElementById('liveDeckBar')]},
  {name:'bottom',panels:[document.querySelector('.controls')]}
 ];
 let keyboard=false;
 function schedule(group){
  clearTimeout(group.timer);
  group.timer=setTimeout(()=>{
   const engaged=group.panels.some(panel=>(matchMedia('(hover: hover)').matches&&panel.matches(':hover'))||(keyboard&&panel.contains(document.activeElement)));
   if(engaged||document.querySelector('dialog[open]')){schedule(group);return;}
   document.body.classList.remove('audience-'+group.name+'-visible');
  },1800);
 }
 function reveal(group){document.body.classList.add('audience-'+group.name+'-visible');schedule(group);}
 function pointer(event){
  keyboard=false;
  // Only the nearest 32px of the top/bottom edge reveals that panel.
  // Movement over slide content leaves both panels undisturbed.
  for(const group of groups){
   const near=group.name==='top'?event.clientY<=32:event.clientY>=window.innerHeight-32;
   const visible=document.body.classList.contains('audience-'+group.name+'-visible');
   if(near||(visible&&group.panels.some(panel=>panel.contains(event.target))))reveal(group);
  }
 }
 document.addEventListener('pointermove',pointer,{passive:true});
 document.addEventListener('pointerdown',pointer,{passive:true});
 // Tab exposes controls for keyboard access; slide navigation must never reveal them.
 document.addEventListener('keydown',event=>{if(event.key==='Tab'){keyboard=true;groups.forEach(reveal);}});
 document.addEventListener('focusin',event=>{if(keyboard)for(const group of groups)if(group.panels.some(panel=>panel.contains(event.target)))reveal(group);});
 document.addEventListener('focusout',()=>groups.forEach(schedule));
 return true;
}
