import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";
import type { Rating as R } from "./rating";
import { leagueOf } from "./leagues";
import { LeagueBadge } from "./LeagueBadge";

/** Nota geral do desenho (overall): chip no topo do laboratório + cartão com os seis atributos e o porquê de cada um. */
export function RatingChip({ rating, title, competitive = false, assessment = false }: { rating: R; title: string; competitive?: boolean; assessment?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  const lg = !competitive || rating.overall === null ? null : leagueOf(rating.overall);
  const tcStyle = lg ? ({ "--tc": lg.c1 } as React.CSSProperties) : undefined;
  const shown = rating.attrs;
  return (
    <div className="ovr" ref={ref} data-tour="rating">
      <button className="ovr-chip" style={tcStyle} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)}
        title={rating.overall === null ? t("Nota geral do desenho: monte e simule para ver") : t("Nota geral do desenho: {n} ({nivel})", { n: rating.overall, nivel: competitive && lg ? t(lg.name) : assessment ? t("Avaliação sem dicas") : t("Prática") })}>
        {lg ? <LeagueBadge league={lg} size={24} label={false} /> : null}
        <b className="ovr-num num">{rating.overall ?? "—"}</b>
        <span className="ovr-lbl"><small>OVR</small>{lg ? <em>{t(lg.name)}</em> : <em>{rating.overall === null ? t("sem nota") : assessment ? t("Avaliações") : t("Prática")}</em>}</span>
      </button>
      {open && (
        <div className="ovr-pop" style={tcStyle} role="dialog" aria-label={t("Nota geral do desenho")}>
          <div className="ovr-head">
            {lg ? <LeagueBadge league={lg} size={62} label={false} /> : null}
            <div className="ovr-id">
              <span className="ovr-tier">{lg ? t(lg.name) : rating.overall === null ? t("Sem nota ainda") : assessment ? t("Resultado da avaliação") : t("Nota de prática")}</span>
              <div className="ovr-score"><b className="num">{rating.overall ?? "—"}</b><small>OVR</small></div>
              <strong>{title}</strong>
              <small>{t("Média ponderada dos seis atributos abaixo.")}</small>
            </div>
          </div>
          <div className="ovr-grid" aria-hidden>
            {shown.map((a) => <div key={a.id} className={`ovr-stat${a.score === null ? " na" : ""}`}><b className="num">{a.score ?? "—"}</b><small>{a.abbr}</small></div>)}
          </div>
          <ul className="ovr-list">
            {shown.map((a) => (
              <li key={a.id}>
                <div className="ovr-row"><span>{a.label}<small>{Math.round(a.weight * 100)}%</small></span><b className="num">{a.score ?? "—"}</b></div>
                <div className="ovr-bar" role="img" aria-label={`${a.label}: ${a.score ?? t("sem medida")}`}><i className={a.score !== null && a.score < 60 ? "low" : a.score !== null && a.score < 80 ? "mid" : ""} style={{ width: `${a.score ?? 0}%` }} /></div>
                <p>{a.why}{a.tip && <><br /><span className="ovr-tip"><Icon name="lightbulb" size={13} /> {a.tip}</span></>}</p>
              </li>
            ))}
          </ul>
          <p className="ovr-note">{assessment ? t("Os pontos gerais e da temporada usam somente seu melhor resultado por empresa, sem somar tentativas repetidas.") : t("Nota de ensino: calculada com os perfis fictícios do simulador, na carga atual. Muda quando você edita o desenho ou o tráfego.")}</p>
        </div>
      )}
    </div>
  );
}
