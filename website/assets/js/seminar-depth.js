// Content-rich teaching layouts. All figures below are workshop examples unless attributed.
window.signalEnrichSlide=function(section,title,html,note,type=''){
 const icon=name=>'<img class="d-icon" src="../assets/icons/'+name+'.svg" alt="" aria-hidden="true">';
 const band=(label,body)=>'<div class="d-teaching-band"><b>'+label+'</b><p>'+body+'</p></div>';
 const table=(headers,rows)=>'<table class="d-teaching-table"><thead><tr>'+headers.map(v=>'<th>'+v+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
 const decision=(label,body)=>'<div class="d-margin-example"><small>'+label+'</small><p>'+body+'</p></div>';
 switch(section){
 case 'BEYOND COMPLIANCE':
  title='Beyond Compliance';
  html='<img class="d-cover-photo" src="../assets/images/jakarta-cover.jpg" alt="Jakarta skyline at sunset"><div class="d-cover-wash" aria-hidden="true"></div><div class="d-simple-cover"><p class="d-cover-subtitle">Memaksimalkan Potensi AI dalam<br>Mengawal Strategi dan Risiko Organisasi</p><div class="d-cover-rule"></div><p class="d-cover-format">SIGNAL / Evidence. Judgment. Action.</p></div><a class="d-cover-credit" href="https://commons.wikimedia.org/wiki/File:JakartaSkyline.jpg" target="_blank" rel="noreferrer">Jakarta / Georgi Kovachev / CC BY-SA 4.0</a>';
  type='d-cover-slide d-simple-cover-slide';
  break;
 case 'THE FOUNDATION': {
  let i=0;const details=[['Accountable role','Objective / delivery owner','Working record','KPI target, actual and forecast'],['Accountable role','Risk / control owner','Working record','Exposure, assumptions and actions'],['Accountable role','Independent assurance provider','Working record','Test evidence and conclusions']];
  html=html.replace(/<\/article>/g,()=>{const d=details[i++];return '<dl class="d-pillar-record"><dt>'+d[0]+'</dt><dd>'+d[1]+'</dd><dt>'+d[2]+'</dt><dd>'+d[3]+'</dd></dl></article>';});
  html=html.replace('<p class="d-takeaway">', '<p class="d-takeaway"><b>The integration test:</b> ');
  break;
 }
 case 'THE PRACTICAL TEST':
  html='<div class="d-boundary-chain"><article><small>01 / PERFORMANCE</small><h3>Protect the target</h3><strong>Revenue +15%</strong><p>A growth plan depends on continued US-bound demand.</p></article><span class="d-boundary-arrow" aria-hidden="true">&#8594;</span><article><small>02 / RISK</small><h3>Challenge the assumption</h3><strong>Demand changes</strong><p>A new trade-policy signal challenges the growth forecast.</p></article><span class="d-boundary-arrow" aria-hidden="true">&#8594;</span><article><small>03 / ASSURANCE</small><h3>Test the protection</h3><strong>Evidence returns</strong><p>Audit tests whether the downside case and customer commitments are supported.</p></article></div><div class="d-boundary-question"><b>THE INTEGRATION TEST</b><p>Does the evidence change a forecast, a risk decision or an owned response?</p></div><small class="d-boundary-caption">Illustrative strategic example / the same objective passes through all three disciplines.</small>';
  type='d-practical-slide';
  break;
 case 'OUR PAIN POINT':
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
 return {section:section==='BEYOND COMPLIANCE'?'OPENING':section,title,html,note,type};
};
