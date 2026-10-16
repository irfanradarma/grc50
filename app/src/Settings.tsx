import { tr } from "./i18n";
import { useEffect, useState } from 'react';
import { api } from './api';
export type Department = {
  id: string;
  name: string;
  code: string;
  head: string;
  parentId?: string;
};
export type CompanyProfile = {
  name: string;
  sector: string;
  description: string;
  stakeholders: string;
  dependencies: string;
  appetite: string;
};
export default function Settings({
  profile,
  onProfile,
  onObjectives
}: {
  profile: CompanyProfile;
  onProfile: (p: CompanyProfile) => void;
  onObjectives: () => void;
}) {
  const [tab, setTab] = useState('profile'),
    [form, setForm] = useState(profile),
    [departments, setDepartments] = useState<Department[]>([]),
    [draft, setDraft] = useState<Partial<Department> | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function load() {
    try {
      setDepartments(await api<Department[]>('/departments'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load organization structure.');
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
  return <><div className="settings-admin-note"><b>{tr("Workspace administration")}</b><span>{tr("The private guest workspace owner manages company profile and organization structure.")}</span></div><div className="context-tabs"><button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>{tr("Company profile")}</button><button className={tab === 'departments' ? 'active' : ''} onClick={() => setTab('departments')}>{tr("Organization structure")}</button></div>{tr(error && <div className="error" role="alert">{tr(error)}</div>)}{tr(message && <div className="workflow-success" role="status">{tr(message)}</div>)}{tr(tab === 'profile' ? <form className="panel workflow-panel" onSubmit={e => {
      e.preventDefault();
      run(async () => {
        const p = await api<CompanyProfile>('/profile', {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        onProfile(p);
        setMessage('Company profile saved. Objectives and KPIs remain separate.');
      });
    }}><div className="section-heading"><div><h2>{tr("Company profile")}</h2><p>{tr("Maintain the enduring mandate, stakeholders, dependencies and risk boundaries.")}</p></div><span className="badge green">{tr("Admin settings")}</span></div><div className="form-grid">{tr([['name', 'Company / organization name'], ['sector', 'Sector'], ['description', 'Purpose & operating environment'], ['stakeholders', 'Key stakeholders'], ['dependencies', 'Critical dependencies'], ['appetite', 'Risk appetite & boundaries']].map(([key, label]) => <label className={`field ${['description', 'appetite'].includes(key) ? 'full' : ''}`} key={key}><span>{tr(label)}{tr(['name', 'sector'].includes(key) ? ' *' : '')}</span>{tr(['description', 'appetite'].includes(key) ? <textarea maxLength={3000} value={tr(form[key as keyof CompanyProfile])} onChange={e => setForm({
            ...form,
            [key]: e.target.value
          })} /> : <input required={['name', 'sector'].includes(key)} maxLength={3000} value={tr(form[key as keyof CompanyProfile])} onChange={e => setForm({
            ...form,
            [key]: e.target.value
          })} />)}</label>))}</div><div className="button-row"><button className="secondary" type="button" disabled={busy} onClick={() => run(async () => {
          setForm(await api<CompanyProfile>('/generate/context', {
            method: 'POST'
          }));
          setMessage('Sample profile loaded for review; save explicitly to apply.');
        })}>{tr("Generate sample profile")}</button><button className="primary" disabled={busy}>{tr("Save company profile")}</button><button className="text-button" type="button" onClick={onObjectives}>{tr("Open Objectives")}</button></div></form> : <section className="panel workflow-panel"><div className="section-heading"><div><h2>{tr("Departments & reporting structure")}</h2><p>{tr("Create departments before assigning objective KPIs. Names can change without losing existing assignments.")}</p></div><button className="primary" disabled={busy} onClick={() => setDraft({
          name: '',
          code: '',
          head: '',
          parentId: undefined
        })}>{tr("Add department")}</button></div>{tr(draft && <form className="workflow-form" onSubmit={e => {
        e.preventDefault();
        run(async () => {
          await api('/departments' + (draft.id ? '/' + draft.id : ''), {
            method: draft.id ? 'PUT' : 'POST',
            body: JSON.stringify(draft)
          });
          setDraft(null);
          await load();
          setMessage('Department saved. It is available for objective and KPI assignment.');
        });
      }}><h3>{tr(draft.id ? 'Edit department' : 'New department')}</h3><div className="form-grid"><label className="field"><span>{tr("Department name *")}</span><input required maxLength={3000} value={tr(draft.name || '')} onChange={e => setDraft({
              ...draft,
              name: e.target.value
            })} /></label><label className="field"><span>{tr("Department code")}</span><input maxLength={50} value={tr(draft.code || '')} onChange={e => setDraft({
              ...draft,
              code: e.target.value
            })} /></label><label className="field"><span>{tr("Department head")}</span><input maxLength={3000} value={tr(draft.head || '')} onChange={e => setDraft({
              ...draft,
              head: e.target.value
            })} /></label><label className="field"><span>{tr("Reports to department")}</span><select value={draft.parentId || ''} onChange={e => setDraft({
              ...draft,
              parentId: e.target.value || undefined
            })}><option value="">{tr("Top-level department")}</option>{tr(departments.filter(d => d.id !== draft.id).map(d => <option key={d.id} value={d.id}>{tr(d.name)}</option>))}</select></label></div><div className="button-row"><button className="primary" disabled={busy}>{tr("Save department")}</button><button className="secondary" type="button" onClick={() => setDraft(null)}>{tr("Cancel department")}</button></div></form>)}<div className="trigger-table-scroll"><table className="trigger-table"><thead><tr><th>{tr("Department")}</th><th>{tr("Head")}</th><th>{tr("Reports to")}</th><th>{tr("Action")}</th></tr></thead><tbody>{tr(departments.map(d => <tr key={d.id}><td><b>{tr(d.name)}</b><small>{tr(d.code || 'No code assigned')}</small></td><td>{tr(d.head || 'Not assigned')}</td><td>{tr(departments.find(parent => parent.id === d.parentId)?.name || 'Organization leadership')}</td><td><button className="text-button" onClick={() => setDraft({
                  ...d
                })}>{tr("Edit department")}</button></td></tr>))}</tbody></table></div>{tr(!departments.length && <p className="helper">{tr("No departments yet. Add the departments that exist in your organization.")}</p>)}</section>)}</>;
}
