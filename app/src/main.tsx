import '../../website/assets/js/brand-storage.js';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {frontendRoute,browserPath} from '../shared/deployment';
import './base.css';

const WorkshopApp=React.lazy(()=>import('./WorkshopApp'));
const SeminarQR=React.lazy(()=>import('./WorkshopApp').then(m=>({default:m.SeminarQR})));
const SeminarWalkthrough=React.lazy(()=>import('./WorkshopApp').then(m=>({default:m.SeminarWalkthrough})));
const route=frontendRoute();
if(route.canonical&&location.pathname+location.search!==route.canonical)history.replaceState(null,'',browserPath(route.canonical));
const root=import.meta.hot?.data.root||createRoot(document.getElementById('root')!);
if(import.meta.hot)import.meta.hot.data.root=root;
root.render(<React.StrictMode><React.Suspense fallback={<main className="loading-screen">SIGNAL - Loading...</main>}>
 {route.kind==='tour'?<SeminarWalkthrough/>:route.kind==='qr'?<SeminarQR/>:route.kind==='notfound'?<main className="loading-screen"><h1>Page not found</h1><a href={browserPath("/audience")}>Open audience page</a></main>:<WorkshopApp/>}
</React.Suspense></React.StrictMode>);
