import { tr } from "./i18n";
import { api, cloudEnabled } from './api';
import LanguageSwitch from './LanguageSwitch';
import { useLanguage } from './i18n';

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, ArrowRight, Building2, Check, ChevronDown, ChevronRight, ClipboardList, Compass, Layers3, LoaderCircle, LogOut, Plus, ShieldCheck, Sparkles, Target, Settings as SettingsIcon } from 'lucide-react';
import './styles.css';
import Objectives, { type Objective } from './Objectives';
import Settings from './Settings';
import Dashboard from './Dashboard';
import MacroSwitcher from './MacroSwitcher';
import ActivityApps from './ActivityApps';
import ProfileOnboarding from './ProfileOnboarding';
import WorkspaceStart from './WorkspaceStart';
import type { Mitigation } from './Mitigation';
import CompactMonitoring from './CompactMonitoring';
import RiskRegister from './RiskRegister';
import { RiskTriggers } from './Workflow';
const SeminarApp=React.lazy(()=>import('./SeminarApp'));
const SeminarQR=React.lazy(()=>import('./SeminarApp').then(m=>({default:m.SeminarQR})));
type Context = {
  name: string;
  sector: string;
  description: string;
  objective: string;
  stakeholders: string;
  dependencies: string;
  appetite: string;
};
type Risk = {
  mitigations?: Mitigation[];
  id?: string;
  originSignalId?: string;
  objectiveId?: string;
  objectiveYear?: number;
  title: string;
  category: string;
  cause: string;
  event: string;
  impact: string;
  objective: string;
  owner: string;
  controls: string;
  response: string;
  likelihood: number;
  impactScore: number;
  source: string;
};
type Workspace = {
  id: string;
  name: string;
};
const blankContext: Context = {
  name: '',
  sector: 'Public sector',
  description: '',
  objective: '',
  stakeholders: '',
  dependencies: '',
  appetite: ''
};
const blankRisk: Risk = {
  title: '',
  category: 'Operational',
  cause: '',
  event: '',
  impact: '',
  objective: '',
  owner: '',
  controls: '',
  response: '',
  likelihood: 3,
  impactScore: 3,
  source: 'Manual'
};
const requestedView = new URLSearchParams(location.search).get('view');
const seminarView = requestedView === 'context' ? 'objectives' : requestedView;
const initialPage = seminarView && ['dashboard', 'objectives', 'settings', 'risks', 'monitoring', 'triggers', 'incidents', 'ams', 'assurance'].includes(seminarView) ? seminarView : 'dashboard';
function App() {
  useLanguage();
  const [scratchId, setScratchId] = useState('');
  const [objectives, setObjectives] = useState<Objective[]>([]),
    [selectedId, setSelectedId] = useState('');
  const selectedObjective = objectives.find(o => o.id === selectedId);
  const objectiveText = selectedObjective ? selectedObjective.title + ' - ' + selectedObjective.target : '';
  const [workspace, setWorkspace] = useState<Workspace | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [toast, setToast] = useState(''),
    [page, setPage] = useState(initialPage),
    [context, setContext] = useState<Context | null>(null),
    [risks, setRisks] = useState<Risk[]>([]),
    [draft, setDraft] = useState<Risk | null>(null);
  useEffect(() => {
    api<Workspace>('/auth/me').then(async w => {
      const [c, r] = await Promise.all([api<Context | null>('/context'), api<Risk[]>('/risks')]);
      const goals = await api<Objective[]>('/objectives');
      setObjectives(goals);
      setSelectedId(goals[0]?.id || '');
      setWorkspace(w);
      setContext(c);
      setRisks(r);
    }).catch(e => {
      if (!e.message.includes('guest workspace') && !e.message.includes('expired')) setError(e.message);
    }).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }
  const notify = (text: string) => setToast(text);
  function navigate(next: string) {
    setPage(next);
    setError('');
    const url = new URL(location.href);
    url.searchParams.set('view', next);
    history.replaceState(null, '', url);
  }
  useEffect(() => {
    document.title = 'HORI / ' + ({
      incidents: 'Incident Reporting',
      ams: 'Audit Management',
      assurance: 'Continuous Assurance'
    }[page as 'incidents' | 'ams' | 'assurance'] || 'Risk workspace');
  }, [page]);
  async function guest() {
    await action(async () => {
      const w = await api<Workspace>('/auth/guest', {
        method: 'POST'
      });
      setObjectives([]);
      setSelectedId('');
      setWorkspace(w);
      setContext(null);
      setRisks([]);
      setPage(initialPage);
    });
  }
  async function logout() {
    await action(async () => {
      await api('/auth/logout', {
        method: 'POST'
      });
      setObjectives([]);
      setSelectedId('');
      setWorkspace(null);
      setContext(null);
      setRisks([]);
      setDraft(null);
      notify('Signed out of your guest workspace.');
    });
  }
  if (loading) return <div className="loading-screen"><LoaderCircle className="spin" />{tr("Opening your workspace…")}</div>;
  if (!workspace) return <div className="login"><section className="login-story"><div className="logo"><span className="logo-mark"><Layers3 size={22} /></span>{tr("hori")}<span className="logo-dot">{tr(".")}</span></div><div className="login-copy"><span className="eyebrow light">{tr("GRC 5.0 / OBJECTIVES, RISK & ASSURANCE")}</span><h1>{tr("Clarity for the")}<br />{tr("decisions")}<br />{tr("that matter.")}</h1><p>{tr("Connect annual objectives, risk exposure, and assurance evidence in one private workspace.")}</p><div className="story-line"><ShieldCheck size={20} /><span>{tr("Your context. Your risks. Your workspace.")}</span></div></div><div className="orb orb-one" /><div className="orb orb-two" /><footer>{tr("Built for thoughtful risk management ")}<span>{tr("LOCAL PROTOTYPE / 01")}</span></footer></section><section className="login-form"><div className="login-box"><LanguageSwitch /><span className="eyebrow">{tr("WELCOME TO HORI")}</span><h2>{tr("Your next good")}<br />{tr("decision starts here.")}</h2><p>{tr("Explore the workspace without creating an account.")}</p><button className="primary wide" disabled={busy} onClick={guest}>{tr(busy ? <LoaderCircle size={18} className="spin" /> : <Compass size={18} />)}{tr("Continue as guest")}<ArrowRight size={18} /></button><div className="guest-info"><ShieldCheck size={18} /><p>{tr("We create a private workspace for this browser. ")}{tr(cloudEnabled ? 'Your guest session is saved in this browser.' : 'Your session lasts up to 30 days.')}{tr(" Signing out ends access to this guest workspace.")}</p></div><div className="login-rule" /><span className="eyebrow muted">{tr("WHAT YOU CAN DO")}</span><div className="login-feature"><Building2 size={19} /><div><b>{tr("Set the organizational context")}</b><span>{tr("Objectives, stakeholders, and dependencies")}</span></div></div><div className="login-feature"><ClipboardList size={19} /><div><b>{tr("Build a focused Risk Register")}</b><span>{tr("Manual entries or randomized sample drafts")}</span></div></div><div className="sample-note"><Sparkles size={14} />{tr("Sample generation available. AI connection comes next.")}</div>{tr(error && <div className="error" role="alert">{tr(error)}</div>)}</div><small>{tr("Private by design · No shared guest workspace")}</small></section></div>;
  const startKey = 'hori-start-' + workspace.id;
  let scratchChosen = scratchId === workspace.id;
  try {
    scratchChosen = scratchChosen || sessionStorage.getItem(startKey) === 'scratch' || Boolean(sessionStorage.getItem('hori-onboarding-' + workspace.id));
  } catch {}
  if (!context && !scratchChosen) return <WorkspaceStart onScratch={() => {
    setScratchId(workspace.id);
    try {
      sessionStorage.setItem(startKey, 'scratch');
    } catch {}
  }} onTemplate={async () => {
    const [profile, goals, items] = await Promise.all([api<Context>('/context'), api<Objective[]>('/objectives'), api<Risk[]>('/risks')]);
    setContext(profile);
    setObjectives(goals);
    setSelectedId(goals[0]?.id || '');
    setRisks(items);
    setPage(seminarView ? initialPage : 'dashboard');
    notify('Your private template workspace is ready. All sample data is editable.');
  }} onLogout={logout} />;
  if (!context) return <ProfileOnboarding onChooseStart={() => {
    setScratchId('choose');
    try {
      sessionStorage.removeItem(startKey);
      sessionStorage.removeItem('hori-onboarding-' + workspace.id);
    } catch {}
  }} workspaceId={workspace.id} onComplete={p => {
    setContext({
      ...p,
      objective: ''
    });
    setPage('objectives');
    notify('Company profile saved. Next, set your annual objectives.');
  }} onLogout={logout} />;
  const pageTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    objectives: 'Objectives',
    settings: 'Settings',
    risks: 'Risk Register',
    monitoring: 'Risk Monitoring',
    triggers: 'Risk Trigger',
    incidents: 'Incident Reporting',
    ams: 'Audit Management',
    assurance: 'Continuous Assurance'
  };
  const total = risks.length;
  return <div className="app-shell"><aside className="sidebar"><div className="logo"><span className="logo-mark"><Layers3 size={20} /></span>{tr("hori")}<span className="logo-dot">{tr(".")}</span></div><div className="workspace-switch"><div className="workspace-icon">{tr((context?.name || 'My workspace').slice(0, 1))}</div><div><b>{tr(context?.name || 'My workspace')}</b><span>{tr("Private guest workspace")}</span></div><ChevronDown size={15} /></div><span className="nav-label">{tr("WORKSPACE")}</span><button className={`nav-item ${page === 'dashboard' ? 'selected' : ''}`} onClick={() => navigate('dashboard')}><LayoutDashboard size={18} />{tr("Dashboard")}</button><button className={`nav-item ${page === 'objectives' ? 'selected' : ''}`} onClick={() => navigate('objectives')}><Target size={18} />{tr("Objectives")}</button><button className={`nav-item ${page === 'risks' ? 'selected' : ''}`} onClick={() => navigate('risks')}><ClipboardList size={18} />{tr("Risk Register")}<span className="nav-count">{tr(total)}</span></button><button className={`nav-item ${page === 'monitoring' ? 'selected' : ''}`} onClick={() => navigate('monitoring')}><ShieldCheck size={18} />{tr("Risk Monitoring")}</button><button className={`nav-item ${page === 'triggers' ? 'selected' : ''}`} onClick={() => navigate('triggers')}><Compass size={18} />{tr("Risk Trigger")}</button><div className="sidebar-bottom"><div className="sample-card"><Sparkles size={18} /><b>{tr("Start with a sample")}</b><p>{tr("Explore the workflow with randomized, editable drafts.")}</p><span>{tr("AI integration coming next")}</span></div><button className={`nav-item admin-settings-link ${page === 'settings' ? 'selected' : ''}`} onClick={() => navigate('settings')}><SettingsIcon size={18} />{tr("Settings")}<span className="admin-label">{tr("Admin")}</span></button><div className="profile"><div className="avatar">{tr("G")}</div><div><b>{tr("Guest explorer")}</b><span>{tr("Workspace ")}{tr(workspace.id.slice(0, 8))}</span></div><button aria-label={tr("Sign out")} onClick={logout} disabled={busy}><LogOut size={17} /></button></div></div></aside><div className="main-shell"><header className="topbar"><div><span>{tr("Workspace")}</span><ChevronRight size={13} /><b>{tr(pageTitle[page])}</b></div><div className="top-right"><LanguageSwitch /><MacroSwitcher onNavigate={navigate} /><span className="private-pill"><span />{tr("Private workspace")}</span><div className="avatar small-avatar">{tr("G")}</div><button className="icon-button mobile-signout" aria-label={tr("Sign out of workspace")} disabled={busy} onClick={logout}><LogOut size={16} /></button></div></header><main className="main">{tr(page === 'risks' && <div className="page-actions"><button className="primary" disabled={busy || !selectedObjective} onClick={() => setDraft({
            ...blankRisk,
            objective: objectiveText,
            objectiveId: selectedId,
            objectiveYear: selectedObjective?.year
          })}><Plus size={17} />{tr("New risk")}</button></div>)}{tr(error && <div className="error" role="alert">{tr(error)}</div>)}
 {tr(['incidents', 'ams', 'assurance'].includes(page) ? <ActivityApps key={page} app={page} risks={risks} onNavigate={navigate} /> : page === 'dashboard' ? <Dashboard organization={context.name} objectives={objectives} risks={risks} onNavigate={navigate} onEdit={id => {
          setDraft({
            ...risks.find(r => r.id === id)!
          });
          navigate('risks');
        }} /> : page === 'objectives' ? <Objectives objectives={objectives} selectedId={selectedId} onObjectives={goals => {
          setObjectives(goals);
          api<Risk[]>('/risks').then(setRisks).catch(e => setError(e.message));
        }} onSelect={setSelectedId} onRisks={() => navigate('risks')} onSettings={() => navigate('settings')} /> : page === 'settings' ? <Settings profile={context} onProfile={p => setContext({
          ...p,
          objective: ''
        })} onObjectives={() => navigate('objectives')} /> : page === 'monitoring' ? <CompactMonitoring risks={risks} objectives={objectives} onUpdated={() => api<Risk[]>('/risks').then(setRisks)} onCreate={(id, signal) => {
          const o = objectives.find(o => o.id === id);
          if (o) {
            navigate('risks');
            setDraft({
              ...blankRisk,
              objectiveId: id,
              objectiveYear: o.year,
              objective: o.title + ' - ' + o.target,
              originSignalId: signal.id,
              title: signal.title,
              cause: signal.details
            });
          }
        }} /> : page === 'triggers' ? <RiskTriggers risks={risks} objectives={objectives} /> : <RiskRegister risks={risks} objectives={objectives} draft={draft} onChange={setDraft} onOpen={setDraft} onClose={() => setDraft(null)} onSave={() => action(async () => {
          if (!draft) return;
          await api(`/risks${draft.id ? '/' + draft.id : ''}`, {
            method: draft.id ? 'PUT' : 'POST',
            body: JSON.stringify(draft)
          });
          setRisks(await api<Risk[]>('/risks'));
          setDraft(null);
          notify('Risk saved to your private register.');
        })} onGenerate={() => action(async () => {
          setDraft(await api<Risk>('/generate/risk', {
            method: 'POST',
            body: JSON.stringify({
              objectiveId: selectedId
            })
          }));
        })} busy={busy} error={error} organization={context.name} onUpdated={() => api<Risk[]>('/risks').then(setRisks)} />)}

 <footer className="main-footer"><span>{tr("HORI / Risk intelligence workspace")}</span><span>{tr(cloudEnabled ? 'Connected risk workspace' : 'Connected risk workspace')}</span></footer></main></div>{tr(toast && <div className="toast" role="status"><Check size={17} />{tr(toast)}</div>)}</div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><React.Suspense fallback={<div style={{padding:40}}>HORI - Loading...</div>}>{new URLSearchParams(location.search).get("mode")==="qr"?<SeminarQR />:new URLSearchParams(location.search).has("view")?<App />:<SeminarApp />}</React.Suspense></React.StrictMode>);
