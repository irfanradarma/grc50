import { tr } from "./i18n";
import { Fragment, useEffect, useState } from 'react';
import { ArrowRight, Check, ExternalLink, Newspaper, Plus, Radio, RefreshCw, Search, X } from 'lucide-react';
import { api } from './api';
import { assessNews, newsState, publisherFeed, publishers, contextNewsQuery, operatingLocations, focusedWatches, type NewsItem } from '../shared/newsReview';
import { newsText } from '../shared/newsText';
import type { Objective } from './Objectives';
import type { Risk, Source } from './Workflow';
type Props = {
  items: NewsItem[];
  sources: Source[];
  risks: Risk[];
  objectives: Objective[];
  busy: boolean;
  run: (fn: () => Promise<void>) => Promise<void>;
  onSources: () => void;
};
const post = (path: string, body: unknown, method = 'POST') => api<any>(path, {
  method,
  body: JSON.stringify(body)
});
export default function NewsInbox({
  items,
  sources,
  risks,
  objectives,
  busy,
  run,
  onSources
}: Props) {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null),
    [contextError, setContextError] = useState('');
  const [state, setState] = useState('Pending'),
    [query, setQuery] = useState(''),
    [sourceFilter, setSourceFilter] = useState(''),
    [priority, setPriority] = useState('Potential impact'),
    [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(''),
    [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState(''),
    [verdict, setVerdict] = useState<'Capture' | 'Neglect'>('Capture'),
    [objectiveId, setObjective] = useState(''),
    [riskId, setRisk] = useState(''),
    [notes, setNotes] = useState('');
  const [setup, setSetup] = useState(false),
    [chosen, setChosen] = useState(publishers.map(p => p.id)),
    [topic, setTopic] = useState('logistik OR transportasi OR banjir OR pelabuhan OR siber'),
    [setupObjective, setSetupObjective] = useState(objectives[0]?.id || ''),
    [message, setMessage] = useState(''),
    [progress, setProgress] = useState(''),
    [collection, setCollection] = useState<Array<{
      name: string;
      scanned: number;
      added: number;
      duplicates: number;
      error?: string;
    }>>([]);
  useEffect(() => {
    api<Record<string, unknown>>('/context').then(p => {
      setProfile(p);
      setTopic(contextNewsQuery(p));
    }).catch(e => setContextError(e.message));
  }, []);
  const ranked = items.map(item => ({
    item,
    assessment: assessNews({
      ...item,
      details: newsText(item.details)
    }, profile, objectives, risks)
  }));
  const filtered = ranked.filter(({
    item,
    assessment
  }) => newsState(item) === state && (!sourceFilter || item.sourceId === sourceFilter) && (!priority || assessment.level === priority) && (!query || (item.title + ' ' + newsText(item.details)).toLowerCase().includes(query.toLowerCase()))).sort((a, b) => b.assessment.order - a.assessment.order || (b.item.publishedAt ? Date.parse(b.item.publishedAt) || 0 : 0) - (a.item.publishedAt ? Date.parse(a.item.publishedAt) || 0 : 0) || a.item.id.localeCompare(b.item.id));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)),
    currentPage = Math.min(page, pages - 1),
    visible = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize),
    pending = items.filter(i => newsState(i) === 'Pending');
  function begin(item: NewsItem, decision: 'Capture' | 'Neglect') {
    const a = assessNews({
      ...item,
      details: newsText(item.details)
    }, profile, objectives, risks);
    setExpanded(item.id);
    setSelected(item.id);
    setVerdict(decision);
    setObjective(a.objectiveId || objectives[0]?.id || '');
    setRisk(a.riskId || '');
    setNotes('');
  }
  async function collect() {
    await run(async () => {
      let scanned = 0,
        added = 0;
      const results: Array<{
        name: string;
        scanned: number;
        added: number;
        duplicates: number;
        error?: string;
      }> = [];
      try {
        for (const source of sources.filter(s => s.format !== 'reference')) {
          setProgress('Collecting ' + source.name + '...');
          try {
            const r = await post('/trigger-sources/' + source.id + '/capture', {});
            scanned += r.scanned;
            added += r.added;
            results.push({
              name: source.name,
              scanned: r.scanned,
              added: r.added,
              duplicates: r.duplicates || 0
            });
          } catch (e) {
            results.push({
              name: source.name,
              scanned: 0,
              added: 0,
              duplicates: 0,
              error: e instanceof Error ? e.message : 'Collection failed'
            });
          }
          setCollection([...results]);
        }
        const failed = results.filter(r => r.error).length;
        setMessage(`${results.length - failed}/${results.length} sources fetched. ${scanned} articles scanned; ${added} new inbox items; ${results.reduce((n, r) => n + r.duplicates, 0)} duplicates skipped. ${failed ? 'Inspect failed sources below.' : 'Review relevance before escalation.'}`);
      } finally {
        setProgress('');
      }
    });
  }
  async function addWatches() {
    await run(async () => {
      let added = 0;
      for (const watch of focusedWatches(profile, objectives)) {
        const endpoint = publisherFeed(watch.domain, watch.query);
        if (!watch.objectiveId || sources.some(s => s.endpoint === endpoint)) continue;
        await post('/trigger-sources', {
          name: watch.name,
          kind: 'news',
          objectiveId: watch.objectiveId,
          format: 'rss',
          endpoint,
          keywords: '',
          cadence: 'On demand',
          rule: ''
        });
        added++;
      }
      setMessage(`${added} focused watch sources added. Collect to check route, fuel-cost, and cloud developments against their objectives.`);
    });
  }
  async function tuneSources() {
    await run(async () => {
      let updated = 0;
      for (const source of sources) {
        if (!publishers.some(p => source.name === p.name + ' / Indonesia')) continue;
        let u;
        try {
          u = new URL(source.endpoint);
        } catch {
          continue;
        }
        if (u.hostname !== 'news.google.com') continue;
        const publisher = publishers.find(p => u.searchParams.get('q')?.includes('site:' + p.domain));
        if (!publisher) continue;
        await post('/trigger-sources/' + source.id, {
          ...source,
          endpoint: publisherFeed(publisher.domain, contextNewsQuery(profile)),
          keywords: ''
        }, 'PUT');
        updated++;
      }
      setMessage(`${updated} publisher searches now use saved operating locations. Existing articles and review decisions were preserved.`);
    });
  }
  async function addPublishers() {
    await run(async () => {
      let count = 0;
      const failed: string[] = [];
      for (const p of publishers.filter(p => chosen.includes(p.id))) {
        const endpoint = publisherFeed(p.domain, topic);
        if (sources.some(s => s.endpoint === endpoint)) continue;
        try {
          await post('/trigger-sources', {
            name: p.name + ' / Indonesia',
            kind: 'news',
            objectiveId: setupObjective,
            format: 'rss',
            endpoint,
            keywords: '',
            cadence: 'On demand',
            rule: ''
          });
          count++;
        } catch (e) {
          failed.push(p.name + ': ' + (e instanceof Error ? e.message : 'Unable to add'));
        }
      }
      if (!failed.length) setSetup(false);
      setMessage(`${count} publisher feeds added. ${failed.length ? failed.join(' | ') : 'Collect news to populate your review inbox.'}`);
    });
  }
  return <>
  <section className="news-intelligence panel"><div className="news-intro"><div><span className="eyebrow">{tr("EXTERNAL INTELLIGENCE")}</span><h2>{tr("News worth a second look.")}</h2><p>{tr("Collect across publishers. Check the connection to your organization. Capture meaningful signals; neglect the noise.")}</p></div><div className="news-hero-icon"><Newspaper size={34} /></div></div><div className="news-summary"><div><strong>{tr(pending.length)}</strong><span>{tr("Awaiting your decision")}</span></div><div><strong>{tr(ranked.filter(v => newsState(v.item) === 'Pending' && v.assessment.level === 'Potential impact').length)}</strong><span>{tr("Potential impact · preview")}</span></div><div><strong>{tr(items.filter(i => newsState(i) === 'Captured').length)}</strong><span>{tr("Captured into monitoring")}</span></div><div><strong>{tr(sources.length)}</strong><span>{tr("News sources")}</span></div></div><div className="news-top-actions"><button className="primary" disabled={busy || !sources.some(s => s.format !== 'reference')} onClick={collect}><RefreshCw size={16} />{tr(busy && progress ? progress : 'Collect from all sources')}</button><button className="secondary" disabled={busy || !objectives.length} onClick={() => setSetup(!setup)}><Plus size={16} />{tr("Set up Indonesian publishers")}</button><button className="secondary" disabled={busy || !profile} onClick={addWatches}>{tr("Add focused risk watches")}</button><button className="text-button" onClick={onSources}>{tr("Manage sources")}<ArrowRight size={15} /></button></div><div className="news-scope"><b>{tr("Operating locations:")}</b> {tr(operatingLocations(profile).join(', ') || 'None recognized; review geographic relevance manually')}<button className="text-button" disabled={busy || !profile} onClick={tuneSources}>{tr("Focus publisher searches on context")}</button></div></section>
  {tr(message && <div className="workflow-success news-message" role="status"><Check size={17} />{tr(message)}</div>)}{tr(contextError && <div className="error">{tr("Context ranking unavailable: ")}{tr(contextError)}</div>)}
  <details className="panel news-health"><summary>{tr("Source health & collection evidence")}</summary><p className="helper">{tr(sources.length)}{tr(" configured feeds. Up to 100 entries per feed per collection. Failures remain visible; they are not reported as successful collections.")}</p>{tr(sources.map(source => {
        const last = collection.find(r => r.name === source.name);
        return <div className="news-health-row" key={source.id}><b>{tr(source.name)}</b><span className={`badge ${last?.error || source.health === 'Failed' ? 'high' : 'green'}`}>{tr(last?.error ? 'Failed' : source.health || 'Not fetched yet')}</span><small>{tr(source.lastAttempt ? new Date(source.lastAttempt).toLocaleString() : 'No recorded attempt')}</small><p>{tr(last?.error || source.lastError || (source.lastCaptureResult ? `${source.lastCaptureResult.scanned} scanned / ${source.lastCaptureResult.added} added / ${source.lastCaptureResult.duplicates || 0} duplicates` : 'Collect to verify this source.'))}</p></div>;
      }))}</details>
  {tr(setup && <section className="panel workflow-panel"><div className="section-heading"><div><h2>{tr("One search, multiple publishers")}</h2><p>{tr("Publisher-specific Google News RSS searches. These are real feed requests, with no publisher scraping or API key.")}</p></div><button className="icon-button" aria-label={tr("Close publisher setup")} onClick={() => setSetup(false)}><X size={18} /></button></div><div className="publisher-options">{tr(publishers.map(p => <label key={p.id}><input type="checkbox" checked={chosen.includes(p.id)} onChange={e => setChosen(e.target.checked ? [...chosen, p.id] : chosen.filter(id => id !== p.id))} /><b>{tr(p.name)}</b><small>{tr(p.domain)}</small></label>))}</div><div className="form-grid"><label className="field"><span>{tr("News search topic")}</span><input required maxLength={500} value={tr(topic)} onChange={e => setTopic(e.target.value)} /></label><label className="field"><span>{tr("Default objective for collected news")}</span><select value={setupObjective} onChange={e => setSetupObjective(e.target.value)}>{tr(objectives.map(o => <option key={o.id} value={o.id}>{tr(o.year)}{tr(" / ")}{tr(o.title)}</option>))}</select></label></div><p className="helper">{tr("Searches request the last seven days. Check publication and event dates when reviewing. The objective can be changed when capturing an item.")}</p><button className="primary" disabled={busy || !chosen.length || !topic.trim() || !setupObjective} onClick={addPublishers}>{tr("Add ")}{tr(chosen.length)}{tr(" publisher feeds")}</button></section>)}
  <section className="panel news-review-panel"><div className="section-heading"><div><h2>{tr("Review before escalation")}</h2><p>{tr("Relevance preview uses your saved profile, objectives, and risks. Adverse events, operating locations, dependencies, and dates are checked separately. This is rule-based screening; AI is not connected.")}</p></div><span className="badge">{tr("Human decision required")}</span></div><div className="news-state-tabs" aria-label={tr("News review status")}>{tr(['Pending', 'Captured', 'Neglected', 'Archived'].map(v => <button disabled={busy} key={v} className={state === v ? 'active' : ''} onClick={() => {
          setState(v);
          setPage(0);
          setSelected('');
        }}>{tr(v === 'Pending' ? 'Awaiting review' : v)} <span>{tr(items.filter(i => newsState(i) === v).length)}</span></button>))}</div><div className="news-filters"><label className="search"><Search size={16} /><input aria-label={tr("Search collected news")} placeholder={tr("Search headlines or summaries")} value={tr(query)} onChange={e => {
            setQuery(e.target.value);
            setPage(0);
          }} /></label><label className="field"><span>{tr("Publisher / source")}</span><select value={sourceFilter} onChange={e => {
            setSourceFilter(e.target.value);
            setPage(0);
          }}><option value="">{tr("All sources")}</option>{tr(sources.map(s => <option key={s.id} value={s.id}>{tr(s.name)}</option>))}</select></label><label className="field"><span>{tr("Relevance preview")}</span><select value={priority} onChange={e => {
            setPriority(e.target.value);
            setPage(0);
          }}><option value="">{tr("All relevance levels")}</option>{tr(['Potential impact', 'Context only', 'Low relevance'].map(v => <option key={v} value={v}>{tr(v)}</option>))}</select></label></div>
  {tr(!filtered.length && <div className="empty"><Radio size={30} /><h3>{tr(state === 'Pending' ? 'No news matches this view.' : 'No news in this view.')}</h3><p>{tr(state === 'Pending' ? 'Choose All relevance levels to inspect other collected articles, or collect from your sources. Unreviewed news does not create monitoring alerts.' : 'Capture and neglect decisions remain here with your rationale.')}</p></div>)}
  {tr(!!filtered.length && <div className="trigger-table-scroll"><table className="trigger-table news-review-table" aria-label={tr("News review queue")}><thead><tr><th scope="col">{tr("News / evidence")}</th><th scope="col">{tr("Source / published")}</th><th scope="col">{tr("Relevance")}</th><th scope="col">{tr("Objective / risk")}</th><th scope="col">{tr("Actions")}</th></tr></thead><tbody>{tr(visible.map(({
              item,
              assessment
            }) => <Fragment key={item.id}><tr className={expanded === item.id ? 'is-expanded' : ''}><td><strong className="table-headline">{tr(newsText(item.title))}</strong>{tr(item.sample && <small>{tr("Synthetic demo news")}</small>)}{tr(newsState(item) !== 'Pending' && <small className="table-decision-preview">{tr(newsState(item))}{tr(" / ")}{tr(item.notes || item.decision || 'Previously reviewed')}</small>)}</td><td><b>{tr(sources.find(s => s.id === item.sourceId)?.name || 'News reference')}</b><small>{tr(item.publishedAt && Number.isFinite(Date.parse(item.publishedAt)) ? new Date(item.publishedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Date unavailable')}</small></td><td><span className={`badge ${assessment.level === 'Potential impact' ? 'moderate' : ''}`}>{tr(assessment.level)}</span></td><td>{tr(objectives.find(o => o.id === (item.newsState === 'Captured' ? item.objectiveId : assessment.objectiveId))?.title || 'Choose during review')}<small>{tr(risks.find(r => r.id === (item.newsState === 'Captured' ? item.riskId : assessment.riskId))?.title || 'Potential new risk')}</small></td><td><div className="table-actions"><button className="text-button" aria-expanded={expanded === item.id} aria-controls={'news-detail-' + item.id} onClick={() => {
                      setExpanded(expanded === item.id ? '' : item.id);
                      setSelected('');
                    }}>{tr(expanded === item.id ? 'Hide details' : 'View details')}</button>{tr(newsState(item) === 'Pending' && <><button className="secondary" disabled={busy} onClick={() => begin(item, 'Neglect')}>{tr("Neglect")}</button><button className="primary" disabled={busy || !objectives.length} onClick={() => begin(item, 'Capture')}>{tr("Capture")}</button></>)}</div></td></tr>{tr(expanded === item.id && <tr className="trigger-detail-row"><td colSpan={5}><div className="news-row-detail" id={'news-detail-' + item.id}><div className="news-item-meta"><span>{tr(sources.find(s => s.id === item.sourceId)?.name || 'News reference')}</span><span>{tr(item.publishedAt && Number.isFinite(Date.parse(item.publishedAt)) ? new Date(item.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Publication date unavailable')}</span><span className={`badge ${assessment.level === 'Potential impact' ? 'moderate' : ''}`}>{tr(assessment.level)}</span></div>{tr(item.sample && <span className="badge">{tr("Synthetic demo news / not a published article")}</span>)}<h3>{tr(newsText(item.title))}</h3><p className="news-excerpt">{tr(newsText(item.details) || 'Open the source for the published article.')}</p><div className="news-reason"><b>{tr("Why this may matter")}</b><p>{tr(assessment.reason)}</p><div className="news-evidence-checks">{tr(assessment.checks.map(c => <span key={c.label} className={c.passed ? 'pass' : 'needs-check'}><b>{tr(c.passed ? 'Matched' : 'Verify')}{tr(" / ")}{tr(c.label)}</b><small>{tr(c.detail)}</small></span>))}</div><p><b>{tr("Next step:")}</b> {tr(assessment.nextStep)}</p>{tr(assessment.terms.length > 0 && <small>{tr("Context cues: ")}{tr(assessment.terms.join(' · '))}</small>)}<div className="news-suggested"><span>{tr("Suggested objective: ")}<b>{tr(objectives.find(o => o.id === assessment.objectiveId)?.title || 'Choose during review')}</b></span>{tr(assessment.riskId && <span>{tr("Possible risk: ")}<b>{tr(risks.find(r => r.id === assessment.riskId)?.title)}</b></span>)}</div></div><div className="news-item-actions">{tr(item.evidence && /^https?:\/\//i.test(item.evidence) && <a href={item.evidence} target="_blank" rel="noreferrer"><ExternalLink size={15} />{tr("Read source")}</a>)}{tr(newsState(item) === 'Pending' ? <><button className="secondary" disabled={busy} onClick={() => begin(item, 'Neglect')}>{tr("Neglect")}</button><button className="primary" disabled={busy || !objectives.length} onClick={() => begin(item, 'Capture')}>{tr("Capture signal")}<ArrowRight size={15} /></button></> : <span className="news-decision"><b>{tr(newsState(item))}</b>{tr(" · ")}{tr(item.notes || item.decision || 'Previously reviewed')}</span>)}</div>
   {tr(selected === item.id && <form className="workflow-form news-decision-form" onSubmit={e => {
                      e.preventDefault();
                      run(async () => {
                        await post('/news/' + item.id + '/decision', {
                          decision: verdict,
                          notes,
                          objectiveId: verdict === 'Capture' ? objectiveId : undefined,
                          riskId: verdict === 'Capture' ? riskId || undefined : undefined
                        });
                        setSelected('');
                        setMessage(verdict === 'Capture' ? 'Signal captured. Review it in the linked Risk Monitoring row or identify a new risk for the objective.' : 'News neglected. Your rationale is retained; no monitoring alert was created.');
                      });
                    }}><h3>{tr(verdict === 'Capture' ? 'Connect this evidence to a decision' : 'Neglect this news item')}</h3>{tr(verdict === 'Capture' && <div className="form-grid"><label className="field"><span>{tr("Capture to annual objective")}</span><select required value={objectiveId} onChange={e => {
                            setObjective(e.target.value);
                            setRisk('');
                          }}><option value="">{tr("Choose an objective")}</option>{tr(objectives.map(o => <option key={o.id} value={o.id}>{tr(o.year)}{tr(" / ")}{tr(o.title)}</option>))}</select></label><label className="field"><span>{tr("Capture to risk")}</span><select value={riskId} onChange={e => setRisk(e.target.value)}><option value="">{tr("Potential new risk for this objective")}</option>{tr(risks.filter(r => r.objectiveId === objectiveId).map(r => <option key={r.id} value={r.id}>{tr(r.title)}</option>))}</select></label></div>)}<label className="field full"><span>{tr(verdict === 'Capture' ? 'Objective impact and next steps' : 'Reason for neglecting')}</span><textarea required maxLength={3000} value={tr(notes)} onChange={e => setNotes(e.target.value)} placeholder={tr(verdict === 'Capture' ? 'Explain the dependency, possible impact, and what needs to be verified.' : 'For example: promotional news, unrelated geography, duplicate event, or no relevant dependency.')} /></label><p className="helper">{tr(verdict === 'Capture' ? 'Capturing creates a review signal. It does not change the risk rating or confirm that an incident occurred.' : 'Neglecting keeps the source and decision history. It does not delete the evidence.')}</p><div className="button-row"><button className="primary" disabled={busy || !notes.trim()}>{tr(verdict === 'Capture' ? 'Confirm capture' : 'Confirm neglect')}</button><button className="secondary" type="button" onClick={() => setSelected('')}>{tr("Cancel")}</button></div></form>)}
  </div></td></tr>)}</Fragment>))}</tbody></table></div>)}<div className="news-pagination"><label className="table-page-size">{tr("Rows per page ")}<select aria-label={tr("News rows per page")} value={pageSize} onChange={e => {
            setPageSize(Number(e.target.value));
            setPage(0);
          }}>{tr([25, 50, 100].map(n => <option key={n} value={n}>{tr(n)}</option>))}</select></label><span>{tr(filtered.length)}{tr(" items · page ")}{tr(currentPage + 1)}{tr(" of ")}{tr(pages)}</span><div><button className="secondary" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>{tr("Previous")}</button><button className="secondary" disabled={currentPage === pages - 1} onClick={() => setPage(currentPage + 1)}>{tr("Next")}</button></div></div></section>
 </>;
}
