import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";

export type SaveState = "idle" | "saving" | "local" | "cloud" | "error";
const STATUS: Record<SaveState, [string, string]> = {
  idle: ["save", "Salvamento automático"], saving: ["sync", "Salvando…"], local: ["save", "Salvo neste navegador"],
  cloud: ["cloud_done", "Salvo na sua conta"], error: ["cloud_off", "Não salvou na nuvem; tentamos de novo na próxima edição"],
};

/** Nome do desenho (editável nos desenhos livres) com o estado do salvamento embaixo, no topo do laboratório. */
export function DesignName({ value, editable, onCommit, status }: { value: string; editable: boolean; onCommit: (v: string) => void; status: SaveState | null }) {
  const [edit, setEdit] = useState(false); const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (edit) { setDraft(value); input.current?.focus(); input.current?.select(); } }, [edit]); // eslint-disable-line react-hooks/exhaustive-deps
  const finish = (save: boolean) => { setEdit(false); const v = draft.trim().replace(/\s+/g, " ").slice(0, 60); if (save && v && v !== value) onCommit(v); };
  const [icon, text] = STATUS[status ?? "idle"];
  return (
    <div className="dn" data-tour="name">
      {edit ? (
        <input ref={input} className="dn-input" value={draft} maxLength={60} aria-label={t("Nome do desenho")} onChange={(e) => setDraft(e.target.value)}
          onBlur={() => finish(true)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); finish(true); } else if (e.key === "Escape") { e.stopPropagation(); finish(false); } }} />
      ) : editable ? (
        <button type="button" className="dn-name" onClick={() => setEdit(true)} title={t("Renomear o desenho")} aria-label={`${t("Nome do desenho")}: ${value}. ${t("Clique para renomear")}`}>
          <span>{value}</span><Icon name="edit" size={13} />
        </button>
      ) : <span className="dn-name static" title={value}><span>{value}</span></span>}
      {status && <small className={`dn-status ${status}`} role="status" aria-live="polite" title={t(text)}><Icon name={icon} size={12} /><span>{t(text)}</span></small>}
    </div>
  );
}
