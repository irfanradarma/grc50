const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const dataHandlingKinds=['data-chat-cli','data-agent-loop','data-session-checks','data-task-folder','data-everyday-sweetspot','data-local-workflow'];
const detail={
 "attach": [
  "The original stays. A copy goes online.",
  "Uploading a file from your computer sends a copy to the service. The original is still on your computer unless you remove it.",
  "Check whether the document is suitable to upload before pressing Send."
 ],
 "folder": [
  "The files stay. Read information can travel.",
  "The agent works with files on your computer. Information it reads may be sent to the online AI service it uses.",
  "Limit actual access to the files needed for the job."
 ],
 "localtools": [
  "The agent reads and works",
  "It may open files, search for information or run a task on your computer, within its permissions.",
  "Check what it is allowed to read and do before starting."
 ],
 "context": [
  "AI works with what you share",
  "Your question, parts of the document and earlier messages can help AI form an answer. It may still miss details.",
  "Be specific about the task and check the answer against the document."
 ],
 "model": [
  "There can be data in both places",
  "The original can remain on your computer while the online service receives a copy or selected information. An answer returning does not erase that copy.",
  "Check your account’s rules for use, storage, access and deletion."
 ],
 "output": [
  "You receive a draft",
  "AI can help you write, summarise or analyse. Its answer can still contain mistakes or private information.",
  "Check it before using it or sending it to someone else."
 ],
 "commands": [
  "On your laptop can still mean online",
  "An agent can work on your computer while using an AI service over the internet.",
  "Check the service it uses; do not assume the work stays offline."
 ],
 "readonly": [
  "Reading can still mean sharing",
  "Stopping an agent from changing a file does not necessarily stop it from sending readable contents to AI.",
  "Check what it can read as well as what it can change."
 ],
 "rawoutput": [
  "The result can contain private details",
  "A task run on your computer may produce names, figures or other details that the agent can pass to AI.",
  "Review what goes back to AI, not only which file you opened."
 ],
 "account": [
  "Use the right account",
  "Your personal account and your organisation’s approved account may have different rules.",
  "Check which account you may use for this document."
 ],
 "reuse": [
  "Check how your information is used",
  "The rules for improving AI and sending feedback can differ between accounts and tools.",
  "Read the rules for the account and feature you actually use."
 ],
 "history": [
  "Check what is kept",
  "Chats, uploaded documents and saved memories may be kept and deleted separately.",
  "Check the relevant settings; deleting a chat may not remove every copy."
 ],
 "permissions": [
  "Choose what AI can open",
  "An agent may read folders or use other connected tools within the access you give it.",
  "Allow only what the task needs and check that the restriction works."
 ],
 "sharing": [
  "Check who else can see it",
  "Shared chats, links and connected apps can give other people or services access.",
  "Check the audience before you share."
 ],
 "archive": [
  "Keep unrelated files out of reach",
  "Your main work folder may include salaries, other clients’ documents and passwords.",
  "Keep those files outside the agent’s actual access."
 ],
 "task": [
  "Prepare a small working folder",
  "Put a clear task, an example and only the necessary approved documents in it.",
  "A separate folder helps you choose. Also check the agent’s actual permissions."
 ],
 "ignore": [
  "A folder alone is not a lock",
  "Naming a folder “private” or asking AI to ignore it does not prove it cannot be opened.",
  "Use real file-access controls and check them."
 ],
 "schema": [
  "Start with a made-up example",
  "Describe the task and show made-up rows instead of the real client records when that is enough.",
  "Keep real names, figures and identifying details out of the example."
 ],
 "code": [
  "Ask AI to prepare a check",
  "AI can suggest a spreadsheet formula or a small program to help check records.",
  "Have someone competent review and test it before using real data."
 ],
 "private": [
  "You run the check privately",
  "You can run a reviewed check yourself on records kept outside the agent’s access.",
  "This is a separate local task, not a command whose full result is returned to AI."
 ],
 "summary": [
  "Keep the full report. Share a smaller part.",
  "Select the relevant pages or facts you may share. Keep other pages outside the agent’s access; only the selected information goes online.",
  "A short summary can still reveal private details. Review it before sending."
 ],
 "finding": [
  "Ask for help with the wording",
  "AI can turn approved facts into a clearer draft finding or report.",
  "You still verify the evidence and own the final conclusion."
 ]
};
const node=(id,x,y,w,h,title,sub=[],extra='')=>`<g class="dh-node ${extra}" data-dh-node="${id}" role="button" tabindex="0" aria-label="Explain ${esc(title)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/><text x="${x+14}" y="${y+25}" class="dh-node-title">${esc(title)}</text>${sub.map((s,i)=>`<text x="${x+14}" y="${y+49+i*18}" class="dh-node-sub">${esc(s)}</text>`).join('')}<circle cx="${x+w-12}" cy="${y+12}" r="3" class="dh-node-dot"/></g>`;
const pictures={
 browser:'<rect x="5" y="7" width="150" height="99" rx="9" fill="white"/><path d="M5 29H155"/><circle cx="16" cy="18" r="2"/><circle cx="25" cy="18" r="2"/><circle cx="34" cy="18" r="2"/><path d="M61 42h29l12 12v40H61z" fill="#e2f4fc"/><path d="M90 42v13h12M69 65h24M69 75h24M69 85h16"/><path d="M30 72V48m-9 9 9-9 9 9" stroke="#3f9c35"/>',
 cloud:'<path d="M40 94C8 94 7 49 39 45C42 9 95 7 110 41C146 31 171 89 127 94Z" fill="#e6f6fc"/><path d="m79 40 5 13 14 5-14 5-5 14-5-14-14-5 14-5z" fill="#009cde" stroke="#009cde"/><circle cx="111" cy="69" r="4" fill="#3f9c35" stroke="#3f9c35"/>',
 answer:'<rect x="18" y="9" width="127" height="84" rx="12" fill="white"/><path d="M44 93 29 109V91" fill="white"/><path d="M38 32h73M38 46h85M38 60h64"/><circle cx="126" cy="83" r="23" fill="#e9f6e6" stroke="#3f9c35"/><path d="m115 83 8 8 15-17" stroke="#3f9c35"/>',
 folder:'<path d="M9 29V15h53l15 15h75v76H9Z" fill="#e3f2fa"/><path d="M22 43h122l-10 63H9Z" fill="#d5edf9"/><path d="M50 49h40l11 11v36H50z" fill="white"/><path d="M90 49v12h11M60 72h30M60 82h24"/>',
 terminal:'<path d="M20 8h120v84H20z" fill="#00153d"/><path d="M27 17h106v65H27z" stroke="#56829d"/><path d="m42 36 10 9-10 9m20 0h21" stroke="#7bd5f6"/><path d="M20 92 4 106h152l-16-14" fill="#e2edf4"/><path d="M63 99h34"/>',
 document:'<path d="M43 5h53l24 24v79H43z" fill="white"/><path d="M96 5v25h24M57 47h48M57 61h48M57 75h48M57 89h30"/>',
 lock:'<rect x="38" y="48" width="85" height="60" rx="9" fill="#e3f4fa"/><path d="M54 48V30a26 26 0 0 1 52 0v18"/><circle cx="80" cy="72" r="6" fill="#009cde"/><path d="M80 78v13"/>',
 person:'<circle cx="80" cy="33" r="23" fill="#e9f6e6"/><path d="M35 108V94a45 45 0 0 1 90 0v14" fill="#e3f4fa"/>'
};
const picture=(kind,x,y,w=160,h=120)=>`<svg class="dh-picture" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 160 120" fill="none" stroke="#00153d" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${pictures[kind]||pictures.document}</svg>`;
const zone=(x,y,w,h,title,sub='',extra='')=>`<g class="dh-zone ${extra}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/><text x="${x+14}" y="${y+25}" class="dh-zone-title">${esc(title)}</text>${sub?`<text x="${x+14}" y="${y+45}" class="dh-zone-sub">${esc(sub)}</text>`:''}</g>`;
const arrow=(d,id,extra='')=>`<path class="dh-flow ${extra}" d="${d}" marker-end="url(#${id}-arrow)"/>`;
const label=(x,y,text,extra='')=>`<text x="${x}" y="${y}" class="dh-label ${extra}">${esc(text)}</text>`;
const svg=(id,height,title,content)=>`<svg class="dh-map" viewBox="0 0 1200 ${height}" role="group" aria-label="${esc(title)}"><title>${esc(title)}</title><defs><marker id="${id}-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="#009cde"/></marker></defs>${content}</svg>`;
const panel=(selected)=>{const d=detail[selected];return `<aside class="dh-detail" aria-live="polite"><div><small>SELECT A PICTURE TO LEARN MORE</small><h2 data-dh-title>${esc(d[0])}</h2></div><p data-dh-copy>${esc(d[1])}</p><p class="dh-detail-control"><b>What you can do</b><span data-dh-control>${esc(d[2])}</span></p></aside>`;};
const inspect=(id,selected,diagram,legend='Solid: data flow · dashed: optional path or control boundary.')=>{
 const marked=diagram.replaceAll(`class="dh-node " data-dh-node="${selected}"`,`class="dh-node selected" data-dh-node="${selected}" aria-pressed="true"`).replaceAll(`class="dh-node dh-scene-card " data-dh-node="${selected}"`,`class="dh-node dh-scene-card selected" data-dh-node="${selected}" aria-pressed="true"`);
 return `<div class="dh-inspector" data-dh-map="${id}" data-dh-selected="${selected}"><div class="dh-canvas" data-dh-interactive><span class="dh-pan-hint">Swipe across the picture; tap an item to learn more.</span>${marked}</div><div class="dh-legend">${esc(legend)}</div>${panel(selected)}</div>`;
};


const locationJourney=(slide,variant)=>{
 const cli=variant==='cli',limited=variant==='limited';
 const selected=cli?'folder':limited?'summary':'attach';
 const packet=kind=>`<svg viewBox="0 0 30 36" aria-hidden="true"><path d="M4 2h15l7 7v25H4Z"/><path d="M19 2v8h7M9 16h12M9 22h12M9 28h8"/></svg>`;
 const card=(key,where,icon,title,body,note)=>`<button type="button" class="dh-node dh-location-card${selected===key?' selected':''}" data-dh-node="${key}" aria-pressed="${selected===key}"><small>${esc(where)}</small><div class="dh-location-art">${picture(icon,0,0,200,150)}</div><strong>${esc(title)}</strong><span>${esc(body)}</span><em>${esc(note)}</em></button>`;
 const send=cli?'Information the agent reads':limited?'Only approved pages / facts':'A copy of your document';
 const original=cli?'Your files stay here':limited?'The full report stays here':'Your original file stays here';
 const cloudTitle=limited?'AI receives the selected part':cli?'AI receives shared information':'AI receives the uploaded copy';
 const note=cli?'Agent = the app on your computer. Its AI may be online.':limited?'Check permission before sharing even a short summary.':'For example: upload a report at chatgpt.com.';
 const computer=card(selected,'ON YOUR COMPUTER',cli?'terminal':'browser',original,cli?'The agent opens files within its access.':limited?'You prepare a smaller, approved version.':'You choose the document to upload.',note);
 const cloud=card('model','CLOUD / INTERNET','cloud',cloudTitle,'The online service works on what you send.','Copies may be kept under the service’s rules.');
 return `<div class="dh-inspector dh-location" data-dh-map="${slide.key}" data-dh-selected="${selected}" data-dh-location><div class="dh-location-stage" data-dh-interactive>
 <div class="dh-location-side dh-computer-side">${computer}<div class="dh-local-file">${picture(cli?'folder':'document',0,0,42,32)}<span>${limited?'Other pages stay out of AI’s access':'Original remains on your computer'}</span></div><button type="button" class="dh-arrival dh-node" data-dh-node="output" aria-pressed="false">AI answer received</button></div>
 <div class="dh-location-crossing" aria-label="Information travels to the online service; the answer returns"><div class="dh-route dh-route-out"><b>${esc(send)}</b><span class="dh-route-line"></span><span class="dh-data-packet">${packet('file')}</span></div><div class="dh-route dh-route-back"><b>The answer comes back</b><span class="dh-route-line"></span><span class="dh-data-packet">${packet('answer')}</span></div></div>
 <div class="dh-location-side dh-cloud-side">${cloud}<div class="dh-cloud-copy">${picture('document',0,0,42,32)}<span>${limited?'Selected information is now online':'A copy or shared information is now online'}</span></div><span class="dh-cloud-presence">Check access, storage & deletion</span></div>
 </div><div class="dh-location-footer"><div class="dh-location-steps"><span class="dh-step-one"><b>1</b> Choose what to share</span><span class="dh-step-two"><b>2</b> Information goes online</span><span class="dh-step-three"><b>3</b> An answer returns</span></div><div class="dh-motion-controls"><button type="button" data-dh-motion-toggle aria-pressed="false">Pause movement</button><button type="button" data-dh-motion-replay>Replay</button></div></div>
 <p class="dh-legend">${cli?'Working on your laptop does not automatically keep the information on your laptop. ':''}Cloud means an online service, not a public posting. This drawing does not identify a storage country; check the service and account.</p>${panel(selected)}</div>`;
};

export const sweetSpotTasks={
 structure:{label:'Draft a report outline',minimum:'template',why:'Tell AI the purpose, audience and sections you want. It does not need the whole client file.'},
 exceptions:{label:'Check spending approvals',minimum:'excerpt',why:'To check actual records, AI needs the relevant approved facts. To design a check, a made-up example may be enough.'},
 finding:{label:'Draft an audit finding',minimum:'excerpt',why:'Give AI the approved facts and the rule being tested. A made-up example cannot prove a real finding.'}
};
const payloads={template:{label:'Made-up example / column names',rank:0},excerpt:{label:'Only the relevant approved details',rank:1},full:{label:'The whole pack, not yet checked',rank:2}};
const workflows={web:'Upload or paste into a chatbot',cli:'Give a CLI agent access to files',split:'AI prepares a check; I run it myself'};
const accounts={unknown:'Account rules not yet checked',approved:'An account approved for this work'};
export function evaluateDataUse(input={}){
 const taskKey=Object.hasOwn(sweetSpotTasks,input.task)?input.task:'exceptions',task=sweetSpotTasks[taskKey];
 const payload=Object.hasOwn(payloads,input.payload)?payloads[input.payload]:payloads.excerpt;
 const workflow=Object.hasOwn(workflows,input.workflow)?input.workflow:'cli',account=Object.hasOwn(accounts,input.account)?input.account:'unknown';
 const minimum=taskKey==='exceptions'&&workflow==='split'?'template':task.minimum;
 const checks=input.checks||{},missing=[['authority','Permission to share for this task'],['terms','How this account uses and keeps data'],['access','Which files and apps AI can access'],['review','I will check the answer']].filter(([k])=>checks[k]!==true).map(([,v])=>v);
 const sufficient=payload.rank>=payloads[minimum].rank,minimal=payload.rank===payloads[minimum].rank;
 let state='pending',title='Check before you share',message='Confirm the sharing rules and access settings before using real information.';
 if(account==='unknown'){title='Check the account first';message='Use an account approved for this work. Paying for a personal account does not automatically make client information suitable to upload.';}
 else if(payload.rank===2){state='minimise';title='Do you need to share all of it?';message='Choose the relevant pages or facts first. Check that you may share them.';}
 else if(!sufficient){state='insufficient';title='AI needs more relevant information';message='Share the relevant approved facts, or ask a simpler question. A made-up example cannot prove a real finding.';}
 else if(!minimal){state='minimise';title='You can share less for this task';message='Start with a made-up example. Keep real records out if AI does not need them.';}
 else if(!missing.length){state='candidate';title='A possible sweet spot';message='Enough information to help, without sharing more than this task needs. Your organisation’s rules still apply.';}
 const why=taskKey==='exceptions'&&workflow==='split'?'AI prepares the check using a made-up example. You review it and run it yourself on real records, then choose which approved facts to share.':task.why;
 return {state,title,message,sufficient,minimal,missing,minimum,why,payloadRank:payload.rank,taskKey,workflow,account};
}
const options=(values,selected)=>Object.entries(values).map(([key,value])=>`<option value="${key}"${key===selected?' selected':''}>${esc(typeof value==='string'?value:value.label)}</option>`).join('');
const plot=result=>{
 const x=240+result.payloadRank*330,minimumX=240+payloads[result.minimum].rank*330;
 return `<svg class="dh-sweet-plot" viewBox="0 0 1100 270" role="img" aria-label="Qualitative task support versus information sent"><title>Just enough to help context depends on task and method</title><rect x="${minimumX-95}" y="52" width="190" height="80" rx="14" class="dh-target"/><path d="M110 30V205H1050" class="dh-axis"/><path d="M110 137H1050" class="dh-threshold"/><text x="120" y="23" class="dh-plot-axis">Can AI help with the task?</text><text x="25" y="101" class="dh-plot-small">Enough</text><text x="25" y="178" class="dh-plot-small">Too little</text><text x="${minimumX}" y="43" text-anchor="middle" class="dh-target-label">Just enough to help</text>${['Made-up example','Relevant details','Whole document'].map((v,i)=>`<text x="${240+i*330}" y="235" text-anchor="middle" class="dh-plot-small">${v}</text>`).join('')}<circle cx="${x}" cy="${result.sufficient?92:172}" r="16" class="dh-selected-point ${result.state}"/><text x="1050" y="263" text-anchor="end" class="dh-plot-axis">Information shared with AI →</text></svg>`;
};
export function renderSweetSpotResult(input){const result=evaluateDataUse(input);return {result,html:`${plot(result)}<div class="dh-verdict ${result.state}" role="status"><strong>${esc(result.title)}</strong><p>${esc(result.message)}</p></div><p class="dh-task-reason">${esc(result.why)}</p><p class="dh-missing"><b>Before sharing:</b> ${esc(result.missing.length?result.missing.join(' · '):'All four selected. Confirm that these checks are true for your work.')}</p>`};}

export function renderDataHandlingSlide(slide){
 const id=slide.key;let diagram='';
 if(slide.kind==='data-chat-cli')return locationJourney(slide,'chat');
 if(slide.kind==='data-agent-loop')return locationJourney(slide,'cli');
 if(slide.kind==='data-session-checks'){
  diagram=svg(id,284,'Six everyday questions before sharing a document',
   node('account',8,8,384,112,'01 · May I use this account?',['Personal or approved work account?','Check your organisation’s rules.'])+node('reuse',408,8,384,112,'02 · How is my data used?',['Check this account’s data rules.','Check before sending feedback.'])+node('history',808,8,384,112,'03 · What is kept?',['Your chat, files and saved details.','Check how to remove them.'])+
   node('permissions',8,154,384,112,'04 · Which files can it open?',['Only the files needed for the job.','Check the actual access settings.'])+node('sharing',408,154,384,112,'05 · Who else can see it?',['Shared links, people and other apps.','Check before sharing.'])+node('output',808,154,384,112,'06 · Is the answer ready to use?',['It may be wrong or reveal details.','Check it before using it.'])
  );
  return inspect(id,'account',diagram,'Rules differ by account and tool. Check the one you actually use.');
 }
 if(slide.kind==='data-task-folder'){
  const button=(key,title,body)=>`<button type="button" class="dh-folder-action dh-node" data-dh-node="${key}"><b>${esc(title)}</b><span>${esc(body)}</span></button>`;
  return `<div class="dh-inspector" data-dh-map="${id}" data-dh-selected="task"><div class="dh-folder-layout" data-dh-interactive><article class="dh-folder-tree archive"><small>YOUR MAIN WORK FOLDER</small><h2>Keep other work separate.</h2><ul><li>Salaries & personal details</li><li>Other clients’ reports</li><li>Passwords</li><li>Files unrelated to this task</li></ul>${button('archive','Keep these out of reach','Check which files the agent can really open.')}</article><div class="dh-folder-transfer" aria-hidden="true">SELECT<br>→<br>REVIEW</div><article class="dh-folder-tree task"><small>A FOLDER FOR THIS ONE TASK</small><h2>Share just enough.</h2><ul><li>Instructions · what you want done</li><li>An example · made-up information</li><li>Relevant pages · approved for sharing</li><li>Nothing unrelated to this task</li></ul>${button('task','Give access to this task only','Check the permissions before you start.')}</article></div><div class="dh-folder-actions">${button('ignore','A folder alone is not a lock','Asking AI to ignore a file does not lock it.')}${button('permissions','Check what AI may do','Open files · run tasks · use other apps')}</div>${panel('task')}</div>`;
 }
 if(slide.kind==='data-everyday-sweetspot'){
  const initial={task:'exceptions',workflow:'cli',payload:'excerpt',account:'approved',checks:{}};
  return `<div class="dh-sweetspot" data-dh-sweetspot><form class="dh-sweet-controls"><label>1 · The task<select name="task">${options(sweetSpotTasks,initial.task)}</select></label><label>2 · The method<select name="workflow">${options(workflows,initial.workflow)}</select></label><label>3 · What AI receives<select name="payload">${options(payloads,initial.payload)}</select></label><label>4 · The account<select name="account">${options(accounts,initial.account)}</select></label><fieldset><legend>Confirm before sharing</legend>${[['authority','I may share this information'],['terms','I checked how data is used and kept'],['access','I checked which files AI can open'],['review','I will check the answer']].map(([name,title])=>`<label><input type="checkbox" name="${name}">${esc(title)}</label>`).join('')}</fieldset><button type="button" data-dh-reset>Reset illustration</button></form><div class="dh-sweet-result" data-dh-result>${renderSweetSpotResult(initial).html}</div></div><p class="dh-small-note">Try the choices. No document is uploaded here. This example does not replace your organisation’s rules.</p>`;
 }
 if(slide.kind==='data-local-workflow')return locationJourney(slide,'limited');
 return null;
}
export function installDataHandling(root){
 const selectNode=(target)=>{const group=target.closest('[data-dh-node]');if(!group)return;const map=group.closest('[data-dh-map]'),value=detail[group.dataset.dhNode];if(!map||!value)return;map.dataset.dhSelected=group.dataset.dhNode;map.querySelectorAll('[data-dh-node]').forEach(n=>{n.classList.toggle('selected',n.dataset.dhNode===group.dataset.dhNode);n.setAttribute('aria-pressed',String(n.dataset.dhNode===group.dataset.dhNode));});map.querySelector('[data-dh-title]').textContent=value[0];map.querySelector('[data-dh-copy]').textContent=value[1];map.querySelector('[data-dh-control]').textContent=value[2];};
 const refresh=(container)=>{const form=container.querySelector('form'),data=new FormData(form);const input={task:data.get('task'),payload:data.get('payload'),workflow:data.get('workflow'),account:data.get('account'),checks:Object.fromEntries(['authority','terms','access','review'].map(k=>[k,data.get(k)==='on']))};const rendered=renderSweetSpotResult(input);container.querySelector('[data-dh-result]').innerHTML=rendered.html;container.dataset.decision=rendered.result.state;};
 root.querySelectorAll('[data-dh-map]').forEach(map=>map.querySelectorAll('[data-dh-node]').forEach(node=>{node.classList.toggle('selected',node.dataset.dhNode===map.dataset.dhSelected);node.setAttribute('aria-pressed',String(node.dataset.dhNode===map.dataset.dhSelected));}));
 root.addEventListener('click',event=>{
  const toggle=event.target.closest('[data-dh-motion-toggle]'),replay=event.target.closest('[data-dh-motion-replay]');
  if(toggle||replay){const container=(toggle||replay).closest('[data-dh-location]');if(!container)return;
   if(toggle){const paused=container.classList.toggle('dh-motion-paused');toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'Resume movement':'Pause movement';}
   if(replay){container.classList.remove('dh-motion-paused');const button=container.querySelector('[data-dh-motion-toggle]');button.setAttribute('aria-pressed','false');button.textContent='Pause movement';container.getAnimations({subtree:true}).forEach(animation=>{animation.currentTime=0;});}
   return;
  }
  selectNode(event.target);const reset=event.target.closest('[data-dh-reset]');if(reset){const container=reset.closest('[data-dh-sweetspot]');container.querySelector('form').reset();refresh(container);}});
 root.addEventListener('change',event=>{const container=event.target.closest('[data-dh-sweetspot]');if(container)refresh(container);});
 root.addEventListener('submit',event=>{if(event.target.closest('[data-dh-sweetspot]'))event.preventDefault();});
 root.addEventListener('keydown',event=>{if(event.target.closest('[data-dh-location]')&&event.target.closest('button')&&!event.target.closest('[data-dh-node]')){event.stopPropagation();}else if(event.target.closest('[data-dh-node]')&&['Enter',' '].includes(event.key)){event.preventDefault();event.stopPropagation();selectNode(event.target);}else if(event.target.closest('[data-dh-sweetspot]')&&event.target.matches('select,input,button'))event.stopPropagation();});
}
