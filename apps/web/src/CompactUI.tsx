import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";

/** Peças do laboratório em celular e tablet em pé: navegação inferior, gavetas que sobem de baixo, barra de ações e menu "Mais". */
export type DockTab = "brief" | "components" | "flows" | "props" | "review";
export type Snap = "closed" | "half" | "full";

export function Dock({ items, active, onPick }: { items: { id: DockTab; icon: string; label: string; badge?: number }[]; active: DockTab | null; onPick: (id: DockTab) => void }) {
  return (
    <nav className="dock" aria-label={t("Navegação do laboratório")}>
      {items.map((i) => (
        <button key={i.id} type="button" className={active === i.id ? "on" : ""} aria-pressed={active === i.id} onClick={() => onPick(i.id)}>
          <span className="dock-ico"><Icon name={i.icon} size={22} />{i.badge ? <i className="dock-badge" aria-label={t("{n} importantes", { n: i.badge })}>{i.badge}</i> : null}</span>
          <span className="dock-lbl">{i.label}</span>
        </button>
      ))}
    </nav>
  );
}

/**
 * Alça de uma gaveta: arrastar para cima abre mais, para baixo fecha; um toque alterna meia altura e altura total.
 * O movimento acompanha o dedo (sem animação durante o arrasto) e, ao soltar, a gaveta encaixa no ponto mais próximo.
 */
export function useSheetDrag(ref: RefObject<HTMLElement | null>, snap: Snap, setSnap: (s: Snap) => void) {
  const start = useRef<{ y: number; t: number; moved: boolean } | null>(null);
  const order: Snap[] = ["closed", "half", "full"];
  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!start.current || !el) return;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dy) > 6) start.current.moved = true;
    // o limite superior é a altura total: puxar além disso não faz nada
    const up = snap === "full" ? Math.min(0, dy) * 0.25 : Math.min(0, dy);
    el.style.transition = "none"; el.style.transform = `translateY(${Math.max(up, -el.offsetHeight * 0.6) + Math.max(0, dy)}px)`;
  };
  const end = (e: React.PointerEvent) => {
    const el = ref.current; const s = start.current; start.current = null; if (!el || !s) return;
    el.style.transition = ""; el.style.transform = "";
    const dy = e.clientY - s.y, v = Math.abs(dy) / Math.max(1, performance.now() - s.t);
    if (!s.moved) { setSnap(snap === "full" ? "half" : "full"); return; }
    const i = order.indexOf(snap);
    if (dy < -50 || (dy < -20 && v > 0.5)) setSnap(order[Math.min(2, i + 1)]!);
    else if (dy > 50 || (dy > 20 && v > 0.5)) setSnap(order[Math.max(0, i - 1)]!);
  };
  return {
    onPointerDown: (e: React.PointerEvent) => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); start.current = { y: e.clientY, t: performance.now(), moved: false }; },
    onPointerMove: move, onPointerUp: end, onPointerCancel: end,
  };
}

export function SheetGrip({ asideRef, snap, setSnap, title }: { asideRef: RefObject<HTMLElement | null>; snap: Snap; setSnap: (s: Snap) => void; title: string }) {
  const drag = useSheetDrag(asideRef, snap, setSnap);
  return (
    <div className="sheet-grip" role="group" aria-label={title}>
      <div className="grip-hit" {...drag} role="button" tabIndex={0} aria-label={snap === "full" ? t("Reduzir o painel") : t("Expandir o painel")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSnap(snap === "full" ? "half" : "full"); } }}><i /></div>
      <button type="button" className="icon-btn grip-close" aria-label={t("Fechar o painel")} onClick={() => setSnap("closed")}><Icon name="keyboard_arrow_down" size={22} /></button>
    </div>
  );
}

/** Barra flutuante do bloco selecionado: conectar, réplicas, propriedades e remover, tudo ao alcance do polegar. */
export function NodeActionBar({ raised, name, replicas, maxReplicas, connecting, onConnect, onReplicas, onProps, onRemove, onCancel }: {
  raised?: boolean; name: string; replicas: number; maxReplicas: number; connecting: boolean; onConnect: () => void; onReplicas: (n: number) => void; onProps: () => void; onRemove: () => void; onCancel: () => void;
}) {
  if (connecting) {
    return (
      <div className={`action-bar connecting${raised ? " raised" : ""}`} role="status">
        <span><Icon name="touch_app" size={20} /><b>{t("Toque no destino")}</b><small>{t("de {nome}", { nome: name })}</small></span>
        <button type="button" className="chip" onClick={onCancel}>{t("Cancelar")}</button>
      </div>
    );
  }
  return (
    <div className={`action-bar${raised ? " raised" : ""}`} role="toolbar" aria-label={t("Ações de {nome}", { nome: name })}>
      <button type="button" className="ab primary" onClick={onConnect}><Icon name="arrow_right_alt" size={22} /><span>{t("Conectar")}</span></button>
      <span className="ab-step" role="group" aria-label={t("Réplicas")}>
        <button type="button" aria-label={t("Menos uma réplica")} disabled={replicas <= 1} onClick={() => onReplicas(replicas - 1)}><Icon name="remove" size={20} /></button>
        <b className="num" title={t("Réplicas")}>×{replicas}</b>
        <button type="button" aria-label={t("Mais uma réplica")} disabled={replicas >= maxReplicas} onClick={() => onReplicas(replicas + 1)}><Icon name="add" size={20} /></button>
      </span>
      <button type="button" className="ab" aria-label={t("Propriedades")} onClick={onProps}><Icon name="tune" size={22} /></button>
      <button type="button" className="ab danger" aria-label={t("Remover componente")} onClick={onRemove}><Icon name="delete" size={22} /></button>
    </div>
  );
}

export interface LessonSummary { step: number; total: number; title: string; done: number; tasks: number; complete: boolean }
/** Faixa da aula acima da navegação: o passo atual e quantas tarefas faltam, sempre à vista enquanto a pessoa monta o desenho. */
export function LessonStrip({ s, onOpen }: { s: LessonSummary; onOpen: () => void }) {
  return (
    <button type="button" className={`lesson-strip${s.complete ? " ok" : ""}`} onClick={onOpen} aria-label={t("Abrir a aula: passo {a} de {b}", { a: s.step, b: s.total })}>
      <span className="ls-ico"><Icon name={s.complete ? "check_circle" : "school"} size={20} /></span>
      <span className="ls-txt"><small>{t("Passo {a} de {b}", { a: s.step, b: s.total })} · {s.done}/{s.tasks}</small><b>{s.title}</b></span>
      <span className="ls-go">{s.complete ? t("Continuar") : t("Ver")}<Icon name="keyboard_arrow_up" size={20} /></span>
    </button>
  );
}

/** Menu "Mais": cenário da simulação e as ações que no computador ficam espalhadas pelo cabeçalho. */
export function MoreSheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => { ref.current?.showModal(); requestAnimationFrame(() => setShown(true)); }, []);
  return (
    <dialog ref={ref} className={`dialog more-sheet${shown ? " in" : ""}`} onClose={onClose} onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }} aria-label={t("Mais opções")}>
      <div className="grip-hit static"><i /></div>
      <div className="more-body">{children}</div>
    </dialog>
  );
}

export const MoreRow = ({ icon, label, hint, onClick, badge }: { icon: string; label: string; hint?: string; onClick: () => void; badge?: number }) => (
  <button type="button" className="more-row" onClick={onClick}>
    <span className="mr-ico"><Icon name={icon} size={22} /></span>
    <span className="mr-txt"><b>{label}</b>{hint && <small>{hint}</small>}</span>
    {badge ? <i className="mr-badge">{badge}</i> : <Icon name="chevron_right" size={20} />}
  </button>
);
