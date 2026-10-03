import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { solveDemand, type NodeLoad } from "@archlab/domain";
import fixture from "../../../../fixtures/url-shortener-baseline.json";
import { ProviderLogo } from "../ProviderLogo";
import { AnimatedBeam } from "./ui/animated-beam";
import { Icon, fmt } from "../ui";
import { cn } from "./lib/utils";
import { t } from "../i18n";

/** Mini-laboratório na página: roda o MESMO motor do sistema (solveDemand) sobre o exemplo de links curtos. */
const NODES = [
  { id: "client", label: "Cliente", sub: "origem de carga", icon: "language", provider: "chrome" },
  { id: "lb", label: "Load balancer", sub: "NGINX", icon: "alt_route", provider: "nginx" },
  { id: "app", label: "Backend ×3", sub: "Node.js", icon: "dns", provider: "nodejs" },
  { id: "cache", label: "Cache", sub: "Redis", icon: "memory", provider: "redis" },
  { id: "db", label: "Banco", sub: "PostgreSQL", icon: "database", provider: "postgresql" },
] as const;
const EDGES = [["client", "lb"], ["lb", "app"], ["app", "cache"], ["app", "db"]] as const;

const PRESETS = [
  { id: "cache", icon: "memory", title: "Cache cai", desc: "O Redis fica indisponível: toda leitura vai para o banco." },
  { id: "dblat", icon: "timer", title: "Banco lento", desc: "+200 ms de latência no PostgreSQL." },
  { id: "app", icon: "car_crash", title: "Perde 1 backend", desc: "Uma das 3 instâncias sai da rotação." },
  { id: "loss", icon: "wifi_off", title: "Perda de pacotes", desc: "10% das requisições somem entre balanceador e backend." },
] as const;

type Health = "ok" | "warn" | "bad" | "down";
const healthOf = (l: NodeLoad | undefined, down: boolean): Health => down ? "down" : !l || l.utilization === null ? "ok" : l.utilization > 1 ? "bad" : l.utilization > 0.8 ? "warn" : "ok";
const TONE: Record<Health, string> = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--danger)", down: "var(--danger)" };

export function Playground({ onBroken }: { onBroken?: (broken: boolean) => void }) {
  const doc = fixture as any;
  const [traffic, setTraffic] = useState(1);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const rps = Math.round(5000 * traffic);
  useEffect(() => { onBroken?.(Object.values(on).some(Boolean) || traffic > 4); }, [on, traffic, onBroken]);

  const { loads, flow } = useMemo(() => {
    const nodes: Record<string, any> = {}; const edges: Record<string, any> = {};
    if (on.cache) nodes.cache = { unavailable: true };
    if (on.dblat) nodes.db = { extraLatencyMs: 200 };
    if (on.app) nodes.app = { capacityFactor: 2 / 3 };
    if (on.loss) edges["lb-app"] = { dropRate: 0.1 };
    const r = solveDemand(doc, { rps, effects: { nodes, edges } });
    return { loads: r.loads, flow: r.flows.get("flow-redirect")! };
  }, [doc, rps, on]);

  const errPct = flow.offered > 0 ? (1 - flow.completed / flow.offered) * 100 : 0;
  const container = useRef<HTMLDivElement>(null);
  const refs = { client: useRef<HTMLDivElement>(null), lb: useRef<HTMLDivElement>(null), app: useRef<HTMLDivElement>(null), cache: useRef<HTMLDivElement>(null), db: useRef<HTMLDivElement>(null) };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="flex flex-col gap-5 rounded-3xl border border-line bg-surface/60 p-6 backdrop-blur">
        <div>
          <div className="flex items-baseline justify-between text-sm font-semibold text-text-2"><span>{t("Tráfego")}</span><span className="text-text">{traffic}× · {fmt(rps)} req/s</span></div>
          <input type="range" min={1} max={10} step={1} value={traffic} onChange={(e) => setTraffic(+e.target.value)} aria-label={t("Multiplicador de tráfego")}
            className="mt-3" style={{ width: "100%", ["--p" as string]: `${((traffic - 1) / 9) * 100}%` }} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-text-2">{t("Injete uma falha")}</span>
          {PRESETS.map((p) => {
            const active = !!on[p.id];
            return (
              <button key={p.id} onClick={() => setOn((s) => ({ ...s, [p.id]: !s[p.id] }))} aria-pressed={active}
                className={cn("group flex items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-300 hover:-translate-y-0.5",
                  active ? "border-danger/50 bg-danger/10" : "border-line bg-surface hover:border-line-strong")}>
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl transition-colors", active ? "bg-danger text-white" : "bg-track text-text-2")}>
                  <Icon name={p.icon} size={18} />
                </span>
                <span className="flex flex-col"><b className="text-sm font-semibold">{t(p.title)}</b><small className="text-xs leading-snug text-text-2">{t(p.desc)}</small></span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div ref={container} className="relative overflow-hidden rounded-3xl border border-line bg-surface/60 p-6 backdrop-blur sm:px-10 sm:py-12">
          <div className="lp-grid pointer-events-none absolute inset-0 opacity-60 lp-fade-y" />
          <div className="relative grid grid-cols-4 items-center gap-x-3 sm:gap-x-10">
            {(["client", "lb", "app"] as const).map((id) => <PNode key={id} node={NODES.find((n) => n.id === id)!} refEl={refs[id]} load={loads.get(id)} down={false} />)}
            <div className="flex flex-col gap-14 sm:gap-16">
              {(["cache", "db"] as const).map((id) => <PNode key={id} node={NODES.find((n) => n.id === id)!} refEl={refs[id]} load={loads.get(id)} down={id === "cache" && !!on.cache} />)}
            </div>
          </div>
          {EDGES.map(([a, b], i) => {
            const bad = healthOf(loads.get(b), b === "cache" && !!on.cache);
            const dead = b === "cache" && !!on.cache;
            return (
              <AnimatedBeam key={a + b} containerRef={container as RefObject<HTMLElement>} fromRef={refs[a]} toRef={refs[b]} curvature={a === "app" ? (b === "cache" ? -70 : 70) : 0}
                pathColor="var(--text-2)" pathOpacity={dead ? 0.1 : 0.25} pathWidth={2} duration={dead ? 9999 : 2.6 + i * 0.3} delay={i * 0.25}
                gradientStartColor={bad === "bad" || bad === "down" ? "#ef4444" : "#38bdf8"} gradientStopColor={bad === "bad" || bad === "down" ? "#f97316" : "#34d399"} />
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={t("Oferecidas")} value={`${fmt(flow.offered)}/s`} />
          <Stat label={t("Concluídas")} value={`${fmt(flow.completed)}/s`} tone={errPct > 1 ? "bad" : "ok"} />
          <Stat label={t("Erro")} value={`${errPct.toFixed(errPct < 10 ? 1 : 0)}%`} tone={errPct > 0.1 ? "bad" : "ok"} />
          <Stat label={t("Latência p95 (proxy)")} value={flow.p95Ms === null ? "—" : `${Math.round(flow.p95Ms)} ms`} tone={flow.p95Ms !== null && flow.p95Ms > 200 ? "bad" : "ok"} />
        </div>
        <p className="text-sm text-text-2">
          {on.cache && !on.dblat ? t("Sem o cache, as 5.000 leituras/s caem no banco, que aguenta 2.000. É assim que um componente barato derruba o sistema todo.")
            : on.cache && on.dblat ? t("Cache fora e banco lento: respostas passam do prazo de 500 ms e viram timeout, além da rejeição por capacidade.")
            : on.app ? t("Com 2 de 3 instâncias, o backend sobe de 56% para 83% de utilização — sem folga para o próximo pico.")
            : traffic > 4 ? t("Com o tráfego acima de 4×, o balanceador e o backend começam a saturar antes mesmo do banco.")
            : t("Tudo saudável. Ligue uma falha acima e veja o efeito se propagar pelo desenho.")}
          <span className="ml-1 text-text-2/70">{t("Cálculo real do motor do ArchLab, com perfis fictícios de ensino.")}</span>
        </p>
      </div>
    </div>
  );
}

function PNode({ node, refEl, load, down }: { node: (typeof NODES)[number]; refEl: RefObject<HTMLDivElement | null>; load?: NodeLoad; down: boolean }) {
  const h = healthOf(load, down);
  const util = load?.utilization;
  return (
    <div className="relative z-10 flex flex-col items-center gap-2 text-center">
      <div ref={refEl} className="relative grid size-16 place-items-center rounded-2xl border bg-surface shadow-[0_8px_30px_-12px_rgba(0,0,0,.45)] transition-all duration-500 sm:size-24"
        style={{ borderColor: h === "ok" ? "var(--border)" : `color-mix(in srgb, ${TONE[h]} 55%, transparent)`, boxShadow: h === "bad" || h === "down" ? `0 0 0 4px color-mix(in srgb, ${TONE[h]} 14%, transparent)` : undefined }}>
        <ProviderLogo id={node.provider} name={t(node.sub)} size={44} className={down ? "opacity-30 grayscale" : ""} />
        {(h === "bad" || h === "down") && <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-danger text-white"><Icon name={down ? "power_off" : "priority_high"} size={14} /></span>}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[11px] font-semibold sm:text-[13px]">{t(node.label)}</div>
        <div className="font-mono text-[11px] tabular-nums transition-colors duration-500" style={{ color: TONE[h] }}>
          {node.id === "client" ? t("origem") : down ? t("fora do ar") : util == null ? "—" : Number.isFinite(util) ? `${Math.round(util * 100)}%` : "∞"}
        </div>
      </div>
      {node.id !== "client" && !down && util != null && Number.isFinite(util) && (
        <div className="h-1 w-full max-w-16 overflow-hidden rounded-full bg-track sm:max-w-20"><i className="block h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, util * 100)}%`, background: TONE[h] }} /></div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "ok" }: { label: string; value: string; tone?: "ok" | "bad" }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-4 backdrop-blur">
      <div className="font-mono text-[11px] text-text-2">{label}</div>
      <div className={cn("mt-1 font-mono text-xl font-semibold tabular-nums transition-colors duration-500", tone === "bad" ? "text-danger" : "text-text")}>{value}</div>
    </div>
  );
}
