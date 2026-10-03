import fixture from "../../../fixtures/url-shortener-baseline.json";
import { connectionOptions, DEFAULT_PROFILE_BY_TYPE, solveDemand } from "@archlab/domain";
import { addStep, createFlow, type Flow, type FlowMeta, type Step } from "./flowOps";
import type { Checks, Load } from "./session";
import { t } from "./i18n";

/** Desenho de referência de um caso, no mesmo formato do histórico do laboratório (snapshot). */
export interface Snapshot {
  n: { id: string; x: number; y: number; w: number; d: { name: string; type: string; replicas: number; providerId?: string; hitRate?: number } }[];
  e: any[]; f: Flow[]; w: any[]; m: Record<string, FlowMeta>;
}

export const MAX_REPLICAS = 100;
const DEFAULT_PROVIDER: Record<string, string> = {
  client: "chrome", "load-balancer": "nginx", "api-gateway": "kong", backend: "nodejs", redis: "redis", "sql-database": "postgresql", "nosql-database": "cassandra",
  kafka: "kafka", queue: "rabbitmq", cdn: "cloudfront", "object-storage": "s3", "search-engine": "elasticsearch", websocket: "socketio", worker: "nodejs",
};
const LABEL: Record<string, string> = {
  client: "Cliente", cdn: "CDN", "load-balancer": "Load balancer", "api-gateway": "API Gateway", websocket: "WebSocket", backend: "Backend", redis: "Cache",
  "sql-database": "Banco SQL", "nosql-database": "Banco NoSQL", kafka: "Log de eventos", queue: "Fila", worker: "Workers", "search-engine": "Busca",
  "object-storage": "Object storage", "notification-service": "Notificações",
};

/** Tipo concreto escolhido para cada requisito de arquitetura (`any` = alternativas aceitas). */
const pick = (any: string[]) => (any.includes("kafka") ? "kafka" : any[0]!);

/**
 * Monta a arquitetura de referência a partir das verificações do caso: o caminho de leitura e escrita, mais os componentes
 * que o caso exige, com réplicas dimensionadas para a carga de pico (sem componente acima de 70%).
 */
export function buildReference(checks: Checks, load: Load): Snapshot {
  const has = new Set<string>(); for (const n of checks.needs) has.add(pick(n.any));
  const sql = has.has("sql-database") || !has.has("nosql-database");
  const nosql = has.has("nosql-database");
  const stream = has.has("kafka") ? "kafka" : has.has("queue") ? "queue" : null;

  type N = { id: string; type: string; name: string; replicas: number; col: number };
  const nodes: N[] = []; const add = (id: string, type: string, col: number, replicas = 2) => { nodes.push({ id, type, name: t(LABEL[type] ?? type), replicas, col }); return id; };
  add("client", "client", 0, 1);
  const ws = has.has("websocket") ? add("ws", "websocket", 1) : null;
  const cdn = has.has("cdn") ? add("cdn", "cdn", 1) : null;
  const lb = has.has("api-gateway") && !has.has("load-balancer") ? null : add("lb", "load-balancer", 2);
  const gw = has.has("api-gateway") ? add("gw", "api-gateway", lb ? 3 : 2) : null;
  const app = add("app", "backend", gw && lb ? 4 : 3, 3);
  const cache = has.has("redis") ? add("cache", "redis", 4 + (gw && lb ? 1 : 0)) : null;
  const dataCol = 4 + (gw && lb ? 1 : 0);
  const sqlId = sql ? add("sql", "sql-database", dataCol + (cache ? 1 : 0)) : null;
  const nosqlId = nosql ? add("nosql", "nosql-database", dataCol + (cache ? 1 : 0)) : null;
  const streamId = stream ? add("stream", stream, dataCol) : null;
  const worker = stream || has.has("worker") ? add("worker", "worker", dataCol + 1) : null;
  const search = has.has("search-engine") ? add("search", "search-engine", dataCol) : null;
  const obj = has.has("object-storage") ? add("obj", "object-storage", dataCol) : null;
  const notify = has.has("notification-service") ? add("notify", "notification-service", dataCol + 2) : null;
  const db = sqlId ?? nosqlId!;

  const typeOf = (id: string) => nodes.find((n) => n.id === id)!.type;
  const edges: any[] = [];
  const link = (a: string | null, b: string | null) => {
    if (!a || !b || edges.some((e) => e.source === a && e.target === b)) return;
    const o = connectionOptions(typeOf(a), typeOf(b))[0]; if (!o) return;
    edges.push({ id: `${a}-${b}`, source: a, sourcePort: "out", target: b, targetPort: "in",
      configuration: { mode: o.mode, protocol: o.protocol, required: true, timeoutMs: o.timeoutMs, networkLatencyMs: o.networkLatencyMs, maxAttempts: 1, backoffMs: 0, retryable: false, tls: o.tls } });
  };
  const entryChain = [lb, gw].filter(Boolean) as string[];
  link("client", cdn); link("client", entryChain[0] ?? app);
  entryChain.forEach((id, i) => link(id, entryChain[i + 1] ?? app));
  link("client", ws); link(ws, app);
  link(app, cache); link(app, sqlId); link(app, nosqlId); link(app, streamId); link(streamId, worker); link(worker, db); link(app, search); link(app, obj); link(app, notify);
  if (cdn && obj) link(cdn, obj);

  // ── fluxos ──
  const flows: Flow[] = []; const workloads: any[] = []; const meta: Record<string, FlowMeta> = {};
  const hit = 0.9;
  const newFlow = (name: string, weight: number) => { const { flow, workload } = createFlow(flows, "client"); flows.push(flow); workloads.push(workload); meta[flow.id] = { name, weight }; return flow; };
  const edgeOf = (a: string, b: string) => edges.find((e) => e.source === a && e.target === b)?.id as string;
  /** encadeia `path` a partir do passo raiz; `cacheAt` marca o lookup de cache cujo miss segue para o próximo nó. */
  const chain = (flow: Flow, path: string[], classes: Record<string, string>, ack?: string): Flow => {
    let f = flow; let parent: Step = f.steps[0]!; let prevId = "client"; let cacheStep: Step | null = null; let cacheParent: Step | null = null;
    for (const id of path) {
      const isCache = id === cache && path.includes(db);
      const step = (): Step => f.steps[f.steps.length - 1]!;
      if (cacheStep && cacheParent) {
        f = addStep(f, { parent: cacheParent, nodeId: id, edgeId: edgeOf(prevId === cache ? app : prevId, id), operationClass: classes[id] ?? "read", visits: 1, missOf: cacheStep, missShare: 1 - hit });
        parent = step(); cacheStep = null; prevId = id; continue;
      }
      f = addStep(f, { parent, nodeId: id, edgeId: edgeOf(prevId, id), operationClass: classes[id] ?? "compute", visits: 1, isCacheLookup: isCache });
      if (isCache) { cacheStep = step(); cacheParent = parent; prevId = id; continue; }
      parent = step(); prevId = id;
    }
    if (ack) { const s = f.steps.find((x) => x.nodeId === ack); if (s) f = { ...f, ackStepId: s.id }; }
    return f;
  };
  const front = [cdn, ...entryChain].filter(Boolean) as string[];
  const compute = (extra: Record<string, string> = {}) => ({ client: "compute", cdn: "read", lb: "compute", gw: "compute", app: "compute", ...extra });

  const replace = (flow: Flow) => { const i = flows.findIndex((f) => f.id === flow.id); flows[i] = flow; };
  replace(chain(newFlow(t("Leitura"), 1), [...front.filter((x) => x !== cdn), app, ...(cache ? [cache] : []), db], compute({ cache: "read", [db]: "read" })));
  replace(chain(newFlow(t("Escrita"), 0.6), [...front.filter((x) => x !== cdn), app, db], compute({ [db]: "write" })));
  // o consumo da fila/log é calculado pelo próprio motor a partir da aresta fila → worker; o fluxo só publica
  if (streamId) replace(chain(newFlow(t("Eventos"), 0.5), [...front.filter((x) => x !== cdn), app, streamId], compute({ [streamId]: "message" })));
  if (search) replace(chain(newFlow(t("Busca"), 0.5), [...front.filter((x) => x !== cdn), app, search], compute({ search: "read" })));
  if (obj) replace(chain(newFlow(t("Mídia"), 0.5), cdn ? [cdn, obj] : [...front, app, obj], compute({ cdn: "read", obj: "read" })));
  if (ws) replace(chain(newFlow(t("Tempo real"), 0.5), [ws, app], compute({ ws: "compute" })));

  // ── layout em colunas ──
  const cols = new Map<number, N[]>(); for (const n of nodes) cols.set(n.col, [...(cols.get(n.col) ?? []), n]);
  const pos = new Map<string, { x: number; y: number }>();
  const maxRows = Math.max(...[...cols.values()].map((c) => c.length));
  for (const [c, list] of cols) list.forEach((n, i) => pos.set(n.id, { x: c * 290, y: (i + (maxRows - list.length) / 2) * 150 }));

  const snap: Snapshot = {
    n: nodes.map((n) => ({ id: n.id, x: Math.round(pos.get(n.id)!.x), y: Math.round(pos.get(n.id)!.y), w: 240,
      d: { name: n.name, type: n.type, replicas: n.replicas, providerId: DEFAULT_PROVIDER[n.type], hitRate: n.type === "redis" ? hit : undefined } })),
    e: edges, f: flows, w: workloads, m: meta,
  };
  return tune(snap, load);
}

/** Documento no formato do motor (mesma montagem do laboratório, para nós novos). */
export function docOf(s: Snapshot) {
  const original = fixture as any;
  const nodes = s.n.map((n) => ({
    id: n.id, type: n.d.type, componentVersion: "1.0.0", name: n.d.name,
    properties: { policy: {}, profileId: DEFAULT_PROFILE_BY_TYPE[n.d.type] ?? "unresolved", replicas: n.d.replicas,
      placements: [{ region: "region-a", zone: "zone-a", count: n.d.replicas }],
      ...(n.d.type === "redis" ? { cache: { hitRate: n.d.hitRate ?? 0.8, invalidation: "ttl", ttlSec: 60, failureMode: "bypass", workingSetMiB: 256, coalescing: false, warmupSec: 0 } } : {}) },
  }));
  return { ...original, nodes, edges: s.e, traffic: { ...original.traffic, workloads: s.w, flows: s.f } };
}

/** Leitura vs escrita → peso de cada fluxo (igual ao laboratório). */
export function weightsOf(flows: Flow[], meta: Record<string, FlowMeta>, readPct: number) {
  const isWrite = (f: Flow) => f.steps.some((s) => s.operationClass === "write");
  const reads = flows.filter((f) => !isWrite(f)), writes = flows.filter(isWrite);
  const wShare = writes.length ? (reads.length ? 1 - readPct / 100 : 1) : 0;
  const out: Record<string, number> = {};
  const spread = (group: Flow[], share: number) => { const sum = group.reduce((a, f) => a + (meta[f.id]?.weight ?? 1), 0); for (const f of group) out[f.id] = sum > 0 ? (share * (meta[f.id]?.weight ?? 1)) / sum : 0; };
  spread(reads, 1 - wShare); spread(writes, wShare);
  return out;
}

/** Aumenta réplicas até nenhum componente passar de 70% no pico do caso. */
function tune(s: Snapshot, load: Load): Snapshot {
  for (let i = 0; i < 12; i++) {
    const r = solveDemand(docOf(s) as any, { rps: load.peakRps, weights: weightsOf(s.f, s.m, load.readPct) });
    let changed = false;
    for (const n of s.n) {
      const u = r.loads.get(n.id)?.utilization;
      if (u != null && Number.isFinite(u) && u > 0.7 && n.d.replicas < MAX_REPLICAS) { n.d.replicas = Math.min(MAX_REPLICAS, Math.ceil((n.d.replicas * u) / 0.7)); changed = true; }
    }
    if (!changed) break;
  }
  return s;
}
