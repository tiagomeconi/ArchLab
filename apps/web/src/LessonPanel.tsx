import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./ui";
import { t, useLang } from "./i18n";
import { goalMet, isTransient, type LessonState } from "./lessonGoals";
import type { Lesson } from "./lessons";
import { loadLessons, saveLesson } from "./lessonProgress";
import { lessonLocked } from "./plan";
import { nextLesson } from "./lessonNav";
import { recordToday } from "./activity";
import type { LessonSummary } from "./CompactUI";

/** Texto com **negrito** e *itálico* simples. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return <>{parts.map((p, i): ReactNode => p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : p.startsWith("*") ? <em key={i}>{p.slice(1, -1)}</em> : p)}</>;
}

/** Painel da aula guiada: explica um passo, pede uma ação no canvas e confere sozinho se ela foi feita antes de liberar o próximo. */
export function LessonPanel({ lesson, state, onExit, onNext, onSummary }: { lesson: Lesson; state: LessonState; onExit: () => void; onNext: (l: Lesson) => void; onSummary?: (s: LessonSummary | null) => void }) {
  useLang();
  const [step, setStep] = useState(() => Math.min(loadLessons()[lesson.id]?.step ?? 0, lesson.steps.length - 1));
  const [finished, setFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  // metas de seleção/aba só valem naquele instante: guarda as que já foram vistas no passo atual
  const seen = useRef<Set<number>>(new Set());
  const s = lesson.steps[step]!;
  const met = s.tasks.map((task, i) => (seen.current.has(i) ? true : goalMet(task.goal, state)));
  s.tasks.forEach((task, i) => { if (isTransient(task.goal) && goalMet(task.goal, state)) seen.current.add(i); });
  const allMet = met.every(Boolean);
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => { seen.current = new Set(); setShowHint(false); top.current?.scrollIntoView?.({ block: "nearest" }); }, [step, lesson.id]);

  // avisa o laboratório do passo atual (a faixa da aula, no celular, mostra isso com o painel fechado)
  const metKey = met.join(",");
  useEffect(() => {
    onSummary?.(finished ? null : { step: step + 1, total: lesson.steps.length, title: t(s.title), done: met.filter(Boolean).length, tasks: s.tasks.length, complete: allMet });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, allMet, metKey, finished, lesson.id]);
  useEffect(() => () => onSummary?.(null), []); // eslint-disable-line react-hooks/exhaustive-deps
  const advance = () => {
    if (step + 1 >= lesson.steps.length) { saveLesson(lesson.id, { step: step, done: true }); recordToday(); setFinished(true); return; }
    saveLesson(lesson.id, { step: step + 1, done: false }); setStep(step + 1);
  };
  const next = nextLesson(lesson);

  if (finished) {
    const canNext = next && !lessonLocked(next);
    return (
      <div className="brief-body lesson" role="region" aria-label={t("Aula concluída")}>
        <header className="brief-head"><span className="tag ok"><Icon name="verified" size={14} />{" "}{t("Aula concluída")}</span><h2>{t(lesson.title)}</h2>
          <p className="lead">{t("Você chegou ao fim. O que ficou desta aula:")}</p></header>
        <ul className="blist recap">{lesson.recap.map((r) => <li key={r}><Rich text={t(r)} /></li>)}</ul>
        <div className="lesson-actions">
          {canNext && <button className="chip primary" onClick={() => onNext(next!)}>{t("Próxima aula")}{": "}{t(next!.title)}</button>}
          {next && !canNext && <p className="note">{t("A próxima aula faz parte do plano Pro.")}</p>}
          <button className="chip" onClick={onExit}>{t("Voltar às aulas")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="brief-body lesson" role="region" aria-label={t("Aula")}>
      <header className="brief-head" ref={top}>
        <span className="tag">{t("Aula")} · {t(lesson.title)}</span>
        <div className="lesson-dots" role="img" aria-label={t("Passo {a} de {b}", { a: step + 1, b: lesson.steps.length })}>
          {lesson.steps.map((_, i) => <i key={i} className={i < step ? "done" : i === step ? "now" : ""} />)}
        </div>
        <h2>{t(s.title)}</h2>
      </header>
      <div className="lesson-explain">{s.explain.map((p) => <p key={p}><Rich text={t(p)} /></p>)}</div>

      <section className="lesson-task" aria-label={t("Sua tarefa")}>
        <h3><Icon name="flag" size={15} />{" "}{t("Sua tarefa")}</h3>
        <ul>{s.tasks.map((task, i) => (
          <li key={task.text} className={met[i] ? "ok" : ""}><Icon name={met[i] ? "check_circle" : "radio_button_unchecked"} size={18} /><span>{t(task.text)}</span></li>
        ))}</ul>
        {!allMet && (showHint
          ? <p className="lesson-hint"><Icon name="lightbulb" size={14} />{" "}{t(s.hint)}</p>
          : <button className="link" onClick={() => setShowHint(true)}><Icon name="lightbulb" size={13} />{" "}{t("Preciso de uma dica")}</button>)}
      </section>

      <div aria-live="polite">
        {allMet && (
          <div className="lesson-done" role="status">
            <p><Icon name="celebration" size={18} />{" "}<Rich text={t(s.done)} /></p>
            <button className="chip primary" onClick={advance}>{step + 1 >= lesson.steps.length ? t("Concluir aula") : t("Continuar")}<Icon name="arrow_forward" size={16} /></button>
          </div>
        )}
      </div>
      <div className="lesson-foot">
        {!allMet && <button className="link" onClick={advance}>{t("Pular este passo")}</button>}
        <span className="spacer" />
        <button className="link" onClick={onExit}>{t("Sair da aula")}</button>
      </div>
    </div>
  );
}
