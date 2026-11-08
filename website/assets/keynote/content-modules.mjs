const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function composeModules(config,reference,renderers,{revision=0,appUrl='',preview=false}={}){
 const originals=new Map(reference.slides.map(s=>[s.key,s])),chapters=[],entries=[],designs={...renderers};
 for(const module of config.modules.filter(m=>m.enabled)){
  if(module.id!=='opening')chapters.push({id:module.id,title:module.title,caption:module.description,icon:'clipboard-check'});
  for(const slide of module.slides.filter(s=>s.enabled)){
   const original=originals.get(slide.builtin),chapter=module.id==='opening'?null:module.id;
   if(slide.layout==='original'){
    if(!original||!renderers[slide.builtin])throw Error('Unknown built-in slide');
    designs[slide.key]={...renderers[slide.builtin],title:slide.title};
   }else{
    const heading=`<div class="heading"><h1>${escape(slide.title)}</h1></div>`,body=`<p class="module-slide-body">${escape(slide.body)}</p>`;
    let html=heading+(slide.layout==='title'?'':body);
    if(slide.layout==='demo'){
     if(module.demo.kind==='sandbox'){const url=appUrl+'/modules/?module='+encodeURIComponent(module.id)+'&embedded=1'+(preview?'&preview=1':'');html+=`<div class="module-demo-viewport"><iframe title="${escape(module.demo.config.title)}" data-src="${escape(url)}" sandbox="allow-scripts allow-same-origin allow-forms allow-modals"></iframe></div>`;}
     else if(module.demo.kind==='signal')html+=`<a class="module-launch" href="${escape(appUrl+'/audience/?module=signal')}" target="_blank" rel="noreferrer">Open SIGNAL →</a>`;
    }
    designs[slide.key]={title:slide.title,tone:slide.tone,kind:'module-custom '+(slide.layout==='demo'?'module-demo':''),html};
   }
   entries.push({...original,key:slide.key,chapter,index:entries.length+1,title:slide.title,section:module.title,note:slide.notes,referenceContext:slide.layout==='original'?original?.referenceContext:undefined,narrativeConnection:slide.layout==='original'?original?.narrativeConnection:undefined,links:original?.links||[],moduleId:module.id,builtin:slide.builtin,layout:slide.layout});
  }
 }
 if(!entries.length)throw Error('No active slides');
 const intact=entries.length===reference.slides.length&&entries.every((s,i)=>s.builtin===reference.slides[i].key&&s.key===reference.slides[i].key&&s.layout==='original')&&chapters.every(ch=>reference.chapters.some(c=>c.id===ch.id&&c.title===ch.title));
 for(const entry of entries){if(!intact&&entry.layout==='original'&&designs[entry.key]?.kind==='divider'){
  const index=chapters.findIndex(c=>c.id===entry.chapter),chapter=chapters[index];if(chapter)designs[entry.key]={...designs[entry.key],title:chapter.title,html:`<div class="section-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</div><div class="section-kicker">SECTION ${index+1} / ${chapters.length}</div><div class="heading"><h1>${escape(chapter.title)}</h1><p class="subtitle">${escape(chapter.caption)}</p></div>`};
 }}
 const agenda=entries.find(s=>s.builtin==='agenda'||s.key==='agenda');
 if(!intact&&agenda&&agenda.layout==='original')designs[agenda.key]={title:'The journey.',html:`<div class="heading"><h1>${escape(config.title)}</h1></div><div class="module-agenda">${chapters.map(c=>`<button data-chapter="${escape(c.id)}"><strong>${escape(c.title)}</strong><span>${escape(c.caption)}</span></button>`).join('')}</div>`};
 return {reference:{...reference,deckId:revision?reference.deckId+'-content-'+revision:reference.deckId,chapters,slides:entries},renderers:designs};
}

export async function loadContentSnapshot(){
 const preview=new URLSearchParams(location.search).get('preview')==='1';
 const token=preview?sessionStorage.getItem('signal-admin-token'):null;
 if(preview&&!token)throw Error('Admin login required to preview draft');
 const response=await fetch((window.SIGNAL_HOSTING?.apiOrigin||'')+'/api/'+(preview?'admin/content':'content'),{cache:'no-store',headers:token?{Authorization:'Bearer '+token}:{},signal:AbortSignal.timeout(10000)});
 if(!response.ok){if(response.status===404&&!preview)return null;throw Error('Content unavailable');}
 const data=await response.json();
 return preview?{revision:data.published.revision,config:data.draft,preview:true}:data;
}
