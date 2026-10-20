import fixture from "../../../fixtures/url-shortener-baseline.json";
import { connectionOptions, DEFAULT_PROFILE_BY_TYPE, solveDemand } from "@archlab/domain";
import { buildAutoFlows, type Flow, type FlowMeta } from "./flowOps";
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
  // com os dois bancos, o volume (leitura/escrita comum) vai ao NoSQL e o SQL fica com as transações que não podem errar (dinheiro, estoque, estado da corrida)
  const both = !!sqlId && !!nosqlId;
  const db = both ? nosqlId! : (sqlId ?? nosqlId!);

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
  if (worker && !streamId) link(app, worker); // worker sem fila: job assíncrono disparado pelo serviço
  if (cdn && obj) link(cdn, obj);

  // ── fluxos ──
  // derivados das conexões pela MESMA regra que vale para quem desenha (buildAutoFlows): a referência é só um desenho,
  // então o mesmo grafo recebe a mesma carga e a mesma nota, seja a referência ou o que a pessoa montou
  const hit = 0.9;
  const auto = buildAutoFlows("client", nodes.map((n) => ({ id: n.id, type: n.type, name: n.name })), edges.map((e) => ({ id: e.id, source: e.source, target: e.target })), hit);
  const flows: Flow[] = auto.map((a) => a.flow);
  const workloads: any[] = auto.map((a) => a.workload);
  const meta: Record<string, FlowMeta> = Object.fromEntries(auto.map((a) => [a.flow.id, { name: t(a.name), weight: a.weight }]));

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
