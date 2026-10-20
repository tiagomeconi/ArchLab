import { useMemo, useState } from "react";
import "./landing.css";
import { LESSONS, UNITS, type Lesson } from "../lessons";
import { loadLessons, resetLesson, type LessonProgress } from "../lessonProgress";
import { lessonLocked } from "../plan";
import { openLesson } from "../lessonNav";
import { useAuth } from "../auth";
import { go } from "../nav";
import { Icon } from "../ui";
import { t, useLang } from "../i18n";

const clearDesign = (l: Lesson) => { try { localStorage.removeItem(`archlab:design:free-${l.designId}`); } catch { /* ignora */ } };

/** Aulas guiadas: do zero ao raciocínio de system design, um conceito por vez, montando o diagrama passo a passo. */
export function Lessons() {
  useLang(); useAuth();
  const [prog, setProg] = useState<Record<string, LessonProgress>>(loadLessons);
  const firstOpen = useMemo(() => LESSONS.find((l) => !prog[l.id]?.done), [prog]);
  const done = LESSONS.filter((l) => prog[l.id]?.done).length;
  const start = (l: Lesson) => { if (lessonLocked(l)) { go("/planos"); return; } openLesson(l); };
  const redo = (l: Lesson) => { if (!confirm(t("Refazer a aula do zero? O desenho dela será apagado."))) return; resetLesson(l.id); clearDesign(l); setProg(loadLessons()); openLesson(l); };

  return (
    <>
      <h1 className="text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]">{t("Aulas")}</h1>
      <p className="mt-2 max-w-2xl text-lg leading-snug text-text-2">{t("Nunca fez system design? Comece aqui. Cada aula explica um conceito em linguagem simples e você monta o diagrama passo a passo: o laboratório confere o que você fez antes de liberar o próximo passo.")}</p>
      <p className="mt-3 text-sm text-text-2"><Icon name="desktop_windows" size={15} />{" "}{t("As aulas funcionam melhor no computador.")}{" "}<b className="text-text">{done}/{LESSONS.length}</b> {t("concluídas")}</p>

      {UNITS.map((u, ui) => (
        <section key={u.title} className="mt-9" aria-label={t(u.title)}>
          <h2 className="text-xl font-semibold tracking-tight">{ui + 1}. {t(u.title)}</h2>
          <p className="mt-1 text-sm text-text-2">{t(u.summary)}</p>
          <ol className="mt-4 grid gap-3">
            {LESSONS.filter((l) => l.unit === ui).map((l) => {
              const p = prog[l.id]; const locked = lessonLocked(l); const rec = firstOpen?.id === l.id;
              return (
                <li key={l.id} className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 ${rec ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}>
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${p?.done ? "bg-ok text-bg" : "bg-track text-accent"}`}><Icon name={p?.done ? "check" : l.icon} size={24} /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{t(l.title)}{rec && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent">{t("Próxima")}</span>}</h3>
                    <p className="mt-0.5 text-sm leading-snug text-text-2">{t(l.summary)}</p>
                    <p className="mt-1 text-xs text-text-2">{t("{n} passos", { n: l.steps.length })} · {t("{n} min", { n: l.minutes })}{p && !p.done ? ` · ${t("passo {a} de {b}", { a: Math.min(p.step + 1, l.steps.length), b: l.steps.length })}` : ""}</p>
                  </div>
                  {locked ? <span className="inline-flex items-center gap-1 text-sm font-semibold text-text-2" title={t("Disponível na assinatura")}><Icon name="lock" size={16} />{t("Pro")}</span> : (
                    <span className="flex items-center gap-2">
                      {p && <button className="text-sm font-semibold text-text-2 hover:text-text" onClick={() => redo(l)}>{t("Refazer")}</button>}
                      <button onClick={() => start(l)} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90">
                        {p?.done ? t("Revisar") : p ? t("Continuar") : t("Começar")}<Icon name="arrow_forward" size={16} />
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </>
  );
}
