import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";
import { clock, DURATIONS, phaseAt, PHASES } from "./interview";

/** Estado persistido da entrevista em andamento (sobrevive a recarregar a página). */
export interface Interview { startedAt: number; minutes: number }

/** Botão de iniciar (com a escolha da duração) ou, durante a entrevista, o relógio com a fase atual. */
export function InterviewChip({ active, onStart, onOpen }: { active: Interview | null; onStart: (minutes: number) => void; onOpen: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => { if (!active) return; const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, [active]);
  useEffect(() => {
    if (!menu) return;
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setMenu(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [menu]);
  if (active) {
    const total = active.minutes * 60, elapsed = (now - active.startedAt) / 1000, left = total - elapsed;
    const ph = phaseAt(elapsed, total);
    return (
      <button className={`chip interview-on${left <= 0 ? " over" : ""}`} onClick={onOpen} title={t("Abrir o painel da entrevista")} aria-label={`${t("Modo entrevista")}: ${t(ph.phase.label)}, ${clock(left)}`}>
        <Icon name="timer" size={16} /><b className="num">{left > 0 ? clock(left) : t("Tempo esgotado")}</b><span className="lbl">· {t(ph.phase.label)}</span>
      </button>
    );
  }
  return (
    <span className="interview-start" ref={box}>
      <button className="chip" aria-label={t("Modo entrevista")} aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} title={t("Simule uma entrevista com relógio e fases")}>
        <Icon name="timer" size={16} /><span className="lbl">{t("Modo entrevista")}</span>
      </button>
      {menu && (
        <div className="export-pop interview-pop" role="menu" aria-label={t("Duração da entrevista")}>
          <p className="export-sec" role="presentation">{t("Duração")}</p>
          {DURATIONS.map((m) => <button key={m} role="menuitem" onClick={() => { setMenu(false); onStart(m); }}><Icon name="play_arrow" size={20} /><span><b>{t("{n} minutos", { n: m })}</b></span></button>)}
        </div>
      )}
    </span>
  );
}

export interface InterviewSummary { rating: number | null; met: number; total: number; findings: number; important: number; nodes: number }

/** Painel da entrevista: fase atual, dicas por fase e o fechamento com o resumo do que foi feito. */
export function InterviewPanel({ active, summary, onClose, onFinish }: { active: Interview; summary: InterviewSummary; onClose: () => void; onFinish: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { ref.current?.showModal(); const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const total = active.minutes * 60, elapsed = (now - active.startedAt) / 1000, ph = phaseAt(elapsed, total);
  return (
    <dialog ref={ref} className="dialog interview" onClose={onClose}>
      <div className="chaos-head"><h2><Icon name="timer" size={22} />{" "}{t("Modo entrevista")}</h2>
        <button className="icon-btn" aria-label={t("Fechar")} onClick={() => ref.current?.close()}><Icon name="close" size={18} /></button></div>
      <p className="sub">{t("Tempo restante: {tempo} de {n} minutos.", { tempo: clock(total - elapsed), n: active.minutes })}</p>
      <ol className="phases">
        {PHASES.map((p, i) => (
          <li key={p.id} className={i === ph.index ? "now" : i < ph.index || ph.over ? "past" : ""}>
            <b>{t(p.label)}<small>{Math.round(p.share * active.minutes)} min</small></b>
            <p>{t(p.tip)}</p>
          </li>
        ))}
      </ol>
      <section className="summary" aria-label={t("Seu desenho agora")}>
        <h3>{t("Seu desenho agora")}</h3>
        <div className="sum-grid">
          <div><b className="num">{summary.rating ?? "—"}</b><small>{t("Nota geral")}</small></div>
          <div><b className="num">{summary.total ? `${summary.met}/${summary.total}` : "—"}</b><small>{t("Requisitos")}</small></div>
          <div><b className="num">{summary.nodes}</b><small>{t("Componentes")}</small></div>
          <div><b className="num">{summary.important}</b><small>{t("Pontos importantes")}</small></div>
        </div>
      </section>
      <div className="chaos-foot">
        <span className="spacer" />
        <button className="chip" onClick={() => ref.current?.close()}>{t("Continuar")}</button>
        <button className="chip primary" onClick={() => { ref.current?.close(); onFinish(); }}><Icon name="flag" size={16} />{" "}{t("Encerrar entrevista")}</button>
      </div>
    </dialog>
  );
}

/** Resultado ao encerrar. */
export function InterviewResult({ minutes, usedSec, summary, onClose }: { minutes: number; usedSec: number; summary: InterviewSummary; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  const verdict = summary.rating === null ? t("Monte e simule o desenho para receber uma nota.")
    : summary.rating >= 75 ? t("Boa entrevista: o desenho está sólido. Revise os pontos que sobraram e treine explicar as decisões em voz alta.")
    : summary.rating >= 60 ? t("Caminho certo, mas há pontos importantes a corrigir. Veja a aba Revisão e tente de novo.")
    : t("O desenho ainda tem lacunas sérias. Releia os requisitos e use as dicas antes de tentar outra vez.");
  return (
    <dialog ref={ref} className="dialog interview" onClose={onClose}>
      <div className="chaos-head"><h2><Icon name="flag" size={22} />{" "}{t("Entrevista encerrada")}</h2>
        <button className="icon-btn" aria-label={t("Fechar")} onClick={() => ref.current?.close()}><Icon name="close" size={18} /></button></div>
      <p className="sub">{t("Você usou {tempo} dos {n} minutos.", { tempo: clock(usedSec), n: minutes })}</p>
      <div className="sum-grid big">
        <div><b className="num">{summary.rating ?? "—"}</b><small>{t("Nota geral")}</small></div>
        <div><b className="num">{summary.total ? `${summary.met}/${summary.total}` : "—"}</b><small>{t("Requisitos")}</small></div>
        <div><b className="num">{summary.findings}</b><small>{t("Pontos na revisão")}</small></div>
      </div>
      <p className="verdict">{verdict}</p>
      <div className="chaos-foot"><span className="spacer" /><button className="chip primary" onClick={() => ref.current?.close()}>{t("Fechar")}</button></div>
    </dialog>
  );
}
