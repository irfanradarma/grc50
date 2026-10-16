import { tr } from "./i18n";
export type Mitigation = {
  id: string;
  title: string;
  details: string;
  owner: string;
  deadline: string;
  status: 'Done' | 'Not done';
  completionNotes: string;
  likelihoodReduction?: number;
  impactReduction?: number;
};
type Risk = {
  id?: string;
  title: string;
  objective: string;
  response?: string;
  mitigations?: Mitigation[];
};
export function MitigationEditor({
  plans,
  owner,
  onChange,
  onSave,
  busy = false
}: {
  plans: Mitigation[];
  owner: string;
  onChange: (p: Mitigation[]) => void;
  onSave?: (p: Mitigation) => Promise<void>;
  busy?: boolean;
}) {
  const update = (id: string, patch: Partial<Mitigation>) => onChange(plans.map(p => p.id === id ? {
    ...p,
    ...patch
  } : p));
  return <section className="field full"><div className="section-heading"><div><h3>{tr("Mitigation plans")}</h3><p>{tr("Track each action separately with its owner and deadline.")}</p></div><button type="button" className="secondary" onClick={() => onChange([...plans, {
        id: crypto.randomUUID(),
        title: '',
        details: '',
        owner,
        deadline: '',
        status: 'Not done',
        completionNotes: ''
      }])}>{tr("Add mitigation plan")}</button></div>{tr(plans.map((p, i) => <fieldset key={p.id} className="workflow-form"><legend>{tr("Mitigation ")}{tr(i + 1)}</legend><div className="form-grid"><label className="field full">{tr("Mitigation action *")}<input required value={tr(p.title)} onChange={e => update(p.id, {
            title: e.target.value
          })} /></label><label className="field full">{tr("Plan details")}<textarea value={tr(p.details)} onChange={e => update(p.id, {
            details: e.target.value
          })} /></label><label className="field">{tr("Action owner *")}<input required value={tr(p.owner)} onChange={e => update(p.id, {
            owner: e.target.value
          })} /></label><label className="field">{tr("Deadline *")}<input required type="text" placeholder={tr("YYYY-MM-DD")} pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" maxLength={10} value={tr(p.deadline)} onChange={e => update(p.id, {
            deadline: e.target.value
          })} /></label><label className="field">{tr("Completion status")}<select value={p.status} onChange={e => update(p.id, {
            status: e.target.value as Mitigation['status']
          })}><option value={"Not done"}>{tr("Not done")}</option><option value={"Done"}>{tr("Done")}</option></select></label><label className="field">{tr("Projected likelihood reduction")}<input type="number" min="0" max="4" step="0.5" value={tr(p.likelihoodReduction || 0)} onChange={e => update(p.id, {
            likelihoodReduction: Number(e.target.value)
          })} /></label><label className="field">{tr("Projected impact reduction")}<input type="number" min="0" max="4" step="0.5" value={tr(p.impactReduction || 0)} onChange={e => update(p.id, {
            impactReduction: Number(e.target.value)
          })} /></label><label className="field full">{tr("Completion notes / evidence")}<textarea value={tr(p.completionNotes)} onChange={e => update(p.id, {
            completionNotes: e.target.value
          })} /></label></div><div className="button-row">{tr(onSave && <button type="button" className="primary" disabled={busy} onClick={() => onSave(p)}>{tr("Save mitigation plan")}</button>)}<button type="button" className="text-button" disabled={busy} onClick={() => onChange(plans.filter(v => v.id !== p.id))}>{tr("Remove mitigation")}</button></div></fieldset>))}</section>;
}
