import { useEffect, useRef, useState } from "react";
import { CHAOS, CHAOS_CATEGORIES, type ChaosItem } from "./chaos";
import { Icon } from "./ui";
import { t } from "./i18n";

export interface TargetInfo { id: string; name: string; why: string }

/** Modal do modo caos: escolha falhas, veja o alvo de cada uma e aplique/simule. */
export function ChaosDialog({ active, suggested, targetOf, selectedName, onApply, onClose }: {
  active: Set<string>;
  /** falhas que mais interessam ao caso aberto */
  suggested?: Set<string>;
  targetOf: (item: ChaosItem) => TargetInfo | null;
  selectedName: string | null;
  onApply: (ids: Set<string>, simulate: boolean) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [staged, setStaged] = useState<Set<string>>(new Set(active));
  useEffect(() => { ref.current?.showModal(); }, []);
  const toggle = (id: string) => setStaged((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const done = (simulate: boolean) => { onApply(staged, simulate); ref.current?.close(); };

  return (
    <dialog ref={ref} className="dialog chaos" onClose={onClose}>
      <header className="chaos-head">
        <h2><Icon name="local_fire_department" size={22} />{" "}{t("Modo caos")}</h2>
        <button className="icon-btn" aria-label={t("Fechar")} onClick={() => ref.current?.close()}><Icon name="close" size={18} /></button>
      </header>
      <p className="sub">{t("Injete falhas no seu desenho e veja como ele se comporta. As falhas")}{" "}<b>{t("direcionadas")}</b>{" "}{t("atingem o componente")}{" "}
        {selectedName ? <>{t("selecionado")} (<b>{selectedName}</b>)</> : t("gargalo (nenhum selecionado)")}; {t("os eventos")}{" "}<b>{t("globais")}</b>{" "}{t("afetam tudo. Combine várias: fatores de capacidade multiplicam, latências somam e “indisponível” prevalece.")}</p>
      <div className="chaos-body">
        {CHAOS_CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <h3>{t(cat.title)}</h3>
            <div className="chaos-grid">
              {CHAOS.filter((i) => i.cat === cat.id).map((i) => {
                const on = staged.has(i.id);
                const tgt = i.scope === "target" ? targetOf(i) : null;
                const blocked = i.scope === "target" && !tgt;
                return (
                  <button key={i.id} className={`chaos-card${on ? " on" : ""}`} aria-pressed={on} disabled={blocked} onClick={() => toggle(i.id)}>
                    <span className="ci"><Icon name={i.icon} size={20} /></span>
                    <span className="ct">
                      <b>{t(i.title)}{suggested?.has(i.id) && <span className="sugg">{t("Sugerida")}</span>}</b>
                      <small>{t(i.desc)}</small>
                      <em>{i.scope === "global" ? <><Icon name="public" size={12} /> global</>
                        : tgt ? <><Icon name="my_location" size={12} /> {t("alvo")}: {tgt.name} <i>({t(tgt.why)})</i></>
                        : <>{t("sem componente compatível")}</>}</em>
                    </span>
                    <span className="cc" aria-hidden><Icon name={on ? "check_circle" : "radio_button_unchecked"} size={20} /></span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <footer className="chaos-foot">
        <span className="note">{staged.size ? t("{n} falha(s) selecionada(s)", { n: staged.size }) : t("Nenhuma falha selecionada")}</span>
        <span className="spacer" />
        <button className="chip" onClick={() => setStaged(new Set())} disabled={!staged.size}>{t("Limpar")}</button>
        <button className="chip" onClick={() => done(false)}>{t("Aplicar")}</button>
        <button className="chip primary" onClick={() => done(true)}><Icon name="play_arrow" size={16} />{" "}{t("Aplicar e simular")}</button>
      </footer>
    </dialog>
  );
}
