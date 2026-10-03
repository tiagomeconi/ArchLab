import { Icon, fmt } from "./ui";
import { t } from "./i18n";

export interface Sample { t: number; offered: number; completed: number; worstName?: string; worstUtil?: number; p95?: number | null }
export type RunStatus = "idle" | "running" | "stopped" | "completed";
export const DURATION = 300; // s simulados (spec §10.1)

const STATUS_TEXT: Record<RunStatus, string> = { idle: "", running: "Simulando…", stopped: "Interrompida", completed: "Concluída" };

/** Resultado da simulação: série temporal (com tabela equivalente) e totais. Valores modelados, não medidos. */
export function SimPanel({ status, t: time, series, chaos = [], collapsed = false, onToggle }: {
  status: RunStatus; t: number; series: Sample[]; chaos?: string[]; collapsed?: boolean; onToggle?: () => void;
}) {
  const last = series[series.length - 1];
  const totOffered = series.reduce((a, s) => a + s.offered, 0);
  const totDone = series.reduce((a, s) => a + s.completed, 0);
  const errPct = totOffered > 0 ? (1 - totDone / totOffered) * 100 : 0;
  const max = Math.max(1, ...series.map((s) => s.offered));
  const W = 400, H = 84;
  const x = (i: number) => (series.length <= 1 ? 0 : (i / (DURATION - 1)) * W);
  const y = (v: number) => H - 6 - (v / max) * (H - 14);
  const line = (key: "offered" | "completed") => series.map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(s[key]).toFixed(1)}`).join(" ");
  const area = series.length > 1 ? `${line("completed")} L${x(series.length - 1).toFixed(1)},${H - 6} L0,${H - 6} Z` : "";
  const summary = t("Pedidos e concluídos por segundo ao longo de {n} s. Erro acumulado {pct}%.", { n: series.length, pct: errPct.toFixed(1) });
  const errBad = errPct > 0.1;

  if (collapsed) {
    return (
      <section className="panel simpanel min" aria-label={t("Resultado da simulação (recolhido)")}>
        <Icon name="monitoring" size={17} />
        <b>{t("Resultado")}</b>
        <span className={`sim-state ${status}`}>{t(STATUS_TEXT[status])}</span>
        <span className="num sim-mini">{fmt(last?.completed ?? 0)}/s · erro {errPct.toFixed(errPct < 10 ? 1 : 0)}%{last?.p95 != null ? ` · p95 ${Math.round(last.p95)} ms` : ""}</span>
        <button className="icon-btn" aria-label={t("Expandir resultado")} title={t("Expandir")} onClick={onToggle}><Icon name="expand_less" size={18} /></button>
      </section>
    );
  }
  return (
    <section className="panel simpanel" aria-label={t("Resultado da simulação")}>
      <div className="sim-head">
        <b><Icon name="monitoring" size={17} />{" "}{t("Resultado")}</b>
        <span className={`sim-state ${status}`}>{t(STATUS_TEXT[status])}</span>
        <span className="num sim-time">{time} / {DURATION} s</span>
        <button className="icon-btn" aria-label={t("Recolher resultado")} title={t("Recolher")} onClick={onToggle}><Icon name="expand_more" size={18} /></button>
      </div>
      {chaos.length > 0 && <p className="chaos-line"><Icon name="local_fire_department" size={14} /> Caos ativo: {chaos.join(" · ")}</p>}
      <div className="sim-grid">
        <div className="sim-chart">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={summary}>
            <line x1="0" y1={H - 6} x2={W} y2={H - 6} className="axis" />
            {area && <path d={area} className="area" />}
            {series.length > 1 && <path d={line("offered")} className="l-offered" fill="none" />}
            {series.length > 1 && <path d={line("completed")} className="l-done" fill="none" />}
          </svg>
          <div className="legend"><span><i className="k off" />{" "}{t("Oferecidas")}</span><span><i className="k done" />{" "}{t("Concluídas")}</span></div>
        </div>
        <div className="sim-stats">
          <div className="stat"><span>{t("Oferecidas")}</span><b className="num">{fmt(last?.offered ?? 0)}/s</b></div>
          <div className="stat"><span>{t("Concluídas")}</span><b className="num">{fmt(last?.completed ?? 0)}/s</b></div>
          <div className={`stat${errBad ? " bad" : ""}`}><span>{t("Erro acumulado")}</span><b className="num">{errPct.toFixed(errPct < 10 ? 1 : 0)}%</b></div>
          <div className="stat"><span>{t("Latência p95 (proxy)")}</span><b className="num">{last?.p95 == null ? "—" : `${Math.round(last.p95)} ms`}</b></div>
          <div className="stat"><span>{t("Gargalo agora")}</span><b>{last?.worstName ? `${last.worstName} · ${Math.round((last.worstUtil ?? 0) * 100)}%` : "—"}</b></div>
        </div>
      </div>
      <details className="sim-table">
        <summary>{t("Ver tabela dos últimos segundos")}</summary>
        <table>
          <thead><tr><th>t (s)</th><th>{t("Oferecidas/s")}</th><th>{t("Concluídas/s")}</th><th>{t("Gargalo")}</th></tr></thead>
          <tbody>{series.slice(-8).reverse().map((s) => (
            <tr key={s.t}><td className="num">{s.t}</td><td className="num">{fmt(s.offered)}</td><td className="num">{fmt(s.completed)}</td>
              <td>{s.worstName ? `${s.worstName} ${Math.round((s.worstUtil ?? 0) * 100)}%` : "—"}</td></tr>
          ))}</tbody>
        </table>
      </details>
      <p className="note">Modelo pedagógico com perfis fictícios: “erro” aqui é rejeição por capacidade; latência ainda não é simulada.</p>
    </section>
  );
}
