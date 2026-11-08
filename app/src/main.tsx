import '../../website/assets/js/brand-storage.js';
import React,{useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {frontendRoute,browserPath} from '../shared/deployment';
import './base.css';

const ModuleAudience=React.lazy(()=>import('./ModuleAudience'));
const WorkshopApp=React.lazy(()=>import('./WorkshopApp'));
const SeminarQR=React.lazy(()=>import('./WorkshopApp').then(m=>({default:m.SeminarQR})));
const SeminarWalkthrough=React.lazy(()=>import('./WorkshopApp').then(m=>({default:m.SeminarWalkthrough})));
function DemoAudience(){const [allowed,setAllowed]=React.useState(false),[error,setError]=React.useState('');useEffect(()=>{let stop:(()=>void)|undefined,cancelled=false;void import('./WorkshopApp').then(m=>m.request('/auth/admin/me')).then(()=>import('./demoRecorder')).then(m=>{if(!cancelled){setAllowed(true);stop=m.installDemoRecorder();}}).catch(()=>{if(!cancelled)setError('Masuk ke panel admin untuk membuka ruang demonstrasi.');});return()=>{cancelled=true;stop?.();};},[]);return allowed?<ModuleAudience><WorkshopApp/></ModuleAudience>:<main className="loading-screen">{error||'Memuat ruang demonstrasi...'}</main>;}
const route=frontendRoute();
if(route.canonical&&location.pathname!==browserPath(route.canonical))history.replaceState(null,'',browserPath(route.canonical)+location.search);
const root=import.meta.hot?.data.root||createRoot(document.getElementById('root')!);
if(import.meta.hot)import.meta.hot.data.root=root;
root.render(<React.StrictMode><React.Suspense fallback={<main className="loading-screen">Loading workspace...</main>}>
 {route.kind==='demo'?<DemoAudience/>:route.kind==='modules'?<ModuleAudience forceHub/>:route.kind==='audience'?<ModuleAudience><WorkshopApp/></ModuleAudience>:route.kind==='tour'?<SeminarWalkthrough/>:route.kind==='qr'?<SeminarQR/>:route.kind==='notfound'?<main className="loading-screen"><h1>Page not found</h1><a href={browserPath("/audience")}>Open audience page</a></main>:<WorkshopApp/>}
</React.Suspense></React.StrictMode>);
