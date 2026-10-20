import { Icon } from "./ui";
import { t } from "./i18n";
import type { Finding } from "./lint";
import { CONCEPTS } from "./concepts";

const SEV: Record<Finding["severity"], { icon: string; label: string }> = {
  alta: { icon: "error", label: "Importante" }, media: { icon: "warning", label: "Atenção" }, info: { icon: "info", label: "Sugestão" },
};

/** Revisão automática do desenho: cada achado explica o problema e como corrigir; clicar leva ao componente no canvas. */
export function ReviewPanel({ findings, hasNodes, onFocus }: { findings: Finding[]; hasNodes: boolean; onFocus: (ids: string[]) => void }) {
  if (!hasNodes) return <p className="note pad">{t("Monte o desenho para receber a revisão automática.")}</p>;
  if (!findings.length) return (
    <div className="review-empty"><Icon name="verified" size={28} /><b>{t("Nenhum problema encontrado")}</b>
      <p>{t("A revisão automática não achou falhas clássicas neste desenho. Isso não garante que ele esteja ótimo: confira também os requisitos e simule.")}</p></div>
  );
  return (
    <div className="review">
      <p className="note">{t("{n} pontos para revisar. Clique em um item para ver o componente no canvas.", { n: findings.length })}</p>
      <ul className="review-list">
        {findings.map((f) => (
          <li key={f.id} className={`review-item ${f.severity}`}>
            <button className="review-head" onClick={() => onFocus(f.nodeIds)} disabled={!f.nodeIds.length} aria-label={`${t(SEV[f.severity].label)}: ${f.title}`}>
              <Icon name={SEV[f.severity].icon} size={18} />
              <span><small>{t(SEV[f.severity].label)}</small><b>{f.title}</b></span>
            </button>
            <p>{f.why}</p>
            <p className="fix"><Icon name="lightbulb" size={14} /> {f.fix}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Cartão de conceito do componente selecionado: o que é, quando usar e o que custa. */
export function ConceptCard({ type }: { type: string }) {
  const c = CONCEPTS[type];
  if (!c) return null;
  return (
    <details className="concept">
      <summary><Icon name="menu_book" size={16} />{" "}{t("Sobre este componente")}</summary>
      <dl>
        <dt>{t("O que é")}</dt><dd>{t(c.what)}</dd>
        <dt>{t("Quando usar")}</dt><dd>{t(c.when)}</dd>
        <dt>{t("O que custa")}</dt><dd>{t(c.cost)}</dd>
      </dl>
    </details>
  );
}
