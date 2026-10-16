import { tr } from "./i18n";
import { projectRisk } from '../shared/riskProjection';
import type { Mitigation } from './Mitigation';
export default function RiskMap({
  likelihood,
  impact,
  plans,
  onChange
}: {
  likelihood: number;
  impact: number;
  plans: Mitigation[];
  onChange: (likelihood: number, impact: number) => void;
}) {
  const residual = projectRisk(likelihood, impact, plans);
  const map = (l: number, i: number, editable: boolean) => <div className="risk-map"><span className="risk-map-y">{tr("Likelihood")}</span><div className="risk-map-grid">{tr([5, 4, 3, 2, 1].flatMap(y => [1, 2, 3, 4, 5].map(x => <button type="button" disabled={!editable} key={`${y}-${x}`} aria-label={tr(`Likelihood ${y}, impact ${x}`)} aria-pressed={l === y && i === x} className={'map-cell ' + (y * x >= 15 ? 'high' : y * x >= 6 ? 'medium' : 'low')} onClick={() => onChange(y, x)}><span>{tr(y * x)}</span></button>)))}<span className="map-marker" style={{
        left: `${(i - .5) * 20}%`,
        top: `${(5.5 - l) * 20}%`
      }} aria-hidden="true">{tr("●")}</span></div><div className="risk-map-x"><span>{tr("Impact")}</span><small>{tr("1 → 5")}</small></div></div>;
  return <><div className="risk-map-comparison"><section><div className="risk-map-heading"><h3>{tr("Initial risk")}</h3><strong>{tr(residual.initialScore.toFixed(1))}</strong></div><p>{tr("Click the map to set likelihood and impact.")}</p>{tr(map(likelihood, impact, true))}<p className="map-coordinates">{tr("Likelihood ")}{tr(likelihood)}{tr(" × impact ")}{tr(impact)}</p></section><section><div className="risk-map-heading"><h3>{tr("Projected residual risk")}</h3><strong>{tr(residual.residualScore.toFixed(1))}</strong></div><p>{tr("After the projected effects of mitigation plans.")}</p>{tr(map(residual.residualLikelihood, residual.residualImpact, false))}<p className="map-coordinates">{tr("Likelihood ")}{tr(residual.residualLikelihood.toFixed(1))}{tr(" × impact ")}{tr(residual.residualImpact.toFixed(1))}</p></section></div><p className="helper">{tr("Projected reductions are added and bounded at 1. Review overlapping effects; completion alone does not verify control effectiveness.")}</p></>;
}
