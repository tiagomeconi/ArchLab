import { lazy, Suspense, useMemo, useState, type ReactNode } from "react";
import "./landing.css";
import { CASES, COMPANY_CASES, sessionFor, type CaseGroup, type StudyCase } from "../cases";
import { loadProgress, type CaseProgress } from "../progress";
import { clearSession, DEFAULT_LOAD, emptyRequirements, newDesignId, saveSession, type Requirements } from "../session";
import { go, link } from "../nav";
import { BrandMark, Icon, SearchField } from "../ui";
import { cn } from "./lib/utils";
import { t, useLang } from "../i18n";
import { levelLocked } from "../plan";
import { useAuth } from "../auth";
import { MASTERED_SCORE } from "../assessments";
import { useDeliveries, type Delivery } from "./AssessmentDeliveries";

const field = "w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-text-2/60 focus:border-accent";

/** Cabeçalho de página dentro do sistema (o menu, o topo e a animação de entrada vêm do AppLayout). */
function Shell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <>
      <h1 className="text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]">{title}</h1>
      <p className="mt-2 max-w-2xl text-lg leading-snug text-text-2">{sub}</p>
      <div className="mt-8">{children}</div>
    </>
  );
}

/* ───────────── modo estudo ───────────── */

/** Rótulo de ação do cartão: texto + seta num círculo centrado, que se preenche quando o cartão recebe o mouse. */
function Cta({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold leading-none text-accent">
      {children}
      <span className="grid size-7 place-items-center rounded-full bg-accent-soft leading-none transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-accent group-hover:text-on-accent">
        <Icon name="arrow_forward" size={15} />
      </span>
    </span>
  );
}

/** Progresso no caso: check quando concluído e uma barra fina na base do cartão enquanto em andamento. */
function ProgressMark({ p }: { p?: CaseProgress }) {
  if (!p) return null;
  const pct = p.total ? Math.round((p.met / p.total) * 100) : 0;
  return (
    <>
      {(p.status === "done" || p.ovr) && (
        <span className="absolute right-4 top-4 flex items-center gap-2 text-xs font-semibold">
          {p.ovr ? <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-0.5 pl-1.5 pr-2.5 tabular-nums text-text-2" title={t("Nota de prática: {n}", { n: p.ovr })}><span className="text-[10px]">{t("Prática")}</span><b className="text-text">{p.ovr}</b></span> : null}
          {p.status === "done" && <span className="text-ok" title={t("Concluído")} role="img" aria-label={t("Concluído")}><Icon name="check_circle" size={20} /></span>}
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-track" aria-hidden><i className="block h-full bg-accent transition-all" style={{ width: `${p.status === "done" ? 100 : pct}%` }} /></span>
      <span className="sr-only">{p.status === "done" ? t("Concluído") : t("Em andamento: {met} de {total} verificações", { met: p.met, total: p.total })}</span>
    </>
  );
}

const LEVELS: StudyCase["level"][] = ["Iniciante", "Intermediário", "Avançado"];

/** Dificuldade como três barrinhas (sem cor de alerta): o rótulo só aparece para leitores de tela e no hover. */
/** `short`: em telas estreitas só as barrinhas (o nome do nível some, mas segue para leitores de tela). */
export function Level({ level, short = false }: { level: StudyCase["level"]; short?: boolean }) {
  const n = LEVELS.indexOf(level) + 1;
  return (
    <span className="inline-flex items-center gap-2 text-xs text-text-2" title={t("Dificuldade: {nivel}", { nivel: t(level) })}>
      <span className="flex items-end gap-[3px]" aria-hidden>
        {[1, 2, 3].map((i) => <i key={i} className={cn("block w-[3px] rounded-full", i <= n ? "bg-text" : "bg-line-strong/60")} style={{ height: 5 + i * 3 }} />)}
      </span>
      <span className={short ? "max-sm:sr-only" : undefined}>{t(level)}</span>
    </span>
  );
}

export function openCase(c: StudyCase) {
  if (levelLocked(c.level)) { go("/planos"); return; }
  saveSession(sessionFor(c));
  // o encurtador tem desenho de referência pronto; os demais começam com o canvas em branco
  go(c.id === "url-shortener" ? "/app?s=1" : "/app?blank=1&s=1");
}

/** Cadeado dos casos que o plano atual não abre (só aparece com a restrição ligada). */
function LockMark({ level }: { level: StudyCase["level"] }) {
  useAuth();
  if (!levelLocked(level)) return null;
  return <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-text px-2.5 py-1 text-xs font-semibold text-bg" title={t("Disponível na assinatura")}><Icon name="lock" size={13} />{t("Pro")}</span>;
}

function CompanyCard({ c, p, delivery }: { c: StudyCase; p?: CaseProgress; delivery?: Delivery }) {
  const co = c.company!;
  return (
    <article style={{ "--brand": co.brand } as React.CSSProperties}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 text-left transition-all duration-300 hover:border-[var(--brand)] hover:shadow-[0_24px_60px_-24px_var(--brand)]">
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-[.14] blur-3xl transition-opacity duration-500 group-hover:opacity-35" style={{ background: "var(--brand)" }} />
      <ProgressMark p={p} />
      <LockMark level={c.level} />
      <button type="button" onClick={() => openCase(c)} className="relative flex flex-1 flex-col items-start text-left">
      <div className="relative flex items-start justify-between gap-3">
        <BrandMark id={co.logo} name={co.name} color={co.brand} />
      </div>
      <h3 className="relative mt-5 text-xl font-semibold tracking-tight">{t(co.name)}</h3>
      <p className="relative mt-1 text-[15px] font-semibold leading-snug" style={{ color: "color-mix(in srgb, var(--brand) 45%, var(--text))" }}>{t(co.focus)}</p>
      <p className="relative mt-2.5 flex-1 text-sm leading-snug text-text-2">{t(c.summary)}</p>
      <div className="relative mt-4 flex flex-wrap gap-1.5">{c.concepts.map((k) => <span key={k} className="rounded-md bg-track px-2 py-0.5 text-xs text-text-2">{t(k)}</span>)}</div>
      </button>
      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <button type="button" onClick={() => openCase(c)}><Cta>{t("Ver requisitos")}</Cta></button>
        <Level level={c.level} />
      </div>
      {delivery
        ? delivery.passed && delivery.score >= MASTERED_SCORE
          ? <a {...link(`/avaliacao/tentativa/${delivery.id}`)} title={t("Você já foi aprovado(a) neste caso. Abra para ver o resultado ou corrigir a entrega.")} className="relative mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--ok)] bg-[var(--ok-bg)] px-3 text-sm font-semibold text-[var(--ok)] transition-colors hover:brightness-110"><Icon name="check_circle" size={17} />{t("Avaliação concluída · {n}", { n: delivery.score })}</a>
          : <a {...link(`/avaliacao/tentativa/${delivery.id}`)} title={t("Você já fez esta avaliação. Abra para ver o diagnóstico e corrigir a entrega.")} className="relative mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-accent/50 bg-accent-soft px-3 text-sm font-semibold text-accent transition-colors hover:border-accent"><Icon name="edit" size={17} />{t("Corrigir entrega · {n}", { n: delivery.score })}</a>
        : <a {...link(`/avaliacao/${c.id}`)} className="relative mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-line px-3 text-sm font-semibold text-accent transition-colors hover:border-accent hover:bg-accent-soft"><Icon name="verified" size={17} />{t("Fazer avaliação sem dicas")}</a>}
    </article>
  );
}

/** Resumo do progresso e sugestão do próximo caso (continua o que está em andamento; senão, o mais fácil ainda não feito). */
function ProgressSummary({ all, progress }: { all: StudyCase[]; progress: Record<string, CaseProgress> }) {
  const done = all.filter((c) => progress[c.id]?.status === "done").length;
  const started = all.filter((c) => progress[c.id]?.status === "started");
  const next = started.sort((a, b) => (progress[b.id]!.updatedAt - progress[a.id]!.updatedAt))[0]
    ?? [...all].filter((c) => !progress[c.id]).sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level))[0];
  if (!done && !started.length && !next) return null;
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-surface px-5 py-4">
      <div className="min-w-40">
        <div className="text-sm text-text-2">{t("Seu progresso")}</div>
        <div className="text-lg font-semibold tabular-nums">{t("{done} de {total} casos concluídos", { done, total: all.length })}{started.length ? <span className="ml-2 text-sm font-medium text-text-2">· {t("{n} em andamento", { n: started.length })}</span> : null}</div>
      </div>
      <div className="h-2 min-w-32 flex-1 overflow-hidden rounded-full bg-track" role="img" aria-label={t("{done} de {total} casos concluídos", { done, total: all.length })}><i className="block h-full rounded-full bg-accent" style={{ width: `${(done / all.length) * 100}%` }} /></div>
      {next && <button onClick={() => openCase(next)} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-transform hover:-translate-y-0.5">
        {progress[next.id] ? t("Continuar") : t("Sugerido")}: {t(next.title)}<Icon name="arrow_forward" size={16} /></button>}
    </div>
  );
}

function Study() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<CaseGroup | "Todos">("Todos");
  const progress = useMemo(loadProgress, []);
  const deliveries = useDeliveries();
  const delivered = useMemo(() => new Map((deliveries.rows ?? []).map((d) => [d.caseId, d])), [deliveries.rows]);
  const all = useMemo(() => [...COMPANY_CASES, ...CASES], []);
  const groups = useMemo(() => ["Todos", ...Array.from(new Set(all.map((c) => c.group)))] as (CaseGroup | "Todos")[], [all]);
  const list = all.filter((c) => (group === "Todos" || c.group === group)
    && (q.trim() === "" || `${c.title} ${c.company?.focus ?? ""} ${c.summary} ${c.concepts.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase())));
  const companies = list.filter((c) => c.company), classics = list.filter((c) => !c.company);
  return (
    <Shell title={t("Escolha um caso para treinar")} sub={t("Arquiteturas inspiradas nas grandes empresas e os sistemas que mais aparecem em entrevistas. Ao abrir, os requisitos ficam disponíveis dentro do laboratório.")}>
      <div className="flex flex-wrap items-center gap-3">
        <SearchField className="min-w-60 flex-1 sm:max-w-md" value={q} onChange={setQ} placeholder={t("Buscar por empresa, nome ou conceito")} label={t("Buscar casos")} />
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("Filtrar por categoria")}>
          {groups.map((g) => (
            <button key={g} aria-pressed={group === g} onClick={() => setGroup(g)}
              className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors", group === g ? "border-accent bg-accent text-on-accent" : "border-line hover:bg-track")}>{t(g)}</button>
          ))}
        </div>
      </div>

      <ProgressSummary all={all} progress={progress} />

      {companies.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">{t("Como as grandes empresas resolvem")}</h2>
          <p className="mt-1 text-sm text-text-2">{t("Cada caso traz as regras difíceis do sistema real: o que a entrevista espera que você discuta.")}</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{companies.map((c) => <CompanyCard key={c.id} c={c} p={progress[c.id]} delivery={delivered.get(c.id)} />)}</div>
        </section>
      )}

      {classics.length > 0 && (
        <section className="mt-14">
          {companies.length > 0 && <h2 className="text-xl font-semibold tracking-tight">{t("Sistemas clássicos")}</h2>}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classics.map((c) => (
              <button key={c.id} onClick={() => openCase(c)} className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-lg">
                <ProgressMark p={progress[c.id]} />
                <LockMark level={c.level} />
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent"><Icon name={c.icon} size={24} /></span>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{t(c.title)}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-snug text-text-2">{t(c.summary)}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">{c.concepts.map((k) => <span key={k} className="rounded-md bg-track px-2 py-0.5 text-xs text-text-2">{t(k)}</span>)}</div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5">
                  <Cta>{c.id === "url-shortener" ? t("Com desenho pronto") : t("Começar do zero")}</Cta>
                  <Level level={c.level} />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
      {list.length === 0 && <p className="mt-10 text-text-2">{t("Nenhum caso encontrado.")}{" "}<button className="font-semibold text-accent" onClick={() => { setQ(""); setGroup("Todos"); }}>{t("Limpar filtros")}</button></p>}
    </Shell>
  );
}

/* ───────────── modo livre ───────────── */

function ListEditor({ label, hint, items, onChange, placeholder }: { label: string; hint: string; items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => { const v = draft.trim(); if (v) { onChange([...items, v]); setDraft(""); } };
  return (
    <div>
      <h2 className="font-semibold">{label}</h2>
      <p className="mb-3 text-sm text-text-2">{hint}</p>
      <div className="flex gap-2">
        <input className={field} value={draft} placeholder={placeholder} aria-label={label} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button onClick={add} className="shrink-0 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent disabled:opacity-40" disabled={!draft.trim()}>{t("Adicionar")}</button>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm">
            <span>{it}</span>
            <button aria-label={`${t("Remover")}: ${it}`} className="text-text-2 hover:text-danger" onClick={() => onChange(items.filter((_, j) => j !== i))}><Icon name="close" size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Free() {
  const [name, setName] = useState("");
  const [r, setR] = useState<Requirements>(emptyRequirements());
  const [peak, setPeak] = useState("");
  const [read, setRead] = useState("");
  const [p95, setP95] = useState("");
  const set = <K extends keyof Requirements>(k: K, v: Requirements[K]) => setR((p) => ({ ...p, [k]: v }));
  const text = (label: string, value: string, on: (v: string) => void, ph: string) => (
    <label className="block text-sm"><span className="mb-1.5 block font-medium">{label}</span>
      <input className={field} value={value} placeholder={ph} onChange={(e) => on(e.target.value)} /></label>
  );
  const start = (withReqs: boolean) => {
    const p = parseInt(peak, 10), rd = parseInt(read, 10);
    const load = { peakRps: p > 0 ? p : DEFAULT_LOAD.peakRps, readPct: rd >= 10 && rd <= 100 ? rd : DEFAULT_LOAD.readPct };
    if (withReqs) saveSession({ mode: "free", title: name.trim() || "Meu sistema", requirements: r, load, checks: { needs: [], p95Ms: parseInt(p95, 10) > 0 ? parseInt(p95, 10) : undefined } }); else clearSession();
    go(withReqs ? `/app?blank=1&s=1&d=${newDesignId()}` : `/app?blank=1&d=${newDesignId()}`);
  };
  return (
    <Shell title={t("Modo livre")} sub={t("Tudo aqui é opcional. Registre o que já sabe sobre o sistema, ou pule direto para o canvas em branco.")}>
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-10">
          {text(t("Nome do sistema"), name, setName, t("Ex.: Plataforma de agendamento"))}
          <ListEditor label={t("Requisitos funcionais")} hint={t("O que o sistema precisa fazer.")} items={r.functional} onChange={(v) => set("functional", v)} placeholder={t("Ex.: Usuário agenda um horário")} />
          <ListEditor label={t("Requisitos não funcionais")} hint={t("Qualidades esperadas: desempenho, disponibilidade, segurança…")} items={r.nonFunctional} onChange={(v) => set("nonFunctional", v)} placeholder={t("Ex.: Suportar picos de 10x no fim do mês")} />
          <div>
            <h2 className="font-semibold">{t("Escala estimada")}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {text(t("Usuários"), r.scale.users, (v) => set("scale", { ...r.scale, users: v }), t("50 milhões ativos/mês"))}
              {text(t("Requisições"), r.scale.rps, (v) => set("scale", { ...r.scale, rps: v }), t("10.000 req/s no pico"))}
              {text(t("Leitura vs escrita"), r.scale.readWrite, (v) => set("scale", { ...r.scale, readWrite: v }), t("90% leitura"))}
              {text(t("Armazenamento"), r.scale.storage, (v) => set("scale", { ...r.scale, storage: v }), t("2 TB por ano"))}
            </div>
          </div>
          <div>
            <h2 className="font-semibold">{t("Carga do simulador")}</h2>
            <p className="mb-3 text-sm text-text-2">{t("Define o pico e a mistura de leitura e escrita com que o laboratório começa. Em branco, usa 5.000 req/s e 99% de leitura.")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm"><span className="mb-1.5 block font-medium">{t("Pico (req/s)")}</span>
                <input className={field} inputMode="numeric" value={peak} placeholder="5000" onChange={(e) => setPeak(e.target.value.replace(/\D/g, "").slice(0, 7))} /></label>
              <label className="block text-sm"><span className="mb-1.5 block font-medium">{t("Meta de latência p95 (ms)")}</span>
                <input className={field} inputMode="numeric" value={p95} placeholder={t("Opcional, ex.: 200")} onChange={(e) => setP95(e.target.value.replace(/\D/g, "").slice(0, 5))} /></label>
              <label className="block text-sm"><span className="mb-1.5 block font-medium">{t("Leituras (%)")}</span>
                <input className={field} inputMode="numeric" value={read} placeholder="99" onChange={(e) => setRead(e.target.value.replace(/\D/g, "").slice(0, 3))} /></label>
            </div>
          </div>
          <div>
            <h2 className="font-semibold">{t("Metas de qualidade")}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {text(t("Latência"), r.targets.latency, (v) => set("targets", { ...r.targets, latency: v }), "p95 < 200 ms")}
              {text("Disponibilidade", r.targets.availability, (v) => set("targets", { ...r.targets, availability: v }), "99,95%")}
              {text(t("Consistência"), r.targets.consistency, (v) => set("targets", { ...r.targets, consistency: v }), t("Forte nos pagamentos"))}
            </div>
          </div>
          <label className="block"><span className="font-semibold">{t("Restrições e observações")}</span>
            <textarea className={cn(field, "mt-3 min-h-28")} value={r.constraints} onChange={(e) => set("constraints", e.target.value)} placeholder={t("Orçamento, equipe, provedor de nuvem, regulamentação…")} /></label>
        </div>
        <aside className="h-fit rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-semibold">{t("Pronto para desenhar?")}</h2>
          <p className="mt-2 text-sm text-text-2">{t("O que você registrar fica à mão dentro do laboratório, no botão “Requisitos”. Fica guardado só neste navegador.")}</p>
          <button onClick={() => start(true)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-semibold text-on-accent transition-transform hover:-translate-y-0.5">{t("Abrir o canvas")}<Icon name="arrow_forward" size={18} /></button>
          <button onClick={() => start(false)} className="mt-3 w-full rounded-full border border-line-strong px-5 py-3 text-sm font-medium transition-colors hover:bg-track">{t("Pular e desenhar sem requisitos")}</button>
        </aside>
      </div>
    </Shell>
  );
}

const DocsPage = lazy(() => import("./Docs").then((m) => ({ default: m.Docs })));
export function Start({ path }: { path: string }) {
  useLang();
  if (path.startsWith("/start/aulas")) return <Suspense fallback={null}><DocsPage path={path} /></Suspense>;
  if (path.startsWith("/start/estudo")) return <Study />;
  if (path.startsWith("/start/livre")) return <Free />;
  return <Study />;
}
