import { tr } from "./i18n";
import { useState } from 'react';
import { Grid2X2, ExternalLink } from 'lucide-react';
export default function MacroSwitcher({
  onNavigate
}: {
  onNavigate: (page: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const local = location.hostname === 'localhost' || location.hostname.endsWith('.localhost') || location.hostname === '127.0.0.1';
  const deck = import.meta.env.VITE_DECK_URL || (local ? `${location.protocol}//${location.hostname}:8765/website/deck/` : '../deck/');
  const apps = [['dashboard', 'Risk intelligence', 'Objectives, risks and monitoring'], ['incidents', 'Incident Reporting', 'Submit evidence to risk owners'], ['ams', 'Audit Management', 'Programs, workpapers and reports'], ['assurance', 'Continuous Assurance', 'Automated checks and confirmation']];
  return <div className="macro-switcher"><button className="secondary" aria-expanded={open} aria-label={tr("Open app switcher")} onClick={() => setOpen(!open)}><Grid2X2 size={17} />{tr("Apps")}</button>{tr(open && <div className="macro-menu"><div className="section-heading"><b>{tr("HORI workspace apps")}</b><button className="text-button" onClick={() => setOpen(false)}>{tr("Close")}</button></div>{tr(apps.map(([page, label, description]) => <div className="macro-item" key={page}><button onClick={() => {
          onNavigate(page);
          setOpen(false);
        }}><b>{tr(label)}</b><small>{tr(description)}</small></button><a href={'?view=' + page} target="_blank" rel="noreferrer" aria-label={tr('Open ' + label + ' in new tab')}><ExternalLink size={16} /></a></div>))}<a className="macro-deck" href="?mode=participant" target="_blank" rel="noreferrer">Seminar hands-on <ExternalLink size={16}/></a><a className="macro-deck" href="?mode=presenter" target="_blank" rel="noreferrer">Presenter controls <ExternalLink size={16}/></a><a className="macro-deck" href={deck} target="_blank" rel="noreferrer">{tr("Seminar presentation ")}<ExternalLink size={16} /></a><div className="macro-coming">{tr("More workspace apps / coming later")}</div></div>)}</div>;
}
