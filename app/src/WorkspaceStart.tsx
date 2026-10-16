import LanguageSwitch from './LanguageSwitch';
import { tr } from "./i18n";
import { useState } from 'react';
import { ArrowRight, Building2, Check, Layers3, LoaderCircle, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from './api';
export default function WorkspaceStart({
  onScratch,
  onTemplate,
  onLogout
}: {
  onScratch: () => void;
  onTemplate: () => Promise<void>;
  onLogout: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function start() {
    setBusy(true);
    setError('');
    try {
      await api('/workspace/template', {
        method: 'POST',
        body: JSON.stringify({
          templateId: 'public-service-v1'
        })
      });
      await onTemplate();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to prepare the workspace.');
    } finally {
      setBusy(false);
    }
  }
  return <div className="workspace-start"><header className="onboarding-header"><LanguageSwitch/><div className="logo"><span className="logo-mark"><Layers3 size={22} /></span>{tr("hori")}<span className="logo-dot">{tr(".")}</span></div><span className="onboarding-private"><ShieldCheck size={17} />{tr("Your private workspace")}</span><button className="secondary" disabled={busy} onClick={onLogout}><LogOut size={16} />{tr("Sign out")}</button></header><main className="start-main"><span className="eyebrow">{tr("MAKE THE WORKSPACE YOURS")}</span><h1>{tr("How would you like to start?")}</h1><p className="start-intro">{tr("Explore a complete example, or build a workspace around your organization.")}</p><div className="start-options"><section className="start-option template-option"><div className="start-option-icon"><Sparkles size={26} /></div><span className="badge green">{tr("READY TO EXPLORE")}</span><h2>{tr("Use a template")}</h2><p>{tr("An Indonesian logistics scenario with connected objectives, risks, indicators, and monitoring evidence.")}</p><div className="template-preview"><Building2 size={20} /><div><b>{tr("PT Aruna Logistik Nusantara")}</b><span>{tr("Fictional organization · Synthetic sample data")}</span></div></div><ul>{tr(['Company profile, 7 departments and 3 annual objectives', '4 department-assigned KPIs', '4 linked risks, mitigation plans and 5 key risk indicators', 'Baseline readings and threshold alerts', '6 live news feeds, incident/audit sources and automated assurance', '7 news example items: review, capture, neglect and monitoring', '3 audit projects, 6 automated checks and 11 detected anomalies'].map(text => <li key={text}><Check size={17} />{tr(text)}</li>))}</ul><button className="primary wide" disabled={busy} onClick={start}>{tr(busy ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />)} {tr(busy ? 'Preparing your workspace...' : 'Use template')}<ArrowRight size={18} /></button><small>{tr("Your own editable copy. Changes stay in your workspace.")}</small></section><section className="start-option"><div className="start-option-icon scratch-icon"><Building2 size={26} /></div><span className="badge">{tr("YOUR ORGANIZATION")}</span><h2>{tr("Start from scratch")}</h2><p>{tr("Set up your company profile through a guided survey, then add your annual objectives and risks.")}</p><div className="scratch-steps"><div><b>{tr("01")}</b><span>{tr("Describe your organization")}</span></div><div><b>{tr("02")}</b><span>{tr("Set annual objectives")}</span></div><div><b>{tr("03")}</b><span>{tr("Build your Risk Register")}</span></div></div><button className="secondary wide" disabled={busy} onClick={onScratch}>{tr("Start from scratch")}<ArrowRight size={18} /></button><small>{tr("You can use sample suggestions as you work.")}</small></section></div>{tr(error && <div className="error" role="alert">{tr(error)}</div>)}<p className="start-privacy"><ShieldCheck size={16} />{tr("Both options create a private workspace for this guest session.")}</p></main></div>;
}
