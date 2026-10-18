// Content-rich teaching layouts. All figures below are workshop examples unless attributed.
window.horiEnrichSlide=function(section,title,html,note,type=''){
 const icon=name=>'<img class="d-icon" src="../assets/icons/'+name+'.svg" alt="" aria-hidden="true">';
 const band=(label,body)=>'<div class="d-teaching-band"><b>'+label+'</b><p>'+body+'</p></div>';
 const table=(headers,rows)=>'<table class="d-teaching-table"><thead><tr>'+headers.map(v=>'<th>'+v+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
 const decision=(label,body)=>'<div class="d-margin-example"><small>'+label+'</small><p>'+body+'</p></div>';
 switch(section){
 case 'BEYOND COMPLIANCE':
  title='Beyond Compliance';
  html='<div class="d-simple-cover"><p class="d-cover-subtitle">Utilizing AI to capture more signals<br>for effective risk management</p><div class="d-cover-rule"></div><p class="d-cover-format">A seminar and hands-on experience</p></div>';
  type='d-cover-slide d-simple-cover-slide';
  break;
 case 'THE FOUNDATION': {
  let i=0;const details=[['Accountable role','Objective / delivery owner','Working record','KPI target, actual and forecast'],['Accountable role','Risk / control owner','Working record','Exposure, assumptions and actions'],['Accountable role','Independent assurance provider','Working record','Test evidence and conclusions']];
  html=html.replace(/<\/article>/g,()=>{const d=details[i++];return '<dl class="d-pillar-record"><dt>'+d[0]+'</dt><dd>'+d[1]+'</dd><dt>'+d[2]+'</dt><dd>'+d[3]+'</dd></dl></article>';});
  html=html.replace('<p class="d-takeaway">', '<p class="d-takeaway"><b>The integration test:</b> ');
  break;
 }
 case 'THE PRACTICAL TEST':
  html=html.replace('<p class="d-takeaway">',table(['Shared objective','Risk assumption','Assurance evidence','Management decision'],[['Profitable export growth','US-bound demand supports the forecast','Has the growth case been stressed against new trade policy?','Rebase the forecast and gate investment commitments']])+'<p class="d-takeaway">');
  break;
 case 'OUR PAIN POINT':
  html=html.replace('</div><button data-loop-toggle', '</div>'+band('What should travel across the handoff?','The affected objective, the challenged assumption, the evidence, the accountable owner and the next decision date.')+'<button data-loop-toggle');
  break;
 case 'REAL CASE / CARILLION / 1 OF 3':
  html=html.replace('<p>Its 2016 accounts', '<div class="d-service-strip"><span>'+icon('route')+'Roads</span><span>'+icon('landmark')+'Hospitals</span><span>'+icon('user-round-check')+'Public services</span></div><p>Its 2016 accounts');
  html=html.replace('<strong>What would challenge', '<div class="d-case-lens"><b>Performance lens</b><span>Delivery commitments depend on cash and sustainable contract assumptions.</span></div><strong>What would challenge');
  break;
 case 'REAL CASE / CARILLION / 2 OF 3': {
  let i=0;const prompts=['Which contract assumptions need to be reopened?','What does cash pressure mean for continued delivery?','Who must reconcile the warning with the payout decision?'];
  html=html.replace(/<\/article>/g,()=>decision('DECISION QUESTION',prompts[i++])+'</article>');
  break;
 }
 case 'REAL CASE / CARILLION / 3 OF 3':
  html=html.replace('<div class="d-collapse-line">', '<div class="d-case-lens"><b>Assurance-to-risk handoff</b><span>Testing should challenge management’s confidence in the controls protecting delivery.</span></div><div class="d-collapse-line">');
  html+=band('Our lesson from the case','A system needs both relevant evidence and leaders willing to challenge assumptions, escalate exposure and act. AI can assist the first task. Accountability remains essential.');
  break;
 case 'WHAT WAS MISSING?':
  html=html.replace('<p class="d-takeaway">',table(['Review dimension','Periodic record alone','Dynamic risk assessment'],[['Timing','Next scheduled reporting cycle','When material evidence changes'],['Focus','Maintain the documented rating','Revisit the assumption and exposure'],['Result','Completed assessment record','Reasoned decision, owned action and follow-up']])+'<p class="d-takeaway">');
  break;
 case 'NOW YOU TAKE THE DECISIONS':
  html=html.replace('<b>Different exposure',decision('FIRST QUESTION','Does the event affect a market, customer segment, business model or investment assumption that your selected objective depends on?')+'<b>Different exposure');
  html=html.replace('<b>Same review discipline',decision('NEXT QUESTION','Does the evidence challenge a control assumption already used in your assessment?')+'<b>Same review discipline');
  break;
 case 'YOUR TURN':
  html=html.replace('<label>Audience link', '<div class="d-join-checks"><p>'+icon('circle-check')+'Phone or laptop: open the same audience link.</p><p>'+icon('circle-check')+'Choose your context, then work in your own workspace.</p><p>'+icon('circle-check')+'Wait for the presenter to release each signal round.</p></div><label>Audience link');
  break;
 case 'SAME EVENT, DIFFERENT EXPOSURE':
  html=html.replace('<button data-reveal-exposure', band('Test the dependency before the score','Same headline ≠ same exposure. Confirm the market, revenue concentration, planning horizon and available strategic options before judging severity.')+'<button data-reveal-exposure');
  break;
 case 'A BUSIER INFORMATION ENVIRONMENT':
  html=html.replace('<p>Open original sources. Capture useful evidence.<br>Keep or change assessments with reasons.</p>', '<div class="d-review-sprint">'+table(['During the review','What to check','Decision to record'],[['1. Open the source','Event date, location, reliability and scope','Is the event established?'],['2. Check the dependency','Selected objective, risk and existing controls','Capture or neglect, with a reason'],['3. Review the assessment','What changed since the last decision?','Keep or update the score'],['4. Choose the response','Owner, due date and expected protection','Agree or customize the mitigation']])+'<aside>'+icon('clock')+'<b>Work on useful decisions</b><p>Several headlines can describe one event. Read them together and avoid counting the same exposure repeatedly.</p><small>A justified neglect decision is a valid result.</small></aside></div>');
  break;
 case 'COMPARE THE REASONS':
  html=html.replace('<p class="d-takeaway">', table(['Question for the room','What a strong explanation contains'],[['Why was the signal relevant?','A source-supported connection to a dependency or control assumption'],['Why did the score change or stay?','New evidence compared with what was already reflected'],['What action will protect the objective?','An owner, deadline, plausible effect and evidence to verify it']])+'<p class="d-takeaway">');
  break;
 case 'BACK TO KEMENKEU':
  html=html.replace(/(<p class="d-source">)/, '<div class="d-institution-path"><div><b>Management</b><span>Own objectives, assess exposure and respond</span></div><div><b>UKI / monitoring</b><span>Connect evidence and escalate exceptions</span></div><div><b>Assurance</b><span>Test protection and communicate conclusions</span></div><div><b>Information flow</b><span>Link sources, decisions, actions and follow-up</span></div></div>'+band('The implementation question','Can one significant finding or operational signal be traced to the affected objective, a risk decision and evidence of an effective response?')+'$1');
  break;
 case 'THE NEXT 30 DAYS':
  html=html.replace('<p class="d-takeaway">', table(['Pilot checkpoint','Deliverable to review','Evidence of usefulness'],[['Week 1','One objective, risk owner and dependency map','Agreed context and review criteria'],['Week 2','A few permitted, traceable sources','Source coverage and data-quality issues'],['Week 3','Human-reviewed signals and responses','Reasons, owners, deadlines and review time'],['Week 4','Review of the pilot’s decisions','False positives, missed signals and verified protection']])+'<p class="d-takeaway">');
  break;
 case 'YOUR COMMITMENT':
  html='<div class="d-closing-work"><div><p class="d-closing-question">Think of one decision that could improve<br>if the evidence reached you earlier.</p><p>Start with an objective you own. Choose a signal you can access. Agree who will review it and what should happen next.</p><div class="d-commitment-line">Your first pilot can begin with one useful connection.</div></div><div class="d-commitment-sheet"><small>YOUR COMMITMENT</small><div><b>Our objective</b><p>What result are we protecting?</p></div><div><b>The signal we need earlier</b><p>Which change or control failure matters?</p></div><div><b>Our review and response</b><p>Who decides, by when, using what evidence?</p></div><div><b>How we will know it helped</b><p>What decision or protection improved?</p></div></div></div>';
  break;
 }
 const guides={
 'CHOOSE YOUR CONTEXT':['WHAT YOUR CHOICE CHANGES','The objective determines which risks and dependencies are supplied. The same news may be relevant to another company and irrelevant to yours.'],
 'YOUR STARTING POSITION':['WHAT TO NOTICE','Risks describe exposure. Mitigation plans are commitments to act. Each needs an owner and a due date that you can follow up.'],
 'THE FIRST HUMAN DECISION':['CAPTURE DOES NOT CHANGE THE SCORE','First establish relevance: this market, this growth assumption and this planning horizon. A score review is a separate management decision.'],
 'REASSESSMENT':['WORKED ASSESSMENT','US-bound demand concentration confirmed; downside growth assumptions unvalidated. Consider likelihood 3 → 4 with impact 4: score 12 → 16. This is an exercise judgment, not a measured probability.'],
 'A RESPONSE YOU CAN OWN':['EXAMPLE RESPONSE','Rebase the growth forecast and approve a 90-day market-diversification plan. Assign the Commercial Director, set a decision date and retain buyer commitments and an approved downside case.'],
 'INTERNAL EVIDENCE':['SAME RISK, SEVERAL SOURCES','A meeting note and an audit finding may concern the same unsupported growth assumption. Assess the combined evidence without increasing the score for every document.'],
 'CONTINUOUS ASSURANCE':['READ THE DENOMINATOR','Logistics example: 8 of 20 forecast deals lack updated trade-policy assumptions = 40%, above the 20% review threshold. Inspect the business cases and customer evidence before concluding that exposure changed.']
 };
 if(guides[section]){const [label,body]=guides[section];html=html.replace('</aside>',decision(label,body)+'</aside>');}
 if(section==='EXPECTED PROTECTION')html=html.replace('</output></div>', '</output>'+decision('WHAT WOULD JUSTIFY A LATER REDUCTION?','Qualified non-US demand, revised commercial commitments, a credible funded growth case and an explicit reassessment by the risk owner.')+'</div>');
 if(section==='WHAT CHANGED?')html=html.replace('<span class="d-status"', '<span class="d-dashboard-question">Ask: did a useful signal lead to a justified decision and an action we can verify?</span><span class="d-status"');
 const exempt=['EVIDENCE / RISK MANAGEMENT','EVIDENCE / ASSURANCE','EVIDENCE / HOW THE GAP HAPPENS','ONE REAL EVENT','THE SOLUTION FRAMEWORK','REFERENCE / DISCUSSION'];
 if(section!=='BEYOND COMPLIANCE'&&!exempt.includes(section))type+=' d-content-rich';
 return {section:section==='BEYOND COMPLIANCE'?'SEMINAR / 60 MINUTES':section,title,html,note,type};
};
