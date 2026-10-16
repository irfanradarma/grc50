import { tr } from "./i18n";
import { Fragment as ReactFragment, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Activity, Target, ShieldCheck, Radio, RefreshCw, LoaderCircle, Inbox } from 'lucide-react';
import { api } from './api';
import { visibleInMonitoring, newsState } from '../shared/newsReview';
import type { Objective } from './Objectives';
import type { Risk, Workflow } from './Workflow';
export default function Dashboard({
  organization,
  objectives,
  risks,
  onNavigate,
  onEdit
}: {
  organization: string;
  objectives: Objective[];
  risks: Risk[];
  onNavigate: (page: string) => void;
  onEdit: (id: string) => void;
}) {
  const [data, setData] = useState<Workflow | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [updated, setUpdated] = useState(''),
    [year, setYear] = useState(''),
    [goal, setGoal] = useState(''),
    [heatCell, setHeatCell] = useState<{
      likelihood: number;
      impact: number;
    } | null>(null);
  async function load() {
    setLoading(true);
    setError('');
    try {
      setData(await api<Workflow>('/workflow'));
      setUpdated(new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const goals = objectives.filter(o => (!year || String(o.year) === year) && (!goal || o.id === goal)),
    ids = new Set(goals.map(o => o.id));
  const scoped = risks.filter(r => ids.has(r.objectiveId)),
    riskIds = new Set(scoped.map(r => r.id)),
    kris = data?.kris.filter(k => riskIds.has(k.riskId)) || [];
  const latest = useMemo(() => {
    const map = new Map<string, Workflow['readings'][number]>();
    for (const r of data?.readings || []) {
      const previous = map.get(r.kriId);
      if (!previous || r.observedAt > previous.observedAt || r.observedAt === previous.observedAt && (r.createdAt || '') > (previous.createdAt || '')) map.set(r.kriId, r);
    }
    return map;
  }, [data]);
  const breaches = kris.filter(k => ['Warning', 'Critical'].includes(latest.get(k.id)?.status || '')),
    critical = breaches.filter(k => latest.get(k.id)?.status === 'Critical');
  const signals = data?.signals.filter(s => ids.has(s.objectiveId) && visibleInMonitoring(s) && s.status === 'Open') || [];
  const news = data?.signals.filter(s => ids.has(s.objectiveId) && s.kind === 'news') || [],
    pendingNews = news.filter(n => newsState(n) === 'Pending');
  const priority = scoped.map(r => {
    const alerts = signals.filter(s => s.riskId === r.id),
      indicators = breaches.filter(k => k.riskId === r.id);
    return {
      risk: r,
      alerts,
      indicators,
      score: alerts.length * 10 + indicators.length * 10 + r.likelihood * r.impactScore
    };
  }).sort((a, b) => b.alerts.length - a.alerts.length || b.indicators.length - a.indicators.length || b.risk.likelihood * b.risk.impactScore - a.risk.likelihood * a.risk.impactScore).slice(0, 5);
  const levels = [{
    name: 'High',
    color: '#c77965',
    count: scoped.filter(r => r.likelihood * r.impactScore >= 15).length
  }, {
    name: 'Moderate',
    color: '#e1ad45',
    count: scoped.filter(r => r.likelihood * r.impactScore >= 6 && r.likelihood * r.impactScore < 15).length
  }, {
    name: 'Low',
    color: '#559d83',
    count: scoped.filter(r => r.likelihood * r.impactScore < 6).length
  }];
  const reviews = data?.reviews.filter(r => riskIds.has(r.riskId)).sort((a, b) => (b.reviewedAt || '').localeCompare(a.reviewedAt || '')).slice(0, 3) || [];
  const unlinked = signals.filter(s => !s.riskId),
    coverage = scoped.filter(r => kris.some(k => k.riskId === r.id)).length;
  const metric = (label: string, value: number, detail: string, Icon: typeof Target, page: string) => <button className="dash-metric" onClick={() => onNavigate(page)}><span><Icon size={19} />{tr(label)}<ArrowRight size={15} /></span><strong>{tr(value)}</strong><small>{tr(detail)}</small></button>;
  return <div className="dashboard"><div className="dash-tools"><div><b>{tr(organization)}</b><span>{tr(updated ? 'Updated ' + updated : 'Workspace overview')}</span></div><label className="field"><span>{tr("Planning year")}</span><select value={year} onChange={e => {
          setYear(e.target.value);
          setGoal('');
        }}><option value="">{tr("All years")}</option>{tr([...new Set(objectives.map(o => o.year))].sort((a, b) => b - a).map(y => <option key={y} value={y}>{tr(y)}</option>))}</select></label><label className="field"><span>{tr("Dashboard objective")}</span><select value={goal} onChange={e => setGoal(e.target.value)}><option value="">{tr("All objectives")}</option>{tr(objectives.filter(o => !year || String(o.year) === year).map(o => <option key={o.id} value={o.id}>{tr(o.title)}</option>))}</select></label><button className="secondary" disabled={loading} onClick={load}><RefreshCw size={16} className={loading ? 'spin' : ''} />{tr("Refresh")}</button></div>
 {tr(error && <div className="error" role="alert">{tr(error)} <button className="text-button" onClick={load}>{tr("Try again")}</button></div>)}
 {tr(loading && !data ? <div className="panel dash-loading" role="status"><LoaderCircle className="spin" />{tr("Loading your workspace overview...")}</div> : data && <>
 <div className="dash-metrics">{tr(metric('Annual objectives', goals.length, 'Targets and accountable owners', Target, 'objectives'))}{tr(metric('Registered risks', scoped.length, 'Linked to selected objectives', ShieldCheck, 'risks'))}{tr(metric('Open signals', signals.length, 'Captured or internal; awaiting review', Radio, 'monitoring'))}{tr(metric('KRIs in breach', breaches.length, critical.length + ' critical; latest observations only', Activity, 'monitoring'))}</div>
 <section className="panel risk-heatmap"><div className="section-heading"><div><h2>{tr("Risk heat map")}</h2><p>{tr("Likelihood x impact for the selected objectives. Select a cell to inspect its risks.")}</p></div><span className="badge">{tr(scoped.length)}{tr(" registered risks")}</span></div><div className="heatmap-layout"><div><div className="heatmap-axis">{tr("Likelihood (1-5)")}</div><div className="heatmap-grid">{tr([5, 4, 3, 2, 1].map(l => <ReactFragment key={l}><span className="heatmap-tick">{tr(l)}</span>{tr([1, 2, 3, 4, 5].map(i => {
                  const count = scoped.filter(r => r.likelihood === l && r.impactScore === i).length;
                  return <button key={i} className={`heatmap-cell ${l * i >= 15 ? 'high' : l * i >= 6 ? 'moderate' : 'low'} ${heatCell?.likelihood === l && heatCell.impact === i ? 'selected' : ''}`} aria-label={tr(`Likelihood ${l}, impact ${i}: ${count} risks`)} aria-pressed={heatCell?.likelihood === l && heatCell.impact === i} onClick={() => setHeatCell({
                    likelihood: l,
                    impact: i
                  })}><strong>{tr(count || '0')}</strong><small>{tr("Rating ")}{tr(l * i)}</small></button>;
                }))}</ReactFragment>))}<span />{tr([1, 2, 3, 4, 5].map(i => <span className="heatmap-tick" key={i}>{tr(i)}</span>))}</div><div className="heatmap-axis impact-axis">{tr("Impact (1-5)")}</div></div><div className="heatmap-risk-list"><h3>{tr(heatCell ? `Likelihood ${heatCell.likelihood} / impact ${heatCell.impact}` : 'Select a heat-map cell')}</h3><p className="helper">{tr("Current register ratings; a signal prompts review rather than changing the rating automatically.")}</p>{tr(heatCell && scoped.filter(r => r.likelihood === heatCell.likelihood && r.impactScore === heatCell.impact).map(r => <button className="heatmap-risk" key={r.id} onClick={() => onEdit(r.id!)}><b>{tr(r.title)}</b><small>{tr(r.owner)}</small></button>))}{tr(heatCell && !scoped.some(r => r.likelihood === heatCell.likelihood && r.impactScore === heatCell.impact) && <p className="helper">{tr("No risks in this cell.")}</p>)}<div className="heatmap-legend"><span>{tr("Low <6")}</span><span>{tr("Moderate 6-14")}</span><span>{tr("High 15+")}</span></div></div></div></section>

 {tr(!objectives.length ? <section className="panel dash-empty"><Target size={35} /><h2>{tr("Start with an annual objective.")}</h2><p>{tr("Define a target to connect your risks, indicators, and evidence.")}</p><button className="primary" onClick={() => onNavigate('objectives')}>{tr("Set organization objectives")}<ArrowRight size={16} /></button></section> : <>
 <div className="dash-grid"><section className="panel dash-objectives"><div className="section-heading"><div><h2>{tr("Objectives & exposure")}</h2><p>{tr("Target context and signals; not a measure of target completion.")}</p></div><button className="text-button" onClick={() => onNavigate('objectives')}>{tr("View objectives")}<ArrowRight size={15} /></button></div>{tr(goals.map(o => {
              const linked = scoped.filter(r => r.objectiveId === o.id),
                open = signals.filter(s => s.objectiveId === o.id),
                breach = breaches.filter(k => linked.some(r => r.id === k.riskId));
              return <div className="dash-objective" key={o.id}><div className="dash-objective-heading"><span>{tr(o.year)}</span><b>{tr(o.title)}</b><span className={`badge ${open.length || breach.length ? 'moderate' : 'green'}`}>{tr(open.length || breach.length ? 'Review needed' : 'No open signals')}</span></div><p>{tr(o.target)}</p><small>{tr(o.owner)}</small><div className="dash-objective-counts"><span><b>{tr(linked.length)}</b>{tr(" risks")}</span><span><b>{tr(open.length)}</b>{tr(" open signals")}</span><span><b>{tr(breach.length)}</b>{tr(" KRI breaches")}</span></div></div>;
            }))}</section>
 <aside className="dash-side"><section className="panel"><div className="section-heading"><div><h2>{tr("Register exposure")}</h2><p>{tr("Current likelihood x impact ratings")}</p></div></div><div className="dash-distribution" aria-label={tr("Risk rating distribution")}>{tr(levels.filter(l => l.count).map(l => <div key={l.name} style={{
                  flex: l.count,
                  background: l.color
                }} title={tr(l.name + ': ' + l.count + ' risks')} />))}</div>{tr(levels.map(l => <div className="dash-legend" key={l.name}><span style={{
                  background: l.color
                }} />{tr(l.name)}<b>{tr(l.count)}</b></div>))}<p className="helper">{tr("Prototype matrix: high 15+, moderate 6-14, low below 6.")}</p></section>
 <section className="panel dash-inbox"><div className="dash-inbox-icon"><Inbox size={23} /></div><h2>{tr("News awaiting review")}</h2><strong>{tr(pendingNews.length)}</strong><p>{tr("Collected articles stay outside monitoring until captured.")}</p><div className="dash-news-counts"><span>{tr(news.filter(n => newsState(n) === 'Captured').length)}{tr(" captured")}</span><span>{tr(news.filter(n => newsState(n) === 'Neglected').length)}{tr(" neglected")}</span></div><button className="primary" onClick={() => onNavigate('triggers')}>{tr("Open review inbox")}<ArrowRight size={16} /></button></section></aside></div>
 <section className="panel dash-priority"><div className="section-heading"><div><h2>{tr("Risks to look at next")}</h2><p>{tr("Ordered by open signals, KRI breaches, then register rating.")}</p></div><button className="text-button" onClick={() => onNavigate('monitoring')}>{tr("Open Risk Monitoring")}<ArrowRight size={16} /></button></div>{tr(!priority.length ? <p className="helper">{tr("No risks yet. Create a linked risk in the Risk Register.")}</p> : <div className="table-wrap"><table><thead><tr><th>{tr("Risk / objective")}</th><th>{tr("Rating")}</th><th>{tr("Open signals")}</th><th>{tr("Latest KRI breaches")}</th><th /></tr></thead><tbody>{tr(priority.map(({
                  risk: r,
                  alerts,
                  indicators
                }) => <tr key={r.id}><td><b>{tr(r.title)}</b><small>{tr(goals.find(o => o.id === r.objectiveId)?.title)}</small></td><td><span className={`badge ${r.likelihood * r.impactScore >= 15 ? 'high' : r.likelihood * r.impactScore >= 6 ? 'moderate' : 'green'}`}>{tr(r.likelihood * r.impactScore)}</span></td><td><b>{tr(alerts.length)}</b>{tr(alerts[0] && <small>{tr(alerts[0].title)}</small>)}</td><td>{tr(indicators.length ? indicators.map(k => <span className="dash-kri" key={k.id}><b>{tr(k.name)}</b><span className={`badge ${latest.get(k.id)?.status === 'Critical' ? 'high' : 'moderate'}`}>{tr(latest.get(k.id)?.value)} {tr(k.unit)}{tr(" / ")}{tr(latest.get(k.id)?.status)}</span><small>{tr(latest.get(k.id)?.observedAt)}</small></span>) : <small>{tr(kris.some(k => k.riskId === r.id) ? 'No breach in recorded readings' : 'No KRIs configured')}</small>)}</td><td><button className="secondary" onClick={() => r.id && onEdit(r.id!)}>{tr("View risk")}<ArrowRight size={14} /></button></td></tr>))}</tbody></table></div>)}</section>
 <div className="dash-bottom"><section className="panel"><h2>{tr("Monitoring coverage")}</h2><div className="dash-coverage"><strong>{tr(coverage)}<span>{tr(" / ")}{tr(scoped.length)}</span></strong><p>{tr("Risks with at least one KRI configured")}</p></div><p className="helper">{tr(kris.length)}{tr(" indicators; ")}{tr(kris.filter(k => !latest.has(k.id)).length)}{tr(" without an observation. Configuration alone does not establish effective assurance.")}</p><button className="text-button" onClick={() => onNavigate('monitoring')}>{tr("Review indicators")}<ArrowRight size={15} /></button></section><section className="panel"><h2>{tr("Potential new risks")}</h2><div className="dash-coverage"><strong>{tr(unlinked.length)}</strong><p>{tr("Open signals linked to an objective without an existing risk")}</p></div><button className="text-button" onClick={() => onNavigate('monitoring')}>{tr("Review identification needs")}<ArrowRight size={15} /></button></section><section className="panel"><h2>{tr("Recent risk reviews")}</h2>{tr(reviews.length ? reviews.map(r => <div className="dash-review" key={r.id}><b>{tr(r.decision)}</b><small>{tr(scoped.find(x => x.id === r.riskId)?.title)}</small><p>{tr(r.notes)}</p></div>) : <p className="helper">{tr("No risk reviews recorded for this selection.")}</p>)}</section></div>
 </>)}
 </>)}
 </div>;
}
