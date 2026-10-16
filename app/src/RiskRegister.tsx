import { tr } from "./i18n";
import { Fragment, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Objective } from './Objectives';
import { MitigationEditor, type Mitigation } from './Mitigation';
import RiskMap from './RiskMap';
import { api } from './api';
import { KriPanel } from './Workflow';
export type RiskRecord = {
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
export function RiskEditor({
  draft,
  objectives,
  onChange,
  onSave,
  onClose,
  busy,
  error,
  onPersisted
}: {
  draft: RiskRecord;
  objectives: Objective[];
  onChange: (r: RiskRecord) => void;
  onSave: () => void;
  onClose: () => void;
  busy: boolean;
  error: string;
  onPersisted?: () => Promise<unknown>;
}) {
  const [tab, setTab] = useState('detail'),
    [validation, setValidation] = useState(''),
    [planBusy, setPlanBusy] = useState(false),
    [planMessage, setPlanMessage] = useState('');
  async function savePlan(plan: Mitigation) {
    if (!draft.id) {
      setValidation('Save the risk before saving individual mitigation plans.');
      return;
    }
    setPlanBusy(true);
    setValidation('');
    setPlanMessage('');
    try {
      await api(`/risks/${draft.id}/mitigations/${plan.id}`, {
        method: 'PUT',
        body: JSON.stringify(plan)
      });
      await onPersisted?.();
      setPlanMessage('Mitigation plan saved. You can add another plan.');
    } catch (e) {
      setValidation(e instanceof Error ? e.message : 'Unable to save plan.');
    } finally {
      setPlanBusy(false);
    }
  }
  const field = (key: 'title' | 'cause' | 'event' | 'impact' | 'owner' | 'controls' | 'response', label: string, required = false, multiline = false) => <label className={`field ${key === 'owner' ? '' : 'full'}`}><span>{tr(label)}{tr(required ? ' *' : '')}</span>{tr(multiline ? <textarea required={required} maxLength={3000} value={tr(draft[key])} onChange={e => onChange({
      ...draft,
      [key]: e.target.value
    })} /> : <input required={required} maxLength={3000} value={tr(draft[key])} onChange={e => onChange({
      ...draft,
      [key]: e.target.value
    })} />)}</label>;
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim() || !draft.cause.trim() || !draft.event.trim() || !draft.impact.trim() || !draft.owner.trim() || !draft.objectiveId || draft.mitigations?.some(p => !p.title.trim() || !p.owner.trim() || !p.deadline)) {
      setValidation('Complete the required risk attributes and each mitigation owner, action and deadline before saving.');
      setTab(!draft.title.trim() || !draft.cause.trim() || !draft.event.trim() || !draft.impact.trim() || !draft.owner.trim() || !draft.objectiveId ? 'detail' : 'score');
      return;
    }
    setValidation('');
    onSave();
  }
  return <section className="risk-inline-editor" aria-label={tr(draft.id ? 'Risk assessment details' : 'New risk assessment')}><div className="risk-editor-heading"><h3>{tr(draft.id ? 'Risk assessment' : 'New risk')}</h3><button type="button" className="text-button" disabled={busy} onClick={onClose}>{tr("Close details")}</button></div><div className="context-tabs" role="tablist" aria-label={tr("Risk assessment tabs")}><button type="button" role="tab" aria-selected={tab === 'detail'} onClick={() => setTab('detail')}>{tr("Detail")}</button><button type="button" role="tab" aria-selected={tab === 'score'} onClick={() => setTab('score')}>{tr("Risk-score")}</button><button type="button" role="tab" aria-selected={tab === 'kri'} onClick={() => setTab('kri')}>{tr("Key Risk Indicator")}</button></div>{tr(tab === 'kri' ? draft.id ? <KriPanel riskId={draft.id} riskOwner={draft.owner} /> : <p className="helper">{tr("Save the risk before adding Key Risk Indicators.")}</p> : <form onSubmit={submit}>{tr(tab === 'detail' ? <div className="form-grid">{tr(field('title', 'Risk title', true))}<label className="field full"><span>{tr("Linked annual objective *")}</span><select required value={draft.objectiveId || ''} onChange={e => {
            const o = objectives.find(o => o.id === e.target.value)!;
            onChange({
              ...draft,
              objectiveId: o.id,
              objectiveYear: o.year,
              objective: o.title + ' - ' + o.target
            });
          }}><option value="" disabled>{tr("Select an annual objective")}</option>{tr(objectives.map(o => <option key={o.id} value={o.id}>{tr(o.year)}{tr(" / ")}{tr(o.title)}</option>))}</select></label>{tr(field('cause', 'Cause', true, true))}{tr(field('event', 'Risk event', true, true))}{tr(field('impact', 'Impact on the objective', true, true))}{tr(field('owner', 'Risk owner', true))}<label className="field"><span>{tr("Category")}</span><select value={draft.category} onChange={e => onChange({
            ...draft,
            category: e.target.value
          })}>{tr(['Operational', 'Strategic', 'Technology', 'Compliance', 'Financial'].map(v => <option key={v} value={v}>{tr(v)}</option>))}</select></label>{tr(field('controls', 'Existing controls', false, true))}</div> : <><div className="form-grid"><div className="field full"><RiskMap likelihood={draft.likelihood} impact={draft.impactScore} plans={draft.mitigations || []} onChange={(likelihood, impactScore) => onChange({
              ...draft,
              likelihood,
              impactScore
            })} /></div>{tr(field('response', 'Planned response', false, true))}</div><div className="risk-mitigation-details"><MitigationEditor onSave={savePlan} busy={planBusy} plans={draft.mitigations || []} owner={draft.owner} onChange={mitigations => onChange({
            ...draft,
            mitigations
          })} /></div></>)}{tr(planMessage && <p className="workflow-success" role="status">{tr(planMessage)}</p>)}{tr((error || validation) && <div className="error" role="alert">{tr(error || validation)}</div>)}<div className="form-footer"><button type="button" className="secondary" disabled={busy} onClick={onClose}>{tr("Cancel")}</button><button className="primary" disabled={busy}>{tr("Save risk")}</button></div></form>)}</section>;
}
export default function RiskRegister({
  risks,
  objectives,
  draft,
  onChange,
  onOpen,
  onClose,
  onSave,
  onGenerate,
  busy,
  error,
  organization,
  onUpdated
}: {
  risks: RiskRecord[];
  objectives: Objective[];
  draft: RiskRecord | null;
  onChange: (r: RiskRecord) => void;
  onOpen: (r: RiskRecord) => void;
  onClose: () => void;
  onSave: () => void;
  onGenerate: () => void;
  busy: boolean;
  error: string;
  organization: string;
  onUpdated: () => Promise<unknown>;
}) {
  const [filter, setFilter] = useState(''),
    [search, setSearch] = useState('');
  const filtered = risks.filter(r => (!filter || r.objectiveId === filter) && `${r.title} ${r.owner} ${r.objective}`.toLowerCase().includes(search.toLowerCase()));
  const editor = (r: RiskRecord): ReactNode => <RiskEditor key={r.id || 'new'} draft={r} objectives={objectives} onChange={onChange} onSave={onSave} onClose={onClose} busy={busy} error={error} onPersisted={onUpdated} />;
  // Keep an externally opened risk visible even when a local filter was active.
  const visible = draft?.id && !filtered.some(r => r.id === draft.id) ? [...filtered, risks.find(r => r.id === draft.id)!].filter(Boolean) : filtered;
  return <section className="panel register"><div className="register-head"><div><h2>{tr("Your risk items")}</h2><p>{tr(organization)}</p></div><div className="register-actions"><label className="field"><span>{tr("Filter by objective")}</span><select value={filter} onChange={e => {
            setFilter(e.target.value);
            onClose();
          }}><option value="">{tr("All objectives")}</option>{tr(objectives.map(o => <option key={o.id} value={o.id}>{tr(o.year)}{tr(" / ")}{tr(o.title)}</option>))}</select></label><label className="field"><span>{tr("Search risks")}</span><input value={tr(search)} onChange={e => {
            setSearch(e.target.value);
            onClose();
          }} placeholder={tr("Risk, objective or owner")} /></label><button className="secondary" disabled={busy || !objectives.length} onClick={onGenerate}>{tr("Generate sample risk")}</button></div></div>{tr(draft && !draft.id && <div className="new-risk-inline">{tr(editor(draft))}</div>)}<div className="table-wrap"><table className="risk-register-table"><thead><tr><th>{tr("Risk")}</th><th>{tr("Objective")}</th><th>{tr("Rating")}</th><th>{tr("Owner")}</th><th><span className="sr-only">{tr("Details")}</span></th></tr></thead><tbody>{tr(visible.map(r => <Fragment key={r.id}><tr className={draft?.id === r.id ? 'risk-register-expanded' : ''}><td><button className="risk-title" aria-expanded={draft?.id === r.id} onClick={() => draft?.id === r.id ? onClose() : onOpen({
                  ...r
                })}>{tr(r.title)}</button></td><td><small>{tr(r.objectiveYear)}</small><span>{tr(objectives.find(o => o.id === r.objectiveId)?.title || r.objective)}</span></td><td><span className={`badge ${r.likelihood * r.impactScore >= 15 ? 'high' : r.likelihood * r.impactScore >= 6 ? 'moderate' : 'green'}`}>{tr(r.likelihood * r.impactScore >= 15 ? 'High' : r.likelihood * r.impactScore >= 6 ? 'Moderate' : 'Low')}{tr(" / ")}{tr(r.likelihood * r.impactScore)}</span></td><td>{tr(r.owner)}</td><td><button className="icon-button" aria-expanded={draft?.id === r.id} aria-label={tr(`${draft?.id === r.id ? 'Close' : 'Open'} ${r.title}`)} onClick={() => draft?.id === r.id ? onClose() : onOpen({
                  ...r
                })}>{tr(draft?.id === r.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}</button></td></tr>{tr(draft && draft.id === r.id && <tr className="risk-register-detail-row"><td colSpan={5}>{tr(editor(draft))}</td></tr>)}</Fragment>))}</tbody></table>{tr(!visible.length && !draft && <p className="no-results">{tr(risks.length ? 'No risks match your filter.' : 'Create your first risk using New risk.')}</p>)}</div><div className="register-foot">{tr(risks.length)}{tr(" registered risks")}</div></section>;
}
