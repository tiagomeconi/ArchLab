import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";

/** Botão de download com duas saídas: o arquivo do desenho (.json, reimportável) e o relatório em imagem para compartilhar. */
export function ExportMenu({ onJson, onReport, busy }: { onJson: () => void; onReport: () => void; busy?: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", key); document.addEventListener("mousedown", down);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("mousedown", down); };
  }, [open]);
  const pick = (fn: () => void) => () => { setOpen(false); fn(); };
  return (
    <div className="export-menu" ref={box}>
      <button className="chip icon-only" aria-label={t("Exportar")} title={t("Exportar")} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name={busy ? "hourglass_top" : "download"} size={18} />
      </button>
      {open && (
        <div className="export-pop" role="menu" aria-label={t("Exportar")}>
          <button role="menuitem" onClick={pick(onReport)}>
            <Icon name="image" size={20} /><span><b>{t("Relatório em imagem")}</b><small>{t("PNG com a nota, o caso e o desenho, para compartilhar")}</small></span>
          </button>
          <button role="menuitem" onClick={pick(onJson)}>
            <Icon name="data_object" size={20} /><span><b>{t("Desenho (.json)")}</b><small>{t("Arquivo para guardar e importar de volta")}</small></span>
          </button>
        </div>
      )}
    </div>
  );
}
