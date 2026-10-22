import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { streakOf } from "../activity";
import { Avatar } from "../AccountMenu";
import { ALL_CASES } from "../home";
import { link } from "../nav";
import type { CaseProgress } from "../progress";
import { BrandMark, Icon } from "../ui";
import { t, useLang } from "../i18n";
import { cn } from "./lib/utils";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { AchievementGrid } from "./AchievementGrid";
import { DesignThumb } from "./DesignThumb";
import { PointsCard } from "./PointsCard";
import { AssessmentCards, AssessmentHistory } from "./AssessmentPortfolio";
import { useAssessmentProfile } from "./useAssessmentProfile";
import { StreakCard } from "./StreakCard";
import { fetchShowcase, publishSolution, unpublishSolution, validSolution, type Showcase, type PublishedSolution } from "../profileShowcase";
import { ProfileDialog } from "./ProfileDialog";
import { openCase } from "./Start";
import { journeyOf } from "./useJourney";
import type { DesignItem } from "./useMyDesigns";

const SolutionDialog = lazy(() => import("./SolutionDialog").then((m) => ({ default: m.SolutionDialog })));

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
    <li className="flex items-center gap-2 rounded-full border border-line bg-bg/40 px-3 py-2">
      <span aria-hidden className="grid size-6 shrink-0 place-items-center text-accent"><Icon name={icon} size={18} /></span>
      <span className="min-w-0 text-xs font-medium leading-tight">{title}</span>
    </li>
  );
}

function CaseRow({ id, p, owner, design, solution, onView, onPublish, onUnpublish, busy }: { id: string; p: CaseProgress; owner: boolean; design?: DesignItem; solution?: PublishedSolution; onView: (s: PublishedSolution) => void; onPublish: (d: DesignItem) => void; onUnpublish: (id: string) => void; busy: boolean }) {
  const c = ALL_CASES.find((x) => x.id === id); if (!c) return null;
  const body = (
    <>
      {c.company ? <BrandMark id={c.company.logo} name={c.company.name} color={c.company.brand} height={26} /> : <span aria-hidden className="grid size-[26px] place-items-center rounded-lg bg-track"><Icon name={c.icon} size={16} /></span>}
      <span className="min-w-0 flex-1"><b className="block truncate font-medium">{t(c.title)}</b>
        <small className="text-text-2">{p.status === "done" ? t("Concluído") : t("{met} de {total} verificações cumpridas", { met: p.met, total: p.total })}</small></span>
      {p.ovr ? <span className="inline-flex shrink-0 items-center gap-1.5 tabular-nums" title={t("Nota de prática")}><small className="text-text-2">{t("Prática")}</small><b>{p.ovr}</b></span> : null}
    </>
  );
  const cls = "flex w-full items-center gap-3 rounded-xl border border-line px-3.5 py-3 text-left";
  const preview = solution?.snap ?? design?.snap;
  const action = "inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-50";
  return <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg/30">
    {preview && <button type="button" onClick={() => onView(solution ?? { caseId: id, title: c.title, snap: design!.snap, publishedAt: "" })} aria-label={t("Ver solução de {caso}", { caso: t(c.title) })} className="block w-full border-b border-line bg-bg/50 px-4 transition-colors hover:bg-track"><DesignThumb snap={preview} w={480} h={160} /></button>}
    <div className={cn(cls, "border-0")}>{body}</div>
    <div className="mt-auto px-3.5 pb-3.5 pt-1">
      <div className={cn("grid gap-2", preview && owner ? "grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))]" : "grid-cols-1")}>
        {preview && <button type="button" onClick={() => onView(solution ?? { caseId: id, title: c.title, snap: design!.snap, publishedAt: "" })} className={cn(action, "border-accent/30 bg-accent-soft text-accent hover:border-accent hover:bg-accent/15")}><Icon name="account_tree" size={16} />{t("Ver solução")}</button>}
        {owner && <button type="button" onClick={() => openCase(c)} className={cn(action, "border-line text-text-2 hover:bg-track hover:text-text")}><Icon name="arrow_forward" size={16} />{t("Continuar caso")}</button>}
        {!owner && !preview && <span className="py-2 text-xs text-text-2">{t("Solução não publicada")}</span>}
      </div>
    </div>
    {owner && <div className="flex min-h-14 items-center border-t border-line px-3.5 py-2.5">
      {solution ? <button type="button" disabled={busy} onClick={() => onUnpublish(id)} className={cn(action, "min-h-9 w-full border-line font-medium text-text-2 hover:bg-track hover:text-text")}><Icon name="public_off" size={16} />{t("Retirar do perfil público")}</button>
        : design && p.status === "done" ? <button type="button" disabled={busy} onClick={() => onPublish(design)} className={cn(action, "min-h-9 w-full border-line font-medium text-accent hover:border-accent/40 hover:bg-accent-soft")}><Icon name="public" size={16} />{t("Publicar solução")}</button>
          : <span className="inline-flex min-h-9 items-center gap-2 text-xs text-text-2"><Icon name="lock" size={16} />{t("Solução não publicada")}</span>}
    </div>}
  </article>;
}

/** A vitrine de um perfil (a mesma tela para o seu perfil e para o público): cabeçalho com foto e liga, contadores à direita e painéis que trocam ao clicar. */
export function ProfileView({ data, actions }: { data: ProfileViewData; actions?: ReactNode }) {
  useLang();
  const reduced = useReducedMotion();
  const competitive = useAssessmentProfile(data.owner ? undefined : data.handle);
  const j = useMemo(() => journeyOf(data.progress, data.days), [data.progress, data.days]);
  const streak = useMemo(() => streakOf(j.days), [j.days]);
  const [tab, setTab] = useState<Tab>(() => { const h = location.hash.slice(1) as Tab; return TABS.includes(h) && (h !== "desenhos" || data.owner) ? h : "visao"; });
  const [showcase, setShowcase] = useState<Showcase | null>(null);
  const [showcaseLoading, setShowcaseLoading] = useState(true);
  const [solution, setSolution] = useState<PublishedSolution | null>(null);
  const [publishing, setPublishing] = useState<DesignItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [leagueOpen, setLeagueOpen] = useState(false);
  useEffect(() => { let alive = true; setShowcase(null); setShowcaseLoading(true); fetchShowcase(data.owner ? undefined : data.handle).then((v) => { if (alive) { setShowcase(v); setShowcaseLoading(false); } }); return () => { alive = false; }; }, [data.owner, data.handle]);
  const publish = async () => {
    if (!publishing || !validSolution(publishing.snap) || busy) return;
    setBusy(true); setError("");
    const title = ALL_CASES.find((c) => c.id === publishing.key)?.title ?? publishing.title;
    const ok = await publishSolution(publishing.key, title, publishing.snap);
    if (ok) { setShowcase((s) => ({ seasons: s?.seasons ?? [], solutions: [...(s?.solutions ?? []).filter((x) => x.caseId !== publishing.key), { caseId: publishing.key, title, snap: publishing.snap, publishedAt: new Date().toISOString() }] })); setPublishing(null); }
    else setError(t("Não foi possível publicar a solução. Tente novamente."));
    setBusy(false);
  };
  const unpublish = async (id: string) => {
    if (busy) return; setBusy(true); setError("");
    if (await unpublishSolution(id)) setShowcase((s) => s ? { ...s, solutions: s.solutions.filter((x) => x.caseId !== id) } : s);
    else setError(t("Não foi possível retirar a solução. Tente novamente."));
    setBusy(false);
  };
  const caseRow = (r: { id: string; p: CaseProgress }) => <CaseRow id={r.id} p={r.p} owner={data.owner} design={data.owner ? data.designs?.find((d) => d.key === r.id) : undefined} solution={showcase?.solutions.find((s) => s.caseId === r.id)} onView={setSolution} onPublish={(d) => { setError(""); setPublishing(d); }} onUnpublish={(id) => void unpublish(id)} busy={busy || showcaseLoading} />;
  const [filter, setFilter] = useState<Filter>("all");
  const pick = (tb: Tab, f: Filter = "all") => { setTab(tb); setFilter(f); history.replaceState(history.state, "", `${location.pathname}${location.search}#${tb}`); };

  const rows = useMemo(() => ALL_CASES.filter((c) => data.progress[c.id]).map((c) => ({ id: c.id, p: data.progress[c.id]! })), [data.progress]);
  const done = rows.filter((r) => r.p.status === "done"), started = rows.filter((r) => r.p.status !== "done");
  const best = [...done].filter((r) => r.p.ovr).sort((a, b) => (b.p.ovr ?? 0) - (a.p.ovr ?? 0));
  const featured = j.ach.filter((a) => a.unlocked).slice(-5).reverse();
  const shownAch = data.owner ? j.ach : j.ach.filter((a) => a.unlocked);
  const list = filter === "done" ? done : filter === "started" ? started : [...rows].sort((a, b) => Number(b.p.status === "done") - Number(a.p.status === "done") || (b.p.ovr ?? 0) - (a.p.ovr ?? 0));

  const side: { tab: Tab; filter?: Filter; icon: string; label: string; value: string }[] = [
    { tab: "conquistas", icon: "emoji_events", label: t("Conquistas"), value: `${j.unlocked}/${j.ach.length}` },
    { tab: "casos", filter: "done", icon: "task_alt", label: t("Práticas concluídas"), value: String(done.length) },
    { tab: "casos", filter: "started", icon: "flag", label: t("Práticas em andamento"), value: String(started.length) },
    ...(data.owner ? [{ tab: "desenhos" as Tab, icon: "folder_open", label: t("Desenhos"), value: data.designs ? String(data.designs.length) : "…" }] : []),
    { tab: "atividade", icon: "local_fire_department", label: t("Sequência"), value: t("{n} dias", { n: streak.current }) },
  ];
  const active = (s: (typeof side)[number]) => tab === s.tab && (s.tab !== "casos" || filter === (s.filter ?? "all"));
  const btn = "flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition-colors lg:w-full";

  return (
    <>
      {error && !publishing && <p role="alert" className="mb-4 rounded-xl border border-danger/40 p-4 text-sm text-danger">{error}</p>}
      {solution && <Suspense fallback={<ProfileDialog title={t("Carregando solução…")} onClose={() => setSolution(null)}><p role="status">{t("Carregando solução…")}</p></ProfileDialog>}><SolutionDialog solution={solution} onClose={() => setSolution(null)} /></Suspense>}
      {publishing && <ProfileDialog title={t("Publicar solução")} onClose={() => setPublishing(null)}>
        <p className="text-text-2">{t("Uma cópia do desenho salvo, incluindo componentes, anotações e fluxos, ficará disponível para visitantes quando seu perfil estiver público. Você pode retirá-la a qualquer momento.")}</p>
        <div className="my-4 rounded-xl border border-line p-3"><DesignThumb snap={publishing.snap} w={600} h={200} /></div>
        {error && <p role="alert" className="mb-4 text-sm text-danger">{error}</p>}
        <button type="button" disabled={busy} onClick={() => void publish()} className="rounded-full bg-accent px-5 py-2.5 font-semibold text-on-accent disabled:opacity-50">{busy ? t("Publicando…") : t("Publicar solução")}</button>
      </ProfileDialog>}
      {leagueOpen && <ProfileDialog title={t("Histórico de temporadas")} onClose={() => setLeagueOpen(false)}><AssessmentHistory profile={competitive.profile} owner={data.owner} reload={competitive.reload} /></ProfileDialog>}
      <section className={cn(card, "sm:p-7")} aria-label={t("Perfil")}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative shrink-0">
              <Avatar name={data.name} src={data.photo} size={112} />
              {!!competitive.profile?.points && <span className="absolute -bottom-2 -right-2 grid size-10 place-items-center rounded-full bg-accent text-on-accent ring-4 ring-surface"><Icon name="emoji_events" size={22} /></span>}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl">{data.name}</h1>
              {data.handle && <p className="text-text-2">@{data.handle}</p>}
              {data.since && <p className="mt-0.5 text-sm text-text-2">{t("Membro desde {data}", { data: data.since })}</p>}
              {data.bio && <p className="mt-3 max-w-md text-[15px] italic leading-snug text-text/90">“{data.bio}”</p>}
              {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
            </div>
          </div>
          <button type="button" onClick={() => setLeagueOpen(true)} aria-label={t("Ver histórico de temporadas")} className="rounded-2xl border border-line bg-bg/40 p-5 text-left transition-colors hover:border-accent"><PointsCard profile={competitive.profile} loading={competitive.loading} error={competitive.error} /><span className="mt-3 flex items-center gap-1 text-xs text-accent">{t("Histórico de temporadas")}<Icon name="chevron_right" size={16} /></span></button>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <div className="min-w-0">
          <motion.div key={`${tab}-${filter}`} role="tabpanel" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="grid grid-cols-1 gap-6">
            {tab === "visao" && (
              <>
                <section className={card} aria-label={t("Melhores avaliações de empresas")}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">{t("Melhores avaliações de empresas")}</h2>{data.owner && <a {...link("/start/estudo")} className="text-sm font-semibold text-accent">{t("Fazer avaliação")}</a>}</div><p className="mb-5 text-sm text-text-2">{t("Somente avaliações sem dicas de casos de empresas concedem patente e pontos. As entregas preservam a versão que recebeu a nota.")}</p>
                  {competitive.loading ? <p role="status" className="text-sm text-text-2">{t("Carregando avaliações…")}</p> : competitive.error ? <p role="alert" className="text-sm text-text-2">{t("Não foi possível carregar as avaliações.")} <button type="button" onClick={competitive.reload} className="text-accent">{t("Tentar novamente")}</button></p> : competitive.profile?.best.length ? <AssessmentCards records={competitive.profile.best} owner={data.owner} reload={competitive.reload} /> : <p className="text-sm text-text-2">{t("Ainda sem avaliações aprovadas. Resultados antigos de prática não geram pontos competitivos.")}</p>}
                </section>
                <section className={card} aria-label={t("Atividade")}>
                  <h2 className="mb-4 text-lg font-semibold">{t("Atividade")}</h2>
                  <ActivityHeatmap days={j.days} weeks={26} />
                </section>
                {(featured.length > 0 || data.owner) && (
                  <section className={card} aria-label={t("Conquistas em destaque")}>
                    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t("Conquistas em destaque")}</h2>
                      <button type="button" onClick={() => pick("conquistas")} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">{t("Ver todas")}<Icon name="arrow_forward" size={16} /></button></div>
                    {featured.length ? <ul className="flex flex-wrap gap-2">{featured.map((a) => <AchTile key={a.id} icon={a.icon} title={t(a.title)} />)}</ul>
                      : <p className="text-sm text-text-2">{t("Você ainda não desbloqueou conquistas. Comece um caso para ganhar a primeira.")}</p>}
                  </section>
                )}

              </>
            )}
            {tab === "conquistas" && (
              <section className={card} aria-label={t("Conquistas")}>
                <h2 className="mb-4 text-lg font-semibold">{t("Conquistas")} <span className="text-base font-medium text-text-2">· {j.unlocked}/{j.ach.length}</span></h2>
                {shownAch.length ? <AchievementGrid list={shownAch} /> : <p className="text-sm text-text-2">{t("Nenhuma conquista ainda.")}</p>}
              </section>
            )}
            {tab === "casos" && (
              <section className={card} aria-label={t("Casos de prática")}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">{t("Casos de prática")}</h2>
                  <div className="flex gap-2" role="group" aria-label={t("Filtrar casos")}>
                    {([["all", "Todos"], ["done", "Concluídos"], ["started", "Em andamento"]] as const).map(([f, l]) => (
                      <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors", filter === f ? "border-accent bg-accent text-on-accent" : "border-line hover:bg-track")}>{t(l)}</button>
                    ))}
                  </div>
                </div>
                {list.length ? <ul className="grid gap-2.5">{list.map((r) => <li key={r.id}>{caseRow(r)}</li>)}</ul>
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
          </div>
            {data.owner && data.rank && (
              <a {...link("/ranking")} className={cn(btn, "mt-2 border border-line text-text-2 hover:bg-track hover:text-text")}><Icon name="leaderboard" size={20} /><span className="flex-1 whitespace-nowrap">{t("Ranking")}</span><b className="tabular-nums text-text">#{data.rank.rank}</b></a>
            )}
        </aside>
      </div>
    </>
  );
}
