import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import catalogue from '../../website/assets/keynote/audit-translations-id.json';
import {createDeckTranslator} from '../../website/assets/keynote/deck-language.js';
const translate=createDeckTranslator(catalogue.strings);
export function useAssuranceLanguage(){
 const root=useRef<HTMLDivElement>(null);
 const [language,setLanguage]=useState<'en'|'id'>(()=>{const requested=new URLSearchParams(location.search).get('lang');if(requested==='en'||requested==='id')return requested;try{return localStorage.getItem('signal-language-v2')==='id'?'id':'en';}catch{return 'en';}});
 const current=useRef(language);current.current=language;
 const cache=useRef(new WeakMap<Text,{original:string;last:string}>());
 const attrs=useRef(new WeakMap<Element,Record<string,{original:string;last:string}>>());
 function localize(){const target=root.current;if(!target)return;const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT);for(let node=walker.nextNode();node;node=walker.nextNode()){
  if(node.parentElement?.closest('script,style,textarea,[data-language-fixed]'))continue;
  if(node.parentElement?.tagName==='OPTION'&&!node.parentElement.hasAttribute('value'))(node.parentElement as HTMLOptionElement).value=node.parentElement.textContent||'';
  const text=node as Text;let item=cache.current.get(text);if(!item||text.nodeValue!==item.last)item={original:text.nodeValue||'',last:text.nodeValue||''};const next=translate(item.original,current.current);if(text.nodeValue!==next)text.nodeValue=next;item.last=next;cache.current.set(text,item);
 }
 for(const el of target.querySelectorAll('[placeholder],[title],[aria-label],[alt]')){if(el.closest('[data-language-fixed]'))continue;const records=attrs.current.get(el)||{};for(const key of ['placeholder','title','aria-label','alt']){const value=el.getAttribute(key);if(!value)continue;let item=records[key];if(!item||value!==item.last)item={original:value,last:value};const next=translate(item.original,current.current);if(value!==next)el.setAttribute(key,next);item.last=next;records[key]=item;}attrs.current.set(el,records);}
 }
 useLayoutEffect(()=>{localize();document.documentElement.lang=language;try{localStorage.setItem('signal-language-v2',language);}catch{}},[language]);
 useEffect(()=>{const observer=new MutationObserver(localize);if(root.current)observer.observe(root.current,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label','alt']});return()=>observer.disconnect();},[]);
 return {root,language,setLanguage,copy:(value:string)=>translate(value,language)};
}
