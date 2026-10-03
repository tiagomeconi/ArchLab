import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";

export const NOTE_MAX = 4000;

/** Notas gerais do desenho: botão de lápis no canvas que abre um bloco de anotações livre (conversa da entrevista, ajustes pedidos). */
export function NotesPad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!open) return;
    area.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", key); document.addEventListener("mousedown", down);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("mousedown", down); };
  }, [open]);
  const filled = value.trim().length > 0;
  return (
    <div className="notes-pad nodrag nopan" ref={box}>
      <button type="button" className={`notes-btn${filled ? " filled" : ""}`} aria-expanded={open} aria-haspopup="dialog"
        title={t("Anotações do desenho")} aria-label={t("Anotações do desenho")} onClick={() => setOpen((o) => !o)}>
        <Icon name="edit" size={18} />{filled && <i className="notes-dot" aria-hidden />}
      </button>
      {open && (
        <div className="notes-card" role="dialog" aria-label={t("Anotações do desenho")}>
          <div className="notes-head"><b>{t("Anotações do desenho")}</b>
            <button type="button" className="notes-x" aria-label={t("Fechar")} onClick={() => setOpen(false)}><Icon name="close" size={16} /></button></div>
          <textarea ref={area} value={value} maxLength={NOTE_MAX} onChange={(e) => onChange(e.target.value)} spellCheck
            placeholder={t("O que foi dito na entrevista, pontos a ajustar, perguntas para o entrevistador…")} aria-label={t("Anotações do desenho")} />
          <div className="notes-foot"><span>{t("Salvo neste navegador, junto do desenho")}</span><span>{value.length}/{NOTE_MAX}</span></div>
        </div>
      )}
    </div>
  );
}
