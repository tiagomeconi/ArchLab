import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";
import { ITEM_BY_TYPE } from "./catalog";
import { PATTERNS, type Pattern } from "./patterns";
import type { Version } from "./versions";

/** Padrões prontos: pequenas arquiteturas (cache, fila e workers, CQRS, duas zonas…) para inserir no canvas. */
export function PatternsDialog({ onPick, onClose }: { onPick: (p: Pattern) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} className="dialog chaos patterns" onClose={onClose} aria-label={t("Padrões prontos")}>
      <header className="chaos-head"><h2><Icon name="extension" size={22} />{" "}{t("Padrões prontos")}</h2>
        <button className="icon-btn" aria-label={t("Fechar")} onClick={() => ref.current?.close()}><Icon name="close" size={18} /></button></header>
      <p className="sub">{t("Escolha um padrão para inserir no canvas. Depois ligue o seu cliente à entrada e ajuste réplicas e provedores.")}</p>
      <div className="chaos-body"><div className="chaos-grid">
        {PATTERNS.map((p) => (
          <button key={p.id} className="chaos-card" onClick={() => { onPick(p); ref.current?.close(); }}>
            <span className="ci"><Icon name={p.icon} size={20} /></span>
            <span className="ct"><b>{t(p.title)}</b><small>{t(p.summary)}</small>
              <em>{p.nodes.map((n) => ITEM_BY_TYPE.get(n.type)?.label ?? n.type).filter((v, i, a) => a.indexOf(v) === i).map((l) => t(l)).join(" · ")}</em></span>
          </button>
        ))}
      </div></div>
    </dialog>
  );
}

/** Versões nomeadas do desenho: salvar um ponto de retorno, voltar a ele ou apagá-lo. */
export function VersionsDialog({ versions, onSave, onRestore, onDelete, onClose }: { versions: Version[]; onSave: (name: string) => void; onRestore: (v: Version) => void; onDelete: (v: Version) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  useEffect(() => { ref.current?.showModal(); }, []);
  const fmt = (at: number) => new Date(at).toLocaleString();
  return (
    <dialog ref={ref} className="dialog interview versions" onClose={onClose} aria-label={t("Versões do desenho")}>
      <header className="chaos-head"><h2><Icon name="history" size={22} />{" "}{t("Versões do desenho")}</h2>
        <button className="icon-btn" aria-label={t("Fechar")} onClick={() => ref.current?.close()}><Icon name="close" size={18} /></button></header>
      <p className="sub">{t("Salve pontos de retorno antes de mudanças grandes. As versões ficam neste navegador, junto do desenho.")}</p>
      <form className="ver-form" onSubmit={(e) => { e.preventDefault(); onSave(name); setName(""); }}>
        <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder={t("Nome da versão (ex.: antes do cache)")} aria-label={t("Nome da versão")} />
        <button className="chip primary" type="submit"><Icon name="bookmark_add" size={16} />{" "}{t("Salvar versão agora")}</button>
      </form>
      {versions.length === 0 ? <p className="note">{t("Nenhuma versão salva ainda.")}</p> : (
        <ul className="ver-list">
          {versions.map((v) => (
            <li key={v.id}>
              <span><b>{v.name}</b><small>{fmt(v.at)}</small></span>
              <button className="chip" onClick={() => { onRestore(v); ref.current?.close(); }}>{t("Restaurar")}</button>
              <button className="icon-btn" aria-label={`${t("Apagar versão")}: ${v.name}`} onClick={() => onDelete(v)}><Icon name="delete" size={16} /></button>
            </li>
          ))}
        </ul>
      )}
    </dialog>
  );
}
