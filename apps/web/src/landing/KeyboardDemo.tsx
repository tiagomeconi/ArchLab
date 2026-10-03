import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Icon } from "../ui";
import { ProviderLogo } from "../ProviderLogo";
import { cn } from "./lib/utils";
import { t } from "../i18n";

/** Duas ações de teclado em loop sobre um mini-canvas: copiar/colar um componente e apagar/desfazer. */
const STEPS = [
  { ms: 900, sel: false, keys: [] as string[], label: "", toast: null as string | null, clone: false, cursor: "idle" },
  { ms: 1000, sel: true, keys: [], label: "Selecionar", toast: null, clone: false, cursor: "redis" },
  { ms: 1200, sel: true, keys: ["Ctrl", "C"], label: "Copiar", toast: "Copiado", clone: false, cursor: "redis" },
  { ms: 1500, sel: false, keys: ["Ctrl", "V"], label: "Colar", toast: "Colado", clone: true, cursor: "redis" },
  { ms: 1300, sel: false, keys: ["Delete"], label: "Apagar", toast: null, clone: false, cursor: "redis" },
  { ms: 1700, sel: false, keys: ["Ctrl", "Z"], label: "Desfazer", toast: "Desfeito", clone: true, cursor: "redis" },
  { ms: 1100, sel: false, keys: [], label: "", toast: null, clone: true, cursor: "redis" },
];

function Key({ k, down }: { k: string; down: boolean }) {
  return (
    <motion.kbd animate={down ? { y: 3, scale: 0.94 } : { y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 520, damping: 22 }}
      className={cn("grid min-h-11 min-w-11 place-items-center rounded-xl border border-b-[4px] px-3.5 text-[15px] font-semibold shadow-sm transition-colors duration-200",
        down ? "border-accent bg-accent/15 text-accent shadow-[0_0_30px_-6px_var(--accent)]" : "border-line-strong bg-surface text-text")}>
      {k}
    </motion.kbd>
  );
}

function NodeCard({ name, logo, selected = false, ghost = false }: { name: string; logo: string; selected?: boolean; ghost?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border bg-surface px-2.5 py-2 transition-all duration-300", ghost && "opacity-60")}
      style={{ borderColor: selected ? "var(--accent)" : "var(--border)", boxShadow: selected ? "0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent)" : "none" }}>
      <ProviderLogo id={logo} name={name} size={22} />
      <div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold">{name}</div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-track"><i className="block h-full w-1/4 rounded-full bg-ok" /></div></div>
    </div>
  );
}

export function KeyboardDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "-10% 0px" });
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setI((n) => (n + 1) % STEPS.length), STEPS[i]!.ms);
    return () => clearTimeout(t);
  }, [i, visible]);
  const s = STEPS[i]!;
  const history = STEPS.slice(0, i + 1).filter((x) => x.label && x.keys.length).slice(-3).reverse();

  return (
    <div ref={ref} className="grid items-stretch gap-4 sm:grid-cols-[1.25fr_1fr]">
      {/* mini-canvas */}
      <div className="relative h-[13.5rem] overflow-hidden rounded-2xl border border-line-strong bg-bg">
        <div className="lp-grid absolute inset-0 opacity-70" />
        <div className="absolute left-[4%] top-[14%] w-[28%]"><NodeCard name="Cliente" logo="chrome" /></div>
        <div className="absolute left-[36%] top-[14%] w-[28%]"><NodeCard name="API" logo="nodejs" /></div>
        <div className="absolute left-[68%] top-[14%] w-[28%]"><NodeCard name="Redis" logo="redis" selected={s.sel} /></div>
        <i className="absolute left-[32%] top-[27%] h-px w-[4%] bg-line-strong" /><i className="absolute left-[64%] top-[27%] h-px w-[4%] bg-line-strong" />
        <AnimatePresence>
          {s.clone && (
            <motion.div key="clone" initial={{ opacity: 0, scale: 0.8, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 6 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }} className="absolute left-[67%] top-[48%] w-[28%]">
              <NodeCard name="Redis" logo="redis" selected={i === 3} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* cursor: a ponta da seta (canto superior esquerdo) pousa dentro do card do Redis */}
        <motion.span animate={s.cursor === "idle" ? { left: "55%", top: "82%", opacity: 0 } : { left: "84%", top: "27%", opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute z-10 -translate-x-[3px] -translate-y-[2px] drop-shadow-md">
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden>
            <path d="M2 1.5v16l4.3-4 3 6.6 3-1.4-3-6.4H16L2 1.5z" fill="var(--text)" stroke="var(--bg)" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </motion.span>
        {/* toast */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <AnimatePresence mode="wait">
            {s.toast && (
              <motion.span key={s.toast} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                className="rounded-full bg-text px-3.5 py-1.5 text-[12px] font-semibold text-bg shadow-lg">{s.toast}</motion.span>
            )}
          </AnimatePresence>
        </div>
        {/* teclas (telas pequenas) */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 sm:hidden">{s.keys.map((k) => <Key key={k} k={k} down />)}</div>
      </div>

      {/* teclado */}
      <div className="hidden flex-col justify-between rounded-2xl border border-line bg-surface/50 p-4 sm:flex">
        <div className="flex min-h-[4.5rem] flex-col items-start justify-center gap-2.5">
          <div className="flex items-center gap-2">
            {(s.keys.length ? s.keys : ["Ctrl", "…"]).map((k, idx) => (
              <span key={k + idx} className="inline-flex items-center gap-2">
                {idx > 0 && <span className="text-text-2">+</span>}
                <Key k={k} down={s.keys.length > 0} />
              </span>
            ))}
          </div>
          <div className="h-5 text-[13px] font-semibold text-accent">{s.label}</div>
        </div>
        <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
          {history.length === 0 && <li className="text-[12px] text-text-2">{t("Aguardando o primeiro atalho…")}</li>}
          {history.map((h, idx) => (
            <li key={h.label} className={cn("flex items-center justify-between text-[12px] transition-opacity", idx === 0 ? "text-text" : "text-text-2 opacity-60")}>
              <span className="font-medium">{h.label}</span><span className="tabular-nums text-text-2">{h.keys.join(" + ")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
