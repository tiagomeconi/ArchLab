import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { streakOf } from "../activity";
import { Avatar } from "../AccountMenu";
import { ALL_CASES } from "../home";
import { leagueOf } from "../leagues";
import { LeagueBadge, LeagueLadder } from "../LeagueBadge";
import { link } from "../nav";
import type { CaseProgress } from "../progress";
import { BrandMark, Icon } from "../ui";
import { t, useLang } from "../i18n";
import { cn } from "./lib/utils";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { AchievementGrid } from "./AchievementGrid";
import { DesignThumb } from "./DesignThumb";
import { LeagueCard } from "./LeagueCard";
import { StreakCard } from "./StreakCard";
import { openCase } from "./Start";
import { journeyOf } from "./useJourney";
import type { DesignItem } from "./useMyDesigns";

const card = "rounded-2xl border border-line bg-surface p-6";
type Tab = "visao" | "conquistas" | "casos" | "desenhos" | "atividade";
type Filter = "all" | "done" | "started";
const TABS: Tab[] = ["visao", "conquistas", "casos", "desenhos", "atividade"];

export interface ProfileViewData {
  name: string; handle?: string; photo?: string | null; since?: string; bio?: string;
  progress: Record<string, CaseProgress>; days: string[]; owner: boolean;
  rank?: { rank: number; total: number } | null; designs?: DesignItem[] | null;
}

function AchTile({ icon, title }: { icon: string; title: string }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-3.5 py-3">
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-on-accent"><Icon name={icon} size={22} /></span>
      <span className="min-w-0 text-sm font-semibold leading-tight">{title}</span>
    </li>
  );
}

function CaseRow({ id, p, owner }: { id: string; p: CaseProgress; owner: boolean }) {
  const c = ALL_CASES.find((x) => x.id === id); if (!c) return null;
  const body = (
    <>
      {c.company ? <BrandMark id={c.company.logo} name={c.company.name} color={c.company.brand} height={26} /> : <span aria-hidden className="grid size-[26px] place-items-center rounded-lg bg-track"><Icon name={c.icon} size={16} /></span>}
      <span className="min-w-0 flex-1"><b className="block truncate font-medium">{t(c.title)}</b>
        <small className="text-text-2">{p.status === "done" ? t("Concluído") : t("{met} de {total} verificações cumpridas", { met: p.met, total: p.total })}</small></span>
      {p.ovr ? <span className="inline-flex shrink-0 items-center gap-1.5 tabular-nums" title={t(leagueOf(p.ovr).name)}><LeagueBadge league={leagueOf(p.ovr)} size={22} label={false} /><b>{p.ovr}</b></span> : null}
    </>
  );
  const cls = "flex w-full items-center gap-3 rounded-xl border border-line px-3.5 py-3 text-left";
  return owner ? <button type="button" onClick={() => openCase(c)} className={cn(cls, "transition-colors hover:border-accent hover:bg-accent/5")}>{body}</button> : <div className={cls}>{body}</div>;
}

/** A vitrine de um perfil (a mesma tela para o seu perfil e para o público): cabeçalho com foto e liga, contadores à direita e painéis que trocam ao clicar. */
export function ProfileView({ data, actions }: { data: ProfileViewData; actions?: ReactNode }) {
  useLang();
  const reduced = useReducedMotion();
  const j = useMemo(() => journeyOf(data.progress, data.days), [data.progress, data.days]);
  const streak = useMemo(() => streakOf(j.days), [j.days]);
  const [tab, setTab] = useState<Tab>(() => { const h = location.hash.slice(1) as Tab; return TABS.includes(h) && (h !== "desenhos" || data.owner) ? h : "visao"; });
  const [filter, setFilter] = useState<Filter>("all");
  const pick = (tb: Tab, f: Filter = "all") => { setTab(tb); setFilter(f); history.replaceState(history.state, "", `${location.pathname}${location.search}#${tb}`); };

  const rows = useMemo(() => ALL_CASES.filter((c) => data.progress[c.id]).map((c) => ({ id: c.id, p: data.progress[c.id]! })), [data.progress]);
  const done = rows.filter((r) => r.p.status === "done"), started = rows.filter((r) => r.p.status !== "done");
  const best = [...rows].filter((r) => r.p.ovr).sort((a, b) => (b.p.ovr ?? 0) - (a.p.ovr ?? 0));
  const featured = j.ach.filter((a) => a.unlocked).slice(-5).reverse();
  const shownAch = data.owner ? j.ach : j.ach.filter((a) => a.unlocked);
  const list = filter === "done" ? done : filter === "started" ? started : [...rows].sort((a, b) => Number(b.p.status === "done") - Number(a.p.status === "done") || (b.p.ovr ?? 0) - (a.p.ovr ?? 0));

  const side: { tab: Tab; filter?: Filter; icon: string; label: string; value: string }[] = [
    { tab: "conquistas", icon: "emoji_events", label: t("Conquistas"), value: `${j.unlocked}/${j.ach.length}` },
    { tab: "casos", filter: "done", icon: "task_alt", label: t("Casos concluídos"), value: String(done.length) },
    { tab: "casos", filter: "started", icon: "flag", label: t("Casos em andamento"), value: String(started.length) },
    ...(data.owner ? [{ tab: "desenhos" as Tab, icon: "folder_open", label: t("Desenhos"), value: data.designs ? String(data.designs.length) : "…" }] : []),
    { tab: "atividade", icon: "local_fire_department", label: t("Sequência"), value: t("{n} dias", { n: streak.current }) },
  ];
  const active = (s: (typeof side)[number]) => tab === s.tab && (s.tab !== "casos" || filter === (s.filter ?? "all"));
  const btn = "flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition-colors lg:w-full";

  return (
    <>
      <section className={cn(card, "sm:p-7")} aria-label={t("Perfil")}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative shrink-0">
              <Avatar name={data.name} src={data.photo} size={112} />
              {j.league && <span className="absolute -bottom-2 -right-2 grid place-items-center rounded-full bg-surface p-1.5 ring-4 ring-surface"><LeagueBadge league={j.league.league} size={34} /></span>}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl">{data.name}</h1>
              {data.handle && <p className="text-text-2">@{data.handle}</p>}
              {data.since && <p className="mt-0.5 text-sm text-text-2">{t("Membro desde {data}", { data: data.since })}</p>}
              {data.bio && <p className="mt-3 max-w-md text-[15px] italic leading-snug text-text/90">“{data.bio}”</p>}
              {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-bg/40 p-5"><LeagueCard overall={j.overall} badge={64} /></div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <div className="min-w-0">
          <motion.div key={`${tab}-${filter}`} role="tabpanel" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="grid grid-cols-1 gap-6">
            {tab === "visao" && (
              <>
                {(featured.length > 0 || data.owner) && (
                  <section className={card} aria-label={t("Conquistas em destaque")}>
                    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t("Conquistas em destaque")}</h2>
                      <button type="button" onClick={() => pick("conquistas")} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">{t("Ver todas")}<Icon name="arrow_forward" size={16} /></button></div>
                    {featured.length ? <ul className="grid gap-2.5 sm:grid-cols-2">{featured.map((a) => <AchTile key={a.id} icon={a.icon} title={t(a.title)} />)}</ul>
                      : <p className="text-sm text-text-2">{t("Você ainda não desbloqueou conquistas. Comece um caso para ganhar a primeira.")}</p>}
                  </section>
                )}
                <section className={card} aria-label={t("Melhores casos")}>
                  <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t("Melhores casos")}</h2>
                    {rows.length > 0 && <button type="button" onClick={() => pick("casos")} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">{t("Ver todos")}<Icon name="arrow_forward" size={16} /></button>}</div>
                  {best.length ? <ul className="grid gap-2.5">{best.slice(0, 5).map((r) => <li key={r.id}><CaseRow id={r.id} p={r.p} owner={data.owner} /></li>)}</ul>
                    : <p className="text-sm text-text-2">{data.owner ? t("Termine a simulação de um caso para aparecer aqui com a sua nota.") : t("Ainda sem casos com nota.")}</p>}
                </section>
                <section className={card} aria-label={t("Atividade")}>
                  <h2 className="mb-4 text-lg font-semibold">{t("Atividade")}</h2>
                  <ActivityHeatmap days={j.days} weeks={26} />
                </section>
                <section className={card} aria-label={t("Todas as ligas")}>
                  <h2 className="mb-5 text-lg font-semibold">{t("Todas as ligas")}</h2>
                  <LeagueLadder index={j.league ? j.league.league.index : -1} />
                  <p className="mt-5 text-xs leading-relaxed text-text-2">{t("A liga vem da média das melhores notas dos casos. A cada 10 pontos muda o material.")}</p>
                </section>
              </>
            )}
            {tab === "conquistas" && (
              <section className={card} aria-label={t("Conquistas")}>
                <h2 className="mb-4 text-lg font-semibold">{t("Conquistas")} <span className="text-base font-medium text-text-2">· {j.unlocked}/{j.ach.length}</span></h2>
                {shownAch.length ? <AchievementGrid list={shownAch} /> : <p className="text-sm text-text-2">{t("Nenhuma conquista ainda.")}</p>}
              </section>
            )}
            {tab === "casos" && (
              <section className={card} aria-label={t("Casos")}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">{t("Casos")}</h2>
                  <div className="flex gap-2" role="group" aria-label={t("Filtrar casos")}>
                    {([["all", "Todos"], ["done", "Concluídos"], ["started", "Em andamento"]] as const).map(([f, l]) => (
                      <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors", filter === f ? "border-accent bg-accent text-on-accent" : "border-line hover:bg-track")}>{t(l)}</button>
                    ))}
                  </div>
                </div>
                {list.length ? <ul className="grid gap-2.5">{list.map((r) => <li key={r.id}><CaseRow id={r.id} p={r.p} owner={data.owner} /></li>)}</ul>
                  : <p className="text-sm text-text-2">{t("Nenhum caso por aqui ainda.")}</p>}
              </section>
            )}
            {tab === "desenhos" && data.owner && (
              <section className={card} aria-label={t("Desenhos")}>
                <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t("Desenhos recentes")}</h2>
                  <a {...link("/desenhos")} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">{t("Ver todos os desenhos")}<Icon name="arrow_forward" size={16} /></a></div>
                {!data.designs ? <div className="h-40 animate-pulse rounded-xl bg-track" aria-busy="true" />
                  : data.designs.length ? (
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {data.designs.slice(0, 6).map((d) => (
                        <li key={d.key}><a {...link("/desenhos")} className="block overflow-hidden rounded-xl border border-line transition-colors hover:border-accent"><div className="bg-bg/40 p-2"><DesignThumb snap={d.snap} /></div>
                          <p className="truncate px-3 py-2.5 text-sm font-medium">{d.title.trim() || (ALL_CASES.find((c) => c.id === d.key)?.title ? t(ALL_CASES.find((c) => c.id === d.key)!.title) : d.key === "free" ? t("Canvas livre") : t("Desenho sem nome"))}</p></a></li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-text-2">{t("Você ainda não tem desenhos salvos.")}</p>}
              </section>
            )}
            {tab === "atividade" && (
              <>
                <section className={card} aria-label={t("Sequência de dias")}><h2 className="mb-5 text-lg font-semibold">{t("Sequência de dias")}</h2><StreakCard days={j.days} compact /></section>
                <section className={card} aria-label={t("Atividade")}>
                  <h2 className="mb-4 text-lg font-semibold">{t("Atividade")}</h2>
                  <ActivityHeatmap days={j.days} weeks={53} />
                  <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-5 text-center">
                    {[[t("Sequência atual"), streak.current], [t("Melhor sequência"), streak.best], [t("Dias praticados"), streak.total]].map(([l, v]) => <div key={String(l)}><dd className="text-2xl font-semibold tabular-nums">{v}</dd><dt className="text-xs text-text-2">{l}</dt></div>)}
                  </dl>
                </section>
              </>
            )}
          </motion.div>
        </div>

        <aside aria-label={t("Seções do perfil")} className="order-first min-w-0 lg:order-none lg:sticky lg:top-20">
          <div role="tablist" aria-orientation="vertical" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:grid lg:gap-1 lg:overflow-visible lg:rounded-2xl lg:border lg:border-line lg:bg-surface lg:p-2 lg:pb-2">
            <button type="button" role="tab" aria-selected={tab === "visao"} onClick={() => pick("visao")} className={cn(btn, "border border-line lg:border-0", tab === "visao" ? "bg-track font-semibold" : "text-text-2 hover:bg-track hover:text-text")}>
              <Icon name="dashboard" size={20} /><span className="flex-1 whitespace-nowrap">{t("Visão geral")}</span></button>
            {side.map((s) => (
              <button key={`${s.tab}-${s.filter ?? ""}`} type="button" role="tab" aria-selected={active(s)} onClick={() => pick(s.tab, s.filter ?? "all")} className={cn(btn, "border border-line lg:border-0", active(s) ? "bg-track font-semibold" : "text-text-2 hover:bg-track hover:text-text")}>
                <Icon name={s.icon} size={20} /><span className="flex-1 whitespace-nowrap">{s.label}</span><b className="tabular-nums text-text">{s.value}</b></button>
            ))}
            {data.owner && data.rank && (
              <a {...link("/ranking")} className={cn(btn, "border border-line text-text-2 hover:bg-track hover:text-text lg:border-0")}><Icon name="leaderboard" size={20} /><span className="flex-1 whitespace-nowrap">{t("Ranking")}</span><b className="tabular-nums text-text">#{data.rank.rank}</b></a>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
