import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";

/** Um só botão para tudo que sai ou entra do desenho: link de compartilhamento, relatório em imagem, arquivo .json e importação. */
export function ExportMenu({ onLink, onJson, onMermaid, onDoc, onReport, onCard, onImport, busy }: { onLink: () => void; onJson: () => void; onMermaid: () => void; onDoc: () => void; onReport: () => void; onCard: () => void; onImport: () => void; busy?: boolean }) {
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
    <div className="export-menu" ref={box} data-tour="share">
      <button className="chip" aria-label={t("Compartilhar e exportar")} title={t("Compartilhar e exportar")} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name={busy ? "hourglass_top" : "ios_share"} size={18} /><span className="lbl">{t("Compartilhar")}</span>
      </button>
      {open && (
        <div className="export-pop" role="menu" aria-label={t("Compartilhar e exportar")}>
          <p className="export-sec" role="presentation">{t("Compartilhar")}</p>
          <button role="menuitem" onClick={pick(onLink)}>
            <Icon name="link" size={20} /><span><b>{t("Copiar link do desenho")}</b><small>{t("Gera um link para abrir este desenho")}</small></span>
          </button>
          <p className="export-sec" role="presentation">{t("Exportar")}</p>
          <button role="menuitem" onClick={pick(onCard)}>
            <Icon name="badge" size={20} /><span><b>{t("Cartão da nota para redes sociais")}</b><small>{t("PNG vertical com a sua liga e a nota, pronto para o LinkedIn")}</small></span>
          </button>
          <button role="menuitem" onClick={pick(onReport)}>
            <Icon name="image" size={20} /><span><b>{t("Relatório em imagem")}</b><small>{t("PNG com a nota, o caso e o desenho, para compartilhar")}</small></span>
          </button>
          <button role="menuitem" onClick={pick(onDoc)}>
            <Icon name="description" size={20} /><span><b>{t("Documento de design (.md)")}</b><small>{t("Componentes, comunicação, riscos e custo, pronto para README ou wiki")}</small></span>
          </button>
          <button role="menuitem" onClick={pick(onMermaid)}>
            <Icon name="schema" size={20} /><span><b>{t("Diagrama Mermaid (.mmd)")}</b><small>{t("Texto que o GitHub, Notion e Obsidian desenham sozinhos")}</small></span>
          </button>
          <button role="menuitem" onClick={pick(onJson)}>
            <Icon name="data_object" size={20} /><span><b>{t("Desenho (.json)")}</b><small>{t("Arquivo para guardar e importar de volta")}</small></span>
          </button>
          <p className="export-sec" role="presentation">{t("Importar")}</p>
          <button role="menuitem" onClick={pick(onImport)}>
            <Icon name="upload" size={20} /><span><b>{t("Abrir arquivo (.json)")}</b><small>{t("Carrega um arquivo salvo antes")}</small></span>
          </button>
        </div>
      )}
    </div>
  );
}
