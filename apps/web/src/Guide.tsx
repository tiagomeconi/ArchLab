import { useEffect, useMemo, useRef, useState } from "react";
import { Chip } from "./Brief";
import { buildStages, TOTAL_MINUTES } from "./guide";
import type { Check } from "./requirements";
import { Icon, usePref } from "./ui";
import type { Session } from "./session";
import { t, useLang } from "./i18n";

const mmss = (s: number) => `${String(Math.floor(Math.abs(s) / 60)).padStart(2, "0")}:${String(Math.abs(s) % 60).padStart(2, "0")}`;

/** Guia de entrevista: etapas com tempo sugerido, perguntas do entrevistador, verificações ao vivo e cronômetro de 45 minutos. */
export function Guide({ session, checks, onStages }: { session: Session; checks: Check[]; onStages?: (done: number) => void }) {
  const key = session.caseId ?? "free";
  const lang = useLang();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stages = useMemo(() => buildStages(session), [session, lang]);
  const [done, setDone] = usePref<Record<string, boolean>>(`guide:${key}`, {});
  const [elapsed, setElapsed] = usePref<number>(`timer:${key}`, 0);
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState<string>(() => stages.find((s) => !done[s.id])?.id ?? stages[0]!.id);
  const last = useRef(0);
  const doneCount = stages.filter((s) => done[s.id]).length;
  useEffect(() => { onStages?.(doneCount); }, [doneCount, onStages]);

  useEffect(() => {
    if (!running) return;
    last.current = performance.now();
    const id = setInterval(() => { const now = performance.now(); const d = Math.floor((now - last.current) / 1000); if (d >= 1) { last.current += d * 1000; setElapsed((e) => e + d); } }, 500);
    return () => clearInterval(id);
  }, [running, setElapsed]);

  const total = TOTAL_MINUTES * 60, left = total - elapsed, over = left < 0;
  // etapa "atual" pelo tempo: soma dos minutos sugeridos
  let acc = 0; const byTime = stages.find((s) => { acc += s.minutes * 60; return elapsed < acc; })?.id;

  return (
    <div className="brief-body">
      <header className="brief-head"><span className="tag">{t("Modo entrevista")}</span><h2>{t("Guia de {n} minutos", { n: TOTAL_MINUTES })}</h2>
        <p className="lead">{t("Percorra as etapas como numa entrevista real. Cada uma traz as perguntas do entrevistador e o que o laboratório já consegue verificar.")}</p></header>

      <div className="timer" role="timer" aria-label={t("Cronômetro da entrevista")}>
        <div className="timer-main">
          <b className={`num${over ? " over" : ""}`}>{over ? "+" : ""}{mmss(left)}</b>
          <span className="timer-sub">{over ? t("tempo esgotado") : running ? t("em andamento") : elapsed ? t("pausado") : t("pronto para começar")}</span>
        </div>
        <button className="chip" onClick={() => setRunning((r) => !r)} aria-label={running ? t("Pausar") : t("Iniciar")}><Icon name={running ? "pause" : "play_arrow"} size={16} />{running ? t("Pausar") : elapsed ? t("Continuar") : t("Iniciar")}</button>
        <button className="chip icon-only" onClick={() => { setRunning(false); setElapsed(0); }} aria-label={t("Zerar cronômetro")} title={t("Zerar")} disabled={!elapsed}><Icon name="restart_alt" size={16} /></button>
      </div>
      <div className="score" aria-label={t("{a} de {b} etapas concluídas", { a: doneCount, b: stages.length })}>
        <div className="score-bar"><i style={{ width: `${(doneCount / stages.length) * 100}%` }} /></div><b className="num">{doneCount}/{stages.length}</b>
      </div>

      <ol className="stages">
        {stages.map((s, i) => {
          const mine = checks.filter(s.pick); const isOpen = open === s.id;
          return (
            <li key={s.id} className={`stage${done[s.id] ? " done" : ""}${running && byTime === s.id ? " now" : ""}`}>
              <div className="stage-head">
                <label className="check" title={t("Marcar etapa como concluída")}><input type="checkbox" checked={!!done[s.id]} onChange={() => setDone((d) => ({ ...d, [s.id]: !d[s.id] }))} aria-label={t("Etapa {n} concluída: {titulo}", { n: i + 1, titulo: s.title })} /></label>
                <button className="stage-title" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : s.id)}>
                  <span className="stage-ico"><Icon name={s.icon} size={16} /></span>
                  <span><b>{i + 1}. {s.title}</b><small>{s.minutes} min{running && byTime === s.id ? ` · ${t("agora")}` : ""}</small></span>
                  <Icon name={isOpen ? "expand_less" : "expand_more"} size={18} />
                </button>
              </div>
              {isOpen && (
                <div className="stage-body">
                  <ul className="blist">{s.asks.map((a) => <li key={a}>{a}</li>)}</ul>
                  {s.hint && <p className="stage-hint"><Icon name="lightbulb" size={14} /> {s.hint}</p>}
                  {mine.length > 0 && <ul className="reqs" style={{ marginTop: 8 }}>{mine.map((c) => <li key={c.id}><div><b>{c.label}</b></div><Chip s={c.status} /></li>)}</ul>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
