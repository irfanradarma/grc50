import {record} from '@rrweb/record';
import {apiOrigin,authHeaders} from '../shared/deployment';
export function installDemoRecorder(){
 let stop:(()=>void)|undefined,streamId='',queue:any[]=[],sending=false,disposed=false,lastFlush=0;
 const tell=(data:any)=>parent.postMessage(data,location.origin);
 const shutdown=()=>{stop?.();stop=undefined;streamId='';queue=[];};
 async function flush(){
  if(!streamId||sending||!queue.length&&Date.now()-lastFlush<3000)return;lastFlush=Date.now();sending=true;const id=streamId,events=queue.splice(0,500);
  try{const response=await fetch(apiOrigin+'/api/admin/demo/events',{method:'POST',headers:{'Content-Type':'application/json','x-signal-request':'1',...authHeaders(true)},body:JSON.stringify({streamId:id,events}),signal:AbortSignal.timeout(7000)});if(!response.ok)throw Error('Demo connection ended');}
  catch{if(streamId===id){shutdown();tell({type:'signal-demo-error',streamId:id});}}
  finally{sending=false;}
 }
 function receive(event:MessageEvent){
  if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='signal-demo-control')return;
  if(!event.data.active){shutdown();return;}
  if(streamId===event.data.streamId&&stop)return;
  shutdown();streamId=event.data.streamId;
  stop=record({emit:event=>queue.push(event),checkoutEveryNms:10_000,inlineStylesheet:true,maskInputOptions:{password:true},sampling:{mousemove:50,scroll:100},recordCanvas:false})||undefined;
  void flush();
 }
 window.addEventListener('message',receive);
 const timer=setInterval(()=>{if(disposed)return;tell({type:'signal-demo-ready'});if(streamId)void flush();},250);
 tell({type:'signal-demo-ready'});
 return()=>{disposed=true;shutdown();clearInterval(timer);window.removeEventListener('message',receive);};
}
