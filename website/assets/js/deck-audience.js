// Audience decks fill the viewport without requiring a browser fullscreen gesture.
export function setupAudienceView(){
 const audience=new URLSearchParams(location.search).get('present')!=='1';
 if(!audience)return false;
 document.body.classList.add('audience-deck','immersive');
 for(const id of ['editDeck','reading','notes'])document.getElementById(id).hidden=true;
 const panels=[document.querySelector('.toolbar'),document.querySelector('.controls'),document.getElementById('liveDeckBar')];
 let timer,keyboard=false;
 const engaged=()=>panels.some(panel=>(matchMedia('(hover: hover)').matches&&panel.matches(':hover'))||(keyboard&&panel.contains(document.activeElement)))||!!document.querySelector('dialog[open]');
 function hide(){
  if(engaged()){timer=setTimeout(hide,1800);return;}
  document.body.classList.remove('audience-chrome-visible');
 }
 function reveal(){clearTimeout(timer);document.body.classList.add('audience-chrome-visible');timer=setTimeout(hide,1800);}
 document.addEventListener('pointermove',()=>{keyboard=false;reveal();},{passive:true});
 document.addEventListener('pointerdown',()=>{keyboard=false;reveal();},{passive:true});
 document.addEventListener('keydown',()=>{keyboard=true;reveal();});
 document.addEventListener('focusin',event=>{if(panels.some(panel=>panel.contains(event.target)))reveal();});
 document.addEventListener('focusout',()=>{clearTimeout(timer);timer=setTimeout(hide,1800);});
 return true;
}
