import {canonicalNewsUrl} from '../shared/newsReview.js';
import {newsText} from '../shared/newsText.js';
import https from 'node:https';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {XMLParser} from 'fast-xml-parser';
export type Article={title:string;details:string;url:string;publishedAt:string;publisher?:string};
export function publicAddress(address:string){
 if(isIP(address)===4){const [a,b]=address.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19));}
 return /^2[0-9a-f]{3}:/i.test(address)&&!/^2001:(db8|0:)/i.test(address);
}
export async function captureNews(endpoint:string,format:string):Promise<Article[]>{
 const url=new URL(endpoint);if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443')throw new Error('Use a public HTTPS endpoint on port 443 without embedded credentials.');
 const addresses=await lookup(url.hostname,{all:true});if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new Error('News endpoints must resolve to public internet addresses.');
 const address=addresses[0];
 const body=await new Promise<string>((resolve,reject)=>{const req=https.get(url,{family:address.family,lookup:(_host,_options,callback)=>callback(null,address.address,address.family),headers:{Accept:'application/json, application/rss+xml, application/atom+xml, text/xml','User-Agent':'HORI-local-prototype/1.0'}},res=>{if(res.statusCode!==200){res.resume();reject(new Error('The endpoint must return HTTP 200; redirects are not followed.'));return;}let size=0;const chunks:Buffer[]=[];res.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>1024*1024){req.destroy(new Error('News response exceeds 1 MB.'));return;}chunks.push(chunk);});res.on('end',()=>resolve(Buffer.concat(chunks).toString('utf8')));res.on('error',reject);});req.setTimeout(8000,()=>req.destroy(new Error('News capture timed out.')));req.on('error',reject);});
 return parseNews(body,format);
}
export function parseNews(body:string,format:string):Article[]{
 let items:any[];
 if(format==='json'){const parsed=JSON.parse(body);items=Array.isArray(parsed)?parsed:parsed.articles??parsed.items;if(!Array.isArray(items))throw new Error('JSON must be an array or contain an articles/items array.');}
 else {if(/<!DOCTYPE|<!ENTITY/i.test(body))throw new Error('XML entities are unsupported.');const parsed=new XMLParser({ignoreAttributes:false,processEntities:false}).parse(body);if(!parsed.rss?.channel&&!parsed.feed)throw new Error('Endpoint did not return an RSS or Atom feed.');const entries=parsed.rss?.channel?.item??parsed.feed?.entry??[];items=Array.isArray(entries)?entries:[entries];}
 const plain=(v:any)=>typeof v==='string'?v:typeof v?.['#text']==='string'?v['#text']:'';
 return items.slice(0,100).map(item=>{const link=Array.isArray(item.link)?item.link.find((v:any)=>v['@_rel']==='alternate')??item.link[0]:item.link;let url=plain(item.url)||plain(link)||link?.['@_href']||'';try{if(!['https:','http:'].includes(new URL(url).protocol))url='';}catch{url='';}url=canonicalNewsUrl(url);return {title:newsText(plain(item.title)).slice(0,500),details:newsText(plain(item.summary)||plain(item.description)||plain(item.content)).slice(0,3000),url,publisher:newsText(plain(item.source)||plain(item.publisher)),publishedAt:plain(item.publishedAt)||plain(item.pubDate)||plain(item.published)||plain(item.updated)||''};}).filter(item=>item.title);
}
