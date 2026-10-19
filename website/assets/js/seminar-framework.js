const phases=[
 {name:'Sense',letter:'S',role:'01 / SOURCE CAPTURE',color:'#245bb2',catchphrase:'Watch what changes.',intro:'Bring external and internal evidence into view before the next reporting cycle.',points:[['Sources','News and public leads; strategy reports, audit findings and automated CA.'],['Output','A traceable signal with its source, date and scope.']],example:'A US tariff announcement arrives alongside customer-demand reviews and exceptions in the export growth forecast.',detail:[['Define coverage','Choose permitted sources, access rights, capture frequency and escalation criteria. Keep original links, publication dates and event dates. Show missing or unavailable coverage.'],['Check provenance','Treat social posts as leads to verify. Internal reports and CA require clear scope and registered risk links; an automated exception still needs confirmation.']]},
 {name:'Interpret',letter:'I',role:'02 / RELEVANCE SCREENING',color:'#087d88',catchphrase:'Find the link, not the noise.',intro:'Explain how the evidence could reach a selected objective through a real strategic dependency.',points:[['Test','Source credibility, timing, affected market, contracts and existing controls.'],['Output','An explained objective-to-risk link, with uncertainty retained.']],example:'US-bound exporters support 45% of Nusa\u2019s revenue. A goods tariff may change their orders; it is not a tariff on freight services.',detail:[['Anchor in context','Use the organization profile, objectives, targets, planning horizon, risks and tolerance. A shared industry keyword is not enough; identify the actual causal path.'],['Preserve uncertainty','Separate confirmed exposure, weak matches, opportunities and ambiguous effects. Group reports about one event. Relevance alone does not establish a loss or justify a higher score.']]},
 {name:'Guide',letter:'G',role:'03 / ALERT AND DECISION SUPPORT',color:'#7460a9',catchphrase:'Make the signal actionable.',intro:'Get a useful decision brief to the accountable owner while there is still time to act.',points:[['Assist','Explain why now; summarize evidence, options and possible assessment changes.'],['Output','A prioritized alert with sources, assumptions and uncertainty.']],example:'Ask the Commercial Director to stress-test the growth forecast, verify customer volumes and consider market diversification.',detail:[['Explain the proposal','Show current and proposed assessments separately. State what changed, which objective is exposed, what is unknown, and what evidence would support a response.'],['Keep authority visible','AI screens, summarizes and drafts options. It does not approve a score, allocate capital or commit an action. The workshop uses transparent relevance rules; no language model is connected.']]},
 {name:'Navigate',letter:'N',role:'04 / HUMAN JUDGMENT',color:'#a86d0d',catchphrase:'Human judgment sets the course.',intro:'The risk owner evaluates the evidence and makes an explicit, timely decision.',points:[['Decide','Capture or neglect; keep, accept or customize the assessment.'],['Output','A reasoned decision linked to evidence, authority and a review date.']],example:'The owner may revise likelihood 3 to 4 with impact 4, moving 12 to 16, or keep the score if protection is evidenced.',detail:[['Challenge the signal','Inspect the original source and verify actual exposure. A justified neglect is valid. Capture alone does not change the assessment.'],['Use judgment','Review existing controls and what the score already reflects. Corroborating headlines are not extra likelihood points. An ordinal score is not a measured probability or a predicted KPI percentage. Escalate beyond the owner\u2019s authority.']]},
 {name:'Act',letter:'A',role:'05 / OWNED RESPONSE',color:'#bd5638',catchphrase:'Give the response an owner.',intro:'Turn the decision into a funded commitment that protects the objective.',points:[['Commit','An action, accountable owner, deadline and expected effect.'],['Output','An approved response with clear evidence requirements.']],example:'Rebase the export growth case, approve a 90-day diversification plan and gate hub investment on validated demand.',detail:[['Make action specific','Choose whether to reduce exposure, change a strategic assumption or reconsider the commitment. Record who approves resources, the decision deadline and the implementation milestones.'],['Keep projection separate','A plan may project 16 to 12 through an expected one-point likelihood reduction. Approval or completion does not reduce current assessed risk. Avoid adding overlapping mitigation claims.']]},
 {name:'Learn',letter:'L',role:'06 / EFFECTIVENESS AND FEEDBACK',color:'#32754f',catchphrase:'Prove it. Then reassess.',intro:'Use response results and new evidence to keep the assessment current.',points:[['Verify','Implementation, effectiveness and the objective outlook.'],['Output','Updated assumptions and an explicit next review.']],example:'Qualified non-US demand and revised customer commitments may justify a later reassessment; current risk stays 16 until then.',detail:[['Close the evidence loop','Bring implementation evidence, audit findings and CA indicators back into the relevance screen. Keep source, rationale, owner and timing so the management response can be traced.'],['Monitor achievement','Use actual performance evidence to assess the objective. Risk scores do not create KPI actuals. Review when material evidence changes, alongside scheduled reviews; feed what was learned into context and source selection.']]}
];
const root=document.querySelector('[data-signal-framework]');
if(root){
 const loop=root.querySelector('[data-framework-loop]'),more=root.querySelector('[data-framework-more]'),panel=root.querySelector('[data-framework-panel]');
 let playing=true,selected=0,timer=null;
 const field=(key,value)=>root.querySelector('[data-framework-'+key+']').textContent=value;
 function paint(index){
  selected=(index+phases.length)%phases.length;const item=phases[selected];
  root.dataset.phase=String(selected);root.style.setProperty('--phase-color',item.color);
  field('letter',item.letter);field('name',item.name);field('role',item.role);field('catchphrase',item.catchphrase);field('intro',item.intro);field('example',item.example);field('position',String(selected+1).padStart(2,'0')+' / 06');
  root.querySelectorAll('[data-framework-select]').forEach((node,i)=>{node.setAttribute('aria-pressed',String(i===selected));});
  const points=root.querySelector('[data-framework-points]');points.replaceChildren();
  item.points.forEach(([label,text])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=text;points.append(dt,dd);});
  const detail=root.querySelector('[data-framework-detail]');detail.replaceChildren();
  item.detail.forEach(([label,text])=>{const h=document.createElement('h4'),p=document.createElement('p');h.textContent=label;p.textContent=text;detail.append(h,p);});
  more.open=false;panel.scrollTop=0;
 }
 function sync(){
  clearInterval(timer);timer=null;root.classList.remove('sf-playing');
  loop.setAttribute('aria-pressed',String(playing));loop.textContent=playing?'Pause cycle':'Play cycle';
  root.querySelector('[data-framework-held]').hidden=playing;
  if(!playing||!root.closest('.slide').classList.contains('active')||document.body.classList.contains('deck-editing')||document.visibilityState==='hidden')return;
  root.classList.add('sf-playing');timer=setInterval(()=>paint(selected+1),14000);
 }
 function select(index){if(document.body.classList.contains('deck-editing'))return;playing=false;paint(index);sync();}
 root.querySelectorAll('[data-framework-select]').forEach(node=>{
  node.addEventListener('click',()=>select(Number(node.dataset.frameworkSelect)));
  node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();select(Number(node.dataset.frameworkSelect));}});
 });
 root.querySelector('[data-framework-prev]').addEventListener('click',()=>select(selected-1));
 root.querySelector('[data-framework-next]').addEventListener('click',()=>select(selected+1));
 loop.addEventListener('click',()=>{playing=!playing;sync();});
 more.addEventListener('toggle',()=>{if(more.open){playing=false;sync();}});
 document.addEventListener('signal:slidechange',sync);
 document.addEventListener('signal:editmode',sync);
 document.addEventListener('visibilitychange',sync);
 paint(0);sync();
}
