import LanguageSwitch from './LanguageSwitch';
import { tr } from "./i18n";
import { api } from './api';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Check, Compass, Layers3, LoaderCircle, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { profileSample } from './profileSamples';
const sectors = ['Public sector', 'Logistics', 'Education', 'Financial services', 'Healthcare', 'Technology', 'Other'];
export type CompanyProfile = {
  name: string;
  sector: string;
  description: string;
  stakeholders: string;
  dependencies: string;
  appetite: string;
};
const empty: CompanyProfile = {
  name: '',
  sector: '',
  description: '',
  stakeholders: '',
  dependencies: '',
  appetite: ''
};
const steps = [{
  field: 'name',
  title: 'What is your organization called?',
  hint: 'Use the name your team recognizes. You can update it later.',
  label: 'Company / organization name',
  placeholder: 'e.g. Aruna Public Services'
}, {
  field: 'sector',
  title: 'Which sector do you operate in?',
  hint: 'This helps establish the environment your organization works in.',
  label: 'Sector',
  placeholder: ''
}, {
  field: 'description',
  title: 'What does your organization do?',
  hint: 'A short description of your purpose and main activities is enough.',
  label: 'Purpose & operating environment',
  placeholder: 'We provide digital public services across regional service centers.'
}, {
  field: 'stakeholders',
  title: 'Who relies on your organization?',
  hint: 'Think about the people you serve and the people who help deliver your work.',
  label: 'Key stakeholders',
  placeholder: 'Citizens, employees, leadership, partner organizations'
}, {
  field: 'dependencies',
  title: 'What does your organization rely on?',
  hint: 'Include important systems, suppliers, partners, or capabilities.',
  label: 'Critical dependencies',
  placeholder: 'Cloud hosting, digital identity provider, technology supplier'
}, {
  field: 'appetite',
  title: 'Where do you draw the line on risk?',
  hint: 'Describe what you can tolerate and what must be protected.',
  label: 'Risk appetite & boundaries',
  placeholder: 'Low tolerance for service interruptions and personal-data exposure.'
}, {
  field: 'review',
  title: 'Does this look like your organization?',
  hint: 'Review your profile before entering the workspace. Annual objectives come next.',
  label: 'Review your company profile',
  placeholder: ''
}] as const;
function restore(key: string) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (saved && Object.keys(empty).every(k => typeof saved.profile?.[k] === 'string') && Number.isInteger(saved.step) && saved.step >= 0 && saved.step < steps.length) return saved as {
      profile: CompanyProfile;
      step: number;
      otherSectorSelected?: boolean;
    };
  } catch {}
  return {
    profile: {
      ...empty
    },
    step: 0
  };
}
export default function ProfileOnboarding({
  workspaceId,
  onComplete,
  onLogout,
  onChooseStart
}: {
  workspaceId: string;
  onComplete: (p: CompanyProfile) => void;
  onLogout: () => void;
  onChooseStart?: () => void;
}) {
  const storageKey = 'hori-onboarding-' + workspaceId;
  const initial = useRef(restore(storageKey));
  const [profile, setProfile] = useState(initial.current.profile),
    [step, setStep] = useState(initial.current.step),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [otherSectorSelected, setOtherSectorSelected] = useState(Boolean(initial.current.otherSectorSelected || initial.current.profile.sector === 'Other' || initial.current.profile.sector && !sectors.includes(initial.current.profile.sector))),
    [sampleNotice, setSampleNotice] = useState('');
  const question = steps[step];
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        profile,
        step,
        otherSectorSelected
      }));
    } catch {}
  }, [profile, step, storageKey, otherSectorSelected]);
  useEffect(() => {
    heading.current?.focus();
    setError('');
    setSampleNotice('');
  }, [step]);
  const canContinue = step === 1 ? Boolean(profile.sector.trim() && (!otherSectorSelected || profile.sector !== 'Other')) : step > 1 || Boolean(profile[question.field as keyof CompanyProfile]?.trim());
  function change(value: string) {
    setProfile({
      ...profile,
      [question.field]: value
    });
    setSampleNotice('');
  }
  function fillRandom() {
    if (step < 2 || step > 5) return;
    const field = question.field as 'description' | 'stakeholders' | 'dependencies' | 'appetite';
    setProfile({
      ...profile,
      [field]: profileSample(field, profile.sector, profile[field])
    });
    setSampleNotice('Random sample added. Edit it to match your organization.');
  }
  async function sample() {
    setBusy(true);
    setError('');
    try {
      const data = await api<CompanyProfile>('/generate/context', {
        method: 'POST'
      });
      setProfile(Object.fromEntries(Object.keys(empty).map(k => [k, data[k as keyof CompanyProfile]])) as CompanyProfile);
      setOtherSectorSelected(false);
      setStep(6);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load a sample.');
    } finally {
      setBusy(false);
    }
  }
  async function finish() {
    setBusy(true);
    setError('');
    try {
      const data = await api<CompanyProfile>('/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      try {
        sessionStorage.removeItem(storageKey);
      } catch {}
      onComplete(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save your profile. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return <div className="onboarding"><header className="onboarding-header"><LanguageSwitch/><div className="logo"><span className="logo-mark"><Layers3 size={22} /></span>{tr("hori")}<span className="logo-dot">{tr(".")}</span></div>{tr(onChooseStart && <button type="button" className="text-button" disabled={busy} onClick={onChooseStart}>{tr("Change starting option")}</button>)}<span className="onboarding-private"><ShieldCheck size={17} />{tr("Your private workspace")}</span><button className="secondary" disabled={busy} onClick={onLogout}><LogOut size={16} />{tr("Sign out")}</button></header><main className="onboarding-main"><aside className="onboarding-story"><span className="eyebrow">{tr("A LITTLE CONTEXT GOES A LONG WAY")}</span><h1>{tr("Let’s get to know")}<br />{tr("your organization.")}</h1><p>{tr("A few short questions will create the foundation for your risk work.")}</p><div className="onboarding-roadmap"><div className="current"><span><Building2 size={20} /></span><div><b>{tr("Company profile")}</b><p>{tr("Your organization’s enduring context")}</p></div></div><div><span><Compass size={20} /></span><div><b>{tr("Annual objectives")}</b><p>{tr("Set your goals after this setup")}</p></div></div></div><div className="onboarding-note"><ShieldCheck size={20} /><p>{tr("Your answers stay in this workspace. You can edit your profile at any time.")}</p></div></aside><section className="onboarding-card"><div className="onboarding-progress"><div><span>{tr("Company profile setup")}</span><b>{tr("Step ")}{tr(step + 1)}{tr(" of ")}{tr(steps.length)}</b></div><progress max={steps.length} value={step + 1} aria-label={tr("Company profile setup progress")} /></div><form onSubmit={e => {
          e.preventDefault();
          if (step === 6) finish();else if (canContinue) setStep(step + 1);
        }}><div className="question-content"><span className="eyebrow">{tr(step === 6 ? 'REVIEW & FINISH' : step < 2 ? 'THE BASICS' : 'YOUR OPERATING CONTEXT')}</span><h2 tabIndex={-1} ref={heading}>{tr(question.title)}</h2><p className="question-hint">{tr(question.hint)}</p>{tr(step === 1 ? <><div className="sector-options" role="radiogroup" aria-label={tr("Sector")}>{tr(sectors.map(sector => <button key={sector} type="button" role="radio" aria-checked={sector === 'Other' ? otherSectorSelected : !otherSectorSelected && profile.sector === sector} className={(sector === 'Other' ? otherSectorSelected : !otherSectorSelected && profile.sector === sector) ? 'chosen' : ''} disabled={busy} onClick={() => {
                  setOtherSectorSelected(sector === 'Other');
                  change(sector);
                }}><span>{tr(sector)}</span><span className="select-circle">{tr((sector === 'Other' ? otherSectorSelected : !otherSectorSelected && profile.sector === sector) && <Check size={15} />)}</span></button>))}</div>{tr(otherSectorSelected && <label className="question-field custom-sector"><span>{tr("Please specify your sector *")}</span><input required maxLength={3000} value={tr(profile.sector === 'Other' ? '' : profile.sector)} disabled={busy} placeholder={tr("e.g. Energy, agriculture, or manufacturing")} onChange={e => change(e.target.value)} /></label>)}</> : step === 6 ? <div className="profile-review">{tr(steps.slice(0, 6).map((q, i) => <div key={q.field}><div><span>{tr(q.label)}</span><p>{tr(profile[q.field as keyof CompanyProfile] || 'Not specified yet')}</p></div><button type="button" disabled={busy} onClick={() => setStep(i)}>{tr("Edit")}<span className="sr-only"> {tr(q.label)}</span></button></div>))}</div> : <label className="question-field"><span>{tr(question.label)}{tr(step === 0 ? ' *' : '')}</span>{tr(step === 0 ? <input value={tr(profile.name)} required maxLength={3000} disabled={busy} placeholder={tr(question.placeholder)} onChange={e => change(e.target.value)} autoComplete="organization" /> : <textarea value={tr(profile[question.field as keyof CompanyProfile])} maxLength={3000} disabled={busy} placeholder={tr(question.placeholder)} onChange={e => change(e.target.value)} />)}</label>)}{tr(step > 1 && step < 6 && <><button type="button" className="secondary fill-random" disabled={busy} onClick={fillRandom}><Sparkles size={16} />{tr("Fill randomly")}</button>{tr(sampleNotice && <p className="sample-feedback" role="status">{tr(sampleNotice)}</p>)}</>)}{tr(step > 1 && step < 6 && <p className="question-optional">{tr("Optional for now. Add more detail whenever you’re ready.")}</p>)}{tr(error && <div className="error" role="alert">{tr(error)}</div>)}</div><div className="onboarding-actions"><button type="button" className="secondary" disabled={busy || step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={17} />{tr("Back")}</button><div>{tr(step > 1 && step < 6 && <button type="button" className="skip-button" disabled={busy} onClick={() => setStep(step + 1)}>{tr("Do this later")}</button>)}<button className="primary" disabled={busy || !canContinue}>{tr(busy ? <LoaderCircle className="spin" size={17} /> : step === 6 ? <Check size={17} /> : null)}{tr(step === 6 ? 'Save profile & continue' : 'Continue')}{tr(step !== 6 && <ArrowRight size={17} />)}</button></div></div></form></section></main><footer className="onboarding-footer"><span>{tr("Company profile first. Annual targets next.")}</span><button disabled={busy} onClick={sample}><Sparkles size={16} />{tr("Try with a random sample")}</button></footer></div>;
}
