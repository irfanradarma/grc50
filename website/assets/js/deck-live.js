import {createFollowState} from './deck-follow-model.mjs?v=signal-12';

export function connectLiveDeck({slides,outline,current,showRemote}){
 const params=new URLSearchParams(location.search),code=(params.get('session')||'').toUpperCase();
 if(!params.has('session'))return;
 const host=params.get('present')==='1',bar=document.querySelector('#liveDeckBar');
 bar.hidden=false;document.body.classList.add('has-live-deck');
 const label=bar.querySelector('[data-live-label]'),detail=bar.querySelector('[data-live-detail]'),control=bar.querySelector('[data-live-control]');
 const model=createFollowState(slides[current()].key),indexOf=key=>slides.findIndex(slide=>slide.key===key);
 let connected=false,hasPublished=false,lastSent='',queued=null,sending=false,polling=false,ownerDenied=false;
 if(!/^[A-Z0-9]{6}$/.test(code)){label.textContent='Invalid session link';detail.textContent='Open a deck link shared from Admin.';control.hidden=true;return;}
 const api='/api/presentation/'+code,write='/api/workshop/host/'+code+'/presentation';
 const cleanTitle=slide=>slide.title.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 function paint(){
  bar.dataset.state=connected?'connected':'offline';
  if(host){label.textContent=ownerDenied?'Presenter access unavailable':connected?'Broadcasting live':'Connecting presenter';detail.textContent=ownerDenied?'Open the presenter link in the browser that owns this Admin session.':'Slide '+(current()+1)+' / '+cleanTitle(slides[current()]);control.hidden=true;return;}
  label.textContent=!connected?'Connection interrupted':!hasPublished?'Waiting for presenter':model.following?'Following live':'Exploring independently';
  const at=indexOf(model.presenter);
  detail.textContent=!hasPublished||at<0?'The presenter has not started sharing slides.':'Presenter now: '+(at+1)+' / '+cleanTitle(slides[at]);
  control.textContent=model.following?'Browse independently':'Return to live';control.disabled=!hasPublished;
 }
 async function read(){
  const response=await fetch(api,{signal:AbortSignal.timeout(5000),cache:'no-store'});
  if(!response.ok)throw Error('Live session unavailable');
  const data=await response.json();
  if(data.deckId!==outline.deckId||indexOf(data.slideKey)<0)throw Error('Deck version mismatch');
  return data;
 }
 async function publish(){
  if(sending||ownerDenied||!queued)return;
  sending=true;const key=queued;queued=null;
  try{
   const response=await fetch(write,{method:'PUT',headers:{'Content-Type':'application/json','x-signal-request':'1'},body:JSON.stringify({deckId:outline.deckId,slideKey:key}),signal:AbortSignal.timeout(5000)});
   if(!response.ok){if([401,403,404].includes(response.status))ownerDenied=true;throw Error('Publish failed');}
   lastSent=key;connected=true;
  }catch{connected=false;}
  finally{sending=false;paint();if(queued)void publish();}
 }
 function queueCurrent(){const key=slides[current()].key;if(key!==lastSent){queued=key;void publish();}else paint();}
 async function poll(){
  if(polling||document.visibilityState==='hidden'||ownerDenied)return;polling=true;
  try{const data=await read();connected=true;hasPublished=data.published;
   if(!host){const target=model.receive(data.slideKey);if(data.published&&target&&indexOf(target)!==current()&&!document.body.classList.contains('deck-editing'))showRemote(indexOf(target));}
   else if(!connected||slides[current()].key!==lastSent)queueCurrent();
  }catch{connected=false;}finally{polling=false;paint();}
 }
 control.addEventListener('click',()=>{if(model.following)model.browse(slides[current()].key);else showRemote(indexOf(model.resume()));paint();});
 document.addEventListener('signal:slidenavigate',event=>{if(!host){model.browse(event.detail.key);paint();}});
 document.addEventListener('signal:slidechange',()=>{if(host)queueCurrent();});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden')void poll();});
 document.addEventListener('signal:editmode',()=>{if(!host&&document.body.classList.contains('deck-editing')){model.browse(slides[current()].key);paint();}});
 void(async()=>{
  if(host){try{const data=await read();if(data.published&&!location.hash)showRemote(indexOf(data.slideKey));}catch{/* Publishing still performs the ownership check. */}queueCurrent();}
  else await poll();
 })();
 setInterval(()=>{if(host&&!ownerDenied&&!sending&&slides[current()].key!==lastSent)queueCurrent();void poll();},1500);
 paint();
}
