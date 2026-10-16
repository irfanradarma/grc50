// Presentation-only interactions. They never write to the app or its workspace.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const motion=document.createElement('button');
 motion.textContent='Animations';motion.setAttribute('aria-pressed',String(!reduced.matches));
 document.querySelector('.toolbar nav').append(motion);
 const setMotion=on=>{document.body.classList.toggle('deck-motion',on);motion.setAttribute('aria-pressed',String(on));};
 setMotion(!reduced.matches);motion.addEventListener('click',()=>setMotion(!document.body.classList.contains('deck-motion')));
 reduced.addEventListener('change',e=>setMotion(!e.matches));
})();
