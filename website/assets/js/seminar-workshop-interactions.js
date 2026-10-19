const app=window.signalWorkshopApp;
const input=document.querySelector('[data-workshop-url]'),button=document.querySelector('[data-workshop-connect]'),frame=document.querySelector('[data-workshop-qr]'),status=document.querySelector('[data-workshop-url-status]');
let sessionCode='';
function connect(){
 try{
 const url=new URL(input.value);if(!['http:','https:'].includes(url.protocol)||url.username||url.password||!/^\/audience\/sessions\/[A-Z0-9]{6}\/?$/i.test(url.pathname))throw Error('Use the audience session link.');
 sessionCode=url.pathname.split('/')[3].toUpperCase();
 frame.src=app+'/join-qr?join='+encodeURIComponent(url.href);
 localStorage.setItem('signal-workshop-join-url-v3',url.href);
 document.querySelectorAll('[data-workshop-launch]').forEach(a=>a.href=url.href);
 status.textContent=['localhost','127.0.0.1'].includes(url.hostname)?'Use a reachable LAN address for audience phones.':'Connected to session '+sessionCode+'. Phones need access to '+url.hostname+'.';
 }catch{status.textContent='Paste /audience/sessions/CODE from presenter controls.';}
}
const linkedSession=new URLSearchParams(location.search).get('session');
const providedJoin=new URLSearchParams(location.search).get('join');
input.value=providedJoin||(linkedSession&&/^[A-Z0-9]{6}$/i.test(linkedSession)?app+'/audience/sessions/'+linkedSession.toUpperCase():localStorage.getItem('signal-workshop-join-url-v3')||'');
button.addEventListener('click',connect);if(input.value)connect();
document.querySelector('[data-reveal-exposure]').addEventListener('click',e=>{const root=e.target.closest('.slide').querySelector('.d-exposure');root.classList.toggle('revealed');e.target.textContent=root.classList.contains('revealed')?'Hide the exposure check':'Reveal the exposure check';e.target.setAttribute('aria-expanded',String(root.classList.contains('revealed')));});
document.querySelector('[data-residual-range]').addEventListener('input',e=>{document.querySelector('[data-residual]').textContent='Projected score: '+((4-Number(e.target.value))*4);});
document.querySelector('[data-session-stats]').addEventListener('click',async e=>{
 const message=document.querySelector('[data-session-status]');if(!sessionCode){message.textContent='Connect the audience session on the QR slide first.';return;}
 e.target.disabled=true;message.textContent='Loading owner-authorized session summaryâ€¦';
 try{const response=await fetch(app+'/api/workshop/host/'+sessionCode,{credentials:'include'});if(!response.ok)throw Error('Owner session unavailable');const d=await response.json();const sum=k=>d.progress.reduce((n,p)=>n+Number(p[k]||0),0);const vals=[sum('decided'),sum('reviews'),sum('plans')];document.querySelectorAll('[data-live-stats] strong').forEach((el,i)=>el.textContent=vals[i]);message.textContent='Session '+sessionCode+' Â· '+d.progress.length+' participants Â· updated '+new Date().toLocaleTimeString()+'. Aggregate counts reflect recorded decisions, not KPI improvement.';}catch{message.textContent='Open this deck through the app at /presentation/deck/ in the presenter browser, and connect your owned session.';}finally{e.target.disabled=false;}
});

await import('./seminar-framework.js?v=speakers-17');
await import('./seminar-motion.js?v=speakers-17');
