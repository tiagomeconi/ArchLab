import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { solveDemand } from "@archlab/domain";
import fixture from "../../../../fixtures/url-shortener-baseline.json";
import { Icon, fmt } from "../ui";
import { ProviderLogo } from "../ProviderLogo";
import { BlurFade } from "./ui/blur-fade";
import { NumberTicker } from "./ui/number-ticker";
import { cn } from "./lib/utils";
import { AnimatedGridPattern } from "./ui/animated-grid-pattern";
import { t } from "../i18n";

/** "O ciclo": seis passos à esquerda; à direita, o produto do passo ativo (números vindos do motor real). */
const STEP_MS = 7000;
const STEPS = [
  { t: "Aprender", icon: "menu_book", d: "Enunciado como numa entrevista: requisitos, escala e restrições.", chip: "12 requisitos" },
  { t: "Projetar", icon: "draw", d: "Arraste componentes, ligue-os e escolha o provedor de cada peça.", chip: "85 tecnologias" },
  { t: "Simular", icon: "play_circle", d: "Defina o caminho das requisições e rode com tráfego e mix de leitura/escrita.", chip: "300 s por rodada" },
  { t: "Quebrar", icon: "local_fire_department", d: "Derrube o cache, parta a rede, multiplique o tráfego. Combine falhas.", chip: "30 falhas" },
  { t: "Analisar", icon: "monitoring", d: "Gargalo, erro e p95 com os requisitos atendidos ou não — e a evidência.", chip: "p95 · erro · gargalo" },
  { t: "Melhorar", icon: "build_circle", d: "Corrija, desfaça se errar e rode de novo sob a mesma carga.", chip: "100 passos de histórico" },
] as const;

function useNumbers() {
  const doc = fixture as any;
  return useMemo(() => {
    const run = (cacheDown: boolean, dbReplicas = 1) => {
      const d = structuredClone(doc); d.nodes.find((n: any) => n.id === "db").properties.replicas = dbReplicas;
      const r = solveDemand(d, { rps: 5000, effects: cacheDown ? { nodes: { cache: { unavailable: true } } } : {} });
      const f = r.flows.get("flow-redirect")!;
      return { loads: r.loads, completed: f.completed, err: 1 - f.completed / f.offered, p95: f.p95Ms ?? 0, dbU: r.loads.get("db")?.utilization ?? 0, appU: r.loads.get("app")?.utilization ?? 0, lbU: r.loads.get("lb")?.utilization ?? 0 };
    };
    return { ok: run(false), broken: run(true), fixed: run(true, 3) };
  }, [doc]);
}

/* ── visuais de cada passo ── */
const Box = ({ children, className, canvas = false }: { children: ReactNode; className?: string; canvas?: boolean }) => (
  <div className={cn("relative flex flex-col justify-center lg:absolute lg:inset-0",
    canvas ? "aspect-square sm:aspect-[16/11] lg:aspect-auto" : "p-5 pb-12 sm:p-7 sm:pb-12", className)}>{children}</div>
);
const Label = ({ children }: { children: ReactNode }) => <div className="text-xs font-semibold text-text-2">{children}</div>;
const stagger = (i: number, d = 0.12) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.25 + i * d, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } });

function V1() {
  const rows: [string, string, string][] = [["FR-URL-1", "Criar alias único e durável", "must"], ["FR-URL-2", "Redirecionar um alias", "must"], ["NFR-URL-1", "p95 do redirect ≤ 200 ms", "must"], ["NFR-URL-3", "Tolerar perda de 1 backend", "must"], ["NFR-URL-4", "Orçamento ≤ 1.200 créditos", "must"]];
  return (
    <Box>
      <div className="flex items-center justify-between"><Label>{t("Desafio · iniciante · 40 min")}</Label><span className="rounded-full bg-accent/12 px-2.5 py-0.5 text-[11px] font-semibold text-accent">{t("links curtos")}</span></div>
      <motion.h3 {...stagger(0)} className="mt-2 text-xl font-semibold tracking-tight">{t("Projete um encurtador de links")}</motion.h3>
      <motion.p {...stagger(1)} className="mt-1 text-sm text-text-2">{t("1 milhão de usuários/dia, pico de 5.000 req/s, 99% leituras.")}</motion.p>
      <ul className="mt-4 space-y-2">
        {rows.map(([id, txt, tag], i) => (
          <motion.li key={id} {...stagger(i + 2, 0.14)} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm">
            <span><b className="mr-2 text-xs">{id}</b><span className="text-text-2">{t(txt)}</span></span>
            <span className="rounded-full bg-danger/12 px-2 py-0.5 text-[10.5px] font-semibold uppercase text-danger">{tag}</span>
          </motion.li>
        ))}
      </ul>
    </Box>
  );
}

const NODES = [
  { id: "client", n: "Cliente", logo: "chrome", x: 3, y: 42 }, { id: "lb", n: "NGINX", logo: "nginx", x: 27, y: 42 }, { id: "app", n: "Backend", logo: "nodejs", x: 51, y: 42 },
  { id: "cache", n: "Redis", logo: "redis", x: 76, y: 16 }, { id: "db", n: "PostgreSQL", logo: "postgresql", x: 76, y: 68 },
];
const LINKS: [string, string][] = [["client", "lb"], ["lb", "app"], ["app", "cache"], ["app", "db"]];
const W = 21, H = 16;
function MiniNode({ n, delay, state = "ok", label }: { n: (typeof NODES)[number]; delay: number; state?: "ok" | "bad" | "down"; label?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, type: "spring", stiffness: 380, damping: 24 }}
      className="absolute flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border bg-surface p-1 text-center sm:gap-1 sm:rounded-2xl sm:p-2 shadow-lg transition-colors duration-500"
      style={{ left: `${n.x}%`, top: `${n.y}%`, width: `${W}%`, height: `${H}%`, borderColor: state === "ok" ? "var(--border)" : "color-mix(in srgb, var(--danger) 60%, transparent)", boxShadow: state !== "ok" ? "0 0 0 4px color-mix(in srgb, var(--danger) 13%, transparent)" : undefined }}>
      <ProviderLogo id={n.logo} name={n.n} size={26} className={state === "down" ? "opacity-30 grayscale" : ""} />
      <span className="text-[10px] font-semibold leading-none sm:text-[11px]">{t(n.n)}</span>
      {label && <span className="text-[9.5px] font-semibold leading-none sm:text-[10.5px]" style={{ color: state === "ok" ? "var(--ok)" : "var(--danger)" }}>{label}</span>}
    </motion.div>
  );
}
function Links({ delay = 0.3, bad = false }: { delay?: number; bad?: boolean }) {
  const c = (id: string) => { const n = NODES.find((x) => x.id === id)!; return [n.x + W / 2, n.y + H / 2] as const; };
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {LINKS.map(([a, b], i) => {
        const [x1, y1] = c(a), [x2, y2] = c(b);
        return <motion.path key={a + b} d={`M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`} fill="none" strokeWidth="1.6" vectorEffect="non-scaling-stroke"
          stroke={bad && b === "cache" ? "var(--danger)" : "var(--border-strong)"} strokeDasharray={bad && b === "cache" ? "4 4" : undefined}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: delay + i * 0.25, duration: 0.6 }} />;
      })}
    </svg>
  );
}

function V2() {
  return (
    <Box canvas>
      <div className="absolute inset-y-0 left-0 hidden w-[24%] flex-col gap-2 border-r border-line bg-surface/70 p-3 sm:flex">
        <Label>{t("Componentes")}</Label>
        {([["language", "Cliente"], ["alt_route", "Load balancer"], ["dns", "Backend"], ["memory", "Cache / KV"], ["database", "Banco SQL"]] as [string, string][]).map(([ic, n], i) => (
          <motion.div key={n} {...stagger(i, 0.1)} className="flex items-center gap-2 rounded-lg bg-track px-2 py-1.5 text-[11.5px] font-medium"><Icon name={ic} size={15} />{t(n)}</motion.div>
        ))}
      </div>
      <div className="absolute inset-y-0 right-0 left-0 sm:left-[24%]"><div className="relative size-full">
        <Links delay={0.9} />
        {NODES.map((n, i) => <MiniNode key={n.id} n={n} delay={0.35 + i * 0.2} />)}
      </div></div>
    </Box>
  );
}

function V3({ ok }: { ok: ReturnType<typeof useNumbers>["ok"] }) {
  const [tick, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT((v) => (v + 6) % 301), 90); return () => clearInterval(i); }, []);
  const bars = useMemo(() => Array.from({ length: 28 }, (_, i) => 52 + Math.sin(i * 0.7) * 8 + (i % 5) * 2), []);
  return (
    <Box>
      <div className="flex items-center justify-between"><Label>{t("Simulando…")}</Label><span className="text-xs font-semibold tabular-nums text-text-2">{tick} / 300 s</span></div>
      <div className="mt-3 flex h-28 items-end gap-1 rounded-2xl bg-track p-3" aria-hidden>
        {bars.map((h, i) => <motion.i key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.2 + i * 0.02, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="flex-1 rounded-sm bg-accent/65" style={{ opacity: i / 28 <= tick / 300 ? 1 : 0.35 }} />)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[["Oferecidas", "5.000/s"], ["Concluídas", `${fmt(ok.completed)}/s`], ["Erro", "0,0%"], ["p95 (proxy)", `${Math.round(ok.p95)} ms`]].map(([l, v], i) => (
          <motion.div key={l} {...stagger(i, 0.08)} className="rounded-xl border border-line bg-surface px-3 py-2"><div className="text-[11px] text-text-2">{t(l!)}</div><div className="text-lg font-semibold tabular-nums">{v}</div></motion.div>
        ))}
      </div>
      <div className="mt-3 flex gap-2 text-xs text-text-2"><span className="rounded-full border border-line px-2.5 py-0.5">{t("Tráfego 1×")}</span><span className="rounded-full border border-line px-2.5 py-0.5">{t("99% leitura")}</span><span className="rounded-full border border-line px-2.5 py-0.5">{t("Velocidade 1×")}</span></div>
    </Box>
  );
}

function V4({ b }: { b: ReturnType<typeof useNumbers>["broken"] }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 1400); return () => clearTimeout(t); }, []);
  const items: [string, string][] = [["memory", "Cache indisponível"], ["timer", "Banco lento"], ["public_off", "Perda entre regiões"], ["trending_up", "Tráfego 10×"]];
  return (
    <Box canvas>
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold sm:hidden" style={{ color: on ? "var(--danger)" : undefined }}><Icon name="local_fire_department" size={14} />{on ? t("Cache indisponível") : t("Modo caos")}</div>
      <div className="absolute inset-y-0 left-0 hidden w-[34%] flex-col gap-2 border-r border-line bg-surface/70 p-3 sm:flex">
        <Label>{t("Modo caos")}</Label>
        {items.map(([ic, n], i) => {
          const active = i === 0 && on;
          return (
            <motion.div key={n} {...stagger(i, 0.08)} className={cn("flex items-center gap-2 rounded-xl border px-2.5 py-2 text-[11.5px] font-semibold transition-all duration-500", active ? "border-danger/50 bg-danger/10 text-danger" : "border-line bg-surface text-text-2")}>
              <Icon name={ic} size={15} /><span className="leading-tight">{t(n)}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="absolute inset-y-0 left-0 right-0 sm:left-[34%]"><div className="relative size-full">
        <Links delay={0.2} bad={on} />
        {NODES.map((n, i) => <MiniNode key={n.id} n={n} delay={0.1 + i * 0.08}
          state={on && n.id === "cache" ? "down" : on && n.id === "db" ? "bad" : "ok"}
          label={n.id === "client" ? undefined : on && n.id === "cache" ? t("fora do ar") : on && n.id === "db" ? `${Math.round(b.dbU * 100)}%` : n.id === "db" ? "25%" : n.id === "cache" ? "25%" : undefined} />)}
      </div></div>
    </Box>
  );
}

function V5({ b }: { b: ReturnType<typeof useNumbers>["broken"] }) {
  const bars: [string, number, string][] = [["Banco SQL", b.dbU, "postgresql"], ["Backend ×3", b.appU, "nodejs"], ["Load balancer", b.lbU, "nginx"]];
  const reqs: [string, string, "bad" | "ok"][] = [["Erro ≤ 0,1%", t("{v}% — não atendido", { v: (b.err * 100).toFixed(0) }), "bad"], ["p95 ≤ 200 ms", t("{v} ms — não atendido", { v: Math.round(b.p95) }), "bad"], ["Tolerar perda de 1 backend", t("atendido"), "ok"]];
  return (
    <Box>
      <Label>{t("Gargalo agora")}</Label>
      <div className="mt-3 space-y-3">
        {bars.map(([n, u, logo], i) => (
          <motion.div key={n} {...stagger(i, 0.1)} className="flex items-center gap-3">
            <ProviderLogo id={logo} name={n} size={26} /><span className="w-28 shrink-0 text-sm font-medium">{t(n)}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-track"><motion.i className="block h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(100, u * 100)}%` }} transition={{ delay: 0.5 + i * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ background: u > 1 ? "var(--danger)" : "var(--ok)" }} /></div>
            <span className="w-12 text-right text-sm font-semibold tabular-nums" style={{ color: u > 1 ? "var(--danger)" : "var(--ok)" }}>{Math.round(u * 100)}%</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        {reqs.map(([n, s, tone], i) => (
          <motion.div key={n} {...stagger(i + 3, 0.12)} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm">
            <span className="text-text-2">{t(n)}</span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tone === "ok" ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger")}>{s}</span>
          </motion.div>
        ))}
      </div>
    </Box>
  );
}

function V6({ b, f }: { b: ReturnType<typeof useNumbers>["broken"]; f: ReturnType<typeof useNumbers>["fixed"] }) {
  return (
    <Box>
      <div className="flex items-center justify-between"><Label>{t("Mudança")}</Label>
        <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4 }} className="inline-flex items-center gap-1.5 rounded-full bg-text px-3 py-1 text-xs font-semibold text-bg"><Icon name="undo" size={13} />{t("Ctrl + Z disponível")}</motion.span></div>
      <motion.div {...stagger(0)} className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
        <ProviderLogo id="postgresql" name="PostgreSQL" size={30} />
        <div className="flex-1 text-sm"><b>{t("Banco SQL")}</b><div className="text-xs text-text-2">{t("réplicas")}</div></div>
        <span className="text-lg font-semibold tabular-nums text-text-2">1</span><Icon name="arrow_forward" size={18} /><motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring" }} className="text-lg font-semibold tabular-nums text-accent">3</motion.span>
      </motion.div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[["Antes", b, false], ["Depois", f, true]].map(([l, r, after]: any, i) => (
          <motion.div key={l} {...stagger(i + 1, 0.2)} className={cn("rounded-2xl border p-4", after ? "border-ok/40 bg-ok/8" : "border-danger/30 bg-danger/8")}>
            <div className="text-xs font-semibold text-text-2">{t(l)} · {t("cache fora do ar")}</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums" style={{ color: after ? "var(--ok)" : "var(--danger)" }}>
              {after ? <NumberTicker value={Math.round(r.err * 1000) / 10} startValue={Math.round(b.err * 1000) / 10} direction="down" decimalPlaces={1} delay={0.9} className="text-ok" /> : (b.err * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-text-2">{t("de erro ·")}{" "}{fmt(r.completed)}{t("/s concluídas")}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4">
        <Label>{t("Histórico")}</Label>
        <ul className="mt-2 space-y-1.5">
          {[["Banco SQL: réplicas 1 → 3", "agora", "Ctrl + Z"], ["Fluxo “Redirecionar link” criado", "há 40 s", ""], ["Cache / KV conectado ao backend", "há 1 min", ""]].map(([txt, w, k], idx) => (
            <motion.li key={txt} {...stagger(idx + 3, 0.12)} className={cn("flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px]", idx === 0 ? "bg-track font-medium" : "text-text-2")}>
              <span>{t(txt!)}</span><span className="flex items-center gap-2 text-xs text-text-2">{k && <kbd className="rounded-md border border-line-strong bg-surface px-1.5 py-0.5 text-[10.5px] font-semibold">{k}</kbd>}{t(w!)}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </Box>
  );
}

export function Cycle() {
  const nums = useNumbers();
  const wrap = useRef<HTMLDivElement>(null);
  const visible = useInView(wrap, { margin: "-15% 0px" });
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [round, setRound] = useState(0); // reinicia a barra de progresso ao clicar
  useEffect(() => {
    if (!visible || hover) return;
    const t = setTimeout(() => { setI((n) => (n + 1) % STEPS.length); setRound((r) => r + 1); }, STEP_MS);
    return () => clearTimeout(t);
  }, [i, round, visible, hover]);
  const pick = (n: number) => { setI(n); setRound((r) => r + 1); };

  return (
    <section id="ciclo" className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div aria-hidden className="lp-fade-both pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden">
        <AnimatedGridPattern numSquares={22} maxOpacity={0.16} duration={4} repeatDelay={1.2} width={52} height={52} className="fill-accent/20 stroke-text-2/10 [mask-image:radial-gradient(ellipse_75%_70%_at_50%_50%,black,transparent)]" />
      </div>
      <BlurFade inView><div className="text-[17px] font-semibold tracking-[-0.014em] text-accent">{t("O ciclo")}</div></BlurFade>
      <BlurFade inView delay={0.05}><h2 className="mt-5 max-w-3xl text-balance text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.024em]">{t("Um laboratório, não uma")}{" "}<span className="text-accent">{t("aula decorada")}</span>.</h2></BlurFade>
      <BlurFade inView delay={0.1}><p className="mt-5 max-w-2xl text-xl leading-snug text-text-2">{t("O aprendizado vem de formular uma hipótese, testar e ver o efeito — não de memorizar um diagrama de referência.")}</p></BlurFade>

      <div ref={wrap} className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <ol className="relative flex flex-col gap-1.5">
          {STEPS.map((s, n) => {
            const active = n === i;
            return (
              <li key={s.t}>
                <button onClick={() => pick(n)} aria-current={active} className={cn("group relative w-full overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-500", active ? "border-line-strong bg-surface shadow-[0_18px_50px_-30px_rgba(0,0,0,.6)]" : "border-transparent hover:bg-track")}>
                  <span className="flex items-center gap-3.5">
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-500", active ? "bg-accent text-on-accent" : "bg-track text-text-2 group-hover:text-text")}><Icon name={s.icon} size={20} /></span>
                    <span className="min-w-0 flex-1"><span className="block text-[11px] font-medium tabular-nums text-text-2">0{n + 1}</span><span className={cn("block text-lg font-semibold tracking-tight transition-colors", active ? "text-text" : "text-text-2")}>{t(s.t)}</span></span>
                    <span className={cn("hidden shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity duration-500 sm:block", active ? "border-line text-text-2 opacity-100" : "opacity-0")}>{t(s.chip)}</span>
                  </span>
                  <motion.span initial={false} animate={{ height: active ? "auto" : 0, opacity: active ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="block overflow-hidden">
                    <span className="block pb-1 pl-[3.4rem] pt-2 text-[15px] leading-relaxed text-text-2">{t(s.d)}</span>
                  </motion.span>
                  {active && <span key={`${i}-${round}`} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent" style={{ animation: `cycle-progress ${STEP_MS}ms linear forwards`, animationPlayState: hover ? "paused" : "running" }} />}
                </button>
              </li>
            );
          })}
          <li className="mt-2 flex items-center gap-2.5 pl-4 text-sm text-text-2"><Icon name="autorenew" size={18} /><span>{t("Melhorou?")}{" "}<b className="font-semibold text-text">{t("Volte ao passo 3")}</b>{" "}{t("e rode de novo, sob a mesma carga.")}</span></li>
        </ol>

        <div className="relative flex min-h-[36rem] flex-col justify-center overflow-hidden rounded-3xl border border-line-strong bg-bg shadow-[0_30px_90px_-40px_rgba(0,0,0,.6)] lg:min-h-[34rem]">
          <div className="lp-grid absolute inset-0 opacity-60" />
          <AnimatePresence mode="wait">
            <motion.div key={i} className="relative w-full lg:absolute lg:inset-0" initial={{ opacity: 0, y: 14, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              {i === 0 && <V1 />}{i === 1 && <V2 />}{i === 2 && <V3 ok={nums.ok} />}{i === 3 && <V4 b={nums.broken} />}{i === 4 && <V5 b={nums.broken} />}{i === 5 && <V6 b={nums.broken} f={nums.fixed} />}
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5" aria-hidden>{STEPS.map((_, n) => <i key={n} className={cn("h-1.5 rounded-full transition-all duration-500", n === i ? "w-6 bg-accent" : "w-1.5 bg-line-strong")} />)}</div>
        </div>
      </div>
    </section>
  );
}
