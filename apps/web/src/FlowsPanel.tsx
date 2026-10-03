import { useState } from "react";
import { PROFILES, type OpClass } from "@archlab/domain";
import { depthOf, displayOrder, type Flow, type FlowMeta, type NewStep, type Step } from "./flowOps";
import { Icon, Range } from "./ui";
import { CATEGORY_OF } from "./catalog";
import { t } from "./i18n";

export interface PanelNode { id: string; name: string; type: string; profileId: string; icon: string }
export interface PanelEdge { id: string; source: string; target: string }
const CLASS_LABEL: Record<string, string> = { read: "leitura", write: "escrita", compute: "processamento", message: "mensagem", job: "job" };

export function FlowsPanel(props: {
  flows: Flow[]; meta: Record<string, FlowMeta>; nodes: PanelNode[]; edges: PanelEdge[];
  selectedId: string | null; onSelect: (id: string | null) => void;
  /** canvas em branco: os fluxos vêm das conexões desenhadas e não se editam passo a passo */ auto: boolean;
  onCreate: (rootNodeId: string, name: string) => void; onAuto: () => void; onDelete: (id: string) => void;
  onMeta: (id: string, m: Partial<FlowMeta>) => void; onAddStep: (flowId: string, s: NewStep) => void; onRemoveStep: (flowId: string, stepId: string) => void;
}) {
  const { flows, meta, nodes, edges, selectedId } = props;
  const flow = flows.find((f) => f.id === selectedId) ?? null;
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const [creating, setCreating] = useState(false);
  const [rootId, setRootId] = useState("");
  const [name, setName] = useState("");

  const sources = nodes.filter((n) => PROFILES[n.profileId]?.source);
  const startOptions = sources.length ? sources : nodes;

  return (
    <div className="flows">
      <div className="flow-list">
        {flows.map((f) => (
          <button key={f.id} className={`flow-pill${f.id === selectedId ? " on" : ""}`} onClick={() => props.onSelect(f.id === selectedId ? null : f.id)}>
            <Icon name="route" size={16} /> {meta[f.id]?.name ?? f.id}
            <small className="num">{Math.round((meta[f.id]?.weight ?? 1) * 100)}%</small>
          </button>
        ))}
        {!props.auto && (
          <button className="flow-pill new" onClick={() => { setCreating((v) => !v); setRootId(startOptions[0]?.id ?? ""); setName(""); }}>
            <Icon name="add" size={16} />{" "}{t("Novo fluxo")}</button>
        )}
      </div>

      {!props.auto && creating && (
        <div className="card-form">
          <label>{t("Nome do fluxo")}<input value={name} placeholder={t("ex.: Criar link")} onChange={(e) => setName(e.target.value)} /></label>
          <label>{t("Começa em")}<select value={rootId} onChange={(e) => setRootId(e.target.value)}>
              {startOptions.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </label>
          <button className="chip primary" disabled={!rootId} onClick={() => { props.onCreate(rootId, name.trim() || t("Novo fluxo")); setCreating(false); }}>
            <Icon name="check" size={16} />{" "}{t("Criar fluxo")}</button>
        </div>
      )}

      {props.auto && (
        <div className="auto-box">
          <small>{t("Os fluxos seguem as conexões que você desenha no canvas: ligou, aparece aqui. Cada ramo (dados, eventos, busca, mídia) vira um fluxo.")}</small>
          <button className="chip" disabled={!edges.length} onClick={props.onAuto}><Icon name="sync" size={16} />{" "}{t("Refazer a partir das conexões")}</button>
        </div>
      )}
      {!flow && !creating && !props.auto && (
        <p className="note pad">{t("Um")}{" "}<b>{t("fluxo")}</b>{" "}{t("é o caminho que uma requisição percorre (ex.: cliente → lb → backend → banco). Só os componentes dentro de um fluxo recebem carga e são calculados. Crie um fluxo ou selecione um acima.")}</p>
      )}
      {!flow && !creating && props.auto && flows.length === 0 && <p className="note pad">{t("Ainda não há conexões saindo de uma origem de carga. Ligue o cliente a outro componente no canvas.")}</p>}

      {flow && (
        <FlowEditor key={flow.id} flow={flow} meta={meta[flow.id] ?? { name: flow.id, weight: 1 }} nodeById={nodeById} edges={edges}
          auto={props.auto} onMeta={(m) => props.onMeta(flow.id, m)} onDelete={() => props.onDelete(flow.id)}
          onAdd={(s) => props.onAddStep(flow.id, s)} onRemove={(id) => props.onRemoveStep(flow.id, id)} />
      )}
    </div>
  );
}

function FlowEditor({ flow, meta, nodeById, edges, auto, onMeta, onDelete, onAdd, onRemove }: {
  auto: boolean; flow: Flow; meta: FlowMeta; nodeById: Map<string, PanelNode>; edges: PanelEdge[];
  onMeta: (m: Partial<FlowMeta>) => void; onDelete: () => void; onAdd: (s: NewStep) => void; onRemove: (stepId: string) => void;
}) {
  const order = displayOrder(flow);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  // um passo some quando algum ancestral está recolhido
  const byId = new Map(flow.steps.map((x) => [x.id, x]));
  const hidden = (st: Step) => { for (let p = st.parentStepId ? byId.get(st.parentStepId) : undefined; p; p = p.parentStepId ? byId.get(p.parentStepId) : undefined) if (collapsed.has(p.id)) return true; return false; };
  const rows = order.filter((st) => !hidden(st));
  const edgeIds = new Set(edges.map((e) => e.id));
  // padrão: o último passo que ainda pode seguir adiante (tem conexão de saída)
  const [parentId, setParentId] = useState(() => [...order].reverse().find((s) => edges.some((e) => e.source === s.nodeId))?.id ?? order[order.length - 1]?.id ?? "");
  const parent = flow.steps.find((s) => s.id === parentId) ?? order[order.length - 1];
  const nextEdges = parent ? edges.filter((e) => e.source === parent.nodeId) : [];
  const [edgeId, setEdgeId] = useState("");
  const edge = nextEdges.find((e) => e.id === edgeId) ?? nextEdges[0];
  const target = edge ? nodeById.get(edge.target) : undefined;
  const classes = Object.keys(target ? PROFILES[target.profileId]?.capacity ?? {} : {}) as OpClass[];
  const defaultClass = target?.type === "queue" || target?.type === "kafka" ? "message"
    : classes.includes("read") && !classes.includes("compute") ? "read" : classes[0] ?? "compute";
  const [cls, setCls] = useState("");
  const opClass = cls && (classes.includes(cls as OpClass) || !classes.length) ? cls : defaultClass;
  const [visits, setVisits] = useState(1);
  const [cond, setCond] = useState("always");
  // lookups de cache irmãos (mesmo pai) cujo miss pode ativar este passo
  const siblings = parent ? flow.steps.filter((s) => s.parentStepId === parent.id && nodeById.get(s.nodeId)?.type === "redis") : [];
  const missOf = cond.startsWith("miss:") ? flow.steps.find((s) => s.id === cond.slice(5)) : undefined;

  const stepLabel = (s: Step) => {
    const n = nodeById.get(s.nodeId);
    return `${n?.name ?? s.nodeId} · ${t(CLASS_LABEL[s.operationClass] ?? s.operationClass)}`;
  };

  return (
    <div className="flow-editor">
      <div className="card-form">
        <label>{t("Nome")}<input value={meta.name} onChange={(e) => onMeta({ name: e.target.value })} /></label>
        <label>{t("Peso entre fluxos do mesmo tipo (leitura/escrita)")}{" "}<b className="num">{Math.round(meta.weight * 100)}%</b>
          <Range min={0} max={100} step={5} value={Math.round(meta.weight * 100)} onChange={(e) => onMeta({ weight: +e.target.value / 100 })} />
        </label>
      </div>

      <h3 className="mini">{t("Caminho")}</h3>
      <div className="ftree" role="tree" aria-label={t("Caminho")}>
        {rows.map((s) => {
          const broken = !!s.edgeId && !edgeIds.has(s.edgeId);
          const n = nodeById.get(s.nodeId);
          const depth = depthOf(flow, s);
          const kids = flow.steps.some((x) => x.parentStepId === s.id);
          const closed = collapsed.has(s.id);
          const cond = s.condition === "cache-miss" ? t("só em cache miss") : s.join === "alternative" ? t("consulta de cache (hit encerra)") : s.visitsPerRequest !== 1 ? t("{n}× por requisição", { n: s.visitsPerRequest }) : "";
          const tag = s.condition === "cache-miss" ? t("só no miss") : s.join === "alternative" ? t("consulta") : s.visitsPerRequest !== 1 ? `×${s.visitsPerRequest}` : "";
          return (
            <div key={s.id} role="treeitem" aria-level={depth + 1} aria-expanded={kids ? !closed : undefined} aria-selected={false}
              className={`ft-row cat-${CATEGORY_OF.get(n?.type ?? "") ?? "compute"}${broken ? " broken" : ""}`}
              title={`${stepLabel(s)} · ${cond || t("sempre")}${broken ? ` · ${t("conexão removida")}` : ""}`}>
              {Array.from({ length: depth }, (_, i) => <span key={i} className="ft-guide" aria-hidden />)}
              {kids
                ? <button className="ft-caret" aria-label={closed ? t("Expandir") : t("Recolher")} onClick={() => setCollapsed((c) => { const x = new Set(c); x.has(s.id) ? x.delete(s.id) : x.add(s.id); return x; })}><Icon name={closed ? "chevron_right" : "expand_more"} size={16} /></button>
                : <span className="ft-caret ft-leaf" aria-hidden />}
              <span className="ft-ico"><Icon name={n?.icon ?? "dns"} size={15} /></span>
              <span className="ft-text">
                <span className="ft-name">{n?.name ?? s.nodeId}</span>
                <span className={`ft-sub${broken ? " bad" : ""}`}>{t(CLASS_LABEL[s.operationClass] ?? s.operationClass)}{tag ? ` · ${tag}` : ""}{broken ? ` · ${t("conexão removida")}` : ""}</span>
              </span>
              {!auto && (
                <button className="ft-del" aria-label={`${t("Remover passo")} ${stepLabel(s)}`} title={t("Remover passo (e o que vem depois)")} onClick={() => onRemove(s.id)}>
                  <Icon name={s.parentStepId ? "close" : "delete"} size={15} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!auto && <h3 className="mini">{t("Adicionar passo")}</h3>}
      {!auto && (order.length === 0 ? <p className="note">{t("Fluxo vazio.")}</p> : (
        <div className="card-form">
          <label>{t("Depois de")}<select value={parent?.id} onChange={(e) => { setParentId(e.target.value); setEdgeId(""); setCond("always"); }}>
              {order.map((s) => <option key={s.id} value={s.id}>{stepLabel(s)}</option>)}
            </select>
          </label>
          {nextEdges.length === 0 ? (
            <p className="note">{t("Este componente não tem conexões de saída. Ligue-o a outro no canvas para continuar o caminho.")}</p>
          ) : (
            <>
              <label>{t("Seguir para")}<select value={edge?.id} onChange={(e) => { setEdgeId(e.target.value); setCls(""); }}>
                  {nextEdges.map((e) => <option key={e.id} value={e.id}>{nodeById.get(e.target)?.name ?? e.target}</option>)}
                </select>
              </label>
              <div className="two">
                <label>{t("Operação")}<select value={opClass} onChange={(e) => setCls(e.target.value)}>
                    {(classes.length ? classes : ["compute"]).map((c) => <option key={c} value={c}>{t(CLASS_LABEL[c] ?? c)}</option>)}
                  </select>
                </label>
                <label>{t("Visitas/req")}<input type="number" min={0.1} step={0.5} value={visits} onChange={(e) => setVisits(Math.max(0.1, +e.target.value || 1))} />
                </label>
              </div>
              {siblings.length > 0 && target?.type !== "redis" && (
                <label>{t("Quando")}<select value={cond} onChange={(e) => setCond(e.target.value)}>
                    <option value="always">{t("Sempre")}</option>
                    {siblings.map((s) => <option key={s.id} value={`miss:${s.id}`}>Só em cache miss de {nodeById.get(s.nodeId)?.name}</option>)}
                  </select>
                </label>
              )}
              {target && !classes.length && <p className="note">{t("Este tipo ainda não tem perfil de capacidade: o passo entra no caminho, mas ficará sem cálculo.")}</p>}
              <button className="chip primary" disabled={!parent || !edge} onClick={() => parent && edge && onAdd({
                parent, nodeId: edge.target, edgeId: edge.id, operationClass: opClass, visits,
                missOf, isCacheLookup: target?.type === "redis", missShare: 1,
              })}>
                <Icon name="add_road" size={16} />{" "}{t("Adicionar ao caminho")}</button>
            </>
          )}
        </div>
      ))}
      {!auto && <button className="chip danger" onClick={onDelete}><Icon name="delete" size={16} />{" "}{t("Excluir fluxo")}</button>}
    </div>
  );
}
