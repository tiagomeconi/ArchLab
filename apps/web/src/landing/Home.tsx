import { useMemo } from "react";
import { useAuth } from "../auth";
import { loadProgress } from "../progress";
import { ALL_CASES, dayPart, homeSummary, weeklyChallenge } from "../home";
import { levelLocked } from "../plan";
import { PointsCard } from "./PointsCard";
import { useAssessmentProfile } from "./useAssessmentProfile";
import { StreakCard } from "./StreakCard";
import { useJourney } from "./useJourney";
import { useMyDesigns } from "./useMyDesigns";
import { DesignThumb } from "./DesignThumb";
import { takeNewlyUnlocked } from "../achievements";
import { go, link } from "../nav";
import { newDesignId } from "../session";
import { BrandMark, Icon } from "../ui";
import { t, useLang } from "../i18n";
import { cn } from "./lib/utils";
import { BlurFade } from "./ui/blur-fade";
import { Level, openCase } from "./Start";
import type { StudyCase } from "../cases";

const card = "rounded-2xl border border-line bg-surface";
const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondary = cn(button, "border border-line text-text-2 hover:border-line-strong hover:bg-track hover:text-text");

/** Logo da empresa, ou o ícone do caso quando é um sistema clássico. */
function CaseMark({ c, height = 40 }: { c: StudyCase; height?: number }) {
  if (c.company) return <BrandMark id={c.company.logo} name={c.company.name} color={c.company.brand} height={height} />;
  return <span aria-hidden className="grid shrink-0 place-items-center rounded-xl bg-track" style={{ width: height, height }}><Icon name={c.icon} size={Math.round(height * 0.55)} /></span>;
}

function Shortcut({ to, icon, title, text, onClick }: { to?: string; icon: string; title: string; text: string; onClick?: () => void }) {
  const body = <><span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-track text-text-2 transition-colors group-hover:bg-accent-soft group-hover:text-accent"><Icon name={icon} size={20} /></span>
    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-relaxed text-text-2">{text}</span></span><span className="shrink-0 text-text-2 transition-transform group-hover:translate-x-0.5"><Icon name="arrow_forward" size={17} /></span></>;
  const cls = cn(card, "group flex h-full items-start gap-3 p-4 text-left transition-colors hover:border-accent/50 hover:bg-accent/5");
  return to ? <a {...link(to)} className={cls}>{body}</a> : <button type="button" onClick={onClick} className={cls}>{body}</button>;
}

/** A ação principal é retomar o desenho; liga, desafio e materiais ficam como apoio. */
export function Home() {
  useLang();
  const auth = useAuth();
  const competitive = useAssessmentProfile();
  const progress = useMemo(loadProgress, []);
  const j = useJourney();
  const [designs] = useMyDesigns();
  const fresh = useMemo(() => takeNewlyUnlocked(j.ach), [j.ach]);
  const nextAch = useMemo(() => j.ach.filter((a) => !a.unlocked).sort((a, b) => b.pct - a.pct)[0], [j.ach]);
  const h = useMemo(() => homeSummary(progress), [progress]);
  const meta = auth.user?.user_metadata ?? {};
  const first = String(meta.name ?? "").trim().split(/\s+/)[0] || (auth.user?.email ?? "").split("@")[0] || "";
  const part = dayPart(new Date().getHours());
  const hello = part === "morning" ? t("Bom dia, {nome}", { nome: first }) : part === "afternoon" ? t("Boa tarde, {nome}", { nome: first }) : t("Boa noite, {nome}", { nome: first });
  const hello0 = part === "morning" ? t("Bom dia") : part === "afternoon" ? t("Boa tarde") : t("Boa noite");
  const sub = h.done || h.started ? t("Retome sua arquitetura, teste novas ideias e acompanhe sua evolução.") : t("Bem-vindo ao ArchLab. Comece por um caso guiado ou desenhe o seu próprio sistema.");
  const challenge = useMemo(() => weeklyChallenge(new Date(), ALL_CASES.filter((c) => !levelLocked(c.level))), [auth.user?.id]);
  const challengeDone = !!challenge && progress[challenge.case.id]?.status === "done" && progress[challenge.case.id]!.updatedAt >= challenge.start.getTime();
  const n = h.next, p = n ? progress[n.id] : undefined;
  const saved = n ? designs?.find((d) => d.key === n.id) : undefined;
  const pct = p && p.total ? Math.min(100, Math.round((p.met / p.total) * 100)) : 0;
  const featured = j.ach.filter((a) => a.unlocked).slice(-3).reverse();

  return <>
    <BlurFade>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0"><h1 className="text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-tight tracking-[-0.024em]">{first ? hello : hello0}</h1><p className="mt-2 max-w-xl text-[15px] leading-relaxed text-text-2">{sub}</p></div>
        <a {...link("/start/estudo")} className={secondary}>{t("Explorar casos")}<Icon name="arrow_forward" size={17} /></a>
      </header>
      <dl aria-label={t("Seu progresso")} className="mt-6 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-surface">
        {[["task_alt", t("Concluídos"), h.done, ` / ${h.total}`], ["flag", t("Em curso"), h.started, ""], ["emoji_events", t("Melhor nota de prática"), h.best ? Math.round(h.best) : "—", ""]].map(([icon, label, value, suffix]) => <div key={label} className="min-w-0 px-3 py-4 sm:px-5"><dt className="flex items-center gap-2 text-xs text-text-2"><span className="hidden shrink-0 sm:inline-block"><Icon name={String(icon)} size={16} /></span>{label}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}<span className="text-sm font-normal text-text-2">{suffix}</span></dd></div>)}
      </dl>
    </BlurFade>

    <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid min-w-0 gap-7">
        <BlurFade delay={0.05}>
          <section aria-labelledby="home-continue" style={n?.company ? ({ "--brand": n.company.brand } as React.CSSProperties) : undefined} className={cn(card, "relative overflow-hidden border-accent/25 p-5 sm:p-7")}>
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full opacity-[.12] blur-3xl" style={{ background: n?.company ? "var(--brand)" : "var(--accent)" }} />
            {n ? <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="home-continue" className="text-xs font-semibold uppercase tracking-wider text-text-2">{h.resume ? t("Continuar de onde parou") : t("Comece por aqui")}</h2><span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"><Icon name={h.resume ? "draw" : "school"} size={14} />{h.resume ? t("Em andamento") : t("Caso guiado")}</span></div>
              <div className={cn("mt-5 grid items-center gap-5", saved && "sm:grid-cols-[minmax(0,1fr)_minmax(140px,35%)]")}>
                <div className="min-w-0"><div className="flex items-center gap-3"><CaseMark c={n} height={42} /><div className="min-w-0"><h3 className="truncate text-3xl font-semibold tracking-tight">{t(n.title)}</h3><div className="mt-1"><Level level={n.level} /></div></div></div><p className="mt-4 line-clamp-2 max-w-xl text-sm leading-relaxed text-text-2">{t(n.summary)}</p></div>
                {saved && <button type="button" onClick={() => openCase(n)} aria-label={t("Retomar desenho de {caso}", { caso: t(n.title) })} className="hidden overflow-hidden rounded-xl border border-line bg-bg/50 p-2 sm:block transition-colors hover:border-accent"><DesignThumb snap={saved.snap} w={360} h={180} /><span className="block pb-1 text-center text-[11px] text-text-2">{t("Seu desenho salvo")}</span></button>}
              </div>
              {p && <div className="mt-5"><div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="text-text-2">{t("{met} de {total} verificações cumpridas", { met: p.met, total: p.total })}</span>{p.ovr ? <span className="inline-flex items-center gap-1.5 tabular-nums text-text-2">{t("Prática")} · OVR <b className="text-text">{p.ovr}</b></span> : null}</div><div className="h-1.5 overflow-hidden rounded-full bg-track" role="img" aria-label={t("{met} de {total} verificações cumpridas", { met: p.met, total: p.total })}><i className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} /></div></div>}
              <div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={() => openCase(n)} className={cn(button, "bg-accent px-5 text-on-accent hover:bg-accent/90")}>{h.resume ? t("Retomar") : t("Começar")}<Icon name="arrow_forward" size={17} /></button><a {...link("/desenhos")} className={secondary}><Icon name="folder_open" size={17} />{t("Meus desenhos")}</a></div>
            </div> : <div className="relative py-3"><span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent"><Icon name="verified" size={25} /></span><h2 id="home-continue" className="mt-4 text-2xl font-semibold">{t("Você concluiu todos os casos")}</h2><p className="mt-3 max-w-md text-sm leading-relaxed text-text-2">{t("Que tal desenhar o seu próprio sistema? Use o modo livre e leve a sua arquitetura para o limite.")}</p><a {...link("/start/livre")} className={cn(button, "mt-6 bg-accent text-on-accent hover:bg-accent/90")}>{t("Desenhar meu sistema")}<Icon name="arrow_forward" size={17} /></a></div>}
          </section>
        </BlurFade>

        {h.suggestions.length > 0 && <BlurFade delay={0.1}>
          <section aria-label={t("Para treinar a seguir")}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold tracking-tight">{t("Para treinar a seguir")}</h2><a {...link("/start/estudo")} className="inline-flex items-center gap-1 text-xs font-semibold text-accent">{t("Ver todos os casos")}<Icon name="arrow_forward" size={15} /></a></div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">{h.suggestions.map((c) => <button key={c.id} type="button" onClick={() => openCase(c)} className={cn(card, "group flex min-w-0 flex-col items-start p-4 text-left transition-colors hover:border-accent/50 hover:bg-accent/5")}><div className="flex w-full items-center justify-between gap-2"><CaseMark c={c} height={28} /><span className="text-text-2 transition-transform group-hover:translate-x-0.5"><Icon name="arrow_forward" size={16} /></span></div><h3 className="mt-4 text-sm font-semibold">{t(c.title)}</h3><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-2">{t(c.company?.focus ?? c.summary)}</p><span className="mt-auto pt-4"><Level level={c.level} /></span></button>)}</div>
          </section>
        </BlurFade>}

        <BlurFade delay={0.15}><section aria-label={t("Começar algo novo")}><h2 className="text-lg font-semibold tracking-tight">{t("Começar algo novo")}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Shortcut to="/start/estudo" icon="school" title={t("Treinar para uma entrevista")} text={t("Escolha entre {n} casos com requisitos e metas de escala já definidos.", { n: h.total })} />
          <Shortcut to="/start/livre" icon="draw" title={t("Desenhar meu sistema")} text={t("Registre requisitos e metas e desenhe a sua arquitetura com a ajuda do simulador.")} />
          <Shortcut icon="grid_on" title={t("Canvas em branco")} text={t("Abra o laboratório vazio e monte do zero, sem requisitos.")} onClick={() => go(`/app?blank=1&d=${newDesignId()}`)} />
          <Shortcut to="/start/aulas" icon="auto_stories" title={t("Aulas")} text={t("Documentação do básico ao avançado, em artigos curtos.")} />
        </div></section></BlurFade>

        <BlurFade delay={0.2}><section aria-label={t("Conquistas")} className={cn(card, "p-5")}>
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="text-accent"><Icon name="emoji_events" size={19} /></span><h2 className="text-sm font-semibold">{t("Conquistas")}</h2><span className="rounded-full bg-track px-2 py-0.5 text-xs tabular-nums text-text-2">{j.unlocked}/{j.ach.length}</span></div><a {...link("/perfil#conquistas")} className="inline-flex items-center gap-1 text-xs font-semibold text-accent">{t("Ver todas")}<Icon name="arrow_forward" size={15} /></a></div>
          {fresh.length > 0 && <p role="status" className="mt-3 text-sm text-accent"><b>{fresh.length === 1 ? t("Nova conquista:") : t("Novas conquistas:")}</b> {fresh.map((a) => t(a.title)).join(" · ")}</p>}
          {featured.length > 0 && <ul className="mt-4 flex flex-wrap gap-2">{featured.map((a) => <li key={a.id} className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs"><span className="text-accent"><Icon name={a.icon} size={15} /></span>{t(a.title)}</li>)}</ul>}
          {nextAch && <div className="mt-4 border-t border-line pt-3"><div className="flex flex-wrap items-center justify-between gap-2 text-xs"><p className="text-text-2">{t("Próxima:")} <b className="font-medium text-text">{t(nextAch.title)}</b></p><span className="tabular-nums text-text-2">{nextAch.have}/{nextAch.goal}</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-track" role="img" aria-label={`${t(nextAch.title)}: ${nextAch.have}/${nextAch.goal}`}><i className="block h-full rounded-full bg-accent/60" style={{ width: `${Math.min(100, nextAch.pct)}%` }} /></div></div>}
        </section></BlurFade>
      </div>

      <aside aria-label={t("Sua jornada")} className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <BlurFade delay={0.08}><section aria-label={t("Sua pontuação")} className={cn(card, "h-full p-5")}><div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-xs font-semibold uppercase tracking-wide text-text-2">{t("Sua pontuação")}</h2>{auth.status === "in" && <a {...link("/perfil")} className="text-xs font-semibold text-accent">{t("Ver perfil")}<span className="sr-only"> · {t("Sua pontuação")}</span></a>}</div><PointsCard profile={competitive.profile} loading={competitive.loading} error={competitive.error} /></section></BlurFade>
        {challenge && <BlurFade delay={0.12}><section aria-label={t("Desafio da semana")} className={cn(card, "h-full p-5")}><div className="flex items-center justify-between gap-2"><h2 className="text-xs font-semibold uppercase tracking-wide text-text-2">{t("Desafio da semana")}</h2><span className="rounded-full bg-track px-2 py-1 text-[11px] text-text-2">{t("Termina em {n} dias.", { n: challenge.daysLeft })}</span></div><div className="mt-5 flex items-center gap-3"><CaseMark c={challenge.case} height={32} /><div className="min-w-0"><h3 className="truncate font-semibold">{t(challenge.case.company?.name ?? challenge.case.title)}</h3><Level level={challenge.case.level} /></div></div><p className="mt-3 line-clamp-2 text-xs leading-relaxed text-text-2">{t(challenge.case.company?.focus ?? challenge.case.summary)}</p>{challengeDone ? <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ok"><Icon name="check_circle" size={18} />{t("Concluído nesta semana. Volte na segunda para o próximo.")}</p> : <button type="button" onClick={() => openCase(challenge.case)} className={cn(secondary, "mt-4 w-full")}>{t("Aceitar o desafio")}<Icon name="arrow_forward" size={16} /></button>}</section></BlurFade>}
        <BlurFade delay={0.16}><section aria-label={t("Sequência de dias")} className={cn(card, "h-full p-5")}><h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-2">{t("Sequência de dias")}</h2><StreakCard days={j.days} compact /></section></BlurFade>
        {!h.done && <BlurFade delay={0.18}><section aria-label={t("Aprender system design")} className="h-full rounded-2xl border border-accent/25 bg-accent/5 p-5"><span className="text-accent"><Icon name="auto_stories" size={24} /></span><h2 className="mt-3 text-sm font-semibold">{t("Nunca fez system design? Comece pelas aulas.")}</h2><p className="mt-2 text-xs leading-relaxed text-text-2">{t("Documentação do básico ao avançado, em artigos curtos.")}</p><a {...link("/start/aulas")} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">{t("Ler as aulas")}<Icon name="arrow_forward" size={16} /></a></section></BlurFade>}
      </aside>
    </div>
  </>;
}
