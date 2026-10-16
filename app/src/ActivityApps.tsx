import { tr } from "./i18n";
import { useEffect, useState } from 'react';
import { api } from './api';
type Risk = {
  id?: string;
  title: string;
  objectiveId?: string;
};
type RecordData = {
  id: string;
  [key: string]: any;
};
type Suite = {
  incident: RecordData[];
  audit: RecordData[];
  check: RecordData[];
  anomaly: RecordData[];
};
const empty: Suite = {
  incident: [],
  audit: [],
  check: [],
  anomaly: []
};
const today = () => new Date().toISOString().slice(0, 10);
export default function ActivityApps({
  app,
  risks,
  onNavigate
}: {
  app: string;
  risks: Risk[];
  onNavigate: (page: string) => void;
}) {
  const [data, setData] = useState<Suite>(empty),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [view, setView] = useState('dashboard'),
    [selected, setSelected] = useState(''),
    [draft, setDraft] = useState<any>(null),
    [decision, setDecision] = useState('Confirmed'),
    [reason, setReason] = useState(''),
    [reviewer, setReviewer] = useState(''),
    [status, setStatus] = useState('All'),
    [riskFilter, setRiskFilter] = useState('');
  const riskName = (id: string) => risks.find(r => r.id === id)?.title || 'Registered risk';
  async function load() {
    try {
      setData(await api<Suite>('/suite'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load activities.');
    }
  }
  useEffect(() => {
    setView('dashboard');
    setSelected('');
    setDraft(null);
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [app]);
  async function run(path: string, body: unknown = {}, method = 'POST') {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api<any>(path, {
        method,
        body: JSON.stringify(body)
      });
      await load();
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save.');
      return null;
    } finally {
      setBusy(false);
    }
  }
  const examples = <button className="secondary" disabled={busy || !risks.length} onClick={async () => {
    if (await run('/suite/examples')) setMessage('Synthetic audit projects and automated checks added to your workspace.');
  }}>{tr("Load connected examples")}</button>;
  const navigation = <div className="activity-toolbar"><span className="badge green">{tr("One private workspace / shared Risk Register")}</span><button className="text-button" onClick={() => onNavigate('monitoring')}>{tr("Open Risk Monitoring")}</button>{tr(examples)}<button className="secondary" onClick={load}>{tr("Refresh")}</button></div>;
  const notices = <>{tr(error && <div className="error" role="alert">{tr(error)}</div>)}{tr(message && <div className="workflow-success" role="status">{tr(message)}</div>)}</>;
  const table = (heads: string[], rows: React.ReactNode) => <div className="trigger-table-scroll"><table className="trigger-table activity-table"><thead><tr>{tr(heads.map(h => <th key={h}>{tr(h)}</th>))}</tr></thead><tbody>{tr(rows)}</tbody></table></div>;
  if (app === 'incidents') return <div className="activity-app">{tr(navigation)}{tr(notices)}<div className="context-tabs"><button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>{tr("Submitted reports")}</button><button className={view === 'submit' ? 'active' : ''} onClick={() => {
        setView('submit');
        setDraft({
          title: '',
          riskId: risks[0]?.id || '',
          details: '',
          observedAt: today(),
          evidence: '',
          reporter: ''
        });
      }}>{tr("Submit incident")}</button></div>{tr(view === 'submit' && draft ? <form className="panel workflow-panel" onSubmit={async e => {
      e.preventDefault();
      if (await run('/suite/incidents', draft)) {
        setDraft(null);
        setView('dashboard');
        setMessage('Incident submitted and connected to the registered risk in Risk Monitoring.');
      }
    }}><h2>{tr("Report an operational incident")}</h2><p className="helper">{tr("Describe evidence and exposure. The risk owner validates the impact.")}</p><div className="form-grid"><Field label={tr("Incident title")} value={tr(draft.title)} onChange={v => setDraft({
          ...draft,
          title: v
        })} /><RiskSelect risks={risks} value={draft.riskId} onChange={v => setDraft({
          ...draft,
          riskId: v
        })} /><Field label={tr("Observed date")} type="date" value={tr(draft.observedAt)} onChange={v => setDraft({
          ...draft,
          observedAt: v
        })} /><Field label={tr("Reporter")} value={tr(draft.reporter)} onChange={v => setDraft({
          ...draft,
          reporter: v
        })} /><Field label={tr("Incident evidence and potential impact")} area value={tr(draft.details)} onChange={v => setDraft({
          ...draft,
          details: v
        })} /><Field label={tr("Evidence reference")} required={false} value={tr(draft.evidence)} onChange={v => setDraft({
          ...draft,
          evidence: v
        })} /></div><button className="primary" disabled={busy || !risks.length}>{tr("Submit incident report")}</button></form> : <section className="panel workflow-panel"><div className="section-heading"><div><h2>{tr("Incident evidence")}</h2><p>{tr("Submitted reports route to Periodic/incident reports and their linked monitoring risk.")}</p></div><button className="primary" disabled={!risks.length} onClick={() => {
          setView('submit');
          setDraft({
            title: '',
            riskId: risks[0]?.id || '',
            details: '',
            observedAt: today(),
            evidence: '',
            reporter: ''
          });
        }}>{tr("New incident report")}</button></div>{tr(table(['Incident', 'Registered risk', 'Observed / reporter', 'Status'], data.incident.map(x => <tr key={x.id}><td><b>{tr(x.title)}</b><details><summary>{tr("Evidence & details")}</summary><p>{tr(x.details)}</p><p>{tr(x.evidence)}</p></details></td><td>{tr(riskName(x.riskId))}</td><td>{tr(x.observedAt)}<small>{tr(x.reporter)}</small></td><td><span className="badge">{tr(x.status)}</span></td></tr>)))}{tr(!data.incident.length && <p className="helper">{tr("No incident reports yet. Select a registered risk to submit the first report.")}</p>)}</section>)}</div>;
  if (app === 'ams') {
    const project = data.audit.find(p => p.id === selected);
    const newProject = () => {
      setSelected('');
      setView('editor');
      setDraft({
        title: '',
        riskIds: risks[0]?.id ? [risks[0].id] : [],
        owner: '',
        scope: '',
        program: [{
          id: crypto.randomUUID(),
          procedure: '',
          evidence: '',
          result: '',
          conclusion: ''
        }],
        report: {
          summary: '',
          finding: '',
          recommendation: '',
          managementResponse: ''
        }
      });
    };
    return <div className="activity-app">{tr(navigation)}{tr(notices)}<div className="context-tabs"><button className={view === 'dashboard' ? 'active' : ''} onClick={() => {
          setView('dashboard');
          setDraft(null);
        }}>{tr("Audit projects")}</button><button onClick={newProject} disabled={!risks.length}>{tr("New audit project")}</button></div>{tr(view === 'dashboard' ? <section className="panel workflow-panel"><div className="section-heading"><div><h2>{tr("Risk-based audit portfolio")}</h2><p>{tr("Plan procedures, document workpapers and issue reports against registered risks.")}</p></div><button className="primary" disabled={!risks.length} onClick={newProject}>{tr("Create audit project")}</button></div>{tr(table(['Project / scope', 'Registered risks', 'Owner', 'Status / action'], data.audit.map(p => <tr key={p.id}><td><b>{tr(p.title)}</b><small>{tr(p.scope)}</small></td><td>{tr(p.riskIds.map((id: string) => <small key={id}>{tr(riskName(id))}</small>))}</td><td>{tr(p.owner)}</td><td><span className="badge">{tr(p.status)}</span><button className="text-button" onClick={() => {
              setSelected(p.id);
              setDraft(structuredClone(p));
              setView('editor');
            }}>{tr("Open workspace")}</button></td></tr>)))}{tr(!data.audit.length && <p className="helper">{tr("Create a project or load connected examples.")}</p>)}</section> : draft && <section className="panel workflow-panel"><div className="section-heading"><div><span className="eyebrow">{tr("AUDIT WORKSPACE")}</span><h2>{tr(draft.title || 'New audit project')}</h2><p>{tr(project?.status === 'Reported' ? 'Issued report / retained evidence' : 'Save the program and workpapers before issuing the report.')}</p></div><span className="badge">{tr(project?.status || 'Planning')}</span></div><form onSubmit={async e => {
          e.preventDefault();
          const saved = await run(selected ? '/suite/audits/' + selected : '/suite/audits', draft, selected ? 'PUT' : 'POST');
          if (saved) {
            if (!selected) setSelected(saved.id);
            setMessage('Audit workspace saved.');
          }
        }}><fieldset disabled={busy || project?.status === 'Reported'} className="activity-fieldset"><div className="form-grid"><Field label={tr("Audit project title")} value={tr(draft.title)} onChange={v => setDraft({
                ...draft,
                title: v
              })} /><Field label={tr("Audit owner")} value={tr(draft.owner)} onChange={v => setDraft({
                ...draft,
                owner: v
              })} /><Field label={tr("Audit scope")} area value={tr(draft.scope)} onChange={v => setDraft({
                ...draft,
                scope: v
              })} /><div className="field"><span>{tr("Registered risks *")}</span>{tr(risks.map(r => <label className="audit-risk-choice" key={r.id}><input type="checkbox" checked={draft.riskIds.includes(r.id)} onChange={e => setDraft({
                    ...draft,
                    riskIds: e.target.checked ? [...draft.riskIds, r.id] : draft.riskIds.filter((id: string) => id !== r.id)
                  })} />{tr(r.title)}</label>))}</div></div><h3>{tr("Audit program & workpapers")}</h3>{tr(draft.program.map((p: any, i: number) => <div className="audit-workpaper" key={p.id}><h4>{tr("Workpaper ")}{tr(i + 1)}</h4><div className="form-grid">{tr([['procedure', 'Audit procedure'], ['evidence', 'Evidence reference'], ['result', 'Test result'], ['conclusion', 'Workpaper conclusion']].map(([key, label]) => <Field key={key} label={tr(label + ' / ' + (i + 1))} area required={key === 'procedure'} value={tr(p[key])} onChange={v => setDraft({
                  ...draft,
                  program: draft.program.map((x: any) => x.id === p.id ? {
                    ...x,
                    [key]: v
                  } : x)
                })} />))}</div></div>))}<button type="button" className="secondary" onClick={() => setDraft({
              ...draft,
              program: [...draft.program, {
                id: crypto.randomUUID(),
                procedure: '',
                evidence: '',
                result: '',
                conclusion: ''
              }]
            })}>{tr("Add audit procedure")}</button><h3>{tr("Reporting")}</h3><div className="form-grid">{tr([['summary', 'Report summary'], ['finding', 'Audit finding / objective impact'], ['recommendation', 'Recommendation'], ['managementResponse', 'Management response']].map(([key, label]) => <Field key={key} label={tr(label)} area required={false} value={tr(draft.report[key])} onChange={v => setDraft({
                ...draft,
                report: {
                  ...draft.report,
                  [key]: v
                }
              })} />))}</div><button className="primary" disabled={!draft.riskIds.length}>{tr("Save audit workspace")}</button></fieldset></form>{tr(selected && project?.status !== 'Reported' && <div className="button-row"><button className="secondary" disabled={busy} onClick={async () => {
            if (!(await run('/suite/audits/' + selected, draft, 'PUT'))) return;
            if (await run('/suite/audits/' + selected + '/report')) {
              setMessage('Report issued. Findings are connected to each linked risk in Risk Monitoring.');
              setView('dashboard');
              setDraft(null);
            }
          }}>{tr("Issue report to Risk Monitoring")}</button><p className="helper">{tr("Complete evidence, results, conclusions and report fields first. Issued reports are retained and locked.")}</p></div>)}{tr(project?.status === 'Reported' && <button className="primary" onClick={() => onNavigate('monitoring')}>{tr("View linked risk signals")}</button>)}</section>)}</div>;
  }
  const activeChecks = data.check.filter(c => c.enabled),
    anomalies = data.anomaly.filter(a => (!riskFilter || a.riskId === riskFilter) && (status === 'All' || a.status === status)),
    detail = data.anomaly.find(a => a.id === selected);
  return <div className="activity-app">{tr(navigation)}{tr(notices)}<div className="context-tabs">{tr([['dashboard', 'Dashboard'], ['risks', 'Monitored risks'], ['anomalies', 'Anomalies']].map(([key, label]) => <button key={key} className={view === key ? 'active' : ''} onClick={() => {
        setView(key);
        setSelected('');
      }}>{tr(label)}</button>))}</div><div className="assurance-run-banner"><div><b>{tr("Automated assurance")}</b><p>{tr("Enabled checks run every 60 seconds while the local API is running. Prototype checks evaluate clearly labelled synthetic datasets. Confirmation is a human decision.")}</p></div><button className="secondary" disabled={busy} onClick={async () => {
        const r = await run('/suite/checks/run');
        if (r) setMessage(`${r.inspected} records evaluated; ${r.added} new anomalies detected. Existing records are not duplicated.`);
      }}>{tr("Run checks now")}</button></div>{tr(view === 'dashboard' && <><div className="dash-metrics">{tr([['Enabled checks', activeChecks.length], ['Monitored risks', new Set(data.check.map(c => c.riskId)).size], ['Awaiting confirmation', data.anomaly.filter(a => a.status === 'Pending').length], ['Confirmed exceptions', data.anomaly.filter(a => a.status === 'Confirmed').length]].map(([label, count]) => <button className="dash-metric" key={label} onClick={() => setView(label === 'Enabled checks' || label === 'Monitored risks' ? 'risks' : 'anomalies')}><span>{tr(label)}</span><strong>{tr(count)}</strong></button>))}</div><section className="panel workflow-panel"><h2>{tr("Exceptions to investigate")}</h2><p className="helper">{tr("Detection is automated. Confirmed exceptions flow into the linked risk; false positives retain their rationale.")}</p>{tr(anomalyTable(data.anomaly.filter(a => a.status === 'Pending').slice(0, 5)))}</section></>)}{tr(view === 'risks' && <section className="panel workflow-panel"><h2>{tr("Risk-linked automated checks")}</h2>{tr(table(['Risk / check', 'Detection rule', 'Last run / dataset', 'Action'], data.check.map(c => <tr key={c.id}><td><b>{tr(riskName(c.riskId))}</b><small>{tr(c.name)}</small></td><td>{tr(c.metric)} {tr(c.direction === 'Above' ? '>' : '<')} {tr(c.threshold)}<small>{tr(c.cadence)}</small></td><td>{tr(c.lastRun ? new Date(c.lastRun).toLocaleString() : 'Awaiting run')}<small>{tr(c.dataset)}</small></td><td><span className="badge">{tr(c.enabled ? 'Enabled' : 'Paused')}</span><button className="text-button" disabled={busy} onClick={() => run('/suite/checks/' + c.id, {
            enabled: !c.enabled
          }, 'PUT')}>{tr(c.enabled ? 'Pause check' : 'Enable check')}</button><button className="text-button" onClick={() => {
            setRiskFilter(c.riskId);
            setView('anomalies');
          }}>{tr("View anomalies")}</button></td></tr>)))}{tr(!data.check.length && <p className="helper">{tr("Load connected examples, or configure a risk-linked check below.")}</p>)}<details className="history"><summary>{tr("Configure automated check")}</summary><CheckForm risks={risks} busy={busy} onSave={async body => {
          if (await run('/suite/checks', body)) setMessage('Automated check configured and linked to its registered risk.');
        }} /></details></section>)}{tr(view === 'anomalies' && <section className="panel workflow-panel"><div className="section-heading"><h2>{tr("Anomaly review")}</h2><div className="button-row"><label className="field"><span>{tr("Anomaly status")}</span><select value={status} onChange={e => setStatus(e.target.value)}>{tr(['All', 'Pending', 'Confirmed', 'False positive', 'Resolved'].map(s => <option key={s} value={s}>{tr(s)}</option>))}</select></label><label className="field"><span>{tr("Monitored risk")}</span><select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}><option value="">{tr("All risks")}</option>{tr(risks.map(r => <option key={r.id} value={r.id}>{tr(r.title)}</option>))}</select></label></div></div>{tr(anomalyTable(anomalies))}</section>)}{tr(detail && <section className="panel workflow-panel"><div className="section-heading"><div><span className="eyebrow">{tr("ANOMALY DETAIL / SYNTHETIC DATA")}</span><h2>{tr(detail.title)}</h2><p>{tr(riskName(detail.riskId))}</p></div><button className="text-button" onClick={() => setSelected('')}>{tr("Close detail")}</button></div><dl className="anomaly-facts"><div><dt>{tr("Observed value")}</dt><dd>{tr(detail.value)}{tr(" / ")}{tr(detail.metric)}</dd></div><div><dt>{tr("Exception rule")}</dt><dd>{tr(detail.direction === 'Above' ? '>' : '<')} {tr(detail.threshold)}</dd></div><div><dt>{tr("Detected")}</dt><dd>{tr(new Date(detail.detectedAt).toLocaleString())}</dd></div><div><dt>{tr("Status")}</dt><dd>{tr(detail.status)}</dd></div></dl>{tr(['Pending', 'Confirmed'].includes(detail.status) && <form onSubmit={async e => {
        e.preventDefault();
        if (await run('/suite/anomalies/' + detail.id + '/confirm', {
          decision: detail.status === 'Confirmed' ? 'Resolved' : decision,
          reason,
          reviewer
        })) {
          setReason('');
          setMessage('Confirmation saved. The linked risk signal and decision history are updated.');
        }
      }}><div className="form-grid"><label className="field"><span>{tr("Confirmation decision")}</span><select value={detail.status === 'Confirmed' ? 'Resolved' : decision} onChange={e => setDecision(e.target.value)}>{tr(detail.status === 'Confirmed' ? <option value={"Resolved"}>{tr("Resolved")}</option> : <><option value={"Confirmed"}>{tr("Confirmed")}</option><option value={"False positive"}>{tr("False positive")}</option></>)}</select></label><Field label={tr("Reviewer")} value={tr(reviewer)} onChange={setReviewer} /><Field label={tr("Confirmation rationale / evidence")} area value={tr(reason)} onChange={setReason} /></div><p className="helper">{tr("Confirm when the evidence supports the exception. For false positives, explain stale data, detection logic, or evidence outside the tested dataset. Resolution closes the signal without automatically changing the risk rating.")}</p><button className="primary" disabled={busy}>{tr("Save confirmation")}</button></form>)}<h3>{tr("Confirmation history")}</h3>{tr(detail.history.map((h: any, i: number) => <p className="helper" key={i}><b>{tr(h.decision)}</b>{tr(" / ")}{tr(h.reviewer)}{tr(" / ")}{tr(new Date(h.at).toLocaleString())}<br />{tr(h.reason)}</p>))}</section>)}</div>;
  function anomalyTable(rows: RecordData[]) {
    return table(['Anomaly / record', 'Registered risk', 'Value / threshold', 'Status', 'Review'], rows.map(a => <tr key={a.id}><td><b>{tr(a.title)}</b><small>{tr(a.metric)}{tr(" / Synthetic record")}</small></td><td>{tr(riskName(a.riskId))}</td><td>{tr(a.value)}{tr(" / ")}{tr(a.direction === 'Above' ? '>' : '<')} {tr(a.threshold)}</td><td><span className="badge">{tr(a.status)}</span></td><td><button className="text-button" onClick={() => {
          setSelected(a.id);
          setReason('');
          setDecision('Confirmed');
        }}>{tr("View anomaly")}</button></td></tr>));
  }
}
function Field({
  label,
  value,
  onChange,
  area = false,
  type = 'text',
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  area?: boolean;
  type?: string;
  required?: boolean;
}) {
  return <label className="field"><span>{tr(label)}{tr(required ? ' *' : '')}</span>{tr(area ? <textarea required={required} maxLength={3000} value={tr(value)} onChange={e => onChange(e.target.value)} /> : <input required={required} maxLength={3000} type={type} value={tr(value)} onChange={e => onChange(e.target.value)} />)}</label>;
}
function RiskSelect({
  risks,
  value,
  onChange
}: {
  risks: Risk[];
  value: string;
  onChange: (value: string) => void;
}) {
  return <label className="field"><span>{tr("Registered risk *")}</span><select required value={value} onChange={e => onChange(e.target.value)}><option value="">{tr("Choose a risk")}</option>{tr(risks.map(r => <option key={r.id} value={r.id}>{tr(r.title)}</option>))}</select></label>;
}
function CheckForm({
  risks,
  busy,
  onSave
}: {
  risks: Risk[];
  busy: boolean;
  onSave: (body: unknown) => Promise<void>;
}) {
  const [name, setName] = useState(''),
    [riskId, setRisk] = useState(risks[0]?.id || ''),
    [metric, setMetric] = useState(''),
    [threshold, setThreshold] = useState(10),
    [direction, setDirection] = useState('Above'),
    [dataset, setDataset] = useState('[{"id":"demo-1","label":"Synthetic record","value":15}]'),
    [error, setError] = useState('');
  return <form className="workflow-form" onSubmit={async e => {
    e.preventDefault();
    try {
      const records = JSON.parse(dataset);
      setError('');
      await onSave({
        name,
        riskId,
        metric,
        threshold,
        direction,
        records,
        enabled: true
      });
    } catch {
      setError('Enter a valid JSON array of id, label and numeric value records.');
    }
  }}><p className="helper">{tr("Prototype data adapter: use a synthetic numeric dataset to demonstrate automated threshold detection. This does not query the CMCA production database.")}</p><div className="form-grid"><Field label={tr("Check name")} value={tr(name)} onChange={setName} /><RiskSelect risks={risks} value={riskId} onChange={setRisk} /><Field label={tr("Metric")} value={tr(metric)} onChange={setMetric} /><label className="field"><span>{tr("Exception threshold *")}</span><input type="number" required value={tr(threshold)} onChange={e => setThreshold(Number(e.target.value))} /></label><label className="field"><span>{tr("Exception direction")}</span><select value={direction} onChange={e => setDirection(e.target.value)}><option value={"Above"}>{tr("Above")}</option><option value={"Below"}>{tr("Below")}</option></select></label><Field label={tr("Synthetic dataset (JSON)")} area value={tr(dataset)} onChange={setDataset} /></div>{tr(error && <p className="error">{tr(error)}</p>)}<button className="primary" disabled={busy || !risks.length}>{tr("Create automated check")}</button></form>;
}
