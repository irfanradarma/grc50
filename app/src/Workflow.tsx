import { tr } from "./i18n";
import { visibleInMonitoring } from '../shared/newsReview';
import NewsInbox from './NewsInbox';
import { newsText } from '../shared/newsText';
import { api } from './api';
import { Fragment, useEffect, useState } from 'react';
import { Plus, Activity, Radio, Check, Sparkles } from 'lucide-react';
import type { Objective } from './Objectives';
export async function request<T = any>(path: string, body?: unknown, method = 'POST'): Promise<T> {
  return api<T>(path, {
    method: body === undefined ? 'GET' : method,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}
export type Risk = {
  id?: string;
  title: string;
  cause?: string;
  event?: string;
  impact?: string;
  objectiveId?: string;
  objective: string;
  owner: string;
  likelihood: number;
  impactScore: number;
};
type Kri = {
  id: string;
  riskId: string;
  name: string;
  unit: string;
  owner: string;
  frequency: string;
  direction: string;
  warning: number;
  critical: number;
};
type Reading = {
  id: string;
  kriId: string;
  value: number;
  observedAt: string;
  notes: string;
  status: string;
  createdAt: string;
};
export type Source = {
  id: string;
  name: string;
  kind: string;
  objectiveId: string;
  riskId?: string;
  format: string;
  endpoint: string;
  keywords: string;
  cadence: string;
  rule: string;
  connection?: 'manual' | 'api' | 'mcp';
  system?: string;
  eventTypes?: string;
  enabled?: boolean;
  lastAttempt?: string;
  health?: string;
  lastError?: string;
  lastCapture?: string;
  lastCaptureResult?: {
    scanned: number;
    matched: number;
    added: number;
    duplicates?: number;
  };
};
export type Signal = {
  id: string;
  title: string;
  details: string;
  riskId?: string;
  objectiveId: string;
  sourceId?: string;
  observedAt: string;
  status: string;
  newsState?: string;
  action: string;
  kind: string;
  evidence?: string;
  publishedAt?: string;
  decision?: string;
  notes?: string;
};
type Review = {
  id: string;
  riskId: string;
  decision: string;
  notes: string;
  reviewedAt: string;
};
export type Workflow = {
  kris: Kri[];
  readings: Reading[];
  sources: Source[];
  signals: Signal[];
  reviews: Review[];
};
const empty: Workflow = {
  kris: [],
  readings: [],
  sources: [],
  signals: [],
  reviews: []
};
const today = () => new Date().toLocaleDateString('en-CA');
const kinds: Record<string, string> = {
  news: 'External / News capture',
  manual_periodic: 'Internal / Periodic report',
  manual_incident: 'Internal / Incident report',
  audit: 'Internal / Audit report',
  assurance: 'Internal / Continuous assurance'
};
function useWorkflow() {
  const [data, setData] = useState(empty),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function load() {
    setData(await request<Workflow>('/workflow'));
  }
  useEffect(() => {
    load().catch(e => setError(e.message));
  }, []);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }
  return {
    data,
    error,
    busy,
    run,
    load
  };
}
function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return <label className="field"><span>{tr(label)}</span><input {...props} /></label>;
}
function Area({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
}) {
  return <label className="field full"><span>{tr(label)}</span><textarea maxLength={3000} {...props} /></label>;
}
function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
}) {
  return <label className="field"><span>{tr(label)}</span><select {...props}>{tr(children)}</select></label>;
}
const latest = (readings: Reading[], id: string) => readings.filter(r => r.kriId === id).sort((a, b) => b.observedAt.localeCompare(a.observedAt) || b.createdAt.localeCompare(a.createdAt))[0];
const statusFor = (k: Kri, value: number) => (k.direction === 'Above' ? value >= k.critical : value <= k.critical) ? 'Critical' : (k.direction === 'Above' ? value >= k.warning : value <= k.warning) ? 'Warning' : 'Normal';
function statusClass(s: string) {
  return s === 'Critical' ? 'high' : s === 'Warning' ? 'moderate' : s === 'Normal' ? 'green' : '';
}
export function KriPanel({
  riskId,
  riskOwner = '',
  onChange
}: {
  riskId: string;
  riskOwner?: string;
  onChange?: () => Promise<void>;
}) {
  const {
    data,
    error,
    busy,
    run,
    load
  } = useWorkflow();
  const [draft, setDraft] = useState<Partial<Kri> | null>(null),
    [reading, setReading] = useState(''),
    [value, setValue] = useState(''),
    [observedAt, setDate] = useState(today()),
    [notes, setNotes] = useState('');
  const kris = data.kris.filter(k => k.riskId === riskId);
  return <section className="kri-section"><div className="section-heading"><div><h2>{tr("Key risk indicators")}</h2><p>{tr("Define multiple indicators and record observations.")}</p></div><button type="button" className="secondary" onClick={() => setDraft({
        name: '',
        unit: '%',
        owner: riskOwner,
        frequency: 'Monthly',
        direction: 'Above',
        warning: 5,
        critical: 10
      })}><Plus size={16} />{tr("Add KRI")}</button></div>{tr(error && <div className="error" role="alert">{tr(error)}</div>)}{tr(!kris.length && <p className="helper">{tr("No indicators yet. Add a KRI with warning and critical thresholds.")}</p>)}{tr(kris.map(k => {
      const last = latest(data.readings, k.id),
        status = last ? statusFor(k, last.value) : 'No reading';
      return <div className="indicator" key={k.id}><div><b>{tr(k.name)}</b><span>{tr(k.owner)}{tr(" · ")}{tr(k.frequency)}{tr(" · ")}{tr(k.direction === 'Above' ? '>=' : '<=')} {tr(k.warning)}{tr(" warning / ")}{tr(k.critical)}{tr(" critical ")}{tr(k.unit)}</span>{tr(last && <small>{tr("Latest: ")}{tr(last.value)} {tr(k.unit)}{tr(" on ")}{tr(last.observedAt)}</small>)}</div><span className={`badge ${statusClass(status)}`}>{tr(status)}</span><button type="button" className="secondary" onClick={() => {
          setReading(k.id);
          setValue('');
          setNotes('');
        }}>{tr("Record reading")}</button><button type="button" className="text-button" onClick={() => setDraft({
          ...k
        })}>{tr("Edit")}</button></div>;
    }))}{tr(draft && <div className="workflow-form"><div className="form-grid"><Input label={tr("Indicator name")} required value={tr(draft.name)} onChange={e => setDraft({
          ...draft,
          name: e.target.value
        })} /><Input label={tr("Unit")} required value={tr(draft.unit)} onChange={e => setDraft({
          ...draft,
          unit: e.target.value
        })} /><Input label={tr("Indicator owner")} required value={tr(draft.owner)} onChange={e => setDraft({
          ...draft,
          owner: e.target.value
        })} /><Select label={tr("Observation frequency")} value={draft.frequency} onChange={e => setDraft({
          ...draft,
          frequency: e.target.value
        })}>{tr(['Daily', 'Weekly', 'Monthly', 'Quarterly'].map(v => <option key={v} value={v}>{tr(v)}</option>))}</Select><Select label={tr("Deterioration direction")} value={draft.direction} onChange={e => setDraft({
          ...draft,
          direction: e.target.value
        })}><option value="Above">{tr("Higher values are worse")}</option><option value="Below">{tr("Lower values are worse")}</option></Select><Input label={tr("Warning threshold")} type="number" step="any" value={tr(draft.warning)} onChange={e => setDraft({
          ...draft,
          warning: Number(e.target.value)
        })} /><Input label={tr("Critical threshold")} type="number" step="any" value={tr(draft.critical)} onChange={e => setDraft({
          ...draft,
          critical: Number(e.target.value)
        })} /></div><div className="form-footer"><button type="button" className="secondary" onClick={() => setDraft(null)}>{tr("Cancel indicator")}</button><button type="button" className="primary" disabled={busy} onClick={() => run(async () => {
          await request(draft.id ? '/kris/' + draft.id : '/risks/' + riskId + '/kris', draft, draft.id ? 'PUT' : 'POST');
          setDraft(null);
          await onChange?.();
        })}>{tr("Save indicator")}</button></div></div>)}{tr(reading && <div className="workflow-form"><h3>{tr("Record observation")}</h3><div className="form-grid"><Input label={tr("Observed value")} type="number" step="any" value={tr(value)} onChange={e => setValue(e.target.value)} /><Input label={tr("Observation date")} type="date" value={tr(observedAt)} onChange={e => setDate(e.target.value)} /><Area label={tr("Observation notes")} value={tr(notes)} onChange={e => setNotes(e.target.value)} /></div><div className="form-footer"><button type="button" className="secondary" onClick={() => setReading('')}>{tr("Cancel reading")}</button><button type="button" className="primary" disabled={busy || value === ''} onClick={() => run(async () => {
          await request('/kris/' + reading + '/readings', {
            value: Number(value),
            observedAt,
            notes
          });
          setReading('');
          await onChange?.();
        })}>{tr("Save reading")}</button></div></div>)}{tr(data.readings.some(r => kris.some(k => k.id === r.kriId)) && <details className="history"><summary>{tr("Observation history")}</summary>{tr(data.readings.filter(r => kris.some(k => k.id === r.kriId)).map(r => <p key={r.id}><b>{tr(kris.find(k => k.id === r.kriId)?.name)}</b>{tr(" · ")}{tr(r.observedAt)}{tr(" · ")}{tr(r.value)}{tr(" · ")}{tr(r.status)}<br />{tr(r.notes)}</p>))}</details>)}</section>;
}
export function RiskTriggers({
  risks,
  objectives
}: {
  risks: Risk[];
  objectives: Objective[];
}) {
  const {
    data,
    error,
    busy,
    run,
    load
  } = useWorkflow();
  const [tab, setTab] = useState('news'),
    [newsView, setNewsView] = useState('inbox'),
    [internalView, setInternalView] = useState('reports'),
    [draft, setDraft] = useState<Partial<Source> | null>(null),
    [reportId, setReportId] = useState(''),
    [report, setReport] = useState({
      title: '',
      details: '',
      observedAt: today(),
      evidence: '',
      outcome: 'Issue'
    }),
    [message, setMessage] = useState('');
  const sources = data.sources.filter(s => tab === 'news' ? s.kind === 'news' : internalView === 'reports' ? ['manual_periodic', 'manual_incident'].includes(s.kind) : s.kind === (internalView === 'audit' ? 'audit' : 'assurance'));
  return <>{tr(error && <div className="error" role="alert">{tr(error)}</div>)}{tr(message && <div className="workflow-success" role="status"><Check size={17} />{tr(message)}</div>)}<div className="context-tabs"><button className={tab === 'news' ? 'active' : ''} onClick={() => {
        setTab('news');
        setDraft(null);
        setReportId('');
      }}>{tr("External sources")}</button><button className={tab === 'internal' ? 'active' : ''} onClick={() => {
        setTab('internal');
        setDraft(null);
        setReportId('');
      }}>{tr("Internal sources")}</button></div>{tr(tab === 'internal' && <div className="news-navigation" aria-label={tr("Internal source activities")}>{tr([['reports', 'Periodic/incident reports'], ['audit', 'Audit reports'], ['assurance', 'Continuous assurance']].map(([key, label]) => <button key={key} className={internalView === key ? 'active' : ''} onClick={() => {
        setInternalView(key);
        setDraft(null);
        setReportId('');
      }}>{tr(label)}</button>))}</div>)}{tr(tab === 'news' && <><div className="news-navigation"><button className={newsView === 'inbox' ? 'active' : ''} onClick={() => setNewsView('inbox')}>{tr("News review inbox")}</button><button className={newsView === 'sources' ? 'active' : ''} onClick={() => setNewsView('sources')}>{tr("Manage sources")}</button></div>{tr(newsView === 'inbox' && <NewsInbox items={data.signals.filter(s => s.kind === 'news')} sources={data.sources.filter(s => s.kind === 'news')} risks={risks} objectives={objectives} busy={busy} run={run} onSources={() => setNewsView('sources')} />)}</>)}{tr((tab !== 'news' || newsView === 'sources') && <section className="panel workflow-panel"><div className="section-heading"><div><h2>{tr(tab === 'news' ? 'News capture sources' : internalView === 'reports' ? 'Periodic/incident reports' : internalView === 'audit' ? 'Audit reports' : 'Continuous assurance')}</h2><p>{tr(tab === 'news' ? 'Capture on demand from public RSS/Atom or JSON endpoints, or submit an article reference.' : 'Connect activity evidence and subscribed events to an objective or risk. Exceptions become signals to revisit exposure; normal results remain information.')}</p></div><button className="primary" disabled={!objectives.length} onClick={() => setDraft({
          name: '',
          kind: tab === 'news' ? 'news' : internalView === 'reports' ? 'manual_periodic' : internalView === 'audit' ? 'audit' : 'assurance',
          objectiveId: objectives[0]?.id,
          riskId: undefined,
          format: 'reference',
          endpoint: '',
          keywords: '',
          cadence: 'Monthly',
          rule: '',
          connection: internalView === 'assurance' ? 'api' : 'manual',
          system: '',
          eventTypes: '',
          enabled: true
        })}><Plus size={16} />{tr("Add source")}</button></div>{tr(!objectives.length && <p className="helper">{tr("Create an annual objective first.")}</p>)}{tr(draft && <form className="workflow-form" onSubmit={e => {
        e.preventDefault();
        run(async () => {
          await request(draft.id ? '/trigger-sources/' + draft.id : '/trigger-sources', draft, draft.id ? 'PUT' : 'POST');
          setDraft(null);
          setMessage('Trigger source saved.');
        });
      }}><div className="form-grid"><Input label={tr("Source name")} required maxLength={3000} value={tr(draft.name)} onChange={e => setDraft({
            ...draft,
            name: e.target.value
          })} /><Select label={tr("Source type")} value={draft.kind} onChange={e => setDraft({
            ...draft,
            kind: e.target.value
          })}>{tr(Object.entries(kinds).filter(([key]) => tab === 'news' ? key === 'news' : internalView === 'reports' ? ['manual_periodic', 'manual_incident'].includes(key) : key === (internalView === 'audit' ? 'audit' : 'assurance')).map(([k, v]) => <option key={k} value={k}>{tr(v)}</option>))}</Select><Select label={tr("Linked annual objective")} required value={draft.objectiveId} onChange={e => setDraft({
            ...draft,
            objectiveId: e.target.value,
            riskId: undefined
          })}>{tr(objectives.map(o => <option key={o.id} value={o.id}>{tr(o.year)}{tr(" / ")}{tr(o.title)}</option>))}</Select><Select label={tr(draft.kind === 'assurance' ? 'Registered risk (required)' : 'Target risk (optional)')} required={draft.kind === 'assurance'} value={draft.riskId || ''} onChange={e => setDraft({
            ...draft,
            riskId: e.target.value || undefined
          })}><option value="" disabled={draft.kind === 'assurance'}>{tr(draft.kind === 'assurance' ? 'Choose a registered risk' : 'Objective / potential new risk')}</option>{tr(risks.filter(r => r.objectiveId === draft.objectiveId).map(r => <option key={r.id} value={r.id}>{tr(r.title)}</option>))}</Select>{tr(draft.kind === 'news' ? <><Select label={tr("Indonesian news preset")} value="" onChange={e => {
              const feeds: Record<string, {
                name: string;
                endpoint: string;
                keywords: string;
              }> = {
                antara: {
                  name: 'ANTARA Ekonomi',
                  endpoint: 'https://www.antaranews.com/rss/ekonomi.xml',
                  keywords: 'logistik,transportasi,banjir,pelabuhan,bbm,siber'
                },
                latest: {
                  name: 'ANTARA Terkini',
                  endpoint: 'https://www.antaranews.com/rss/terkini.xml',
                  keywords: 'banjir,logistik,pelabuhan,siber'
                },
                google: {
                  name: 'Google News / Logistik Indonesia',
                  endpoint: 'https://news.google.com/rss/search?q=logistik%20Indonesia%20when%3A7d&hl=id&gl=ID&ceid=ID%3Aid',
                  keywords: ''
                }
              };
              const f = feeds[e.target.value];
              if (f) setDraft({
                ...draft,
                ...f,
                format: 'rss',
                cadence: 'On demand'
              });
            }}><option value="">{tr("Choose a feed or enter your own")}</option><option value="antara">{tr("ANTARA / Ekonomi")}</option><option value="latest">{tr("ANTARA / Terkini")}</option><option value="google">{tr("Google News RSS / Logistik Indonesia (7 days)")}</option></Select><Select label={tr("Capture format")} value={draft.format} onChange={e => setDraft({
              ...draft,
              format: e.target.value
            })}><option value="reference">{tr("Reference URL / manual article")}</option><option value="rss">{tr("RSS / Atom")}</option><option value="json">{tr("JSON API")}</option></Select><Input label={tr("API endpoint or reference URL")} type="url" required value={tr(draft.endpoint)} onChange={e => setDraft({
              ...draft,
              endpoint: e.target.value
            })} /><Input label={tr("Relevance keywords (comma separated)")} value={tr(draft.keywords)} onChange={e => setDraft({
              ...draft,
              keywords: e.target.value
            })} /><p className="helper">{tr("RSS captures real published articles; keywords are a preliminary filter, not an AI impact assessment. Google News uses public RSS, with no API key. Empty keywords capture all articles. JSON: array or articles/items array, with title, summary, url and publishedAt. Public endpoints only; no API credentials in this prototype.")}</p></> : <><Select label={tr("Connection method")} value={draft.connection || (draft.kind === 'assurance' ? 'api' : 'manual')} onChange={e => setDraft({
              ...draft,
              connection: e.target.value as Source['connection']
            })}>{tr(draft.kind !== 'assurance' && <option value="manual">{tr("Manual submission")}</option>)}<option value="api">{tr("API / event adapter")}</option><option value="mcp">{tr("MCP / event adapter")}</option></Select>{tr(draft.connection && draft.connection !== 'manual' && <><Input label={tr("Source system")} required value={tr(draft.system || '')} onChange={e => setDraft({
                ...draft,
                system: e.target.value
              })} /><Input label={tr(draft.connection === 'mcp' ? 'MCP server / tool reference' : 'Source API endpoint')} required value={tr(draft.endpoint || '')} onChange={e => setDraft({
                ...draft,
                endpoint: e.target.value
              })} /><Input label={tr("Subscribed event types (comma separated)")} required value={tr(draft.eventTypes || '')} onChange={e => setDraft({
                ...draft,
                eventTypes: e.target.value
              })} /><Select label={tr("Connector status")} value={draft.enabled === false ? 'paused' : 'enabled'} onChange={e => setDraft({
                ...draft,
                enabled: e.target.value === 'enabled'
              })}><option value="enabled">{tr("Enabled")}</option><option value="paused">{tr("Paused")}</option></Select><p className="helper">{tr("An adapter maps source events to Issue or Normal and sends them to this workspace's authenticated event receiver. API polling and MCP execution require a connected adapter; saving a reference does not establish a live connection. No credentials are stored here.")}</p></>)}<Input label={tr(draft.kind === 'manual_incident' ? 'Reporting expectation' : 'Reporting / test cadence')} value={tr(draft.cadence)} onChange={e => setDraft({
              ...draft,
              cadence: e.target.value
            })} /><Area label={tr(draft.kind === 'assurance' ? 'Control/test and exception rule' : 'Report scope and escalation criteria')} required={draft.kind === 'assurance' || draft.connection === 'api' || draft.connection === 'mcp'} value={tr(draft.rule)} onChange={e => setDraft({
              ...draft,
              rule: e.target.value
            })} /></>)}</div><div className="form-footer"><button type="button" className="secondary" onClick={() => setDraft(null)}>{tr("Cancel source")}</button><button className="primary" disabled={busy}>{tr("Save source")}</button></div></form>)}{tr(!sources.length && !draft && <div className="empty"><Radio size={30} /><h3>{tr("No sources configured yet.")}</h3><p>{tr("Link a source to an objective or a specific risk.")}</p></div>)}{tr(!!sources.length && <div className="trigger-table-scroll"><table className="trigger-table source-table" aria-label={tr(tab === 'news' ? 'News capture sources' : 'Internal trigger sources')}><thead><tr><th scope="col">{tr("Source / type")}</th><th scope="col">{tr("Objective / risk")}</th><th scope="col">{tr("Configuration")}</th><th scope="col">{tr("Health / last attempt")}</th><th scope="col">{tr("Actions")}</th></tr></thead><tbody>{tr(sources.map(s => <Fragment key={s.id}><tr><td><strong>{tr(s.name)}</strong><small>{tr(kinds[s.kind])}</small></td><td>{tr(objectives.find(o => o.id === s.objectiveId)?.title)}<small>{tr(s.riskId ? risks.find(r => r.id === s.riskId)?.title : 'Potential new risk')}</small></td><td>{tr(s.kind === 'news' ? <><b>{tr(s.format?.toUpperCase())}</b><details className="source-config"><summary>{tr("Endpoint & filters")}</summary><p className="evidence">{tr(s.endpoint)}</p><p>{tr("Keywords: ")}{tr(s.keywords || 'All articles')}</p></details></> : <><b>{tr(s.connection === 'api' ? 'API adapter' : s.connection === 'mcp' ? 'MCP adapter' : 'Manual submission')}</b><small>{tr(s.system || s.cadence || 'On demand')}</small>{tr(s.connection && s.connection !== 'manual' && <details className="source-config"><summary>{tr("Connector & events")}</summary><p>{tr(s.endpoint)}</p><p>{tr("Subscribed: ")}{tr(s.eventTypes)}</p><p>{tr("Receiver: /api/trigger-sources/")}{tr(s.id)}{tr("/events")}</p><p>{tr("Adapter delivery not verified. Use Test event to verify routing.")}</p></details>)}{tr(s.rule ? <details className="source-config"><summary>{tr("Reporting rule")}</summary><p>{tr(s.rule)}</p></details> : <small>{tr("Manual reporting")}</small>)}</>)}</td><td>{tr(s.kind === 'news' ? <><span className={`badge ${s.health === 'Failed' ? 'high' : ''}`}>{tr(s.health || 'Not fetched yet')}</span><small>{tr(s.lastAttempt ? new Date(s.lastAttempt).toLocaleString() : s.lastCapture ? new Date(s.lastCapture).toLocaleString() : 'No recorded attempt')}</small>{tr(s.lastError ? <small className="source-error">{tr(s.lastError)}</small> : s.lastCaptureResult && <small>{tr(s.lastCaptureResult.scanned)}{tr(" scanned / ")}{tr(s.lastCaptureResult.added)}{tr(" new / ")}{tr(s.lastCaptureResult.duplicates || 0)}{tr(" duplicates")}</small>)}</> : <><span className="badge">{tr(s.enabled === false ? 'Paused' : s.health || 'No events received')}</span><small>{tr(s.lastAttempt ? new Date(s.lastAttempt).toLocaleString() : 'Awaiting activity evidence')}</small></>)}</td><td><button className="text-button" onClick={() => setDraft({
                    ...s,
                    connection: s.kind === 'assurance' ? s.connection === 'mcp' ? 'mcp' : 'api' : s.connection
                  })}>{tr("Edit source")}</button>{tr(s.kind === 'assurance' && <a className="text-button" href="?view=assurance">{tr("Open assurance module")}</a>)}<div className="table-actions">{tr(s.kind !== 'news' && s.kind !== 'assurance' && s.connection && s.connection !== 'manual' && <button className="secondary" disabled={busy || s.enabled === false} onClick={() => run(async () => {
                      const r = await request('/trigger-sources/' + s.id + '/events', {
                        eventId: crypto.randomUUID(),
                        eventType: (s.eventTypes || '').split(',')[0].trim(),
                        title: 'Test connector event / ' + s.name,
                        details: 'Synthetic adapter event for routing verification. Review criteria: ' + s.rule,
                        observedAt: today(),
                        evidence: 'Synthetic connector test / not a live source event',
                        outcome: 'Issue',
                        test: true
                      });
                      setMessage(r.ignored ? 'Event ignored: ' + r.reason : 'Test event received. Check the linked Risk Monitoring row; this is synthetic evidence.');
                    })}>{tr("Test event")}</button>)}{tr(s.kind === 'news' && s.format !== 'reference' && <button className="secondary" disabled={busy} onClick={() => run(async () => {
                      const r = await request('/trigger-sources/' + s.id + '/capture', {});
                      setMessage(`Collection complete: ${r.scanned} scanned, ${r.matched} matched, ${r.added} new inbox items. Review before capturing into monitoring.`);
                    })}><Sparkles size={16} />{tr("Capture news now")}</button>)}{tr(s.kind !== 'assurance' && <button className="secondary" onClick={() => {
                      setReportId(s.id);
                      setReport({
                        title: '',
                        details: '',
                        observedAt: today(),
                        evidence: '',
                        outcome: 'Issue'
                      });
                    }}>{tr(s.kind === 'news' ? 'Submit article reference' : s.kind === 'assurance' ? 'Record test result' : 'Submit report')}</button>)}</div></td></tr>{tr(reportId === s.id && <tr className="trigger-detail-row"><td colSpan={5}>{tr(reportId === s.id && <form className="workflow-form" onSubmit={e => {
                    e.preventDefault();
                    run(async () => {
                      await request('/trigger-sources/' + s.id + '/reports', report);
                      setReportId('');
                      setMessage(s.kind === 'news' ? 'Article saved to the news review inbox.' : report.outcome === 'Issue' ? 'Report saved; review it in Risk Monitoring.' : 'Normal result saved to monitoring history.');
                    });
                  }}><div className="form-grid"><Input label={tr("Report / article title")} required value={tr(report.title)} onChange={e => setReport({
                        ...report,
                        title: e.target.value
                      })} /><Input label={tr("Observation / report date")} type="date" required value={tr(report.observedAt)} onChange={e => setReport({
                        ...report,
                        observedAt: e.target.value
                      })} /><Area label={tr("Findings and potential objective impact")} required value={tr(report.details)} onChange={e => setReport({
                        ...report,
                        details: e.target.value
                      })} /><Input label={tr("Evidence reference or article URL")} value={tr(report.evidence)} onChange={e => setReport({
                        ...report,
                        evidence: e.target.value
                      })} /><Select label={tr("Result")} value={report.outcome} onChange={e => setReport({
                        ...report,
                        outcome: e.target.value
                      })}><option value="Issue">{tr("Exception / needs review")}</option><option value="Normal">{tr("Normal / information only")}</option></Select></div><div className="form-footer"><button type="button" className="secondary" onClick={() => setReportId('')}>{tr("Cancel report")}</button><button className="primary" disabled={busy}>{tr("Submit report")}</button></div></form>)}</td></tr>)}</Fragment>))}</tbody></table></div>)}</section>)}<p className="helper">{tr("Capture and report submission are on demand. Scheduling, automated assurance connectors, and AI relevance analysis come next.")}</p></>;
}
