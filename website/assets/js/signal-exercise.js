(()=>{
 const news=document.querySelector('[data-gap-news]');
 if(news){const responses={provider:'Review for exposure: the provider is a known dependency. Establish which service, objective and risk could be affected before proposing action.',award:'Neglect if the only connection is the sector. An award does not establish an adverse event, threatened objective or weakened control.',remote:'Check indirect dependencies. Without an affected unit, partner or supply chain, location alone does not support escalation.'};news.onclick=e=>{const b=e.target.closest('[data-news]');if(b){news.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));news.querySelector('.gap-answer').textContent=responses[b.dataset.news];}};news.querySelector('button').click();}
})();
