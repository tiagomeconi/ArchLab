import { useState, type ReactNode } from "react";
import { Chip } from "./Brief";
import type { Check } from "./requirements";
import { BrandMark, Icon, usePref } from "./ui";
import { caseById } from "./cases";
import type { Session } from "./session";
import { t, useLang } from "./i18n";

function Group({ title, icon, children, note }: { title: string; icon: string; children: ReactNode; note?: string }) {
  return (
    <section style={{ marginTop: 18 }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}><Icon name={icon} size={16} />{title}</h3>
      {children}
      {note && <p className="note">{note}</p>}
    </section>
  );
}

/** Comparação entre o desenho do usuário e a solução de referência, e controles para ver/voltar. */
export interface ReferenceProps {
  /** nomes dos componentes da referência que faltam no desenho */ missing: string[];
  /** nomes dos componentes do desenho que a referência não usa */ extra: string[];
  viewing: boolean; hasBackup: boolean; onLoad: () => void; onBack: () => void;
}

function ReferenceBox({ info: r }: { info: ReferenceProps }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <Group title={t("Solução de referência")} icon="auto_stories" note={t("Uma arquitetura possível, dimensionada para o pico do caso. Existem outras boas respostas: use para comparar, não para copiar.")}>
      {r.viewing ? (
        <div className="refbox on"><p><b>{t("Você está vendo a referência.")}</b>{" "}{t("Mexa à vontade, simule e quebre.")}</p>
          <button className="chip primary" onClick={r.onBack}><Icon name="undo" size={16} />{" "}{t("Voltar ao meu desenho")}</button></div>
      ) : (
        <div className="refbox">
          <div className="refcmp">
            <div><small>{t("Faltou no seu desenho")}</small><p>{r.missing.length ? r.missing.map((m) => <span key={m} className="rtag miss">{t(m)}</span>) : <span className="rtag ok">{t("nada, tem tudo")}</span>}</p></div>
            <div><small>{t("Você usou a mais")}</small><p>{r.extra.length ? r.extra.map((m) => <span key={m} className="rtag">{t(m)}</span>) : <span className="rtag ok">{t("nada além da referência")}</span>}</p></div>
          </div>
          {confirm ? (
            <div className="refconfirm" role="alertdialog" aria-label={t("Confirmar troca de desenho")}>
              <p>{t("Isso")}{" "}<b>{t("substitui o canvas")}</b>{" "}{t("pela referência. O seu desenho fica guardado e você pode voltar a ele.")}</p>
              <span className="row"><button className="chip primary" onClick={() => { setConfirm(false); r.onLoad(); }}>{t("Ver a referência")}</button><button className="chip" onClick={() => setConfirm(false)}>{t("Cancelar")}</button></span>
            </div>
          ) : (
            <span className="row">
              <button className="chip" onClick={() => setConfirm(true)}><Icon name="visibility" size={16} />{" "}{t("Ver solução de referência")}</button>
              {r.hasBackup && <button className="chip" onClick={r.onBack}><Icon name="undo" size={16} />{" "}{t("Restaurar o meu")}</button>}
            </span>
          )}
        </div>
      )}
    </Group>
  );
}

/** Requisitos do caso (modo estudo) ou do que foi registrado (modo livre): checagens automáticas sobre o desenho + itens autodeclarados. */
export function RequirementsView({ session, checks, reference }: { session: Session; checks: Check[]; reference?: ReferenceProps }) {
  useLang();
  const { requirements: r } = session;
  const found = session.caseId ? caseById(session.caseId) : undefined;
  const logoOf = found?.company?.logo ?? (found ? `icon:${found.icon}` : undefined);
  const [manual, setManual] = usePref<Record<string, boolean>>(`reqManual:${session.caseId ?? session.title}`, {});
  const met = checks.filter((c) => c.status === "meets").length;
  const manualItems = [...r.functional.map((txt, i) => [`f${i}`, txt, "Funcional"] as const), ...r.nonFunctional.map((txt, i) => [`n${i}`, txt, "Não funcional"] as const)];
  const declared = manualItems.filter(([k]) => manual[k]).length;
  const kv = (o: Record<string, string>, labels: Record<string, string>) => Object.entries(o).filter(([, v]) => v).map(([k, v]) => `${t(labels[k]!)}: ${t(v)}`);
  const facts = [...kv(r.scale, { users: "Usuários", rps: "Requisições", readWrite: "Leitura/escrita", storage: "Armazenamento" }),
    ...kv(r.targets, { latency: "Latência", availability: "Disponibilidade", consistency: "Consistência" })];

  return (
    <div className="brief-body">
      <header className="brief-head">
        {logoOf && <div className="brief-logo"><BrandMark id={logoOf} name={t(session.title)} color="var(--accent)" height={36} /></div>}
        <span className="tag">{session.mode === "study" ? t("Modo estudo") : t("Modo livre")}</span>
        <h2>{t(session.title)}</h2>
        {session.summary && <p className="lead">{t(session.summary)}</p>}
      </header>

      {checks.length > 0 && (
        <Group title={t("Verificado pelo laboratório")} icon="verified" note={t("Calculado a partir do seu desenho e da carga atual; muda conforme você edita.")}>
          <div className="score" role="img" aria-label={t("{met} de {total} verificações atendidas", { met, total: checks.length })}>
            <div className="score-bar"><i style={{ width: `${(met / checks.length) * 100}%` }} /></div>
            <b className="num">{met}/{checks.length}</b>
          </div>
          <ul className="reqs">
            {checks.map((c) => (
              <li key={c.id}><div><b>{c.label}</b><small>{c.detail}</small></div><Chip s={c.status} /></li>
            ))}
          </ul>
        </Group>
      )}

      {reference && <ReferenceBox info={reference} />}

      {manualItems.length > 0 && (
        <Group title={t("Requisitos do caso · {a}/{b} autodeclarados", { a: declared, b: manualItems.length })} icon="checklist"
          note={t("O laboratório não consegue provar estes itens num modelo abstrato. Marque os que você já endereçou no desenho e na sua explicação.")}>
          <ul className="reqs">
            {manualItems.map(([k, txt, kind]) => (
              <li key={k}><div><small style={{ margin: 0 }}>{t(kind)}</small>{t(txt)}</div>
                <label className="check"><input type="checkbox" checked={!!manual[k]} onChange={() => setManual((m) => ({ ...m, [k]: !m[k] }))} aria-label={t("Marcar como endereçado: {item}", { item: t(txt) })} /></label></li>
            ))}
          </ul>
        </Group>
      )}

      {facts.length > 0 && <Group title={t("Escala e metas")} icon="monitoring"><ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>{facts.map((f, i) => <li key={i}>{f}</li>)}</ul></Group>}
      {r.constraints && <Group title={t("Restrições e observações")} icon="rule"><p style={{ margin: 0, lineHeight: 1.6 }}>{t(r.constraints)}</p></Group>}
    </div>
  );
}
