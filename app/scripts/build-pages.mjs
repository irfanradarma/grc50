import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../../',import.meta.url));
const config=JSON.parse(await fs.readFile(path.join(root,'deploy/public-config.json'),'utf8'));
const frontend=new URL(config.frontendUrl),api=new URL(config.apiOrigin);
if(frontend.protocol!=='https:'||api.protocol!=='https:')throw Error('Public endpoints require HTTPS');
const base=frontend.pathname.replace(/\/$/,'')+'/';
execFileSync(process.execPath,[path.join(root,'app/node_modules/vite/bin/vite.js'),'build'],{cwd:path.join(root,'app'),stdio:'inherit',env:{...process.env,VITE_BASE_PATH:base,VITE_API_URL:api.origin}});
const output=path.join(root,'app/.local/pages');
await fs.mkdir(output,{recursive:true});
await fs.cp(path.join(root,'website'),output,{recursive:true});
await fs.cp(path.join(root,'website'),path.join(output,'presentation'),{recursive:true});
await fs.cp(path.join(root,'app/dist/assets'),path.join(output,'assets'),{recursive:true});
await fs.copyFile(path.join(root,'app/dist/signal.svg'),path.join(output,'signal.svg'));
const html=await fs.readFile(path.join(root,'app/dist/index.html'),'utf8');
const routes=['admin','admin/demo','audience','join-qr',...['context','menus','capture','assessment','mitigation','protection','internal','ca','dashboard'].map(key=>'audience/walkthrough/'+key)];
for(const route of routes){await fs.mkdir(path.join(output,route),{recursive:true});await fs.writeFile(path.join(output,route,'index.html'),html);}
const runtime='window.SIGNAL_HOSTING='+JSON.stringify({...config,frontendUrl:config.frontendUrl.replace(/\/$/,'')})+';\n';
for(const prefix of ['','presentation/'])await fs.writeFile(path.join(output,prefix,'assets/js/hosting-config.js'),runtime);
// Compatibility for previously shared dynamic session paths. The final app page returns HTTP 200.
await fs.writeFile(path.join(output,'404.html'),`<!doctype html><meta charset="utf-8"><title>SIGNAL</title><script>const base=${JSON.stringify(base)},p=location.pathname.slice(base.length),m=p.match(/^(admin|audience)\\/sessions\\/([A-Z0-9]{6})\\/?$/i);if(m)location.replace(base+m[1]+'/');</script><p>Page not found. <a href="${base}audience/">Open SIGNAL</a></p>`);
await fs.writeFile(path.join(output,'.nojekyll'),'');

for(const prefix of ['','presentation/']){const vendor=path.join(output,prefix,'assets/vendor');await fs.mkdir(vendor,{recursive:true});await fs.copyFile(path.join(root,'app/node_modules/@rrweb/replay/dist/replay.umd.cjs'),path.join(vendor,'rrweb-replay.js'));await fs.copyFile(path.join(root,'app/node_modules/@rrweb/replay/dist/style.css'),path.join(vendor,'rrweb-replay.css'));}
console.log('Pages artifact ready: app/.local/pages');
