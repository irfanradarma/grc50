let library;
function loadLibrary(){
 if(window.rrwebReplay)return Promise.resolve(window.rrwebReplay);
 return library??=new Promise((resolve,reject)=>{const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('../vendor/rrweb-replay.css',import.meta.url).href;document.head.append(css);const script=document.createElement('script');script.src=new URL('../vendor/rrweb-replay.js',import.meta.url).href;script.onload=()=>resolve(window.rrwebReplay);script.onerror=()=>{library=null;reject(Error('Unable to load live replay'));};document.head.append(script);});
}
export function mountLiveDemo(stage){
 let disposed=false,source=null,replay=null,pending=[],id='',width=1280,height=800;
 const root=document.createElement('div');root.className='live-demo-replay';stage.append(root);
 const loading=document.createElement('p');loading.className='live-demo-loading';loading.textContent='Connecting to the live demonstration...';stage.append(loading);
 const fit=()=>{const scale=Math.min(stage.clientWidth/width,stage.clientHeight/height);Object.assign(root.style,{width:width+'px',height:height+'px',transform:'scale('+scale+')',left:((stage.clientWidth-width*scale)/2)+'px',top:((stage.clientHeight-height*scale)/2)+'px'});};
 const observer=new ResizeObserver(fit);observer.observe(stage);fit();
 const clear=()=>{replay?.destroy();replay=null;pending=[];loading.hidden=false;};
 loadLibrary().then(({Replayer})=>{
  if(disposed)return;source=new EventSource((window.SIGNAL_HOSTING?.apiOrigin||'')+'/api/demo/stream');
  const accept=events=>{const meta=[...events].reverse().find(event=>event.type===4);if(meta){width=meta.data.width;height=meta.data.height;fit();}if(replay){events.forEach(event=>replay.addEvent(event));return;}pending.push(...events);if(!pending.some(event=>event.type===2))return;replay=new Replayer(pending,{root,liveMode:true,mouseTail:false,showWarning:false,showDebug:false,loadTimeout:0});replay.play(Math.max(0,pending.at(-1).timestamp-pending[0].timestamp));pending=[];loading.hidden=true;};
  source.onmessage=event=>{const data=JSON.parse(event.data);if(data.kind==='stop'){clear();id='';return;}if(data.kind==='start'){clear();id=data.streamId;return;}if(data.kind==='bootstrap'){clear();id=data.streamId||'';if(data.active)accept(data.events);return;}if(data.kind==='events'&&data.streamId===id)accept(data.events);};
  source.onerror=()=>{if(!replay)loading.hidden=false;};
 }).catch(()=>{loading.textContent='Unable to connect to the live demonstration.';});
 return()=>{disposed=true;source?.close();observer.disconnect();replay?.destroy();root.remove();loading.remove();};
}
