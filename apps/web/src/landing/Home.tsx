import { useMemo } from "react";
import { useAuth } from "../auth";
import { loadProgress } from "../progress";
import { ALL_CASES, dayPart, homeSummary, weeklyChallenge } from "../home";
import { levelLocked, lessonLocked } from "../plan";
import { LESSONS } from "../lessons";
import { loadLessons } from "../lessonProgress";
import { openLesson } from "../lessonNav";
import { profileOverall } from "../leagues";
import { LeagueCard } from "./LeagueCard";
import { StreakCard } from "./StreakCard";
import { useJourney } from "./useJourney";
import { takeNewlyUnlocked } from "../achievements";
import { go, link } from "../nav";
import { newDesignId } from "../session";
import { BrandMark, Icon } from "../ui";
import { leagueOf } from "../leagues";
import { LeagueBadge } from "../LeagueBadge";
import { t, useLang } from "../i18n";
import { cn } from "./lib/utils";
import { BlurFade } from "./ui/blur-fade";
import { Level, openCase } from "./Start";
import type { StudyCase } from "../cases";

const card = "rounded-3xl border border-line bg-surface";

/** Logo da empresa, ou o ícone do caso quando é um sistema clássico. */
function CaseMark({ c, height = 40 }: { c: StudyCase; height?: number }) {
  if (c.company) return <BrandMark id={c.company.logo} name={c.company.name} color={c.company.brand} height={height} />;
  return <span aria-hidden className="grid place-items-center rounded-xl bg-track" style={{ width: height, height }}><Icon name={c.icon} size={Math.round(height * 0.55)} /></span>;
}

function Shortcut({ to, icon, title, text, onClick }: { to?: string; icon: string; title: string; text: string; onClick?: () => void }) {
  const body = (
    <>
      <span aria-hidden className="grid size-11 place-items-center rounded-xl bg-track transition-colors duration-300 group-hover:bg-accent group-hover:text-on-accent"><Icon name={icon} size={22} /></span>
      <span className="mt-4 block text-lg font-semibold tracking-tight">{title}</span>
      <span className="mt-1 block text-sm leading-snug text-text-2">{text}</span>
      <span aria-hidden className="mt-4 inline-flex text-accent transition-transform duration-300 group-hover:translate-x-1"><Icon name="arrow_forward" size={20} /></span>
    </>
  );
  const cls = cn(card, "group block p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_24px_60px_-28px_var(--accent)]");
  return to ? <a {...link(to)} className={cls}>{body}</a> : <button type="button" onClick={onClick} className={cls}>{body}</button>;
}

/** Home do sistema: retomar de onde parou, números da pessoa e atalhos para começar algo novo. */
export function Home() {
  useLang();
  const auth = useAuth();
  const progress = useMemo(loadProgress, []);
  const j = useJourney();
  const fresh = useMemo(() => takeNewlyUnlocked(j.ach), [j.ach]);
  const nextAch = useMemo(() => j.ach.filter((a) => !a.unlocked).sort((a, b) => b.pct - a.pct)[0], [j.ach]);
  const h = useMemo(() => homeSummary(progress), [progress]);
  const meta = auth.user?.user_metadata ?? {};
  const first = String(meta.name ?? "").trim().split(/\s+/)[0] || (auth.user?.email ?? "").split("@")[0] || "";
  const part = dayPart(new Date().getHours());
  const hello = part === "morning" ? t("Bom dia, {nome}", { nome: first }) : part === "afternoon" ? t("Boa tarde, {nome}", { nome: first }) : t("Boa noite, {nome}", { nome: first });
  const hello0 = part === "morning" ? t("Bom dia") : part === "afternoon" ? t("Boa tarde") : t("Boa noite");
  const sub = h.done || h.started ? t("Você concluiu {done} de {total} casos. Continue de onde parou.", { done: h.done, total: h.total }) : t("Bem-vindo ao ArchLab. Comece por um caso guiado ou desenhe o seu próprio sistema.");
  const overall = useMemo(() => profileOverall(ALL_CASES.map((c) => progress[c.id]?.ovr)), [progress]);
  const lessonNext = useMemo(() => { const p = loadLessons(); const l = LESSONS.find((x) => !p[x.id]?.done); return l && !lessonLocked(l) ? { l, started: !!p[l.id], first: !Object.values(p).some((x) => x.done) } : null; }, [auth.user?.id]);
  const challenge = useMemo(() => weeklyChallenge(new Date(), ALL_CASES.filter((c) => !levelLocked(c.level))), [auth.user?.id]);
  const challengeDone = !!challenge && progress[challenge.case.id]?.status === "done" && progress[challenge.case.id]!.updatedAt >= challenge.start.getTime();
  const n = h.next, p = n ? progress[n.id] : undefined;
  const pct = p && p.total ? Math.min(100, Math.round((p.met / p.total) * 100)) : 0;

  return (
    <>
      <BlurFade><h1 className="text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]">{first ? hello : hello0}</h1></BlurFade>
      <BlurFade delay={0.05}><p className="mt-2 max-w-2xl text-lg leading-snug text-text-2">{sub}</p></BlurFade>

      {fresh.length > 0 && (
        <BlurFade delay={0.08}>
          <div role="status" className="mt-6 flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-3.5">
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-on-accent"><Icon name={fresh[0]!.icon} size={22} /></span>
            <p className="text-sm"><b>{fresh.length === 1 ? t("Nova conquista:") : t("Novas conquistas:")}</b> {fresh.map((a) => t(a.title)).join(" · ")}. <a {...link("/perfil#conquistas")} className="font-semibold text-accent hover:underline">{t("Ver conquistas")}</a></p>
          </div>
        </BlurFade>
      )}

      {lessonNext && (
        <BlurFade delay={0.085}>
          <section aria-label={t("Aulas guiadas")} className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4">
            <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-on-accent"><Icon name="auto_stories" size={24} /></span>
            <div className="min-w-[13rem] flex-1">
              <p className="font-semibold">{lessonNext.first ? t("Nunca fez system design? Comece pelas aulas.") : t("Continue suas aulas.")}</p>
              <p className="truncate text-sm text-text-2">{t(lessonNext.l.title)} · {t("{n} min", { n: lessonNext.l.minutes })}</p>
            </div>
            <button onClick={() => openLesson(lessonNext.l)} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90">{lessonNext.started ? t("Continuar") : t("Começar")}<Icon name="arrow_forward" size={16} /></button>
          </section>
        </BlurFade>
      )}

      {challenge && (
        <BlurFade delay={0.09}>
          <section aria-label={t("Desafio da semana")} className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-4">
            <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><Icon name="emoji_events" size={24} /></span>
            <div className="min-w-[13rem] flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-2">{t("Desafio da semana")}</p>
              <p className="truncate font-semibold">{t(challenge.case.company?.name ?? challenge.case.title)} <span className="font-normal text-text-2">· {t(challenge.case.level)}</span></p>
              <p className="text-sm text-text-2">{challengeDone ? t("Concluído nesta semana. Volte na segunda para o próximo.") : t("Termina em {n} dias.", { n: challenge.daysLeft })}</p>
            </div>
            {challengeDone ? <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ok"><Icon name="check_circle" size={20} />{t("Concluído")}</span>
              : <button onClick={() => openCase(challenge.case)} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90">{t("Aceitar o desafio")}<Icon name="arrow_forward" size={16} /></button>}
          </section>
        </BlurFade>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_20rem]">
        <BlurFade delay={0.1} className="min-w-0">
          <section aria-labelledby="home-continue" style={n?.company ? ({ "--brand": n.company.brand } as React.CSSProperties) : undefined} className={cn(card, "relative h-full overflow-hidden p-7")}>
            <span aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full opacity-[.16] blur-3xl" style={{ background: n?.company ? "var(--brand)" : "var(--accent)" }} />
            {n ? (
              <div className="relative flex h-full flex-col">
                <h2 id="home-continue" className="text-sm font-semibold uppercase tracking-wide text-text-2">{h.resume ? t("Continuar de onde parou") : t("Comece por aqui")}</h2>
                <div className="mt-5 flex items-center gap-4"><CaseMark c={n} height={44} /><div className="min-w-0"><h3 className="truncate text-2xl font-semibold tracking-tight">{t(n.title)}</h3><Level level={n.level} /></div></div>
                <p className="mt-3 line-clamp-2 max-w-xl text-text-2">{t(n.summary)}</p>
                {p ? (
                  <div className="mt-5">
                    <div className="mb-1.5 flex items-center justify-between text-sm"><span className="text-text-2">{t("{met} de {total} verificações cumpridas", { met: p.met, total: p.total })}</span>{p.ovr ? <span className="inline-flex items-center gap-1.5 tabular-nums text-text-2"><LeagueBadge league={leagueOf(p.ovr)} size={20} label={false} />OVR <b className="text-text">{p.ovr}</b></span> : null}</div>
                    <div className="h-2 overflow-hidden rounded-full bg-track" role="img" aria-label={t("{met} de {total} verificações cumpridas", { met: p.met, total: p.total })}><i className="block h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} /></div>
                  </div>
                ) : null}
                <div className="mt-auto pt-7"><button type="button" onClick={() => openCase(n)} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent shadow-[0_10px_30px_-12px_var(--accent)] transition-transform duration-300 hover:-translate-y-0.5">{h.resume ? t("Retomar") : t("Começar")}<Icon name="arrow_forward" size={18} /></button></div>
              </div>
            ) : (
              <div className="relative flex h-full flex-col justify-center">
                <h2 id="home-continue" className="text-2xl font-semibold tracking-tight">{t("Você concluiu todos os casos")}</h2>
                <p className="mt-2 max-w-md text-text-2">{t("Que tal desenhar o seu próprio sistema? Use o modo livre e leve a sua arquitetura para o limite.")}</p>
                <div className="mt-6"><a {...link("/start/livre")} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent">{t("Desenhar meu sistema")}<Icon name="arrow_forward" size={18} /></a></div>
              </div>
            )}
          </section>
        </BlurFade>

        <BlurFade delay={0.15}>
          <section aria-label={t("Sua liga")} className={cn(card, "h-full p-6")}>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-text-2">{t("Sua liga")}</h2>
            <LeagueCard overall={overall} badge={76} />
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5 text-center">
              <div><b className="block text-xl tabular-nums">{h.done}<span className="text-sm font-medium text-text-2">/{h.total}</span></b><small className="text-text-2">{t("Concluídos")}</small></div>
              <div><b className="block text-xl tabular-nums">{h.started}</b><small className="text-text-2">{t("Em curso")}</small></div>
              <div><b className="block text-xl tabular-nums">{h.best ? Math.round(h.best) : "—"}</b><small className="text-text-2">{t("Melhor nota")}</small></div>
            </div>
          </section>
        </BlurFade>
      </div>

      <BlurFade delay={0.18}>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section aria-label={t("Sequência de dias")} className={cn(card, "p-6")}>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-text-2">{t("Sequência de dias")}</h2>
            <StreakCard days={j.days} />
          </section>
          <section aria-label={t("Conquistas")} className={cn(card, "p-6")}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-2">{t("Conquistas")}</h2>
              <a {...link("/perfil#conquistas")} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">{t("Ver todas")}<Icon name="arrow_forward" size={16} /></a>
            </div>
            <div className="flex items-baseline gap-2"><b className="text-4xl font-semibold tabular-nums tracking-tight">{j.unlocked}</b><span className="text-text-2">{t("de {total} desbloqueadas", { total: j.ach.length })}</span></div>
            <ul className="mt-4 flex flex-wrap gap-2" aria-hidden>
              {[...j.ach].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)).slice(0, 10).map((a) => (
                <li key={a.id} title={t(a.title)} className={cn("grid size-10 place-items-center rounded-xl", a.unlocked ? "bg-accent text-on-accent" : "bg-track text-text-2/60")}><Icon name={a.unlocked ? a.icon : "lock"} size={20} /></li>
              ))}
            </ul>
            {nextAch && <p className="mt-4 text-sm text-text-2">{t("Próxima:")} <b className="text-text">{t(nextAch.title)}</b> · {nextAch.have}/{nextAch.goal}</p>}
          </section>
        </div>
      </BlurFade>

      <BlurFade delay={0.2}>
        <h2 className="mt-12 text-xl font-semibold tracking-tight">{t("Começar algo novo")}</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          <Shortcut to="/start/estudo" icon="school" title={t("Treinar para uma entrevista")} text={t("Escolha entre {n} casos com requisitos e metas de escala já definidos.", { n: h.total })} />
          <Shortcut to="/start/livre" icon="draw" title={t("Desenhar meu sistema")} text={t("Registre requisitos e metas e desenhe a sua arquitetura com a ajuda do simulador.")} />
          <Shortcut icon="grid_on" title={t("Canvas em branco")} text={t("Abra o laboratório vazio e monte do zero, sem requisitos.")} onClick={() => go(`/app?blank=1&d=${newDesignId()}`)} />
        </div>
      </BlurFade>

      {h.suggestions.length > 0 && (
        <BlurFade delay={0.25}>
          <div className="mt-12 flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">{t("Para treinar a seguir")}</h2>
            <a {...link("/start/estudo")} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">{t("Ver todos os casos")}<Icon name="arrow_forward" size={16} /></a>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {h.suggestions.map((c) => (
              <button key={c.id} type="button" onClick={() => openCase(c)} className={cn(card, "group flex flex-col items-start rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-lg")}>
                <CaseMark c={c} height={32} />
                <span className="mt-4 text-base font-semibold tracking-tight">{t(c.title)}</span>
                <span className="mt-1 line-clamp-2 text-sm leading-snug text-text-2">{t(c.company?.focus ?? c.summary)}</span>
                <span className="mt-4"><Level level={c.level} /></span>
              </button>
            ))}
          </div>
        </BlurFade>
      )}
    </>
  );
}
