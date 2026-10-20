import { useMemo } from "react";
import "./landing.css";
import { caseById } from "../cases";
import { PATHS, pathProgress, type LearningPath } from "../paths";
import { loadProgress } from "../progress";
import { levelLocked } from "../plan";
import { useAuth } from "../auth";
import { Icon } from "../ui";
import { t, useLang } from "../i18n";
import { Level, openCase } from "./Start";

/** Trilhas de estudo: temas com uma sequência de casos, do mais simples ao mais difícil, e o progresso em cada uma. */
export function Paths() {
  useLang(); useAuth();
  const progress = useMemo(loadProgress, []);
  const done = (id: string) => progress[id]?.status === "done";
  return (
    <>
      <h1 className="text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]">{t("Trilhas de estudo")}</h1>
      <p className="mt-2 max-w-2xl text-lg leading-snug text-text-2">{t("Cada trilha junta casos em ordem de dificuldade, para você aprender um tema de ponta a ponta em vez de pular de assunto.")}</p>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">{PATHS.map((p) => <PathCard key={p.id} p={p} done={done} />)}</div>
    </>
  );
}

function PathCard({ p, done }: { p: LearningPath; done: (id: string) => boolean }) {
  const pr = pathProgress(p, done);
  const next = pr.next && caseById(pr.next.caseId);
  return (
    <section className="rounded-3xl border border-line bg-surface p-6" aria-label={t(p.title)}>
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent"><Icon name={p.icon} size={26} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold tracking-tight">{t(p.title)}</h2>
          <p className="mt-1 text-sm leading-snug text-text-2">{t(p.summary)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3" role="img" aria-label={t("{a} de {b} casos concluídos", { a: pr.done, b: pr.total })}>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-track"><i className="block h-full rounded-full bg-accent transition-all" style={{ width: `${(pr.done / pr.total) * 100}%` }} /></div>
        <b className="num text-sm tabular-nums">{pr.done}/{pr.total}</b>
      </div>
      <ol className="mt-5 grid gap-1.5">
        {p.steps.map((s, i) => {
          const c = caseById(s.caseId); if (!c) return null;
          const ok = done(s.caseId), locked = levelLocked(c.level);
          return (
            <li key={s.caseId}>
              <button onClick={() => openCase(c)} className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-track">
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${ok ? "bg-ok text-bg" : "bg-track text-text-2"}`}>{ok ? <Icon name="check" size={16} /> : i + 1}</span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm font-semibold">{t(c.company?.name ?? c.title)}</b>
                  <small className="block truncate text-xs text-text-2">{t(s.goal)}</small>
                </span>
                {locked ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-2" title={t("Disponível na assinatura")}><Icon name="lock" size={14} />{t("Pro")}</span> : <Level level={c.level} />}
              </button>
            </li>
          );
        })}
      </ol>
      {next && <button onClick={() => openCase(next)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90">{pr.done ? t("Continuar a trilha") : t("Começar a trilha")}<Icon name="arrow_forward" size={16} /></button>}
      {!next && <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ok"><Icon name="verified" size={18} />{t("Trilha concluída")}</p>}
    </section>
  );
}
