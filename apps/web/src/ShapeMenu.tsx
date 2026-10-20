import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";
import { SHAPES, type Shape } from "./trafficShape";

const ICON: Record<Shape, string> = { flat: "trending_flat", spike: "show_chart", daily: "schedule", ramp: "trending_up" };

/** Botão compacto do formato do tráfego (fica na linha do rótulo "Tráfego"): abre um menu no mesmo estilo dos outros. */
export function ShapeMenu({ shape, onChange }: { shape: Shape; onChange: (s: Shape) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  const cur = SHAPES.find((s) => s.id === shape)!;
  return (
    <span className="shape-menu" ref={box}>
      <button type="button" className="shape-btn" aria-haspopup="menu" aria-expanded={open} aria-label={`${t("Formato do tráfego na simulação")}: ${t(cur.label)}`} title={`${t("Formato do tráfego na simulação")}: ${t(cur.label)}`} onClick={() => setOpen((o) => !o)}>
        <Icon name={ICON[shape]} size={15} />
      </button>
      {open && (
        <div className="export-pop shape-pop" role="menu" aria-label={t("Formato do tráfego na simulação")}>
          <p className="export-sec" role="presentation">{t("Formato do tráfego")}</p>
          {SHAPES.map((s) => (
            <button key={s.id} type="button" role="menuitemradio" aria-checked={s.id === shape} onClick={() => { onChange(s.id); setOpen(false); }}>
              <Icon name={ICON[s.id]} size={20} /><span><b>{t(s.label)}</b></span>{s.id === shape && <Icon name="check" size={18} />}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
