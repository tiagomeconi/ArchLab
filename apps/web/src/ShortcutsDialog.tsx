import { useEffect, useRef } from "react";
import { Icon } from "./ui";
import { t } from "./i18n";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = IS_MAC ? "⌘" : "Ctrl";
export const modKey = MOD;

const GROUPS: { title: string; items: [string[], string][] }[] = [
  { title: "Seleção e edição", items: [
    [["Esc"], "Fecha o modal; sem modal, tira a seleção"],
    [[MOD, "A"], "Seleciona todos os componentes"],
    [["Delete"], "Apaga o componente ou a conexão selecionada"],
    [[MOD, "C"], "Copia os componentes selecionados"],
    [[MOD, "X"], "Recorta os componentes selecionados"],
    [[MOD, "V"], "Cola (com as conexões entre eles)"],
    [[MOD, "D"], "Duplica a seleção"],
    [["↑ ↓ ← →"], "Move a seleção (Shift = passos maiores)"],
  ] },
  { title: "Histórico", items: [
    [[MOD, "Z"], "Desfaz"],
    [[MOD, "Shift", "Z"], "Refaz (também {mod} + Y)"],
  ] },
  { title: "Navegação", items: [
    [["F"], "Enquadra o diagrama na tela"],
    [["L"], "Organiza o diagrama automaticamente"],
    [["Espaço", "arrastar"], "Move o canvas"],
    [["/"], "Busca na paleta de componentes"],
    [["B"], "Mostra ou esconde o enunciado"],
    [["M"], "Mostra ou esconde o minimapa"],
    [["?"], "Abre esta ajuda"],
  ] },
  { title: "Simulação", items: [
    [[MOD, "Enter"], "Simular / parar"],
  ] },
];

/** Atalhos de letra única só valem com o foco fora de campos de texto (spec §6.3). */
export function ShortcutsDialog({ onClose, onTour }: { onClose: () => void; onTour?: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} className="dialog keys" onClose={onClose}>
      <header className="chaos-head">
        <h2><Icon name="keyboard" size={22} />{" "}{t("Atalhos de teclado")}</h2>
        <button className="icon-btn" aria-label={t("Fechar")} onClick={() => ref.current?.close()}><Icon name="close" size={18} /></button>
      </header>
      <div className="keys-body">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h3>{t(g.title)}</h3>
            <ul>
              {g.items.map(([keys, desc]) => (
                <li key={desc}>
                  <span className="kbds">{keys.map((k, i) => <kbd key={i}>{t(k)}</kbd>)}</span>
                  <span>{t(desc, { mod: MOD })}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {onTour && <button className="chip" onClick={() => { ref.current?.close(); onTour(); }}><Icon name="help" size={16} />{" "}{t("Rever o tutorial")}</button>}
      </div>
    </dialog>
  );
}
