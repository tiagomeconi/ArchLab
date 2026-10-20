import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";
import { placePopover, TOUR_STEPS, type Box } from "./tour";

const DONE = "archlab:tour-done";
export const tourDone = () => { try { return localStorage.getItem(DONE) === "1"; } catch { return true; } };
export const markTourDone = () => { try { localStorage.setItem(DONE, "1"); } catch { /* ignora */ } };

/** Passeio guiado do laboratório: destaca cada área (elementos com `data-tour`), explica em poucas linhas e se adapta ao que existe na tela. */
export function Tour({ onClose }: { onClose: () => void }) {
  const steps = useMemo(() => TOUR_STEPS.filter((s) => !s.target || document.querySelector(`[data-tour="${s.target}"]`)), []);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Box | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const pop = useRef<HTMLDivElement>(null); const next = useRef<HTMLButtonElement>(null);
  const step = steps[i]!; const last = i === steps.length - 1;
  const close = () => { markTourDone(); onClose(); };

  useLayoutEffect(() => {
    const el = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;
    if (!el) { setRect(null); return; }
    const measure = () => { const r = el.getBoundingClientRect(); setRect({ x: Math.max(4, r.left - 6), y: Math.max(4, r.top - 6), w: r.width + 12, h: r.height + 12 }); };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    window.addEventListener("resize", measure); window.addEventListener("scroll", measure, true);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true); };
  }, [i, step.target]);
  useLayoutEffect(() => {
    const b = pop.current?.getBoundingClientRect(); const vp = { w: window.innerWidth, h: window.innerHeight };
    if (!b) return;
    setPos(rect ? placePopover(rect, { w: b.width, h: b.height }, vp, step.side) : { x: Math.max(12, vp.w / 2 - b.width / 2), y: Math.max(12, vp.h / 2 - b.height / 2) });
  }, [rect, i, step.side]);
  useEffect(() => { next.current?.focus({ preventScroll: true }); }, [i]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === "ArrowRight" || e.key === "Enter") { if (document.activeElement?.tagName === "BUTTON" && e.key === "Enter") return; e.preventDefault(); last ? close() : setI((n) => n + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); setI((n) => Math.max(0, n - 1)); }
    };
    window.addEventListener("keydown", key, true); return () => window.removeEventListener("keydown", key, true);
  });

  return (
    <div className="tour-layer" role="presentation">
      {rect ? <div className="tour-spot" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} /> : <div className="tour-dim" />}
      <div ref={pop} className="tour-pop" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-text" style={pos ? { left: pos.x, top: pos.y } : { left: -9999, top: 0 }}>
        <p className="tour-count">{t("Passo {n} de {total}", { n: i + 1, total: steps.length })}</p>
        <h3 id="tour-title">{t(step.title)}</h3>
        <p id="tour-text">{t(step.text)}</p>
        <div className="tour-foot">
          <span className="tour-dots" aria-hidden>{steps.map((_, k) => <i key={k} className={k === i ? "on" : ""} />)}</span>
          <span className="tour-btns">
            <button type="button" className="chip" onClick={close}>{last ? t("Fechar") : t("Pular")}</button>
            {i > 0 && <button type="button" className="chip" onClick={() => setI(i - 1)}>{t("Anterior")}</button>}
            <button ref={next} type="button" className="chip primary" onClick={() => (last ? close() : setI(i + 1))}>{last ? t("Concluir") : t("Próximo")}<Icon name={last ? "check" : "arrow_forward"} size={16} /></button>
          </span>
        </div>
      </div>
    </div>
  );
}
