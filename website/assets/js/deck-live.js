import {createFollowState} from './deck-follow-model.mjs?v=shared-room-1';

export function connectLiveDeck({slides,outline,current,showRemote}){
 const params=new URLSearchParams(location.search),embedded=params.get('embedded')==='1';
 const token=embedded?sessionStorage.getItem('signal-admin-token'):null,host=embedded&&!!token;
 const bar=document.querySelector('#liveDeckBar');bar.hidden=false;document.body.classList.add('has-live-deck');
 const label=bar.querySelector('[data-live-label]'),detail=bar.querySelector('[data-live-detail]'),control=bar.querySelector('[data-live-control]');
 const model=createFollowState(slides[current()].key),indexOf=key=>slides.findIndex(slide=>slide.key===key);
 const apiBase=window.SIGNAL_HOSTING?.apiOrigin||'',api=apiBase+'/api/presentation/live';
 let connected=false,hasPublished=false,revision=0,polling=false,sending=false,queued=null,stopped=false;
 const title=slide=>slide.title.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 function paint(){
  bar.dataset.state=connected?'connected':'offline';
  if(host){label.textContent=connected?'Shared admin control':'Connecting';detail.textContent='Slide '+(current()+1)+' / '+title(slides[current()]);control.hidden=true;return;}
  label.textContent=!connected?'Connection interrupted':!hasPublished?'Waiting for presenter':model.following?'Following live':'Exploring independently';
  const at=indexOf(model.presenter);detail.textContent=at<0?'':'Presenter now: '+(at+1)+' / '+title(slides[at]);
  control.textContent=model.following?'Browse independently':'Return to live';control.disabled=!connected;
 }
 function receive(data){
  if(data.deckId!==outline.deckId||indexOf(data.slideKey)<0)throw Error('Deck version mismatch');
  if(data.revision<revision)return;
  revision=data.revision;connected=true;hasPublished=data.published;
  if(host){if(indexOf(data.slideKey)!==current())showRemote(indexOf(data.slideKey));}
  else{const target=model.receive(data.slideKey);if(data.published&&target&&indexOf(target)!==current())showRemote(indexOf(target));}
 }
 async function poll(){
  if(polling||sending||stopped||document.visibilityState==='hidden')return;polling=true;
  try{const response=await fetch(api,{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Live unavailable');receive(await response.json());}catch{connected=false;}finally{polling=false;paint();}
 }
 async function publish(key){
  queued=key;if(sending)return;sending=true;
  while(queued&&!stopped){const target=queued;queued=null;
   try{const response=await fetch(apiBase+'/api/admin/presentation',{method:'PUT',headers:{'Content-Type':'application/json','x-signal-request':'1',Authorization:'Bearer '+token},body:JSON.stringify({deckId:outline.deckId,slideKey:target,expectedRevision:revision}),signal:AbortSignal.timeout(8000)});const data=await response.json();
    if(response.status===409&&data.slideKey){queued=null;receive(data);}
    else if(!response.ok){if([401,403].includes(response.status)){stopped=true;label.textContent='Admin login expired';}throw Error('Publish failed');}
    else receive(data);
   }catch{connected=false;queued=null;}
  }sending=false;paint();
 }
 control.addEventListener('click',()=>{if(model.following)model.browse(slides[current()].key);else{const target=indexOf(model.resume());if(target>=0)showRemote(target);}paint();});
 document.addEventListener('signal:slidenavigate',event=>{if(host)void publish(event.detail.key);else{model.browse(event.detail.key);paint();}});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden')void poll();});
 void poll();setInterval(poll,1000);paint();
}
