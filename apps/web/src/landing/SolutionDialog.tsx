import { useCallback, useMemo, useState } from "react";
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, ControlButton, MiniMap, ConnectionMode, useReactFlow, type Node, type Edge, type NodeChange } from "@xyflow/react";
import { ArchNode, FlowEdge, ProviderMark, type NodeData, type EdgeData } from "../CanvasElements";
import { GroupNode, cleanGroups, type GroupData } from "../GroupNode";
import { ConceptCard } from "../ReviewPanel";
import { ITEM_BY_TYPE } from "../catalog";
import { providerOf } from "../providers";
import { sideOf } from "../ports";
import { Icon } from "../ui";
import { t } from "../i18n";
import type { PublishedSolution } from "../profileShowcase";
import { ProfileDialog } from "./ProfileDialog";
import { cn } from "./lib/utils";

const nodeTypes = { arch: ArchNode, group: GroupNode };
const edgeTypes = { flow: FlowEdge };
const noop = () => {};
type Panel = "flows" | "component" | "notes";

/** The editor's actual node, edge and group renderers, driven only by the published snapshot. */
function SolutionBoard({ solution }: { solution: PublishedSolution }) {
  const [measured, setMeasured] = useState<Record<string, { width: number; height: number }>>({});
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const dimensions = changes.filter((c) => c.type === "dimensions" && c.dimensions);
    if (!dimensions.length) return;
    setMeasured((prev) => {
      const next = { ...prev };
      for (const c of dimensions) if (c.type === "dimensions" && c.dimensions) next[c.id] = c.dimensions;
      return next;
    });
  }, []);
  const [flowId, setFlowId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel | null>("flows");
  const { fitView, zoomTo } = useReactFlow();
  const { snap } = solution;
  const flow = snap.f.find((f) => f.id === flowId);
  const active = new Set(flow?.steps.map((s) => s.nodeId));
  const names = useMemo(() => new Map(snap.n.map((n) => [n.id, n.d.name || t(ITEM_BY_TYPE.get(n.d.type ?? "")?.label ?? n.d.type ?? "Componente")])), [snap.n]);
  const groups: Node<GroupData>[] = cleanGroups(snap.r).map((g) => ({ id: g.id, type: "group", position: { x: g.x, y: g.y }, width: g.w, height: g.h, zIndex: -1, selectable: false,
    style: { width: g.w, height: g.h }, data: { name: g.name, color: g.color, readOnly: true, onRename: noop, onColor: noop, onDelete: noop } }));
  const nodes: Node<NodeData>[] = snap.n.map((n) => ({ id: n.id, type: "arch", position: { x: n.x, y: n.y }, width: n.w ?? 240, measured: measured[n.id], selected: selected === n.id,
    data: { name: names.get(n.id)!, type: n.d.type ?? "backend", replicas: n.d.replicas ?? 1, providerId: n.d.providerId, hitRate: n.d.hitRate, note: n.d.note,
      health: "idle", badge: "Somente leitura", readOnly: true, dim: !!flow && !active.has(n.id) } }));
  const stepsById = new Map(flow?.steps.map((s) => [s.id, s]));
  const pairs = new Set(flow?.steps.slice(1).map((s, i) => `${(s.parentStepId ? stepsById.get(s.parentStepId) : flow.steps[i])?.nodeId}:${s.nodeId}`));
  const edgeIds = new Set(flow?.steps.flatMap((s) => s.edgeId ? [s.edgeId] : []));
  const edges: Edge<EdgeData>[] = snap.e.map((e, i) => {
    const highlighted = edgeIds.has(e.id) || pairs.has(`${e.source}:${e.target}`);
    const protocol = e.configuration?.protocol ?? "https", mode = e.configuration?.mode ?? "sync";
    return { id: e.id || `edge-${i}`, type: "flow", source: e.source, target: e.target, sourceHandle: sideOf(e.sourcePort, "source"), targetHandle: sideOf(e.targetPort, "target"), selected: !!flow && highlighted, selectable: false,
      data: { protocol, mode, label: `${protocol} · ${mode}`, both: !!e.configuration?.bidirectional, flow: 0, hot: false, unused: false, dim: !!flow && !highlighted, readOnly: true, onEdit: noop } };
  });
  const component = snap.n.find((n) => n.id === selected);
  const provider = component ? providerOf(component.d.type ?? "", component.d.providerId) : undefined;
  const focusNode = (id: string, inspect = false) => {
    setSelected(id); if (inspect) setPanel("component");
    void fitView({ nodes: [{ id }], padding: 0.8, maxZoom: 1.1, duration: 300 });
  };
  const operation = (value?: string) => t(({ read: "Leitura", write: "Escrita", compute: "Processamento" } as Record<string, string>)[value ?? ""] ?? value ?? "");

  return <div className="solution-workspace flex h-full min-h-0 flex-col">
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-4 py-2.5">
      <span className="inline-flex items-center gap-2 text-xs text-text-2"><Icon name="visibility" size={17} />{t("Somente leitura")}<span className="hidden sm:inline">· {t("{n} componentes", { n: snap.n.length })}</span></span>
      <div className="flex flex-wrap gap-1" role="group" aria-label={t("Painéis da solução")}>
        {([["flows", "account_tree", "Fluxos"], ["component", "tune", "Componente"], ["notes", "sticky_note_2", "Anotações"]] as const).map(([id, icon, label]) => <button key={id} type="button" aria-pressed={panel === id} onClick={() => setPanel(panel === id ? null : id)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm", panel === id ? "bg-accent-soft text-accent" : "text-text-2 hover:bg-track")}><Icon name={icon} size={17} />{t(label)}</button>)}
      </div>
    </div>
    <div className={cn("grid min-h-0 flex-1", panel ? "grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-1" : "grid-cols-1")}>
      <div className="relative min-h-0 min-w-0" aria-label={t("Arquitetura da solução")}>
        <ReactFlow nodes={[...groups, ...nodes] as Node[]} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} connectionMode={ConnectionMode.Loose}
          fitView fitViewOptions={{ padding: 0.2, maxZoom: 1 }} onNodesChange={onNodesChange} nodesDraggable={false} nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null}
          onNodeClick={(_, node) => { if (node.type === "arch") focusNode(node.id, true); }} onPaneClick={() => setSelected(null)}
          minZoom={0.1} maxZoom={2} proOptions={{ hideAttribution: true }}>
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.6} color="var(--dot)" />
          <Controls showInteractive={false}><ControlButton onClick={() => void zoomTo(1, { duration: 250 })} title={t("Tamanho original (100%)")} aria-label={t("Tamanho original (100%)")}><span className="text-[10px] font-semibold">1:1</span></ControlButton></Controls>
          <MiniMap pannable zoomable className="hidden sm:block" nodeColor="var(--border-strong)" maskColor="var(--accent-soft)" />
        </ReactFlow>
      </div>
      {panel && <aside aria-label={t("Detalhes da solução")} className="max-h-[34dvh] min-h-0 overflow-auto border-t border-line bg-surface p-5 lg:max-h-none lg:border-l lg:border-t-0">
        {panel === "flows" && <>
          <h3 className="font-semibold">{t("Fluxos da solução")}</h3>
          <p className="mt-2 text-sm text-text-2">{t("Selecione um fluxo para destacar seu caminho no quadro. Clique em uma etapa para aproximar o componente.")}</p>
          <div className="mt-4 grid gap-2"><button type="button" aria-pressed={!flow} onClick={() => setFlowId(null)} className={cn("rounded-xl border px-3 py-2.5 text-left text-sm", !flow ? "border-accent text-accent" : "border-line")}>{t("Arquitetura completa")}</button>{snap.f.map((f) => <button key={f.id} type="button" aria-pressed={flowId === f.id} onClick={() => setFlowId(f.id)} className={cn("rounded-xl border px-3 py-2.5 text-left text-sm", flowId === f.id ? "border-accent text-accent" : "border-line")}>{snap.m?.[f.id]?.name || f.id}</button>)}</div>
          {snap.f.length ? <div className="mt-5 grid gap-5">{(flow ? [flow] : snap.f).map((f) => <section key={f.id}><h4 className="text-sm font-semibold">{snap.m?.[f.id]?.name || f.id}</h4><ol className="mt-3 grid gap-2">{f.steps.map((s, i) => <li key={s.id ?? `${s.nodeId}-${i}`}><button type="button" onClick={() => focusNode(s.nodeId)} className={cn("flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-sm hover:border-accent", selected === s.nodeId ? "border-accent bg-accent-soft" : "border-line")}><span className="text-accent">{i + 1}.</span><span className="min-w-0"><b className="block font-medium">{names.get(s.nodeId) ?? s.nodeId}</b><small className="text-text-2">{operation(s.operationClass)}{s.condition && s.condition !== "always" ? ` · ${s.condition}` : ""}</small></span></button></li>)}</ol></section>)}</div> : <p className="mt-4 text-sm text-text-2">{t("Esta solução ainda não tem fluxos definidos.")}</p>}
        </>}
        {panel === "component" && <>
          <h3 className="font-semibold">{t("Componente")}</h3>
          {component ? <>
            <div className="mt-4 flex items-center gap-3">{provider && <ProviderMark provider={provider} size={40} />}<div className="min-w-0"><h4 className="break-words font-semibold">{names.get(component.id)}</h4><p className="text-sm text-text-2">{t(ITEM_BY_TYPE.get(component.d.type ?? "")?.label ?? component.d.type ?? "")}</p></div></div>
            <dl className="mt-5 grid gap-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-text-2">{t("Réplicas")}</dt><dd className="font-semibold">{component.d.replicas ?? 1}</dd></div>{provider && <div className="flex justify-between gap-3"><dt className="text-text-2">{t("Provedor")}</dt><dd className="text-right font-semibold">{provider.name}</dd></div>}{component.d.type === "redis" && component.d.hitRate !== undefined && <div className="flex justify-between gap-3"><dt className="text-text-2">{t("Taxa de acerto do cache")}</dt><dd>{Math.round(component.d.hitRate * 100)}%</dd></div>}</dl>
            {component.d.note && <section className="mt-5 rounded-xl border border-line p-3"><h4 className="text-sm font-semibold">{t("Observação")}</h4><p className="mt-2 whitespace-pre-wrap break-words text-sm text-text-2">{component.d.note}</p></section>}
            <div className="mt-5"><ConceptCard type={component.d.type ?? ""} /></div>
            <div className="mt-5 flex flex-wrap gap-2">{snap.f.filter((f) => f.steps.some((s) => s.nodeId === component.id)).map((f) => <button key={f.id} type="button" onClick={() => { setFlowId(f.id); setPanel("flows"); }} className="rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent">{snap.m?.[f.id]?.name || f.id}</button>)}</div>
          </> : <p className="mt-3 text-sm text-text-2">{t("Clique em um componente no quadro para consultar sua configuração.")}</p>}
        </>}
        {panel === "notes" && <><h3 className="font-semibold">{t("Anotações do desenho")}</h3><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-2">{snap.g || t("Este desenho não tem anotações gerais.")}</p></>}
      </aside>}
    </div>
  </div>;
}

export function SolutionDialog({ solution, onClose }: { solution: PublishedSolution; onClose: () => void }) {
  return <ProfileDialog wide title={t("Solução de {caso}", { caso: t(solution.title) })} onClose={onClose}><ReactFlowProvider><SolutionBoard solution={solution} /></ReactFlowProvider></ProfileDialog>;
}
