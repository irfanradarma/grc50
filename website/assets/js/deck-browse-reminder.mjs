// The cooldown belongs to an independent-browsing period, not individual slides.
export function createBrowseReminderClock(now=()=>Date.now()){
 let next=null,open=false;
 return {
  update(diverged,available=true){
   if(!diverged){next=null;open=false;return false;}
   if(next===null)next=now();
   if(!available){open=false;return false;}
   if(open||now()<next)return false;
   open=true;return true;
  },
  dismiss(){open=false;next=now()+90_000;},
 };
}

export function createBrowseReminder({resume}){
 const clock=createBrowseReminderClock(),dialog=document.createElement('dialog');
 dialog.className='browse-reminder';dialog.setAttribute('aria-labelledby','browse-reminder-title');
 const eyebrow=document.createElement('small'),heading=document.createElement('h2'),message=document.createElement('p'),position=document.createElement('div'),actions=document.createElement('div'),follow=document.createElement('button'),keep=document.createElement('button');
 heading.id='browse-reminder-title';position.className='browse-reminder-position';actions.className='browse-reminder-actions';follow.type=keep.type='button';follow.className='browse-reminder-follow';actions.append(follow,keep);dialog.append(eyebrow,heading,message,position,actions);document.body.append(dialog);
 let previousFocus=null,last=null;
 const t=(en,id)=>document.documentElement.lang==='id'?id:en;
 const paint=()=>{eyebrow.textContent=t('LIVE PRESENTATION','PRESENTASI LANGSUNG');heading.textContent=t('The presenter is on another slide.','Presenter sedang menampilkan slide lain.');message.textContent=t('Follow the presentation now, or keep exploring at your own pace.','Ikuti presentasi sekarang, atau lanjutkan menjelajahi slide sesuai ritme Anda.');position.textContent=last?t('Presenter now: slide ','Presenter saat ini: slide ')+last.number+' / '+last.title:'';follow.textContent=t('Go to presenter slide','Ke slide presenter');keep.textContent=t('Keep browsing independently','Tetap jelajahi mandiri');};
 const close=()=>{if(!dialog.open)return;dialog.close();previousFocus?.focus?.({preventScroll:true});previousFocus=null;};
 const dismiss=()=>{clock.dismiss();close();};
 keep.onclick=dismiss;follow.onclick=()=>{close();resume();};
 dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
 // Dialog keys must not also navigate the background deck.
 dialog.addEventListener('keydown',event=>event.stopPropagation());
 document.addEventListener('signal:languagechange',paint);
 return {update(state){last=state;const diverged=state.connected&&state.published&&!state.following&&state.number>0&&state.presenter!==state.local;
   const available=document.visibilityState!=='hidden'&&!document.body.classList.contains('live-app-visible')&&!document.querySelector('dialog[open]:not(.browse-reminder)');
   if(!diverged||!available)close();
   if(clock.update(diverged,available)){paint();previousFocus=document.activeElement;dialog.showModal();keep.focus();}
   else if(dialog.open)paint();
 }};
}
