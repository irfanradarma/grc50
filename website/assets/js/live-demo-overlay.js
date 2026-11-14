import {mountLiveDemo} from './live-demo-player.js?v=live-app-1';
import {audienceDemoUrl,getDemoApp} from './demo-apps.mjs?v=hitl-1';
export function createLiveDemoOverlay(){
 const dialog=document.createElement('dialog');dialog.className='live-app-overlay';dialog.setAttribute('aria-label','Live application demonstration');
 const header=document.createElement('header'),badge=document.createElement('b'),heading=document.createElement('span'),openApp=document.createElement('a'),back=document.createElement('button');badge.textContent='LIVE';heading.textContent='Live application demonstration';back.textContent='Back to slides';back.type='button';openApp.className='live-app-open';openApp.textContent='Open app in new tab';openApp.target='_blank';openApp.rel='noopener noreferrer';header.append(badge,heading,openApp,back);
 const stage=document.createElement('div');stage.className='live-demo-stage';dialog.append(header,stage);document.body.append(dialog);
 const watch=document.createElement('button');watch.className='live-app-watch';watch.textContent='Watch live app';watch.hidden=true;document.body.append(watch);
 let active=null,previousFocus=null,stop=null;
 const hide=()=>{if(dialog.open)dialog.close();document.body.classList.remove('live-app-visible');document.getElementById('stage').inert=false;stop?.();stop=null;previousFocus?.focus?.({preventScroll:true});previousFocus=null;};
 const show=()=>{previousFocus=document.activeElement;document.getElementById('stage').inert=true;document.body.classList.add('live-app-visible');watch.hidden=true;dialog.showModal();stop=mountLiveDemo(stage);};
 const dismiss=()=>{hide();watch.hidden=!active;};
 back.onclick=dismiss;dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});watch.onclick=show;
 return {update(state){if(!state?.active){active=null;hide();watch.hidden=true;openApp.removeAttribute('href');return;}const app=getDemoApp(state.appId),frontend=window.SIGNAL_HOSTING?.frontendUrl||location.origin;heading.textContent=app.label.en;openApp.href=audienceDemoUrl(app.id,frontend);openApp.setAttribute('aria-label','Open '+app.label.en+' in new tab');if(active===state.streamId)return;active=state.streamId;if(!dialog.open)show();}};
}
