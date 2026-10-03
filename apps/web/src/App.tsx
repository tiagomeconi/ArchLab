import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  applyNodeChanges, Background, Panel, BackgroundVariant, BaseEdge, Controls, EdgeLabelRenderer, getBezierPath, Handle, MiniMap,
  NodeResizeControl, Position, ReactFlow, ReactFlowProvider, ResizeControlVariant, useReactFlow,
  type Connection, type ConnectionLineComponentProps, type Edge, type EdgeChange, type EdgeProps, type Node, type NodeChange, type NodeProps,
} from "@xyflow/react";
import {
  solveDemand, connectionOptions, DEFAULT_PROFILE_BY_TYPE, PROFILES, validateArchitecture, type ConnectionOption, type NodeLoad,
} from "@archlab/domain";
import fixture from "../../../fixtures/url-shortener-baseline.json";
import { CATEGORY_OF, ITEM_BY_TYPE, PALETTE, type PaletteItem } from "./catalog";
import { FALLBACK_ICON, PROVIDERS, providerOf, type Provider } from "./providers";
import { LOGOS } from "./logos.generated";
import { INVERT_ON_DARK, SOFT_INVERT_ON_DARK, logoBox } from "./ProviderLogo";
import { FlowsPanel } from "./FlowsPanel";
import { NotesPad } from "./Notes";
import { ExportMenu } from "./ExportMenu";
import { renderReport } from "./report";
import { Brief } from "./Brief";
import { ChaosDialog } from "./ChaosDialog";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { CHAOS, pickTarget, resolveChaos } from "./chaos";
import { DURATION, SimPanel, type RunStatus, type Sample } from "./SimPanel";
import { addStep, buildAutoFlows, SIDE_TYPES, SOURCE_TYPES, createFlow, removeNodeFromFlow, removeStep, type Flow, type FlowMeta } from "./flowOps";
import { fmt, Icon, Logo, Range, SearchField, usePref } from "./ui";
import { go } from "./nav";
import { RequirementsView } from "./RequirementsView";
import { Guide } from "./Guide";
import { evaluate } from "./requirements";
import { buildReference, MAX_REPLICAS } from "./reference";
import { saveCaseProgress } from "./progress";
import { canShare, decodeShare, shareUrl, type SharePayload } from "./share";
import { caseById, sessionFor } from "./cases";
import { emptyRequirements, type Session } from "./session";
import { DEFAULT_LOAD, loadSession } from "./session";
import { ThemeToggle } from "./ThemeToggle";
import { t, useLang } from "./i18n";
import { LangToggle } from "./LangToggle";
import { protoOf } from "./protocols";
import { RatingChip } from "./Rating";
import { errorOf, lossErrors, rate } from "./rating";

type Health = "healthy" | "degraded" | "saturated" | "unavailable" | "unknown" | "idle" | "origin" | "noprofile";
interface NodeData extends Record<string, unknown> {
  chaos?: boolean; name: string; type: string; replicas: number; providerId?: string; hitRate?: number; load?: NodeLoad; health: Health; badge?: string; dim?: boolean; note?: string;
  /** ajusta o número de réplicas direto no card (injetado em shownNodes) */
  onReplicas?: (id: string, n: number) => void;
}
interface EdgeData extends Record<string, unknown> { fault?: boolean; animate?: boolean; label: string; protocol: string; mode: string; flow: number; hot: boolean; unused: boolean; dim?: boolean; onEdit: () => void }
interface DocEdge {
  id: string; source: string; sourcePort: string; target: string; targetPort: string;
  configuration: { mode: string; protocol: string; [k: string]: unknown };
}

/** Material Symbols (Google), fonte empacotada localmente. */
const ICONS: Record<string, string> = {
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
function ProviderMark({ provider, size = 30 }: { provider: Provider; size?: number }) {
  const logo = LOGOS[provider.id];
  const box = logoBox(provider.id, size);
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
/** Provedores iniciais da fixture, só para ilustrar o recurso. */
const DEMO_PROVIDERS: Record<string, string> = { app: "nodejs", cache: "redis", db: "postgresql", lb: "nginx" };
const HEALTH_LABEL: Record<Health, string> = {
  healthy: "Saudável", degraded: "Degradado", saturated: "Saturado", unavailable: "Indisponível", unknown: "Desconhecido",
  idle: "Sem fluxo", origin: "Origem de carga", noprofile: "Sem perfil",
};

// Precedência do spec §10.6: unavailable > saturated > degraded > healthy; sem dado nunca vira "saudável".
function healthOf(load: NodeLoad | undefined, down: boolean, profileId: string, side = false): { health: Health; badge?: string } {
  if (down) return { health: "unavailable" };
  const profile = PROFILES[profileId];
  if (profile?.source) return { health: "origin" };
  if (!profile) return { health: "noprofile", badge: profileId === "unresolved" ? "Escolha o engine" : undefined };
  if (!load) return side ? { health: "idle", badge: "Apoio" } : { health: "idle" };
  if (load.queue && load.queue.backlogGrowthPerSec > 0.5) return { health: "saturated", badge: "Acumulando fila" };
  if (load.utilization === null) return { health: "unknown", badge: "Operação não suportada" };
  if (load.utilization > 1) return { health: "saturated" };
  if (load.utilization > 0.8) return { health: "degraded" };
  return { health: "healthy" };
}

/** Interpola suavemente entre valores (respeita reduced-motion). */
function useTween(target: number, ms = 450) {
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
const Num = ({ value, suffix = "" }: { value: number; suffix?: string }) => (
  <span className="num">{fmt(useTween(value))}{suffix}</span>
);

function ArchNode({ id, data, selected }: NodeProps<Node<NodeData>>) {
  const { load } = data;
  const util = load?.utilization ?? null;
  const width = util === null ? 0 : Math.min(100, util * 100);
  const provider = providerOf(data.type, data.providerId);
  return (
    <div className={`node cat-${CATEGORY_OF.get(data.type) ?? "compute"} ${data.health}${selected ? " sel" : ""}${data.dim ? " dim" : ""}${data.chaos ? " chaos" : ""}`}>
      {data.chaos && <span className="chaos-tag" title={t("Falha injetada neste componente")}><Icon name="local_fire_department" size={14} /></span>}
      <NodeResizeControl position="right" variant={ResizeControlVariant.Line} resizeDirection="horizontal"
        minWidth={176} maxWidth={520} className="resize-edge" aria-label={t("Redimensionar horizontalmente")} />
      <Handle type="target" position={Position.Left} />
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
          <button aria-label={t("Menos uma réplica")} title={t("Menos uma réplica")} disabled={data.replicas <= 1} onClick={() => data.onReplicas?.(id, data.replicas - 1)}><Icon name="remove" size={14} /></button>
          <b className="num" title={t("Réplicas")}>×{data.replicas}</b>
          <button aria-label={t("Mais uma réplica")} title={t("Mais uma réplica")} disabled={data.replicas >= MAX_REPLICAS} onClick={() => data.onReplicas?.(id, data.replicas + 1)}><Icon name="add" size={14} /></button>
        </span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function FlowEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected }: EdgeProps<Edge<EdgeData>>) {
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
  return (
    <>
      <BaseEdge id={id} path={path} interactionWidth={24}
        style={{ opacity: data?.dim ? 0.2 : 1, stroke: selected ? "var(--accent)" : unused ? "var(--border-strong)" : `color-mix(in srgb, ${proto.color} 55%, var(--border-strong))`, strokeWidth: selected ? 3 : 2, strokeDasharray: unused ? "6 6" : async ? "2 7" : undefined, strokeLinecap: "round" }} />
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
          <button className="edge-type" title={t("Editar tipo de comunicação")} aria-label={`${t("Editar tipo de comunicação")}: ${proto.name} ${async ? "async" : "sync"}`}
            onClick={() => data?.onEdit()}>
            <span className="proto-ico"><Icon name={proto.icon} size={13} /></span>
            <b className="proto-name">{t(proto.name)}</b>
            <i className="proto-mode">{async ? "async" : "sync"}</i>
            {unused && <em className="proto-unused">{t("sem fluxo")}</em>}
            <span className="edge-extra"><Icon name="edit" size={13} /></span>
          </button>
          <span className="edge-extra">
            <button className="cut" title={t("Cortar conexão")} aria-label={`${t("Cortar conexão")} ${proto.name}`}
              onClick={() => deleteElements({ edges: [{ id }] })}>
              <Icon name="content_cut" size={14} />
            </button>
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
/** Linha de conexão própria: tolera posições inválidas (a padrão do React Flow derruba a tela inteira). */
const VALID_POS = new Set(["left", "right", "top", "bottom"]);
function ConnectionLine({ fromX, fromY, toX, toY, fromPosition, toPosition }: ConnectionLineComponentProps) {
  const ok = VALID_POS.has(fromPosition) && VALID_POS.has(toPosition);
  const [d] = ok ? getBezierPath({ sourceX: fromX, sourceY: fromY, sourcePosition: fromPosition, targetX: toX, targetY: toY, targetPosition: toPosition })
    : [`M${fromX},${fromY} L${toX},${toY}`];
  return <path d={d} fill="none" className="react-flow__connection-path" />;
}
const nodeTypes = { arch: ArchNode };
const edgeTypes = { flow: FlowEdge };

function ConnectDialog({ source, target, options, current, onPick, onCancel }: {
  source: string; target: string; options: ConnectionOption[]; current?: { protocol: string; mode: string };
  onPick: (o: ConnectionOption) => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [idx, setIdx] = useState(() => Math.max(0, options.findIndex((o) => o.protocol === current?.protocol && o.mode === current?.mode)));
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} className="dialog" onCancel={onCancel} onClose={onCancel}>
      <h2><Icon name={current ? "edit" : "cable"} size={20} /> {current ? t("Editar conexão") : t("Nova conexão")}</h2>
      <p className="sub">{source} → {target}. {t("Escolha o tipo de conexão:")}</p>
      <div role="radiogroup" aria-label={t("Tipo de conexão")} className="options">
        {options.map((o, i) => (
          <label key={o.label} className={`option${i === idx ? " on" : ""}`}>
            <input type="radio" name="conn" checked={i === idx} onChange={() => setIdx(i)} />
            <span className="opt-title">{t(o.label)}
              <span className="proto-tag" style={{ ["--pc" as string]: protoOf(o.protocol).color }}><Icon name={protoOf(o.protocol).icon} size={13} />{t(protoOf(o.protocol).name)}<i>{o.mode}</i></span></span>
            <span className="opt-hint">{t(o.hint)}</span>
          </label>
        ))}
      </div>
      <p className="note">{t("A conexão só descreve que o caminho é possível. Ela não carrega tráfego até existir um fluxo que a use.")}</p>
      <div className="actions">
        <button className="chip" onClick={() => ref.current?.close()}>{t("Cancelar")}</button>
        <button className="chip primary" onClick={() => { const o = options[idx]; if (o) onPick(o); ref.current?.close(); }}>
          <Icon name={current ? "check" : "add_link"} size={16} /> {current ? t("Salvar") : t("Conectar")}
        </button>
      </div>
    </dialog>
  );
}

function ProviderDialog({ type, current, onPick, onClose }: {
  type: string; current?: string; onPick: (id: string | undefined) => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  const list = PROVIDERS[type] ?? [];
  const item = ITEM_BY_TYPE.get(type);
  const choose = (id: string | undefined) => { onPick(id); ref.current?.close(); };
  const lbl = item ? t(item.label) : "";
  const role = /[A-ZÀ-Ý].*[A-ZÀ-Ý]|\d/.test(lbl) ? lbl : lbl.toLowerCase(); // siglas (IoT, WAF, API) mantêm a caixa

  return (
    <dialog ref={ref} className="dialog wide" onClose={onClose}>
      <h2><Icon name={item?.icon ?? "dns"} size={20} /> {t("Qual tecnologia faz o papel de {nome}?", { nome: role })}</h2>
      <p className="sub">{t("Para estudo: escolher o provedor mostra um exemplo real do componente. Isso é apenas ilustrativo e não altera os cálculos da simulação.")}</p>
      <div className="providers">
        {list.map((p) => (
          <button key={p.id} className={`provider${p.id === current ? " on" : ""}`} onClick={() => choose(p.id)}>
            <ProviderMark provider={p} size={56} />
            <span className="p-name">{p.name}</span>
            {p.note && <span className="p-note">{t(p.note)}</span>}
          </button>
        ))}
      </div>
      <div className="actions">
        {current && <button className="chip" onClick={() => choose(undefined)}>{t("Remover provedor")}</button>}
        <button className="chip" onClick={() => ref.current?.close()}>{current ? "Fechar" : "Decidir depois"}</button>
      </div>
    </dialog>
  );
}

function Palette({ onAdd, inCase }: { onAdd: (item: PaletteItem) => void; inCase?: Set<string> }) {
  const [q, setQ] = useState("");
  const [closed, setClosed] = useState<Set<string>>(() => new Set());
  const query = q.trim().toLowerCase();
  const groups = PALETTE.map((g) => ({
    ...g, items: g.items.filter((i) => !query || `${t(i.label)} ${t(i.desc)} ${i.type}`.toLowerCase().includes(query)),
  })).filter((g) => g.items.length);
  return (
    <div className="palette">
      <SearchField value={q} onChange={setQ} placeholder={t("Buscar componente")} label={t("Buscar componente")} hint="/" />
      {groups.map((g) => (
        <section key={g.title} className={`cat-${g.cat}`}>
          <h3><button type="button" className="cat-toggle" aria-expanded={!!query || !closed.has(g.cat)}
            onClick={() => setClosed((c) => { const n = new Set(c); if (n.has(g.cat)) n.delete(g.cat); else n.add(g.cat); return n; })}>
            <i className="dot" />{t(g.title)}<small>{g.items.length}</small><Icon name="expand_more" size={16} /></button></h3>
          {(!!query || !closed.has(g.cat)) && g.items.map((i) => (
            <div key={i.type} className="pitem" draggable
              onDragStart={(e) => { e.dataTransfer.setData("application/archlab", i.type); e.dataTransfer.effectAllowed = "move"; }}>
              <span className="icon"><Icon name={i.icon} size={18} /></span>
              <span className="pitem-text"><b>{t(i.label)}{inCase?.has(i.type) && <span className="sugg" title={t("A arquitetura de referência deste caso costuma usar")}>{t("No caso")}</span>}</b><small>{t(i.desc)}</small></span>
              <button className="add" aria-label={`${t("Adicionar")} ${t(i.label)}`} title={t("Adicionar ao canvas")} onClick={() => onAdd(i)}>
                <Icon name="add" size={18} />
              </button>
            </div>
          ))}
        </section>
      ))}
      {groups.length === 0 && <p className="note">{t("Nenhum componente encontrado.")}</p>}
    </div>
  );
}

const SQL_IDS = new Set((PROVIDERS["sql-database"] ?? []).map((p) => p.id));
const DEFAULT_CACHE = { hitRate: 0.8, invalidation: "ttl", ttlSec: 60, failureMode: "bypass", workingSetMiB: 256, coalescing: false, warmupSec: 0 };

/** Perfil efetivo: `database` abstrato só é resolvido quando o usuário escolhe o engine (spec §6.4). */
function profileIdFor(type: string, providerId: string | undefined, original?: string): string {
  if (original) return original;
  if (type === "database") return providerId ? (SQL_IDS.has(providerId) ? "sql-standard-v1" : "nosql-standard-v1") : "unresolved";
  return DEFAULT_PROFILE_BY_TYPE[type] ?? "unresolved";
}

function Lab() {
  const lang = useLang();
  const original = fixture as any;
  // ?blank=1 abre o laboratório com o canvas vazio (usado para demonstrações e para começar do zero)
  const blank = useMemo(() => new URLSearchParams(location.search).has("blank"), []);
  // a sessão (caso/requisitos) só vale quando a tela inicial a pede (?s=1); abrir /app direto não herda um caso antigo
  const sharedMode = useMemo(() => new URLSearchParams(location.search).has("shared"), []);
  const [shared, setShared] = useState<SharePayload | null | "error">(null);
  const stored = useMemo(() => (new URLSearchParams(location.search).has("s") ? loadSession() : null), []);
  const session = useMemo<Session | null>(() => {
    if (!sharedMode) return stored;
    if (!shared || shared === "error") return null;
    const c = shared.caseId ? caseById(shared.caseId) : undefined;
    return c ? sessionFor(c) : { mode: "free", title: shared.title, requirements: emptyRequirements() };
  }, [sharedMode, stored, shared]);
  // o desenho de referência (encurtador) tem carga própria; no canvas em branco vale a carga do caso ou do modo livre
  const { peakRps: PEAK, readPct: READ0 } = (blank ? session?.load : undefined) ?? DEFAULT_LOAD;
  const [traffic, setTraffic] = useState(1); // × a carga de pico do caso
  const [readPct, setReadPct] = useState(READ0);
  const [speed, setSpeed] = useState(1);
  const [run, setRun] = useState<{ status: RunStatus; t: number; series: Sample[] }>({ status: "idle", t: 0, series: [] });
  const [down, setDown] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(blank ? null : "db");
  const [tab, setTab] = useState<"components" | "flows" | "props">("components");
  const [providerFor, setProviderFor] = useState<string | null>(null);
  const { screenToFlowPosition, deleteElements, fitView } = useReactFlow();
  const counter = useRef(0);
  const [docEdges, setDocEdges] = useState<DocEdge[]>(blank ? [] : original.edges);
  const [flows, setFlows] = useState<Flow[]>(blank ? [] : original.traffic.flows);
  const [workloads, setWorkloads] = useState<any[]>(blank ? [] : original.traffic.workloads);
  const [meta, setMeta] = useState<Record<string, FlowMeta>>(blank ? {} : { "flow-redirect": { name: "Redirecionar link", weight: 1 } });
  const [briefPref, setBriefOpen] = usePref("briefOpen", true);
  const [chaos, setChaos] = useState<Set<string>>(new Set());
  const [chaosOpen, setChaosOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // o enunciado do encurtador só vale para o desenho de referência; no canvas em branco o painel mostra os requisitos da sessão (ou some)
  const caseTypes = useMemo(() => (blank && session?.checks ? new Set(session.checks.needs.flatMap((n) => n.any)) : undefined), [blank, session]);
  const chaosHints = useMemo(() => (blank && session?.checks?.chaos ? new Set(session.checks.chaos) : undefined), [blank, session]);
  const hasPanel = !blank || !!session;
  const briefOpen = hasPanel && briefPref;
  const [toast, setToast] = useState<string | null>(null);
  const [simMin, setSimMin] = usePref("resultCollapsed", false);
  const [mapOpen, setMapOpen] = usePref("minimapOpen", true);
  const [protoFocus, setProtoFocus] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  // a barra superior quebra em duas linhas em telas médias: a legenda de protocolos desce junto, em vez de ficar por baixo dela
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".topbar"); if (!bar) return;
    const set = () => document.documentElement.style.setProperty("--topbar-bottom", `${Math.round(bar.getBoundingClientRect().bottom)}px`);
    set(); const ro = new ResizeObserver(set); ro.observe(bar); window.addEventListener("resize", set);
    return () => { ro.disconnect(); window.removeEventListener("resize", set); };
  }, []);
  const [edgeSel, setEdgeSel] = useState<Set<string>>(new Set());
  const [flowSel, setFlowSel] = useState<string | null>(blank ? null : "flow-redirect");
  const [pending, setPending] = useState<{ source: string; target: string; options: ConnectionOption[]; editId?: string; current?: { protocol: string; mode: string } } | null>(null);
  const [nodes, setNodes] = useState<Node<NodeData>[]>(() =>
    (blank ? [] : original.nodes).map((n: any) => {
      const pos = original.layout.positions.find((p: any) => p.nodeId === n.id) ?? { x: 0, y: 0 };
      // o layout da fixture foi pensado para cards estreitos: afasta os nós para que as bolinhas de conexão não se sobreponham
      return { id: n.id, type: "arch", position: { x: pos.x * 1.55, y: pos.y * 1.15 }, width: 240,
        data: { name: n.name, type: n.type, replicas: n.properties.replicas, providerId: DEMO_PROVIDERS[n.id],
          hitRate: n.properties.cache?.hitRate, health: "idle" } };
    }),
  );

  const originalById = useMemo(() => new Map<string, any>(original.nodes.map((n: any) => [n.id, n])), [original]);
  const originalIds = useMemo(() => new Set(originalById.keys()), [originalById]);

  // Só o que muda a arquitetura (não posição/seleção) recompõe o documento.
  const semKey = JSON.stringify(nodes.map((n) => [n.id, n.data.type, n.data.name, n.data.replicas, n.data.providerId, n.data.hitRate]));
  const docNodes = useMemo(() => nodes.map((n) => {
    const o = originalById.get(n.id);
    const replicas = n.data.replicas;
    const placements = (o?.properties.placements?.length ? o.properties.placements : [{ region: "region-a", zone: "zone-a", count: 1 }])
      .map((p: any, i: number) => ({ ...p, count: i === 0 ? replicas : Math.min(p.count, replicas) }));
    const props: any = {
      ...(o?.properties ?? { policy: {} }), profileId: profileIdFor(n.data.type, n.data.providerId, o?.properties.profileId),
      replicas, placements,
    };
    if (n.data.type === "redis") props.cache = { ...(o?.properties.cache ?? DEFAULT_CACHE), hitRate: n.data.hitRate ?? DEFAULT_CACHE.hitRate };
    return { id: n.id, type: n.data.type, componentVersion: "1.0.0", name: n.data.name, properties: props };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [semKey, originalById]);
  const doc = useMemo(
    () => ({ ...original, nodes: docNodes, edges: docEdges, traffic: { ...original.traffic, workloads, flows } }),
    [original, docNodes, docEdges, workloads, flows],
  );
  const issues = useMemo(() => validateArchitecture(doc), [doc]);
  // leitura x escrita: cada tipo recebe sua fatia; dentro do tipo, a carga se divide pelo peso de cada fluxo
  const weights = useMemo(() => {
    const isWrite = (f: Flow) => f.steps.some((s) => s.operationClass === "write");
    const reads = flows.filter((f) => !isWrite(f)), writes = flows.filter(isWrite);
    const wShare = writes.length ? (reads.length ? 1 - readPct / 100 : 1) : 0;
    const out: Record<string, number> = {};
    const spread = (group: Flow[], share: number) => {
      const sum = group.reduce((a, f) => a + (meta[f.id]?.weight ?? 1), 0);
      for (const f of group) out[f.id] = sum > 0 ? (share * (meta[f.id]?.weight ?? 1)) / sum : 0;
    };
    spread(reads, 1 - wShare); spread(writes, wShare);
    return out;
  }, [flows, meta, readPct]);
  // modo caos: contexto, alvo de cada falha direcionada e efeitos compostos
  const chaosCtx = useMemo(() => ({
    nodes: docNodes.map((n: any) => ({ id: n.id, type: n.type, name: n.name, replicas: n.properties.replicas, source: !!PROFILES[n.properties.profileId]?.source })),
    edges: docEdges.map((e) => ({ id: e.id, source: e.source, target: e.target, tls: !!e.configuration.tls })),
  }), [docNodes, docEdges]);
  const baseTraffic = Math.round(PEAK * traffic);
  const baseline = useMemo(() => solveDemand(doc, { rps: baseTraffic, weights, inactiveNodeIds: [...down] }), [doc, baseTraffic, weights, down]);
  const bottleneck = useCallback((ids: string[]) => {
    let best: [string, number] | null = null;
    for (const id of ids) { const u = baseline.loads.get(id)?.utilization; if (u != null && Number.isFinite(u) && (!best || u > best[1])) best = [id, u]; }
    return best?.[0] ?? null;
  }, [baseline]);
  const chaosRes = useMemo(() => resolveChaos(chaos, chaosCtx, selected, bottleneck), [chaos, chaosCtx, selected, bottleneck]);
  const rps = Math.round(baseTraffic * chaosRes.traffic);
  const result = useMemo(
    () => solveDemand(doc, { rps, weights, inactiveNodeIds: [...down], effects: chaosRes.effects }),
    [doc, rps, weights, down, chaosRes],
  );
  const loads = result.loads;
  // ── overall do desenho: calculado sobre a carga atual, sem as falhas injetadas ──
  const baseP95 = useMemo(() => {
    let p: number | null = null;
    for (const f of flows) { if (f.steps.some((s) => s.operationClass === "write")) continue; const st = baseline.flows.get(f.id); if (st && st.offered > 0 && st.p95Ms !== null && (p === null || st.p95Ms > p)) p = st.p95Ms; }
    return p;
  }, [flows, baseline]);
  const baseErr = useMemo(() => errorOf(baseline), [baseline]);
  const lossErr = useMemo(() => (flows.length ? lossErrors(doc, baseTraffic, weights, baseErr) : {}), [doc, baseTraffic, weights, baseErr, flows.length]);

  // simulação: 1 passo = 1 s simulado; "velocidade" só acelera o relógio. Parâmetros são lidos a cada passo, então mudar
  // tráfego, mix ou derrubar um componente durante a execução aparece na série.
  const latest = useRef({ result, docNodes, down });
  latest.current = { result, docNodes, down };
  useEffect(() => {
    if (run.status !== "running") return;
    const id = setInterval(() => {
      const { result: r, docNodes: dn, down: dd } = latest.current;
      let offered = 0, completed = 0, p95: number | null = null;
      for (const f of r.flows.values()) { offered += f.offered; completed += f.completed; if (f.offered > 0 && f.p95Ms !== null && (p95 === null || f.p95Ms > p95)) p95 = f.p95Ms; }
      let worst: [string, number] | undefined;
      for (const [nid, l] of r.loads) if (!dd.has(nid) && !l.source && l.utilization !== null && Number.isFinite(l.utilization) && (!worst || l.utilization > worst[1])) worst = [nid, l.utilization];
      setRun((cur) => {
        if (cur.status !== "running") return cur;
        const t = cur.t + 1;
        const sample: Sample = { t, offered, completed, worstName: worst ? dn.find((n: any) => n.id === worst![0])?.name : undefined, worstUtil: worst?.[1], p95 };
        return { status: t >= DURATION ? "completed" : "running", t, series: [...cur.series, sample] };
      });
    }, 1000 / speed);
    return () => clearInterval(id);
  }, [run.status, speed]);
  const profileById = useMemo(() => new Map<string, string>(docNodes.map((n: any) => [n.id, n.properties.profileId])), [docNodes]);

  // arestas "usadas": em algum fluxo ou consumo implícito de fila
  const usedEdges = useMemo(() => {
    const s = new Set<string>(flows.flatMap((f) => f.steps.map((x) => x.edgeId).filter(Boolean) as string[]));
    for (const e of docEdges) if (loads.get(e.source)?.queue) s.add(e.id);
    return s;
  }, [flows, docEdges, loads]);
  const activeFlow = tab === "flows" ? flows.find((f) => f.id === flowSel) : undefined;
  const flowNodeIds = useMemo(() => new Set(activeFlow?.steps.map((s) => s.nodeId) ?? []), [activeFlow]);
  const flowEdgeIds = useMemo(() => new Set(activeFlow?.steps.map((s) => s.edgeId).filter(Boolean) as string[] ?? []), [activeFlow]);

  const setReplicas = useCallback((id: string, n: number) =>
    setNodes((ns) => ns.map((x) => (x.id === id ? { ...x, data: { ...x.data, replicas: Math.min(MAX_REPLICAS, Math.max(1, n)) } } : x))), []);
  // foco por protocolo: só os componentes que conversam nesse protocolo ficam em destaque
  const protoNodes = useMemo(() => {
    const s = new Set<string>();
    if (protoFocus) for (const e of docEdges) if (String(e.configuration.protocol) === protoFocus) { s.add(e.source); s.add(e.target); }
    return s;
  }, [protoFocus, docEdges]);
  const shownNodes = nodes.map((n) => {
    const load = loads.get(n.id);
    const h = healthOf(load, down.has(n.id) || !!chaosRes.effects.nodes?.[n.id]?.unavailable, profileById.get(n.id) ?? "unresolved", SIDE_TYPES.has(String(n.data.type)));
    return { ...n, data: { ...n.data, load, ...h, chaos: chaosRes.faultNodes.has(n.id), dim: (!!activeFlow && !flowNodeIds.has(n.id)) || (!!protoFocus && !protoNodes.has(n.id)), onReplicas: setReplicas } };
  });
  const typeOf = (id: string) => nodes.find((n) => n.id === id)?.data.type as string;
  const protoLegend = useMemo(() => {
    const c = new Map<string, number>(); for (const e of docEdges) c.set(String(e.configuration.protocol), (c.get(String(e.configuration.protocol)) ?? 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [docEdges]);
  const edges: Edge<EdgeData>[] = docEdges.map((e) => {
    const tl = loads.get(e.target);
    const unused = !usedEdges.has(e.id);
    const flow = unused || down.has(e.target) ? 0 : tl?.offered ?? 0;
    return {
      id: e.id, source: e.source, target: e.target, type: "flow", deletable: true, selected: edgeSel.has(e.id),
      data: {
        fault: chaosRes.faultEdges.has(e.id), animate: run.status === "running", label: `${e.configuration.protocol} · ${e.configuration.mode}`, protocol: String(e.configuration.protocol), mode: String(e.configuration.mode), flow, hot: (tl?.utilization ?? 0) > 1, unused,
        dim: (!!activeFlow && !flowEdgeIds.has(e.id)) || (!!protoFocus && String(e.configuration.protocol) !== protoFocus),
        onEdit: () => {
          const options = connectionOptions(typeOf(e.source), typeOf(e.target));
          const cur = { protocol: e.configuration.protocol, mode: e.configuration.mode };
          // mantém a configuração atual selecionável mesmo que as regras não a listem
          if (!options.some((o) => o.protocol === cur.protocol && o.mode === cur.mode)) {
            options.unshift({ protocol: cur.protocol as ConnectionOption["protocol"], mode: cur.mode as ConnectionOption["mode"],
              label: `${cur.protocol} (${t("atual")})`, hint: t("Configuração atual da conexão"),
              timeoutMs: Number(e.configuration.timeoutMs), networkLatencyMs: Number(e.configuration.networkLatencyMs), tls: Boolean(e.configuration.tls) });
          }
          setPending({ source: e.source, target: e.target, options, editId: e.id, current: cur });
        },
      },
    };
  });

  const onNodesChange = useCallback((changes: NodeChange<Node<NodeData>>[]) => {
    setNodes((ns) => applyNodeChanges(changes, ns));
    for (const c of changes) {
      if (c.type === "select" && c.selected) { setSelected(c.id); setTab((t) => (t === "flows" ? t : "props")); }
      if (c.type === "remove") {
        setSelected((s) => (s === c.id ? null : s));
        setDown((d) => { const n = new Set(d); n.delete(c.id); return n; });
        // remove do(s) fluxo(s) todos os passos que usavam o componente
        setFlows((fs) => fs.map((f) => removeNodeFromFlow(f, c.id)).filter((f): f is Flow => !!f));
      }
    }
  }, []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    const removed = new Set(changes.filter((c) => c.type === "remove").map((c) => c.id));
    if (removed.size) {
      setDocEdges((es) => es.filter((e) => !removed.has(e.id)));
      setEdgeSel((s) => new Set([...s].filter((id) => !removed.has(id))));
    }
    for (const c of changes) {
      if (c.type === "select") setEdgeSel((s) => { const n = new Set(s); c.selected ? n.add(c.id) : n.delete(c.id); return n; });
    }
  }, []);

  const isValidConnection = useCallback((c: Connection | Edge) =>
    c.source !== c.target &&
    !docEdges.some((e) => e.source === c.source && e.target === c.target) &&
    connectionOptions(typeOf(c.source), typeOf(c.target)).length > 0,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [docEdges, nodes.length]);
  const onConnect = useCallback((c: Connection) => {
    setPending({ source: c.source, target: c.target, options: connectionOptions(typeOf(c.source), typeOf(c.target)) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);
  const confirmConnection = (o: ConnectionOption) => {
    if (!pending) return;
    if (pending.editId) {
      const unchanged = o.protocol === pending.current?.protocol && o.mode === pending.current?.mode;
      if (!unchanged) setDocEdges((es) => es.map((e) => e.id !== pending.editId ? e : {
        ...e, configuration: { ...e.configuration, protocol: o.protocol, mode: o.mode, timeoutMs: o.timeoutMs, networkLatencyMs: o.networkLatencyMs, tls: o.tls },
      }));
      return;
    }
    let id = `${pending.source}-${pending.target}`;
    while (docEdges.some((e) => e.id === id)) id += "-2";
    setDocEdges((es) => [...es, {
      id, source: pending.source, sourcePort: "out", target: pending.target, targetPort: "in",
      configuration: { mode: o.mode, protocol: o.protocol, required: true, timeoutMs: o.timeoutMs,
        networkLatencyMs: o.networkLatencyMs, maxAttempts: 1, backoffMs: 0, retryable: false, tls: o.tls },
    }]);
  };

  const addNode = (item: PaletteItem, position?: { x: number; y: number }) => {
    counter.current += 1;
    let id = `${item.type}-${counter.current}`;
    while (nodes.some((n) => n.id === id)) id = `${item.type}-${++counter.current}`;
    // posição livre: começa no centro visível e desce em diagonal até não sobrepor outro card
    const pos = { ...(position ?? screenToFlowPosition({ x: window.innerWidth * 0.4, y: window.innerHeight * 0.55 })) };
    const overlaps = (p: { x: number; y: number }) => nodes.some((n) => Math.abs(n.position.x - p.x) < 215 && Math.abs(n.position.y - p.y) < 170);
    for (let i = 0; i < 40 && overlaps(pos); i++) { pos.y += 180; if (i % 3 === 2) { pos.x += 240; pos.y -= 540; } }
    setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), {
      id, type: "arch", position: pos, width: 240, selected: true,
      data: { name: t(item.label), type: item.type, replicas: 1, hitRate: item.type === "redis" ? DEFAULT_CACHE.hitRate : undefined, health: "idle" as Health },
    }]);
    setSelected(id); setTab("props");
    if (PROVIDERS[item.type]?.length) setProviderFor(id);
  };
  const onDrop = (e: React.DragEvent) => {
    const item = ITEM_BY_TYPE.get(e.dataTransfer.getData("application/archlab"));
    if (!item) return;
    e.preventDefault();
    const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode(item, { x: p.x - 98, y: p.y - 40 });
  };
  const patchNode = (id: string, patch: Partial<NodeData>) => setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
  const toggleDown = (id: string) => setDown((d) => { const n = new Set(d); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── fluxos ──
  const panelNodes = docNodes.map((n: any) => ({ id: n.id, name: n.name, type: n.type, profileId: n.properties.profileId, icon: ICONS[n.type] ?? "dns" }));
  const createFlowFrom = (rootNodeId: string, name: string) => {
    const { flow, workload } = createFlow(flows, rootNodeId);
    setFlows((fs) => [...fs, flow]); setWorkloads((w) => [...w, workload]);
    setMeta((m) => ({ ...m, [flow.id]: { name, weight: 0.2 } })); setFlowSel(flow.id);
  };
  // ── fluxos derivados das conexões (canvas em branco): o que você liga no desenho aparece sozinho em Fluxos ──
  const structSig = (ns: { id: string; type: string; hit?: number }[], es: { id: string; source: string; target: string }[]) =>
    JSON.stringify([ns.map((n) => [n.id, n.type, n.hit]), es.map((e) => [e.id, e.source, e.target])]);
  const synced = useRef("");
  const tName = (n: string) => n.split(" · ").map((x) => t(x)).join(" · ");
  const deriveFlows = () => {
    const hit = nodes.find((n) => n.data.type === "redis")?.data.hitRate ?? DEFAULT_CACHE.hitRate;
    const an = nodes.map((n) => ({ id: n.id, type: n.data.type, name: n.data.name }));
    return nodes.filter((n) => SOURCE_TYPES.has(n.data.type)).flatMap((n) => buildAutoFlows(n.id, an, docEdges, hit));
  };
  /** Substitui os fluxos pelos derivados das conexões, mantendo nome e peso que a pessoa já tiver ajustado. */
  const syncFlows = (announce = false) => {
    const built = deriveFlows();
    synced.current = structSig(nodes.map((n) => ({ id: n.id, type: n.data.type, hit: n.data.hitRate })), docEdges);
    const sources = new Set(built.map((b) => b.flow.steps[0]!.nodeId));
    setFlows(built.map((b) => b.flow)); setWorkloads(built.map((b) => b.workload));
    setMeta((m) => Object.fromEntries(built.map((b) => [b.flow.id, m[b.flow.id] ?? { name: sources.size > 1 ? `${tName(b.name)} · ${nodes.find((n) => n.id === b.flow.steps[0]!.nodeId)?.data.name ?? ""}` : tName(b.name), weight: b.weight }])));
    setFlowSel((cur) => (built.some((b) => b.flow.id === cur) ? cur : built[0]?.flow.id ?? null));
    if (announce) say(built.length ? t("Fluxos refeitos a partir das conexões") : t("Sem conexões de saída nas origens: ligue a origem de carga a outro componente no canvas."));
    return built.length;
  };
  const sigNow = structSig(nodes.map((n) => ({ id: n.id, type: n.data.type, hit: n.data.hitRate })), docEdges);
  useEffect(() => {
    if (!blank || synced.current === sigNow) return;
    syncFlows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigNow]);
  const deleteFlow = (id: string) => {
    setFlows((fs) => fs.filter((f) => f.id !== id)); setWorkloads((w) => w.filter((x) => x.id !== `wl-${id}` && !(id === "flow-redirect" && x.id === "wl-redirect")));
    setFlowSel(null);
  };

  const selNode = selected ? nodes.find((n) => n.id === selected) : undefined;
  const sel = selNode ? docNodes.find((n: any) => n.id === selNode.id) : null;
  const selProvider = selNode ? providerOf(selNode.data.type, selNode.data.providerId) : undefined;
  const selLoad = selected ? loads.get(selected) : undefined;
  const selHealth = selNode ? healthOf(selLoad, down.has(selNode.id), profileById.get(selNode.id) ?? "unresolved", SIDE_TYPES.has(selNode.data.type)) : undefined;
  const selFlows = selNode ? flows.filter((f) => f.steps.some((s) => s.nodeId === selNode.id)) : [];

  // ── histórico (desfazer/refazer): cada gesto concluído vira um passo; arrastar/redimensionar conta como um só ──
  const hist = useRef({ past: [] as string[], future: [] as string[], last: "", applying: false });
  const snap = () => JSON.stringify({
    n: nodes.map((n) => ({ id: n.id, x: Math.round(n.position.x), y: Math.round(n.position.y), w: n.width,
      d: { name: n.data.name, type: n.data.type, replicas: n.data.replicas, providerId: n.data.providerId, hitRate: n.data.hitRate, note: n.data.note || undefined } })),
    e: docEdges, f: flows, w: workloads, m: meta, g: notes || undefined,
  });
  const key = snap();
  if (!hist.current.last) hist.current.last = key;
  const busy = nodes.some((n) => n.dragging || (n as any).resizing);
  useEffect(() => {
    const h = hist.current;
    if (h.applying) { h.applying = false; h.last = key; return; }
    if (key === h.last || busy) return;
    const t = setTimeout(() => {
      h.past.push(h.last); if (h.past.length > 100) h.past.shift();
      h.last = key; h.future = [];
    }, 350);
    return () => clearTimeout(t);
  }, [key, busy]);
  const say = (msg: string) => { setToast(msg); setTimeout(() => setToast((t) => (t === msg ? null : t)), 1600); };
  const restore = (str: string) => {
    const s = JSON.parse(str);
    hist.current.applying = true;
    setNodes(s.n.map((n: any) => ({ id: n.id, type: "arch", position: { x: n.x, y: n.y }, width: n.w, data: { ...n.d, health: "idle" } })));
    synced.current = structSig(s.n.map((n: any) => ({ id: n.id, type: n.d.type, hit: n.d.hitRate })), s.e);
    setDocEdges(s.e); setFlows(s.f); setWorkloads(s.w); setMeta(s.m); setNotes(typeof s.g === "string" ? s.g : "");
    setSelected(null); setEdgeSel(new Set());
  };
  const undo = () => {
    const h = hist.current; const cur = snap();
    if (cur !== h.last) { h.past.push(h.last); h.last = cur; }
    const prev = h.past.pop();
    if (prev === undefined) { say(t("Nada para desfazer")); return; }
    h.future.push(h.last); h.last = prev; restore(prev); say("Desfeito");
  };
  const redo = () => {
    const h = hist.current; const next = h.future.pop();
    if (next === undefined) { say(t("Nada para refazer")); return; }
    h.past.push(h.last); h.last = next; restore(next); say("Refeito");
  };

  const readP95 = useMemo(() => {
    let p: number | null = null;
    for (const f of flows) {
      if (f.steps.some((s) => s.operationClass === "write")) continue;
      const st = result.flows.get(f.id);
      if (st && st.offered > 0 && st.p95Ms !== null && (p === null || st.p95Ms > p)) p = st.p95Ms;
    }
    return p;
  }, [flows, result]);

  // ── requisitos, solução de referência, guia e progresso (só no canvas em branco com sessão) ──
  const [leftTab, setLeftTab] = usePref<"req" | "guide">("leftTab", "req");
  const [viewingRef, setViewingRef] = useState(false);
  const [backupAt, setBackupAt] = useState(0);
  const [stagesDone, setStagesDone] = useState(0);
  const design = useMemo(() => ({ nodes: docNodes, flows, loads, p95Ms: readP95 }), [docNodes, flows, loads, readP95]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checks = useMemo(() => (blank && session ? evaluate(session, design) : []), [blank, session, design, lang]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rating = useMemo(() => rate({ nodes: docNodes, edges: docEdges, flows, loads: baseline.loads, errFrac: baseErr, p95Ms: baseP95, p95Target: session?.checks?.p95Ms, lossErr, checks, readPct }),
    [docNodes, docEdges, flows, baseline, baseErr, baseP95, session, lossErr, checks, readPct, lang]);
  const refSnap = useMemo(() => (blank && session?.caseId && session.checks && session.load ? buildReference(session.checks, session.load) : null), [blank, session]);
  const compare = useMemo(() => {
    if (!refSnap) return { missing: [] as string[], extra: [] as string[] };
    const mine = new Set(nodes.map((n) => n.data.type)), theirs = new Set(refSnap.n.map((n) => n.d.type));
    const skip = new Set(["client"]);
    const label = (t: string) => ITEM_BY_TYPE.get(t)?.label ?? t;
    return { missing: [...theirs].filter((t) => !mine.has(t) && !skip.has(t)).map(label), extra: [...mine].filter((t) => !theirs.has(t)).map(label) };
  }, [refSnap, nodes]);

  useEffect(() => {
    if (!blank || sharedMode || !session?.caseId || !nodes.length || viewingRef) return;
    const t = setTimeout(() => {
      const met = checks.filter((c) => c.status === "meets").length;
      saveCaseProgress(session.caseId!, { met, total: checks.length, stages: stagesDone, status: "started", ovr: rating.overall ?? undefined });
    }, 800);
    return () => clearTimeout(t);
  }, [blank, session, nodes.length, checks, stagesDone, viewingRef, rating.overall]);

  // ── persistência: o desenho é salvo no navegador (um por caso) e pode ser exportado/importado como arquivo ──
  const storeKey = `archlab:design:${sharedMode ? "shared" : blank ? (session?.caseId ?? "free") : "reference"}`;
  const fileRef = useRef<HTMLInputElement>(null);
  const valid = (s: any) => s && Array.isArray(s.n) && Array.isArray(s.e) && Array.isArray(s.f) && Array.isArray(s.w) && s.m && typeof s.m === "object";
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey); if (!raw) return;
      const saved = JSON.parse(raw)?.snap; if (typeof saved !== "string" || !valid(JSON.parse(saved)) || saved === snap()) return;
      restore(saved); say("Desenho anterior recuperado");
    } catch { /* dado antigo ou corrompido: começa do zero */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const t = setTimeout(() => { try { localStorage.setItem(storeKey, JSON.stringify({ v: 1, savedAt: Date.now(), snap: key })); } catch { /* armazenamento cheio ou bloqueado */ } }, 600);
    return () => clearTimeout(t);
  }, [key, storeKey]);
  const exportDesign = () => {
    const title = session?.title ?? (blank ? t("Canvas livre") : t("Encurtador de links"));
    const blob = new Blob([JSON.stringify({ format: "archlab-design", v: 1, title, snap: JSON.parse(key) }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `archlab-${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "desenho"}.json`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); say("Desenho exportado");
  };
  const [reporting, setReporting] = useState(false);
  const exportReport = async () => {
    if (reporting) return;
    setReporting(true);
    try {
      const found = session?.caseId ? caseById(session.caseId) : undefined;
      const title = session?.title ?? (blank ? t("Canvas livre") : t("Encurtador de links"));
      const blob = await renderReport({
        title, summary: session?.summary, level: found?.level, mode: session?.mode ?? "free", logoId: found?.company?.logo, iconName: found?.icon,
        rating, met: checks.filter((c) => c.status === "meets").length, total: checks.length,
        nodes: shownNodes.map((n) => {
          const d = n.data; const prov = providerOf(d.type, d.providerId);
          return { id: n.id, x: n.position.x, y: n.position.y, w: n.width ?? 240, h: n.measured?.height ?? (d.load ? 124 : 96), name: d.name, type: d.type,
            icon: ICONS[d.type] ?? "dns", cat: CATEGORY_OF.get(d.type) ?? "compute", replicas: d.replicas, providerId: d.providerId, providerName: prov?.name,
            util: d.load?.utilization ?? null, offered: d.load?.offered, health: d.health, status: t(d.badge ?? HEALTH_LABEL[d.health]), hasLoad: !!d.load };
        }),
        edges: edges.map((e) => ({ source: e.source, target: e.target, protocol: String(e.data?.protocol), mode: String(e.data?.mode), flow: e.data?.flow ?? 0, hot: !!e.data?.hot, unused: !!e.data?.unused })),
      });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = `archlab-relatorio-${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "desenho"}.png`;
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); say(t("Relatório exportado"));
    } catch { say(t("Não foi possível gerar o relatório")); }
    finally { setReporting(false); }
  };
  useEffect(() => {
    if (!sharedMode) return;
    decodeShare(location.hash).then((p) => {
      if (!p) { setShared("error"); say(t("Link inválido ou corrompido")); return; }
      setShared(p);
      const c = p.caseId ? caseById(p.caseId) : undefined;
      if (c) setReadPct(sessionFor(c).load?.readPct ?? 99);
      restore(JSON.stringify(p.snap)); setTimeout(doFit, 150); say("Desenho compartilhado aberto");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const copyLink = async () => {
    if (!canShare()) { say(t("Seu navegador não suporta compartilhar por link")); return; }
    try {
      const url = await shareUrl({ v: 1, title: session?.title ?? "Meu desenho", caseId: session?.caseId, snap: JSON.parse(key) });
      try { await navigator.clipboard.writeText(url); say(url.length > 6000 ? t("Link copiado (longo: pode não funcionar em alguns apps)") : t("Link copiado")); }
      catch { window.prompt(t("Copie o link do desenho:"), url); }
    } catch { say(t("Não foi possível gerar o link")); }
  };
  const backupKey = `${storeKey}:mine`;
  useEffect(() => { try { setBackupAt(localStorage.getItem(backupKey) ? 1 : 0); } catch { /* ignora */ } }, [backupKey]);
  const loadReference = () => {
    if (!refSnap) return;
    try { if (!viewingRef) localStorage.setItem(backupKey, key); } catch { /* ignora */ }
    setBackupAt(1); setViewingRef(true); restore(JSON.stringify(refSnap)); say(t("Solução de referência carregada")); setTimeout(doFit, 120);
  };
  const backToMine = () => {
    try { const mine = localStorage.getItem(backupKey); if (mine) { restore(mine); localStorage.removeItem(backupKey); } } catch { /* ignora */ }
    setBackupAt(0); setViewingRef(false); say(t("Seu desenho foi restaurado")); setTimeout(doFit, 120);
  };
  const importDesign = async (file: File) => {
    try {
      const j = JSON.parse(await file.text());
      if (j?.format !== "archlab-design" || !valid(j.snap)) throw new Error("formato");
      restore(JSON.stringify(j.snap)); say(`Importado: ${j.title ?? file.name}`); setTimeout(doFit, 120);
    } catch { say(t("Arquivo inválido: não é um desenho do ArchLab")); }
  };

  // ── área de transferência interna: copiar, recortar, colar, duplicar ──
  const clip = useRef<{ nodes: Node<NodeData>[]; edges: DocEdge[]; pastes: number } | null>(null);
  const copySel = (cut = false) => {
    const picked = nodes.filter((n) => n.selected);
    if (!picked.length) return false;
    const ids = new Set(picked.map((n) => n.id));
    clip.current = { nodes: picked, edges: docEdges.filter((e) => ids.has(e.source) && ids.has(e.target)), pastes: 0 };
    say(cut ? "Recortado" : `Copiado (${picked.length})`);
    if (cut) deleteElements({ nodes: picked.map((n) => ({ id: n.id })) });
    return true;
  };
  const pasteClip = () => {
    const c = clip.current; if (!c) { say("Nada copiado"); return; }
    c.pastes += 1; const off = 36 * c.pastes;
    const idMap = new Map<string, string>(); const taken = new Set(nodes.map((n) => n.id));
    for (const n of c.nodes) {
      let i = 1; while (taken.has(`${n.data.type}-${i}`) || [...idMap.values()].includes(`${n.data.type}-${i}`)) i++;
      idMap.set(n.id, `${n.data.type}-${i}`);
    }
    const fresh: Node<NodeData>[] = c.nodes.map((n) => ({
      id: idMap.get(n.id)!, type: "arch", position: { x: n.position.x + off, y: n.position.y + off }, width: n.width, selected: true,
      data: { ...n.data, load: undefined, health: "idle" as Health, dim: false, chaos: false },
    }));
    setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), ...fresh]);
    setDocEdges((es) => [...es, ...c.edges.map((e) => ({ ...e, id: `${idMap.get(e.source)}-${idMap.get(e.target)}`, source: idMap.get(e.source)!, target: idMap.get(e.target)! }))]);
    setSelected(fresh.length === 1 ? fresh[0]!.id : null); setEdgeSel(new Set());
    say(`Colado (${fresh.length})`);
  };
  const clearSelection = () => { setNodes((ns) => ns.map((n) => (n.selected ? { ...n, selected: false } : n))); setEdgeSel(new Set()); setSelected(null); };
  const nudge = (dx: number, dy: number) => setNodes((ns) => ns.map((n) => (n.selected ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n)));
  const doFit = () => fitView({ padding: { top: "110px", bottom: "60px", left: briefOpen ? "420px" : "80px", right: "400px" }, duration: 400 });

  const keys = useRef<(e: KeyboardEvent) => void>(() => {});
  keys.current = (e) => {
    const t = e.target as HTMLElement | null;
    const inField = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
    if (e.key === "Escape") { if (inField) { (t as HTMLElement).blur(); } else if (!document.querySelector("dialog[open]")) clearSelection(); return; }
    if (inField || document.querySelector("dialog[open]")) return;
    const mod = e.ctrlKey || e.metaKey; const k = e.key.toLowerCase();
    if (mod) {
      if (k === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (k === "y") { e.preventDefault(); redo(); }
      else if (k === "c") { if (copySel()) e.preventDefault(); }
      else if (k === "x") { if (copySel(true)) e.preventDefault(); }
      else if (k === "v") { e.preventDefault(); pasteClip(); }
      else if (k === "d") { e.preventDefault(); if (copySel()) pasteClip(); }
      else if (k === "a") { e.preventDefault(); setNodes((ns) => ns.map((n) => ({ ...n, selected: true }))); }
      else if (k === "enter") { e.preventDefault(); if (run.status === "running") setRun((r) => ({ ...r, status: "stopped" })); else if (!issues.length) setRun({ status: "running", t: 0, series: [] }); }
      return;
    }
    if (e.altKey) return;
    const step = e.shiftKey ? 50 : 10;
    if (k === "arrowleft") { e.preventDefault(); nudge(-step, 0); }
    else if (k === "arrowright") { e.preventDefault(); nudge(step, 0); }
    else if (k === "arrowup") { e.preventDefault(); nudge(0, -step); }
    else if (k === "arrowdown") { e.preventDefault(); nudge(0, step); }
    else if (k === "f") doFit();
    else if (k === "m") setMapOpen((v) => !v);
    else if (k === "b") setBriefOpen((v) => !v);
    else if (e.key === "?" || (e.key === "/" && e.shiftKey)) setHelpOpen(true);
    else if (e.key === "/") { e.preventDefault(); setTab("components"); setTimeout(() => document.querySelector<HTMLInputElement>('input[aria-label="Buscar componente"]')?.focus(), 30); }
  };
  useEffect(() => {
    const on = (e: KeyboardEvent) => keys.current(e);
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const rejected = selLoad ? selLoad.offered - selLoad.admitted : 0;
  const rpsTween = useTween(rps, 250);
  const writePct = 100 - readPct;
  const mixLabel = readPct >= 80 ? "Read-heavy" : readPct >= 45 ? "Equilibrado" : "Write-heavy";
  const running = run.status === "running";

  return (
    <div className={`lab${briefOpen ? " brief-open" : ""}`}>
      <header className="panel topbar">
        <a className="brand" href="/start" title={t("Trocar de modo")} onClick={(e) => { e.preventDefault(); go("/start"); }}>
          <span className="logo"><Logo size={30} /></span>
          <div>{t("ArchLab")}<small>{blank ? (session?.title ?? "Canvas livre") : (original.metadata.title ?? "Links curtos")}</small></div>
        </a>
        <span className="sep" />
        {running ? (
          <button className="simbtn stop" onClick={() => setRun((r) => ({ ...r, status: "stopped" }))}><Icon name="stop" size={20} />{" "}{t("Parar")}</button>
        ) : (
          <button className="simbtn play" onClick={() => { if (flows.length === 0 && !(blank && syncFlows(true) > 0)) { setTab("flows"); if (!blank) say(t("Antes de simular, crie um fluxo: o caminho que a requisição percorre.")); return; } setRun({ status: "running", t: 0, series: [] }); }} disabled={issues.length > 0}
            title={issues.length ? t("Corrija os problemas do modelo antes de simular") : t("Simular 300 s com a carga configurada")}>
            <Icon name="play_arrow" size={20} /> {run.status === "idle" ? t("Simular") : t("Simular de novo")}
          </button>
        )}
        <div className="hctl" style={{ minWidth: 128 }}>
          <label><span>{t("Velocidade")}</span><b className="num">{speed}×</b></label>
          <Range min={0} max={4} step={1} value={[0.5, 1, 2, 5, 10].indexOf(speed)} aria-label={t("Velocidade da simulação")}
            onChange={(e) => setSpeed([0.5, 1, 2, 5, 10][+e.target.value] ?? 1)} />
          <small>{running ? t("{n} s simulado por s real", { n: speed }) : t("Ritmo do relógio")}</small>
        </div>
        <div className="hctl" style={{ minWidth: 146 }}>
          <label><span>{t("Tráfego")}</span><b className="num">{traffic.toFixed(traffic < 1 ? 1 : traffic % 1 ? 1 : 0)}×</b></label>
          <Range min={1} max={100} step={1} value={Math.round(traffic * 10)} aria-label={t("Multiplicador de tráfego")}
            onChange={(e) => setTraffic(+e.target.value / 10)} />
          <small className="num">{fmt(rpsTween)} req/s{traffic === 1 ? (blank ? ` · ${t("pico do caso")}` : ` · ${t("pico do desafio")}`) : ""}</small>
        </div>
        <div className="hctl" style={{ minWidth: 168 }}>
          <label><span>{t("Leituras vs escritas")}</span><b className="num">{readPct}% read</b></label>
          <Range min={10} max={100} step={1} value={readPct} aria-label={t("Percentual de leituras")}
            onChange={(e) => setReadPct(+e.target.value)} />
          <small title={flows.some((f) => f.steps.some((s) => s.operationClass === "write")) ? undefined : t("Ainda não há fluxo de escrita: toda a carga vai para leitura")}>{mixLabel} · {writePct}% write{flows.some((f) => f.steps.some((s) => s.operationClass === "write")) ? "" : ` · ${t("só leitura")}`}</small>
        </div>
        <button className={`chip chaos-btn${chaos.size ? " on" : ""}`} onClick={() => setChaosOpen(true)} title={t("Injetar falhas no desenho")}>
          <Icon name="local_fire_department" size={16} /><span className="lbl">{t("Modo caos")}</span>{chaos.size ? <b className="count">{chaos.size}</b> : null}
        </button>
        <button className="chip" aria-pressed={down.size > 0} disabled={down.size === 0} onClick={() => setDown(new Set())}
          title={down.size ? t("Restaurar todos os componentes") : t("Selecione um componente e use “Simular indisponibilidade”")}>
          <Icon name={down.size ? "restart_alt" : "flash_off"} size={16} />
          <span className="lbl">{down.size ? t("{n} fora do ar · restaurar", { n: down.size }) : t("Sem falhas")}</span>
        </button>
        <span className="spacer" />
        <RatingChip rating={rating} title={session?.title ?? (blank ? t("Canvas livre") : t("Encurtador de links"))} />
        <button className="chip icon-only" aria-label={t("Copiar link do desenho")} title={t("Compartilhar por link")} onClick={copyLink}><Icon name="share" size={18} /></button>
        <ExportMenu onJson={exportDesign} onReport={exportReport} busy={reporting} />
        <button className="chip icon-only" aria-label={t("Importar desenho")} title={t("Importar desenho (.json)")} onClick={() => fileRef.current?.click()}><Icon name="upload" size={18} /></button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importDesign(f); e.target.value = ""; }} />
        <LangToggle />
        <ThemeToggle className="theme-btn" />
        <button className="chip icon-only" aria-label={t("Atalhos de teclado")} title={t("Atalhos de teclado (?)")} onClick={() => setHelpOpen(true)}><Icon name="keyboard" size={18} /></button>
        <span className={`status${issues.length ? " bad" : ""}`} role="status" title={issues.map((i) => i.message).join("\n")}>
          <Icon name={issues.length === 0 ? "verified" : "error"} size={15} /> <span className="lbl">{issues.length === 0 ? t("Modelo válido") : t("{n} problema(s)", { n: issues.length })}</span>
        </span>
      </header>

      <ReactFlow
        nodes={shownNodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} isValidConnection={isValidConnection}
        deleteKeyCode={["Backspace", "Delete"]} connectionRadius={36} connectionLineComponent={ConnectionLine}
        fitView={!blank} defaultViewport={{ x: 0, y: 0, zoom: 1 }} fitViewOptions={{ padding: { top: "110px", bottom: "60px", left: "420px", right: "400px" } }} minZoom={0.25} maxZoom={2}
        onPaneClick={() => setSelected(null)} onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.6} color="var(--dot)" />
        <Controls showInteractive={false} />
        <Panel position="top-left" className="notes-panel"><NotesPad value={notes} onChange={setNotes} /></Panel>
        {protoLegend.length > 0 && (
          <Panel position="top-center" className="proto-legend" aria-label={t("Protocolos em uso")}>
            {protoLegend.map(([p, n]) => {
              const st = protoOf(p);
              return (
                <button key={p} className={`proto-chip${protoFocus === p ? " on" : ""}`} style={{ ["--pc" as string]: st.color }} aria-pressed={protoFocus === p}
                  title={`${t(st.hint)} · ${n}`} onClick={() => setProtoFocus((f) => (f === p ? null : p))} onMouseEnter={() => setProtoFocus(p)} onMouseLeave={() => setProtoFocus(null)}>
                  <Icon name={st.icon} size={13} />{t(st.name)}<small>{n}</small>
                </button>
              );
            })}
          </Panel>
        )}
        <div className={`mm-wrap${mapOpen ? "" : " closed"}`}>
          {mapOpen ? (
            <>
              <MiniMap pannable zoomable nodeColor={(n) => `var(--c-${CATEGORY_OF.get(String((n.data as NodeData).type)) ?? "compute"})`} />
              <button className="mm-toggle icon-btn" aria-label={t("Recolher minimapa")} title={t("Recolher minimapa")} onClick={() => setMapOpen(false)}><Icon name="close_fullscreen" size={14} /></button>
            </>
          ) : (
            <button className="chip" aria-label={t("Mostrar minimapa")} onClick={() => setMapOpen(true)}><Icon name="map" size={16} />{" "}{t("Minimapa")}</button>
          )}
        </div>
      </ReactFlow>

      {run.status !== "idle" && <SimPanel collapsed={simMin} onToggle={() => setSimMin((v) => !v)} status={run.status} t={run.t} series={run.series} chaos={CHAOS.filter((c) => chaos.has(c.id)).map((c) => c.title)} />}

      {run.status === "idle" && <p className="hint panel" role="region" aria-label={t("Dica")}><Icon name="info" size={15} />{" "}{t("Arraste da lateral · ligue pelas bolinhas · defina o caminho em Fluxos ·")}{" "}<kbd>?</kbd> {t("atalhos")}</p>}

      {!hasPanel ? null : briefOpen ? (
        <aside className="panel brief" aria-label={blank ? t("Requisitos") : t("Enunciado do desafio")}>
          <div className="brief-bar">
            {blank && session?.mode === "study" ? (
              <span className="seg" role="tablist" aria-label={t("Painel do caso")}>
                <button role="tab" aria-selected={leftTab === "req"} className={leftTab === "req" ? "on" : ""} onClick={() => setLeftTab("req")}><Icon name="checklist" size={15} />{" "}{t("Requisitos")}</button>
                <button role="tab" aria-selected={leftTab === "guide"} className={leftTab === "guide" ? "on" : ""} onClick={() => setLeftTab("guide")}><Icon name="alarm" size={15} />{" "}{t("Guia")}</button>
              </span>
            ) : <span><Icon name={blank ? "checklist" : "assignment"} size={17} /> {blank ? t("Requisitos") : t("Desafio")}</span>}
            <button className="icon-btn" aria-label={t("Recolher enunciado")} title={t("Recolher")} onClick={() => setBriefOpen(false)}><Icon name="left_panel_close" size={18} /></button>
          </div>
          {blank && session ? (leftTab === "guide" && session.mode === "study"
            ? <Guide session={session} checks={checks} onStages={setStagesDone} />
            : <RequirementsView session={session} checks={checks} reference={refSnap ? { ...compare, viewing: viewingRef, hasBackup: backupAt === 1, onLoad: loadReference, onBack: backToMine } : undefined} />) : <Brief nodes={docNodes} flows={flows} loads={loads} rps={rps} down={down} p95Ms={readP95} />}
        </aside>
      ) : (
        <button className="chip brief-open-btn" onClick={() => setBriefOpen(true)}><Icon name={blank ? "checklist" : "assignment"} size={16} /> {blank ? t("Ver requisitos") : t("Ver enunciado")}</button>
      )}

      <aside className="panel sidebar" aria-label={t("Ferramentas")}>
        <div className="tabs" role="tablist">
          {([["components", "widgets", "Componentes"], ["flows", "route", "Fluxos"], ["props", "tune", "Propriedades"]] as const).map(([k, icon, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              <Icon name={icon} size={16} /> {t(label)}
            </button>
          ))}
        </div>
        {tab === "components" && <Palette onAdd={(i) => addNode(i)} inCase={caseTypes} />}
        {tab === "flows" && (
          <FlowsPanel flows={flows} meta={meta} nodes={panelNodes} edges={docEdges} selectedId={flowSel} onSelect={setFlowSel}
            auto={blank} onCreate={createFlowFrom} onAuto={() => syncFlows(true)} onDelete={deleteFlow}
            onMeta={(id, m) => setMeta((all) => ({ ...all, [id]: { ...(all[id] ?? { name: id, weight: 1 }), ...m } }))}
            onAddStep={(fid, s) => setFlows((fs) => fs.map((f) => (f.id === fid ? addStep(f, s) : f)))}
            onRemoveStep={(fid, sid) => setFlows((fs) => fs.map((f) => (f.id === fid ? removeStep(f, sid) : f)))} />
        )}
        {tab === "props" && (sel && selNode && selHealth ? (
          <div className="inspector" key={selected}>
            <label className="name-field">
              <input value={selNode.data.name} maxLength={40} aria-label={t("Nome do componente")} placeholder={t("Nome do componente")}
                onChange={(e) => patchNode(sel.id, { name: e.target.value })}
                onBlur={() => { if (!selNode.data.name.trim()) patchNode(sel.id, { name: ITEM_BY_TYPE.get(selNode.data.type)?.label ?? selNode.data.type }); }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); e.stopPropagation(); }} />
              <Icon name="edit" size={15} />
            </label>
            <div className="sub">{sel.type} · {sel.properties.profileId}</div>
            {PROVIDERS[sel.type]?.length ? (
              <button className="provider-row" onClick={() => setProviderFor(sel.id)}>
                {selProvider ? <ProviderMark provider={selProvider} size={44} /> : <span className="pmark empty" style={{ width: 44, height: 44 }}><Icon name="add" size={20} /></span>}
                <span className="p-text"><b>{selProvider ? selProvider.name : "Escolher provedor"}</b>
                  <small>{selProvider?.note ? t(selProvider.note) : (sel.type === "database" ? t("Obrigatório: define o engine para calcular") : t("Qual tecnologia faz este papel?"))}</small></span>
                <Icon name="swap_horiz" size={18} />
              </button>
            ) : null}

            <div className="controls">
              <div className="ctl"><span>{t("Réplicas")}</span>
                <div className="stepper">
                  <button aria-label={t("Menos uma réplica")} disabled={selNode.data.replicas <= 1} onClick={() => patchNode(sel.id, { replicas: selNode.data.replicas - 1 })}><Icon name="remove" size={16} /></button>
                  <b className="num">{selNode.data.replicas}</b>
                  <button aria-label={t("Mais uma réplica")} disabled={selNode.data.replicas >= MAX_REPLICAS} onClick={() => patchNode(sel.id, { replicas: selNode.data.replicas + 1 })}><Icon name="add" size={16} /></button>
                </div></div>
              {sel.type === "redis" && (
                <label className="ctl col"><span>{t("Taxa de acerto do cache")}{" "}<b className="num">{Math.round((selNode.data.hitRate ?? 0) * 100)}%</b></span>
                  <Range min={0} max={100} step={5} value={Math.round((selNode.data.hitRate ?? 0) * 100)} onChange={(e) => patchNode(sel.id, { hitRate: +e.target.value / 100 })} />
                </label>
              )}
              <button className="chip" aria-pressed={down.has(sel.id)} onClick={() => toggleDown(sel.id)}>
                <Icon name={down.has(sel.id) ? "restart_alt" : "flash_off"} size={16} /> {down.has(sel.id) ? "Restaurar componente" : "Simular indisponibilidade"}
              </button>
            </div>

            {selLoad && selHealth.health !== "origin" && (
              <div className="stats">
                <div className="stat"><span><Icon name="call_received" size={14} />{" "}{t("Oferecido")}</span><b><Num value={selLoad.offered} />/s</b></div>
                <div className="stat"><span><Icon name="task_alt" size={14} />{" "}{t("Admitido")}</span><b><Num value={selLoad.admitted} />/s</b></div>
                <div className="stat"><span><Icon name="speed" size={14} />{" "}{t("Capacidade")}</span><b>{selLoad.capacity === null ? "unknown" : <><Num value={selLoad.capacity} />/s</>}</b></div>
                <div className="stat"><span><Icon name="percent" size={14} />{" "}{t("Utilização")}</span><b>{selLoad.utilization === null ? "—" : Number.isFinite(selLoad.utilization) ? <Num value={selLoad.utilization * 100} suffix="%" /> : "∞"}</b></div>
                <div className="stat"><span><Icon name="timer" size={14} />{" "}{t("Latência p95")}</span><b>{selLoad.latencyP95Ms === null ? "—" : <><Num value={selLoad.latencyP95Ms} /> ms</>}</b></div>
              </div>
            )}
            {selLoad?.queue && (
              <div className={`alert${selLoad.queue.backlogGrowthPerSec > 0.5 ? "" : " ok"}`}>
                <Icon name={selLoad.queue.backlogGrowthPerSec > 0.5 ? "hourglass_top" : "check_circle"} size={18} />
                <span>{selLoad.queue.consumers === 0 ? t("Sem consumidor: tudo o que entra acumula. Ligue a fila a um worker.")
                  : selLoad.queue.backlogGrowthPerSec > 0.5
                    ? t("Entram {a}/s e os {n} consumidor(es) processam {b}/s. O backlog cresce {c} msg/s (≈ {d} em 300 s).", { a: fmt(selLoad.queue.enqueued), n: selLoad.queue.consumers, b: fmt(selLoad.queue.consumed), c: fmt(selLoad.queue.backlogGrowthPerSec), d: fmt(selLoad.queue.backlogGrowthPerSec * 300) })
                    : t("Os consumidores acompanham a entrada: sem backlog.")}</span>
              </div>
            )}
            {rejected > 0.5 && !selLoad?.queue && <div className="alert"><Icon name="warning" size={18} />{" "}{t("Demanda excede a capacidade em")}{" "}<b className="num">{fmt(rejected)}</b>{" "}{t("ops/s (modelado).")}</div>}
            {down.has(sel.id) && <div className="alert"><Icon name="flash_off" size={18} />{" "}{t("Componente fora do ar neste cenário. Tudo que depende dele reage no canvas.")}</div>}

            {selHealth.health === "idle" && SIDE_TYPES.has(sel.type) && (
              <div className="hintbox"><Icon name="info" size={18} /><span>{t("Componente de apoio: telemetria, segredos e descoberta ficam fora dos fluxos de requisição, então não recebem carga na simulação.")}</span></div>
            )}
            {selHealth.health === "idle" && !SIDE_TYPES.has(sel.type) && (
              <div className="hintbox"><Icon name="route" size={18} />
                <span>{t("Nenhum fluxo passa por aqui, então não há carga para calcular.")}{" "}<button className="link" onClick={() => setTab("flows")}>{t("Abrir Fluxos")}</button>{" "}{t("e adicione este componente a um caminho.")}</span></div>
            )}
            {selHealth.health === "noprofile" && (
              <div className="hintbox"><Icon name="rule" size={18} />
                <span>{sel.properties.profileId === "unresolved" ? t("Este tipo é abstrato: escolha o provedor/engine acima para definir a capacidade.") : t("Este tipo ainda não tem perfil de capacidade na simulação.")}</span></div>
            )}
            {selHealth.health === "unknown" && (
              <div className="hintbox"><Icon name="help" size={18} /><span>{t("O fluxo usa uma classe de operação que o perfil deste componente não define (ex.: mensagem em um banco). Ajuste a operação do passo na aba Fluxos.")}</span></div>
            )}
            {selFlows.length > 0 && (
              <p className="note">{t("Participa de:")} {selFlows.map((f) => meta[f.id]?.name ?? f.id).join(", ")}.</p>
            )}
            {(<>
              <label className="ctl col note-field"><span>{t("Observações")}</span>
                <textarea value={selNode.data.note ?? ""} maxLength={1000} rows={4} onChange={(e) => patchNode(sel.id, { note: e.target.value })}
                  placeholder={t("O que o entrevistado explicou sobre este componente (decisão, trade-off, motivo da escolha)…")} />
                <small>{(selNode.data.note ?? "").length}/1000</small></label>
              <button className="chip danger" onClick={() => deleteElements({ nodes: [{ id: sel.id }] })}><Icon name="delete" size={16} />{" "}{t("Remover componente")}</button>
            </>)}
            <p className="note">{t("Valores modelados com perfis fictícios; não são benchmarks. Fonte: simulated.")}</p>
          </div>
        ) : <p className="note pad">{t("Selecione um componente no canvas para ver as propriedades.")}</p>)}
      </aside>

      {providerFor && (
        <ProviderDialog key={providerFor} type={nodes.find((n) => n.id === providerFor)?.data.type ?? ""}
          current={nodes.find((n) => n.id === providerFor)?.data.providerId}
          onPick={(id) => patchNode(providerFor, { providerId: id })} onClose={() => setProviderFor(null)} />
      )}

      {helpOpen && <ShortcutsDialog onClose={() => setHelpOpen(false)} />}
      <div className="toast-region" aria-live="polite">{toast && <div className="toast" key={toast}>{toast}</div>}</div>

      {chaosOpen && (
        <ChaosDialog active={chaos} suggested={chaosHints} selectedName={selNode?.data.name ?? null}
          targetOf={(item) => { const t = pickTarget(item, chaosCtx, selected, bottleneck); const n = t && docNodes.find((x: any) => x.id === t.id); return t && n ? { id: t.id, name: n.name, why: t.why } : null; }}
          onApply={(ids, simulate) => { setChaos(ids); if (simulate) setRun({ status: "running", t: 0, series: [] }); }}
          onClose={() => setChaosOpen(false)} />
      )}

      {pending && (
        <ConnectDialog source={pending.source} target={pending.target} options={pending.options} current={pending.current}
          key={pending.editId ?? "new"} onPick={confirmConnection} onCancel={() => setPending(null)} />
      )}
    </div>
  );
}

/** Evita a "tela preta": qualquer erro de renderização mostra uma mensagem com ação de recuperação. */
class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="crash panel">
        <h2><Icon name="error" size={22} />{" "}{t("Algo deu errado no editor")}</h2>
        <p className="note">{this.state.error.message}</p>
        <button className="chip primary" onClick={() => this.setState({ error: null })}><Icon name="restart_alt" size={16} />{" "}{t("Tentar novamente")}</button>
        <button className="chip" onClick={() => location.reload()}>{t("Recarregar a página")}</button>
      </div>
    );
  }
}
export const App = () => <Boundary><ReactFlowProvider><Lab /></ReactFlowProvider></Boundary>;
