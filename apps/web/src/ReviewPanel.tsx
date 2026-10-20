import { Icon } from "./ui";
import { t } from "./i18n";
import type { Finding } from "./lint";
import { CONCEPTS } from "./concepts";
import type { CostEstimate } from "./cost";
import { fmt } from "./ui";

const SEV: Record<Finding["severity"], { icon: string; label: string }> = {
  alta: { icon: "error", label: "Importante" }, media: { icon: "warning", label: "Atenção" }, info: { icon: "info", label: "Sugestão" },
};

/** Revisão automática do desenho: cada achado explica o problema e como corrigir; clicar leva ao componente no canvas. */
export function ReviewPanel({ findings, hasNodes, cost, onFocus }: { findings: Finding[]; hasNodes: boolean; cost: CostEstimate; onFocus: (ids: string[]) => void }) {
  if (!hasNodes) return <p className="note pad">{t("Monte o desenho para receber a revisão automática.")}</p>;
  const costBox = cost.total > 0 && (
    <section className="cost-box" aria-label={t("Custo estimado")}>
      <div className="cost-head"><span><Icon name="payments" size={16} />{" "}{t("Custo estimado")}</span><b className="num">{fmt(cost.total)} <small>{t("créditos/mês")}</small></b></div>
      <ul>{cost.lines.slice(0, 4).map((l) => <li key={l.id}><span>{l.name}{l.replicas > 1 ? ` ×${l.replicas}` : ""}</span><b className="num">{fmt(l.credits)}</b></li>)}</ul>
      <small>{cost.unknown > 0 ? t("{n} componente(s) sem preço no catálogo ficaram de fora. ", { n: cost.unknown }) : ""}{t("Créditos fictícios de ensino: servem para comparar desenhos, não para orçar na nuvem.")}</small>
    </section>
  );
  if (!findings.length) return (
    <div className="review-empty"><Icon name="verified" size={28} /><b>{t("Nenhum problema encontrado")}</b>
      <p>{t("A revisão automática não achou falhas clássicas neste desenho. Isso não garante que ele esteja ótimo: confira também os requisitos e simule.")}</p></div>
  );
  return (
    <div className="review">
      {costBox}
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
