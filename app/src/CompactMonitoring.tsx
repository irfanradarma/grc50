import { tr } from "./i18n";
import { Fragment, useEffect, useState } from 'react';
import { api } from './api';
import { RiskEditor, type RiskRecord } from './RiskRegister';
import type { Objective } from './Objectives';
import type { Signal, Workflow } from './Workflow';
import { visibleInMonitoring } from '../shared/newsReview';
const tag = (kind: string) => kind === 'news' ? 'news' : kind === 'audit' ? 'audit' : kind === 'assurance' ? 'CA' : 'report';
export default function CompactMonitoring({
  risks,
  objectives,
  onUpdated,
  onCreate
}: {
  risks: RiskRecord[];
  objectives: Objective[];
  onUpdated: () => Promise<unknown>;
  onCreate: (id: string, s: Signal) => void;
}) {
  const [data, setData] = useState<Workflow | null>(null),
    [draft, setDraft] = useState<RiskRecord | null>(null),
    [filter, setFilter] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [selectedAlert, setSelectedAlert] = useState(''),
    [decision, setDecision] = useState('Acknowledged'),
    [notes, setNotes] = useState('');
  async function load() {
    try {
      setData(await api<Workflow>('/workflow'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load alerts.');
    }
  }
  useEffect(() => {
    load();
  }, [risks]);
  const signals = (data?.signals || []).filter(visibleInMonitoring),
    pending = signals.filter(s => s.status === 'Open');
  async function saveRisk() {
    if (!draft?.id) return;
    setBusy(true);
    setError('');
    try {
      await api('/risks/' + draft.id, {
        method: 'PUT',
        body: JSON.stringify(draft)
      });
      await onUpdated();
      setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save risk.');
    } finally {
      setBusy(false);
    }
  }
  async function review(s: Signal) {
    setBusy(true);
    setError('');
    try {
      await api('/signals/' + s.id + '/review', {
        method: 'POST',
        body: JSON.stringify({
          decision,
          notes
        })
      });
      await load();
      setSelectedAlert('');
      setNotes('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to review alert.');
    } finally {
      setBusy(false);
    }
  }
  const alert = (s: Signal) => <div className="monitor-alert" key={s.id}><button type="button" className="monitor-alert-toggle" aria-expanded={selectedAlert === s.id} onClick={() => {
      setSelectedAlert(selectedAlert === s.id ? '' : s.id);
      setNotes('');
      setDecision('Acknowledged');
    }}><span className={`badge alert-tag tag-${tag(s.kind).toLowerCase()}`}>{tr(tag(s.kind))}</span><span>{tr(s.title)}</span><span className="badge">{tr(s.status)}</span></button>{tr(selectedAlert === s.id && <div className="monitor-alert-detail"><p>{tr(s.details)}</p><p className="helper">{tr(s.observedAt)}</p>{tr(s.evidence && <p>{tr("Evidence: ")}{tr(/^https?:\/\//i.test(s.evidence) ? <a href={s.evidence} target="_blank" rel="noreferrer">{tr("Open source")}</a> : s.evidence)}</p>)}{tr(s.status === 'Open' && <form onSubmit={e => {
        e.preventDefault();
        review(s);
      }}><label className="field"><span>{tr("Review decision")}</span><select value={decision} onChange={e => setDecision(e.target.value)}>{tr(['Acknowledged', 'Reassessment requested', 'Dismissed'].map(v => <option key={v} value={v}>{tr(v)}</option>))}</select></label><label className="field"><span>{tr("Reason and next steps")}</span><textarea required value={tr(notes)} onChange={e => setNotes(e.target.value)} /></label><button className="primary" disabled={busy}>{tr("Save alert review")}</button></form>)}{tr(s.notes && <p>{tr(s.notes)}</p>)}</div>)}</div>;
  return <>{tr(error && <div className="error" role="alert">{tr(error)}</div>)}<section className="panel register"><div className="register-head"><h2>{tr("Risks & actions")}</h2><button className="secondary" disabled={busy || !risks.length} onClick={async () => {
          setBusy(true);
          try {
            await api('/suite/assurance-examples', {
              method: 'POST'
            });
            await load();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Unable to load CA examples.');
          } finally {
            setBusy(false);
          }
        }}>{tr("Load CA examples")}</button><label className="field"><span>{tr("Filter by objective")}</span><select value={filter} onChange={e => {
            setFilter(e.target.value);
            setDraft(null);
          }}><option value="">{tr("All objectives")}</option>{tr(objectives.map(o => <option key={o.id} value={o.id}>{tr(o.title)}</option>))}</select></label></div><div className="table-wrap"><table className="monitor-table compact-monitor-table"><thead><tr><th>{tr("Risk name")}</th><th>{tr("Score")}</th><th>{tr("Owner")}</th><th>{tr("Mitigation")}</th><th>{tr("Alerts")}</th></tr></thead><tbody>{tr(risks.filter(r => !filter || r.objectiveId === filter).map(r => {
              const plans = r.mitigations || [],
                alerts = pending.filter(s => s.riskId === r.id),
                open = draft?.id === r.id;
              return <Fragment key={r.id}><tr onClick={() => setDraft(open ? null : {
                  ...r
                })} className={open ? 'risk-register-expanded' : ''}><td><button className="risk-title" aria-expanded={open} onClick={() => setDraft(open ? null : {
                      ...r
                    })}>{tr(r.title)}</button></td><td><span className={`badge ${r.likelihood * r.impactScore >= 15 ? 'high' : r.likelihood * r.impactScore >= 6 ? 'moderate' : 'green'}`}>{tr(r.likelihood * r.impactScore)}</span></td><td>{tr(r.owner)}</td><td><button className="text-button" onClick={() => setDraft(open ? null : {
                      ...r
                    })}>{tr(plans.filter(p => p.status === 'Done').length)}{tr("/")}{tr(plans.length)}{tr(" done")}</button>{tr(plans.filter(p => p.status !== 'Done').slice(0, 2).map(p => <small key={p.id}>{tr(p.title)}{tr(" / ")}{tr(p.deadline)}</small>))}</td><td><button className="text-button" onClick={() => setDraft(open ? null : {
                      ...r
                    })}>{tr(alerts.length)}{tr(" alerts")}</button><div className="alert-tags">{tr([...new Set(alerts.map(s => tag(s.kind)))].map(label => <span className={`badge alert-tag tag-${label.toLowerCase()}`} key={label}>{tr(label)}</span>))}</div></td></tr>{tr(open && draft && <tr className="risk-register-detail-row"><td colSpan={5}><RiskEditor key={r.id} draft={draft} objectives={objectives} onChange={setDraft} onSave={saveRisk} onClose={() => setDraft(null)} busy={busy} error={error} onPersisted={onUpdated} /><section className="monitor-alert-list"><h3>{tr("Alerts & evidence")}</h3>{tr(signals.filter(s => s.riskId === r.id).map(alert))}{tr(!signals.some(s => s.riskId === r.id) && <p className="helper">{tr("No alerts recorded for this risk.")}</p>)}<details className="history"><summary>{tr("Risk review history")}</summary>{tr(data?.reviews.filter(v => v.riskId === r.id).map(v => <p key={v.id}><b>{tr(v.decision)}</b>{tr(" / ")}{tr(v.notes)}</p>))}</details></section></td></tr>)}</Fragment>;
            }))}</tbody></table>{tr(!risks.length && <p className="no-results">{tr("Create a risk in Risk Register to start monitoring.")}</p>)}</div></section>{tr(pending.some(s => !s.riskId) && <section className="panel workflow-panel"><h2>{tr("Potential new risks")}</h2>{tr(pending.filter(s => !s.riskId && (!filter || s.objectiveId === filter)).map(s => <div key={s.id}>{tr(alert(s))}<button className="text-button" onClick={() => onCreate(s.objectiveId, s)}>{tr("Identify linked risk")}</button></div>))}</section>)}</>;
}
