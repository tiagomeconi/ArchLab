import { useEffect, useRef, useState } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, Handle, NodeResizeControl, Position, ResizeControlVariant, useReactFlow, type Edge, type EdgeProps, type Node, type NodeProps } from "@xyflow/react";
import type { NodeLoad } from "@archlab/domain";
import { CATEGORY_OF } from "./catalog";
import { FALLBACK_ICON, providerOf, type Provider } from "./providers";
import { LOGOS } from "./logos.generated";
import { INVERT_ON_DARK, SOFT_INVERT_ON_DARK, logoBox } from "./ProviderLogo";
import { MAX_REPLICAS } from "./reference";
import { SIDES, type Side } from "./ports";
import { protoOf } from "./protocols";
import { fmt, Icon } from "./ui";
import { t } from "./i18n";

export type Health = "healthy" | "degraded" | "saturated" | "unavailable" | "unknown" | "idle" | "origin" | "noprofile";
export interface NodeData extends Record<string, unknown> {
  readOnly?: boolean; chaos?: boolean; name: string; type: string; replicas: number; providerId?: string; hitRate?: number; load?: NodeLoad; health: Health; badge?: string; dim?: boolean; note?: string;
  /** ajusta o número de réplicas direto no card (injetado em shownNodes) */
  onReplicas?: (id: string, n: number) => void;
}
export interface EdgeData extends Record<string, unknown> { readOnly?: boolean; fault?: boolean; animate?: boolean; label: string; protocol: string; mode: string; flow: number; hot: boolean; unused: boolean; dim?: boolean; both?: boolean; onBoth?: () => void; onEdit: () => void }
/** Material Symbols (Google), fonte empacotada localmente. */
export const ICONS: Record<string, string> = {
  client: "language", "web-app": "web", "mobile-app": "smartphone", "load-balancer": "alt_route",
  "api-gateway": "hub", backend: "dns", microservice: "deployed_code", redis: "memory",
  "sql-database": "database", "nosql-database": "database", queue: "stacks", kafka: "stacks",
  worker: "settings", cdn: "public", "object-storage": "hard_drive", "search-engine": "search",
  websocket: "bolt", "authentication-service": "key", "notification-service": "notifications",
  database: "database", "iot-device": "sensors", "external-system": "domain", "iot-gateway": "router", "mqtt-broker": "swap_vert",
  "iot-platform": "memory_alt", "edge-compute": "developer_board", dns: "travel_explore", waf: "shield", "service-mesh": "grid_view",
  "rate-limiter": "speed", container: "deployed_code_update", kubernetes: "lan", serverless: "function", vm: "computer",
  scheduler: "schedule", "workflow-engine": "account_tree", "stream-processor": "stream", "batch-processor": "database_upload",
  "ml-service": "psychology", "timeseries-db": "monitoring", "graph-db": "hub", "vector-db": "scatter_plot", "data-warehouse": "analytics",
  "event-bus": "cable", "secrets-manager": "lock_person", "service-discovery": "radar", observability: "monitor_heart",
  "payment-gateway": "credit_card", "third-party-api": "api",
};
/** Logo vetorial do provedor, sem fundo (SVG inline). Sem logo disponível: monograma na cor da marca. */
export function ProviderMark({ provider, size = 30, fit }: { provider: Provider; size?: number; /** caixa fixa (miniaturas e chips): o logo se ajusta dentro dela, inclusive os wordmarks largos */ fit?: { w: number; h: number } }) {
  const logo = LOGOS[provider.id];
  const box = fit ?? logoBox(provider.id, size);
  return (
    <span className={`pmark${logo && INVERT_ON_DARK.has(provider.id) ? " inv" : ""}${logo && SOFT_INVERT_ON_DARK.has(provider.id) ? " inv-soft" : ""}`} style={{ width: box.w, height: box.h }} title={provider.name}>
      {logo ? (
        <svg viewBox={`0 0 ${logo.w} ${logo.h}`} width={box.w} height={box.h} role="img" aria-label={provider.name} preserveAspectRatio="xMidYMid meet"
          dangerouslySetInnerHTML={{ __html: logo.body }} />
      ) : FALLBACK_ICON[provider.id] ? (
        <b className="mono" style={{ color: provider.hex, borderColor: provider.hex }} aria-label={provider.name}><Icon name={FALLBACK_ICON[provider.id]!} size={Math.round(size * 0.58)} /></b>
      ) : (
        <b className="mono" style={{ color: provider.hex, borderColor: provider.hex, fontSize: size * 0.5 }} aria-label={provider.name}>{provider.name[0]}</b>
      )}
    </span>
  );
}
export const HEALTH_LABEL: Record<Health, string> = {
  healthy: "Saudável", degraded: "Degradado", saturated: "Saturado", unavailable: "Indisponível", unknown: "Desconhecido",
  idle: "Sem fluxo", origin: "Origem de carga", noprofile: "Sem perfil",
};

/** Interpola suavemente entre valores (respeita reduced-motion). */
export function useTween(target: number, ms = 450) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(target); from.current = target; return; }
    const start = performance.now(), a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms), e = 1 - Math.pow(1 - p, 3);
      const cur = a + (target - a) * e;
      from.current = cur; setV(cur);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
export const Num = ({ value, suffix = "" }: { value: number; suffix?: string }) => (
  <span className="num">{fmt(useTween(value))}{suffix}</span>
);

/** Cada bloco aceita conexão pelos quatro lados; quem começa o arrasto é a origem (a seta aponta para onde terminar). */
const HANDLE_POS: Record<Side, Position> = { top: Position.Top, right: Position.Right, bottom: Position.Bottom, left: Position.Left };
export function ArchNode({ id, data, selected }: NodeProps<Node<NodeData>>) {
  const { load } = data;
  const util = load?.utilization ?? null;
  const width = util === null ? 0 : Math.min(100, util * 100);
  const provider = providerOf(data.type, data.providerId);
  return (
    <div className={`node cat-${CATEGORY_OF.get(data.type) ?? "compute"} ${data.health}${selected ? " sel" : ""}${data.dim ? " dim" : ""}${data.chaos ? " chaos" : ""}`}>
      {data.chaos && <span className="chaos-tag" title={t("Falha injetada neste componente")}><Icon name="local_fire_department" size={14} /></span>}
      {!data.readOnly && <NodeResizeControl position="right" variant={ResizeControlVariant.Line} resizeDirection="horizontal"
        minWidth={176} maxWidth={520} className="resize-edge" aria-label={t("Redimensionar horizontalmente")} />}
      <div className="node-head">
        <span className="icon"><Icon name={ICONS[data.type] ?? "dns"} size={20} /></span>
        <div className="node-title"><div className="name">{data.name}</div><div className="type">{provider ? provider.name : data.type}</div></div>
        {provider && <ProviderMark provider={provider} size={34} />}
      </div>
      {load && (
        <>
          <div className="meter" role="img" aria-label={util === null ? t("utilização desconhecida") : t("utilização {pct}%", { pct: Math.round(util * 100) })}>
            <i style={{ width: `${width}%` }} />
          </div>
          <div className="node-foot">
            <span><b><Num value={load.offered} /></b>/s</span>
            <span>{util === null ? "—" : <b><Num value={util * 100} suffix="%" /></b>}</span>
          </div>
          {load.queue && load.queue.backlogGrowthPerSec > 0.5 && (
            <div className="node-foot"><span>backlog</span><span><b>+<Num value={load.queue.backlogGrowthPerSec} /></b> msg/s</span></div>
          )}
        </>
      )}
      <div className="node-row">
        <span className={`badge ${data.health}`} title={t(data.badge ?? HEALTH_LABEL[data.health])}>{t(data.badge ?? HEALTH_LABEL[data.health])}</span>
        {data.note && <span className="node-note" title={data.note} aria-label={t("Tem observação")}><Icon name="sticky_note_2" size={14} /></span>}
        <span className="node-step nodrag nopan" role="group" aria-label={t("Réplicas")} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          {!data.readOnly && <button aria-label={t("Menos uma réplica")} title={t("Menos uma réplica")} disabled={data.replicas <= 1} onClick={() => data.onReplicas?.(id, data.replicas - 1)}><Icon name="remove" size={14} /></button>}
          <b className="num" title={t("Réplicas")}>×{data.replicas}</b>
          {!data.readOnly && <button aria-label={t("Mais uma réplica")} title={t("Mais uma réplica")} disabled={data.replicas >= MAX_REPLICAS} onClick={() => data.onReplicas?.(id, data.replicas + 1)}><Icon name="add" size={14} /></button>}
        </span>
      </div>
      {SIDES.map((sd) => <Handle key={sd} id={sd} type="source" isConnectable={!data.readOnly} position={HANDLE_POS[sd]} />)}
    </div>
  );
}

export function FlowEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected }: EdgeProps<Edge<EdgeData>>) {
  const { deleteElements } = useReactFlow();
  const [path, lx, ly] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const flow = data?.flow ?? 0, hot = data?.hot ?? false, unused = data?.unused ?? false;
  const proto = protoOf(data?.protocol ?? "");
  const async = data?.mode === "async";
  const carrying = flow > 0 && !unused;
  // intensidade do tráfego: mais carga = mais partículas e mais rápidas (escala logarítmica)
  const level = carrying ? Math.log10(1 + flow) : 0;
  const dots = carrying ? Math.min(5, 1 + Math.floor(level)) : 0;
  const dur = Math.max(3.2, 8 - level * 0.9); // devagar: dá para acompanhar a requisição de um nó ao outro
  const color = hot ? "var(--danger)" : proto.color;
  const both = !!data?.both;
  const EdgeType = data?.readOnly ? "span" : "button";
  const stroke = selected ? "var(--accent)" : unused ? "var(--border-strong)" : `color-mix(in srgb, ${proto.color} 55%, var(--border-strong))`;
  return (
    <>
      <defs>
        <marker id={`arr-${id}`} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
          <path d="M1.5 1.5 L10.5 6 L1.5 10.5 Z" style={{ fill: stroke, stroke, strokeWidth: 1.4, strokeLinejoin: "round" }} />
        </marker>
      </defs>
      <BaseEdge id={id} path={path} interactionWidth={24} markerEnd={`url(#arr-${id})`} markerStart={both ? `url(#arr-${id})` : undefined}
        style={{ opacity: data?.dim ? 0.2 : 1, stroke, strokeWidth: selected ? 3 : 2, strokeDasharray: unused ? "6 6" : async ? "2 7" : undefined, strokeLinecap: "round" }} />
      {carrying && (
        <g className="edge-traffic" style={{ opacity: data?.dim ? 0.2 : 1, ["--c" as string]: color, ["--speed" as string]: `${dur * 0.55}s` }}>
          <path d={path} fill="none" className="traffic-glow" />
          <path d={path} fill="none" className="traffic-dash" />
          {Array.from({ length: dots }, (_, i) => (
            <circle key={i} r={hot ? 3.4 : 2.8} className="traffic-dot">
              <animateMotion dur={`${dur}s`} begin={`${(-i * dur) / dots}s`} repeatCount="indefinite" path={path} />
            </circle>
          ))}
        </g>
      )}
      <EdgeLabelRenderer>
        <div className={`edge-label nodrag nopan${selected ? " on" : ""}${data?.fault ? " fault" : ""}`} style={{ transform: `translate(-50%,-135%) translate(${lx}px,${ly}px)`, ["--pc" as string]: proto.color, opacity: data?.dim ? 0.35 : 1 }}>
          <EdgeType className="edge-type" title={t(data?.readOnly ? "Tipo de comunicação" : "Editar tipo de comunicação")} aria-label={`${t(data?.readOnly ? "Tipo de comunicação" : "Editar tipo de comunicação")}: ${proto.name} ${async ? "async" : "sync"}`}
            onClick={data?.readOnly ? undefined : () => data?.onEdit()}>
            <span className="proto-ico"><Icon name={proto.icon} size={13} /></span>
            <b className="proto-name">{t(proto.name)}</b>
            <i className="proto-mode">{async ? "async" : "sync"}</i>
            {unused && <em className="proto-unused">{t("sem fluxo")}</em>}
            {!data?.readOnly && <span className="edge-extra"><Icon name="edit" size={13} /></span>}
          </EdgeType>
          {!data?.readOnly && <span className="edge-extra">
            <button className={`cut both${both ? " on" : ""}`} title={both ? t("Voltar para um sentido só") : t("Marcar como dois sentidos")} aria-pressed={both}
              aria-label={`${both ? t("Voltar para um sentido só") : t("Marcar como dois sentidos")} ${proto.name}`} onClick={() => data?.onBoth?.()}>
              <Icon name="swap_horiz" size={15} />
            </button>
            <button className="cut" title={t("Cortar conexão")} aria-label={`${t("Cortar conexão")} ${proto.name}`}
              onClick={() => deleteElements({ edges: [{ id }] })}>
              <Icon name="content_cut" size={14} />
            </button>
          </span>}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
