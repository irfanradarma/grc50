import { tr } from "./i18n";
import { useEffect, useState } from 'react';
import { api } from './api';
import type { Department } from './Settings';
export type Objective = {
  id?: string;
  year: number;
  title: string;
  metric: string;
  target: string;
  owner: string;
  departmentId?: string;
};
type KPI = {
  id?: string;
  objectiveId: string;
  departmentId: string;
  name: string;
  definition: string;
  target: string;
  unit: string;
  frequency: string;
  owner: string;
};
export default function Objectives({
  objectives,
  selectedId,
  onObjectives,
  onSelect,
  onRisks,
  onSettings
}: {
  objectives: Objective[];
  selectedId: string;
  onObjectives: (o: Objective[]) => void;
  onSelect: (id: string) => void;
  onRisks: () => void;
  onSettings: () => void;
}) {
  const [year, setYear] = useState(objectives.find(o => o.id === selectedId)?.year || new Date().getFullYear()),
    [draft, setDraft] = useState<Objective | null>(null),
    [kpiDraft, setKpiDraft] = useState<KPI | null>(null),
    [departments, setDepartments] = useState<Department[]>([]),
    [kpis, setKpis] = useState<KPI[]>([]),
    [expanded, setExpanded] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function load() {
    try {
      const [d, k] = await Promise.all([api<Department[]>('/departments'), api<KPI[]>('/objective-kpis')]);
      setDepartments(d);
      setKpis(k);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load KPI assignments.');
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save.');
    } finally {
      setBusy(false);
    }
  }
  function newKpi(o: Objective) {
    setExpanded(o.id!);
    setKpiDraft({
      objectiveId: o.id!,
      departmentId: o.departmentId || departments[0]?.id || '',
      name: kpis.some(k => k.objectiveId === o.id) ? '' : o.metric,
      definition: '',
      target: o.target,
      unit: '%',
      frequency: 'Monthly',
      owner: o.owner
    });
  }
  const inYear = objectives.filter(o => o.year === year),
    years = [...new Set([2025, 2026, 2027, 2028, year, ...objectives.map(o => o.year)])].sort((a, b) => b - a);
  return <>{tr(error && <div className="error" role="alert">{tr(error)}</div>)}{tr(message && <div className="workflow-success" role="status">{tr(message)}</div>)}<div className="annual-toolbar"><div><h2>{tr("Annual objectives & departmental KPIs")}</h2><p>{tr("One objective can have multiple measures, targets and responsible departments.")}</p></div><div className="annual-controls"><label className="year-selector">{tr("Planning year")}<select aria-label={tr("Planning year")} value={year} onChange={e => {
            setYear(Number(e.target.value));
            setDraft(null);
            setKpiDraft(null);
          }}>{tr(years.map(y => <option key={y} value={y}>{tr(y)}</option>))}</select></label><button className="secondary" disabled={busy} onClick={() => run(async () => {
          setDraft(await api<Objective>('/generate/objective', {
            method: 'POST',
            body: JSON.stringify({
              year
            })
          }));
          setMessage('Sample objective loaded. Review the outcome, then define its KPIs after saving.');
        })}>{tr("Generate sample objective")}</button><button className="primary" disabled={busy} onClick={() => setDraft({
          year,
          title: '',
          metric: '',
          target: '',
          owner: '',
          departmentId: undefined
        })}>{tr("Add objective")}</button></div></div>{tr(!departments.length && <div className="department-setup-prompt"><p>{tr("Create your organization departments in Settings before assigning KPIs.")}</p><button className="secondary" onClick={onSettings}>{tr("Set up departments")}</button></div>)}{tr(draft && <form className="panel objective-editor" onSubmit={e => {
      e.preventDefault();
      run(async () => {
        const saved = await api<Objective>('/objectives' + (draft.id ? '/' + draft.id : ''), {
          method: draft.id ? 'PUT' : 'POST',
          body: JSON.stringify(draft)
        });
        onObjectives(draft.id ? objectives.map(o => o.id === draft.id ? saved : o) : [...objectives, saved]);
        onSelect(saved.id!);
        setExpanded(saved.id!);
        setDraft(null);
        setMessage('Objective saved. Add one or more KPIs with departmental responsibility.');
      });
    }}><h2>{tr(draft.id ? 'Edit objective' : 'New objective')}{tr(" / ")}{tr(year)}</h2><div className="form-grid"><Field label={tr("Objective")} value={tr(draft.title)} onChange={v => setDraft({
          ...draft,
          title: v
        })} /><Field label={tr("Annual outcome / commitment")} value={tr(draft.target)} onChange={v => setDraft({
          ...draft,
          target: v
        })} /><Field label={tr("Accountable owner")} value={tr(draft.owner)} onChange={v => setDraft({
          ...draft,
          owner: v
        })} /><label className="field"><span>{tr("Accountable department")}</span><select value={draft.departmentId || ''} onChange={e => setDraft({
            ...draft,
            departmentId: e.target.value || undefined
          })}><option value="">{tr("Not assigned")}</option>{tr(departments.map(d => <option key={d.id} value={d.id}>{tr(d.name)}</option>))}</select></label></div><div className="button-row"><button className="primary" disabled={busy}>{tr("Save objective")}</button><button type="button" className="secondary" onClick={() => setDraft(null)}>{tr("Cancel objective")}</button></div></form>)}{tr(kpiDraft && <form className="panel objective-editor" onSubmit={e => {
      e.preventDefault();
      run(async () => {
        await api('/objective-kpis' + (kpiDraft.id ? '/' + kpiDraft.id : ''), {
          method: kpiDraft.id ? 'PUT' : 'POST',
          body: JSON.stringify(kpiDraft)
        });
        await load();
        setKpiDraft(null);
        setMessage('KPI saved with its objective and responsible department.');
      });
    }}><div className="section-heading"><div><h2>{tr(kpiDraft.id ? 'Edit KPI' : 'New KPI')}</h2><p>{tr(objectives.find(o => o.id === kpiDraft.objectiveId)?.title)}</p></div><span className="badge">{tr("Objective-linked performance measure")}</span></div><div className="form-grid"><Field label={tr("KPI name")} value={tr(kpiDraft.name)} onChange={v => setKpiDraft({
          ...kpiDraft,
          name: v
        })} /><Field label={tr("KPI definition / calculation")} value={tr(kpiDraft.definition)} onChange={v => setKpiDraft({
          ...kpiDraft,
          definition: v
        })} /><Field label={tr("KPI target")} value={tr(kpiDraft.target)} onChange={v => setKpiDraft({
          ...kpiDraft,
          target: v
        })} /><Field label={tr("Unit")} required={false} value={tr(kpiDraft.unit)} onChange={v => setKpiDraft({
          ...kpiDraft,
          unit: v
        })} /><label className="field"><span>{tr("Responsible department *")}</span><select required value={kpiDraft.departmentId} onChange={e => setKpiDraft({
            ...kpiDraft,
            departmentId: e.target.value
          })}><option value="">{tr("Choose a department")}</option>{tr(departments.map(d => <option key={d.id} value={d.id}>{tr(d.name)}</option>))}</select></label><Field label={tr("KPI owner")} value={tr(kpiDraft.owner)} onChange={v => setKpiDraft({
          ...kpiDraft,
          owner: v
        })} /><label className="field"><span>{tr("Measurement frequency")}</span><select value={kpiDraft.frequency} onChange={e => setKpiDraft({
            ...kpiDraft,
            frequency: e.target.value
          })}>{tr(['Weekly', 'Monthly', 'Quarterly', 'Annually'].map(f => <option key={f} value={f}>{tr(f)}</option>))}</select></label></div><div className="button-row"><button className="primary" disabled={busy || !departments.length}>{tr("Save KPI")}</button><button type="button" className="secondary" onClick={() => setKpiDraft(null)}>{tr("Cancel KPI")}</button></div></form>)}<section className="panel annual-list"><div className="section-heading"><div><h2>{tr(`${year} objectives`)}</h2><p>{tr("Select an objective for risk creation, then manage its performance measures.")}</p></div><span className="badge">{tr(inYear.length)}{tr(" objectives")}</span></div>{tr(inYear.map(o => {
        const measures = kpis.filter(k => k.objectiveId === o.id);
        return <div className="objective-with-kpis" key={o.id}><button className={`objective-accordion-toggle ${expanded === o.id ? 'open' : ''}`} aria-expanded={expanded === o.id} onClick={() => {
            onSelect(o.id!);
            setExpanded(expanded === o.id ? '' : o.id!);
          }}><h3>{tr(o.title)}</h3><span className="badge">{tr(measures.length)}{tr(" KPI")}{tr(measures.length === 1 ? '' : 's')}</span><span aria-hidden="true" className="accordion-chevron">{tr(expanded === o.id ? '\u2212' : '+')}</span></button>{tr(expanded === o.id && <div className="objective-kpi-list"><div className="objective-detail-summary"><div><p><b>{tr("Annual commitment:")}</b> {tr(o.target)}</p><p>{tr(o.owner)}{tr(" / ")}{tr(departments.find(d => d.id === o.departmentId)?.name || 'Department not assigned')}</p></div><div className="button-row"><button className="secondary" disabled={busy} onClick={() => setDraft({
                  ...o
                })}>{tr("Edit objective")}</button><button className="primary" disabled={busy || !departments.length} onClick={() => newKpi(o)}>{tr("Add KPI")}</button></div></div>{tr(!measures.length ? <p className="helper">{tr("No KPIs yet.")}{tr(o.metric ? ' Existing measure retained: ' + o.metric + '.' : '')}{tr(" Add a KPI and assign its department.")}</p> : <div className="trigger-table-scroll"><table className="trigger-table" aria-label={tr('KPIs for ' + o.title)}><thead><tr><th>{tr("KPI / definition")}</th><th>{tr("Target")}</th><th>{tr("Responsible department")}</th><th>{tr("Owner / frequency")}</th><th>{tr("Action")}</th></tr></thead><tbody>{tr(measures.map(k => <tr key={k.id}><td><b>{tr(k.name)}</b><small>{tr(k.definition)}</small></td><td>{tr(k.target)}<small>{tr(k.unit)}</small></td><td>{tr(departments.find(d => d.id === k.departmentId)?.name || 'Department unavailable')}</td><td>{tr(k.owner)}<small>{tr(k.frequency)}</small></td><td><button className="text-button" onClick={() => setKpiDraft({
                        ...k
                      })}>{tr("Edit KPI")}</button></td></tr>))}</tbody></table></div>)}</div>)}</div>;
      }))}{tr(!inYear.length && <p className="helper">{tr("No objectives for this year. Add an objective or generate a sample draft.")}</p>)}</section>{tr(inYear.length > 0 && <div className="annual-next"><span>{tr("Risk creation uses the selected objective and its planning year.")}</span><button className="primary" onClick={onRisks}>{tr("Open Risk Register")}</button></div>)}</>;
}
function Field({
  label,
  value,
  onChange,
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return <label className="field"><span>{tr(label)}{tr(required ? ' *' : '')}</span><input required={required} value={tr(value)} maxLength={3000} onChange={e => onChange(e.target.value)} /></label>;
}
