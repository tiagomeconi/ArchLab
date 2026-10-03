import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "motion/react";
import { solveDemand, type NodeLoad } from "@archlab/domain";
import fixture from "../../../../fixtures/url-shortener-baseline.json";
import { Icon, Logo } from "../ui";
import { ProviderLogo } from "../ProviderLogo";
import { Iphone } from "./ui/iphone";
import { cn } from "./lib/utils";
import { t } from "../i18n";

/** O laboratório visto no celular: o mesmo motor de simulação, num roteiro que se repete (normal → pico → cache cai → banco lento → recuperado). */
const STEPS = [
  { label: "Tudo saudável", icon: "check_circle", tone: "ok", traffic: 1, cacheDown: false, dbLat: 0 },
  { label: "Pico de tráfego ×1,5", icon: "trending_up", tone: "warn", traffic: 1.5, cacheDown: false, dbLat: 0 },
  { label: "Redis indisponível", icon: "flash_off", tone: "bad", traffic: 1, cacheDown: true, dbLat: 0 },
  { label: "Banco lento · +200 ms", icon: "timer", tone: "bad", traffic: 1, cacheDown: true, dbLat: 200 },
  { label: "Sistema recuperado", icon: "verified", tone: "ok", traffic: 1, cacheDown: false, dbLat: 0 },
] as const;
const INFO: Record<string, { name: string; sub: string; provider: string }> = {
  client: { name: "Cliente", sub: "origem de carga", provider: "chrome" },
  lb: { name: "Load balancer", sub: "NGINX", provider: "nginx" },
  app: { name: "Backend ×3", sub: "Node.js", provider: "nodejs" },
  cache: { name: "Cache", sub: "Redis", provider: "redis" },
  db: { name: "Banco", sub: "PostgreSQL", provider: "postgresql" },
};
const TONE = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--danger)" } as const;
const toneOf = (u: number | null | undefined, down: boolean) => (down || (u != null && u > 1) ? "bad" : u != null && u > 0.8 ? "warn" : "ok") as keyof typeof TONE;
const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");

function useScenario() {
  const doc = fixture as any;
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "-10% 0px" });
  const [step, setStep] = useState(0);
  useEffect(() => { if (!visible) return; const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 3200); return () => clearInterval(t); }, [visible]);
  const results = useMemo(() => STEPS.map((s) => {
    const nodes: Record<string, any> = {};
    if (s.cacheDown) nodes.cache = { unavailable: true };
    if (s.dbLat) nodes.db = { extraLatencyMs: s.dbLat };
    const r = solveDemand(doc, { rps: Math.round(5000 * s.traffic), effects: { nodes } });
    const f = r.flows.get("flow-redirect")!;
    return { loads: r.loads, offered: f.offered, completed: f.completed, p95: f.p95Ms, err: f.offered ? 1 - f.completed / f.offered : 0 };
  }), [doc]);
  return { ref, step, results };
}

function Card({ id, load, down }: { id: string; load?: NodeLoad; down: boolean }) {
  const info = INFO[id]!;
  const u = load?.utilization;
  const tone = id === "client" ? "ok" : toneOf(u, down);
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-surface px-3 py-2.5 transition-all duration-700" style={{ borderColor: tone === "ok" ? "var(--border)" : `color-mix(in srgb, ${TONE[tone]} 55%, transparent)`, boxShadow: tone === "bad" ? `0 0 0 3px color-mix(in srgb, ${TONE.bad} 13%, transparent)` : "none" }}>
      <ProviderLogo id={info.provider} name={t(info.sub)} size={30} className={down ? "opacity-30 grayscale" : ""} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-semibold">{t(info.name)}</span>
          <span className="text-[12px] font-semibold tabular-nums transition-colors duration-700" style={{ color: TONE[tone] }}>{id === "client" ? "origem" : down ? "fora" : u == null ? "—" : Number.isFinite(u) ? `${Math.round(u * 100)}%` : "∞"}</span></div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-track"><i className="block h-full rounded-full transition-all duration-1000" style={{ width: id === "client" || down || u == null ? "0%" : `${Math.min(100, u * 100)}%`, background: TONE[tone] }} /></div>
      </div>
    </div>
  );
}

function Link({ on, tone = "accent", dashed = false }: { on: boolean; tone?: "accent" | "bad"; dashed?: boolean }) {
  return (
    <div className="relative mx-auto h-5 w-px overflow-hidden" style={{ background: dashed ? "transparent" : "var(--border-strong)", borderLeft: dashed ? "1px dashed var(--border-strong)" : undefined }}>
      {on && <i className="mlab-dot absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full" style={{ background: tone === "bad" ? "var(--danger)" : "var(--accent)" }} />}
    </div>
  );
}

function Screen({ step, results }: { step: number; results: ReturnType<typeof useScenario>["results"] }) {
  const s = STEPS[step]!; const r = results[step]!; const L = r.loads;
  const cacheDown = s.cacheDown;
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-bg text-text" style={{ fontFamily: "var(--font-sans)" }}>
      {/* barra de status + ilha dinâmica */}
      <div className="flex items-center justify-between px-8 pt-[18px] text-[15px] font-semibold"><span>9:41</span>
        <span className="flex items-center gap-1.5"><Icon name="signal_cellular_alt" size={16} /><Icon name="wifi" size={16} /><Icon name="battery_full" size={18} /></span></div>
      {/* navegação */}
      <div className="mt-6 flex items-center justify-between px-5">
        <div className="flex items-center gap-2"><Logo size={32} />
          <div className="leading-tight"><b className="block text-[15px]">{t("ArchLab")}</b><span className="text-[11.5px] text-text-2">{t("Links curtos")}</span></div></div>
        <span className="grid size-9 place-items-center rounded-xl border border-line bg-surface text-text-2"><Icon name="local_fire_department" size={18} /></span>
      </div>
      {/* aviso do cenário */}
      <div className="mx-5 mt-4">
        <div key={step} className="mlab-banner flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold" style={{ color: TONE[s.tone], background: `color-mix(in srgb, ${TONE[s.tone]} 13%, transparent)` }}>
          <Icon name={s.icon} size={17} />{t(s.label)}
          <span className="ml-auto text-[11px] font-medium opacity-80 tabular-nums">{fmt(r.offered)}/s</span>
        </div>
      </div>
      {/* fluxo */}
      <div className="mx-5 mt-4 flex flex-col">
        <Card id="client" load={L.get("client")} down={false} />
        <Link on />
        <Card id="lb" load={L.get("lb")} down={false} />
        <Link on />
        <Card id="app" load={L.get("app")} down={false} />
        <div className="grid grid-cols-2 gap-2.5">
          <div><Link on={!cacheDown} dashed={cacheDown} /><Card id="cache" load={L.get("cache")} down={cacheDown} /></div>
          <div><Link on tone={toneOf(L.get("db")?.utilization, false) === "bad" ? "bad" : "accent"} /><Card id="db" load={L.get("db")} down={false} /></div>
        </div>
      </div>
      {/* eventos recentes */}
      <div className="mx-5 mt-4">
        <div className="mb-2 text-[12px] font-semibold text-text-2">{t("Eventos")}</div>
        <div className="flex flex-col gap-1.5">
          {STEPS.slice(0, step + 1).slice(-3).reverse().map((e, i) => (
            <div key={e.label} className={cn("mlab-banner flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px]", i === 0 ? "bg-track" : "opacity-60")}>
              <span style={{ color: TONE[e.tone] }}><Icon name={e.icon} size={15} /></span>
              <span className="flex-1 truncate font-medium">{t(e.label)}</span>
              <span className="tabular-nums text-text-2">{String(STEPS.indexOf(e) * 20).padStart(2, "0")} s</span>
            </div>
          ))}
        </div>
      </div>
      {/* resultado (folha inferior) */}
      <div className="mt-auto rounded-t-[26px] border-t border-line bg-surface px-5 pb-8 pt-3 shadow-[0_-20px_50px_-30px_rgba(0,0,0,.6)]">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-line-strong" />
        <div className="flex items-center justify-between"><b className="text-[15px]">{t("Resultado")}</b><span className="text-[11.5px] text-text-2">{t("simulação · 300 s")}</span></div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[["Concluídas", `${fmt(r.completed)}/s`, r.err > 0.01], ["Erro", `${(r.err * 100).toFixed(r.err * 100 < 10 ? 1 : 0)}%`, r.err > 0.001], ["p95", r.p95 === null ? "—" : `${Math.round(r.p95)} ms`, (r.p95 ?? 0) > 200]].map(([l, v, bad]) => (
            <div key={String(l)} className="rounded-xl bg-track px-2.5 py-2"><div className="text-[11px] text-text-2">{t(String(l))}</div>
              <div className="text-[15px] font-semibold tabular-nums transition-colors duration-700" style={{ color: bad ? "var(--danger)" : "var(--text)" }}>{v}</div></div>
          ))}
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {results.map((x, i) => (
            <i key={i} className="h-1.5 flex-1 rounded-full transition-all duration-700" style={{ background: i <= step ? (x.err > 0.01 ? "var(--danger)" : "var(--ok)") : "var(--track)", opacity: i === step ? 1 : 0.55 }} />
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-2 mx-auto h-1 w-28 rounded-full bg-text/70" />
    </div>
  );
}

export function MobileLab({ className }: { className?: string }) {
  const { ref, step, results } = useScenario();
  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[70px]" />
      <Iphone><Screen step={step} results={results} /></Iphone>
    </div>
  );
}
