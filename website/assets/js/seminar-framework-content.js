// SIGNAL is the seminar working model; it is not attributed to an external standard.
window.horiSignalFramework=function(){
 const phases=[['sense','S','SENSE','#245bb2'],['interpret','I','INTERPRET','#087d88'],['guide','G','GUIDE','#7460a9'],['navigate','N','NAVIGATE','#a86d0d'],['act','A','ACT','#bd5638'],['learn','L','LEARN','#32754f']];
 const point=(r,a)=>{const t=a*Math.PI/180;return [330+r*Math.cos(t),300+r*Math.sin(t)].map(v=>Number(v.toFixed(2)));};
 const shapes=phases.map(([key,letter,name,color],i)=>{
  const a=-90+i*60+2,b=a+54,outer=point(230,a),outerEnd=point(230,b-6),tip=point(176,b+5),innerEnd=point(123,b-6),inner=point(123,a),notch=point(176,a+8),label=point(177,a+27);
  const path='M'+outer+' A230 230 0 0 1 '+outerEnd+' L'+tip+' L'+innerEnd+' A123 123 0 0 0 '+inner+' L'+notch+' Z';
  return '<g class="sf-phase" data-framework-select="'+i+'" data-framework-key="'+key+'" role="button" tabindex="0" aria-pressed="'+(i===0)+'" aria-controls="sf-explanation" aria-label="'+letter+' / '+name+': select phase and hold the cycle" style="--phase-color:'+color+'"><path class="sf-petal" d="'+path+'" fill="'+color+'"/><text class="sf-phase-letter" x="'+label[0]+'" y="'+(label[1]-9)+'" text-anchor="middle">'+letter+'</text><text class="sf-phase-name" x="'+label[0]+'" y="'+(label[1]+19)+'" text-anchor="middle">'+name+'</text></g>';
 }).join('');
 return `<div class="sf-framework" data-signal-framework data-phase="0" style="--phase-color:#245bb2">
 <div class="sf-model-layout">
  <div class="sf-model-map"><svg class="sf-diagram" viewBox="60 35 540 530" role="group" aria-labelledby="sf-title sf-desc">
   <title id="sf-title">The SIGNAL cycle for dynamic risk assessment</title>
   <desc id="sf-desc">Six colored arrow segments surround objectives, targets, risks and tolerance. Sense sources, interpret relevance, guide with evidence, navigate through human judgment, act through owned responses, and learn from effectiveness. Select a phase to hold it and read its explanation beside the diagram.</desc>
   <circle class="sf-orbit" cx="330" cy="300" r="247"/>
   ${shapes}
   <circle class="sf-core" cx="330" cy="300" r="105"/>
   <text class="sf-core-kicker" x="330" y="270" text-anchor="middle">ANCHORED IN</text>
   <text class="sf-core-title" x="330" y="303" text-anchor="middle">OBJECTIVES</text>
   <text class="sf-core-sub" x="330" y="330" text-anchor="middle">Targets &#183; risks &#183; tolerance</text>
  </svg><p class="sf-map-caption">Evidence enters. Human judgment turns it into action.</p></div>
  <section class="sf-explanation" id="sf-explanation" data-framework-panel aria-label="Selected phase explanation">
   <div class="sf-panel-head"><span class="sf-phase-badge" data-framework-letter>S</span><div><small data-framework-role>01 / SOURCE CAPTURE</small><h3 data-framework-name>Sense</h3></div><span class="sf-held" data-framework-held hidden>HELD</span></div>
   <p class="sf-catchphrase" data-framework-catchphrase>Watch what changes.</p>
   <p class="sf-panel-intro" data-framework-intro></p>
   <dl class="sf-panel-points" data-framework-points></dl>
   <div class="sf-worked-example"><b>IN OUR STRATEGIC CASE</b><p data-framework-example></p></div>
   <details class="sf-more" data-framework-more><summary>Explore the method</summary><div data-framework-detail></div></details>
  </section>
 </div>
 <div class="sf-controls"><span class="sf-position" data-framework-position>01 / 06</span><button type="button" data-framework-prev aria-label="Previous SIGNAL phase">&larr;</button><button type="button" data-framework-loop aria-pressed="true">Pause cycle</button><button type="button" data-framework-next aria-label="Next SIGNAL phase">&rarr;</button><span class="sf-control-hint">Select a phase to hold. Play to continue.</span></div>
 <div class="sf-accountability"><span><i class="sf-ai-dot"></i><b>AI supports</b> Sense &middot; Interpret &middot; Guide</span><span><i class="sf-human-dot"></i><b>People remain accountable</b> Navigate &middot; Act &middot; Learn</span></div>
 <small class="sf-attribution">SIGNAL / A working model for this seminar</small>
 </div>`;
};
