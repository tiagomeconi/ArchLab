/** Cálculo normativo de demanda e utilização (spec §10.3). Determinístico e sem I/O. */
export type OpClass = "read" | "write" | "compute" | "message" | "job";

export interface Profile {
  id: string;
  /** capacidade por instância ativa e por classe de operação (ops/s); ausente = unknown */
  capacity: Partial<Record<OpClass, number>>;
  /** adapter source: emite carga e não impõe capacidade de servidor */
  source?: boolean;
  /** quando consome mensagens de uma fila, qual classe de capacidade usa */
  consumerClass?: OpClass;
  /** custo fictício por instância/mês (créditos); ausente = unknown */
  credits?: number;
  /** latência proxy (ms): base, p95 base e teto da penalidade de fila (spec §10.3) */
  lat?: { base: number; p95: number; max: number };
}
const L = (base: number, p95: number, max: number) => ({ base, p95, max });
const DEFAULT_LAT = L(5, 10, 500);

/** Perfis fictícios de ensino (Apêndice C.1 + ampliação da fase 0). Não são benchmarks. */
export const PROFILES: Record<string, Profile> = {
  "source-v1": { id: "source-v1", capacity: {}, source: true },
  "lb-standard-v1": { id: "lb-standard-v1", capacity: { compute: 20000 }, credits: 80, lat: L(2, 3, 200) },
  "compute-standard-v1": { id: "compute-standard-v1", capacity: { compute: 3000, job: 1500 }, consumerClass: "job", credits: 80, lat: L(5, 10, 500) },
  "worker-standard-v1": { id: "worker-standard-v1", capacity: { compute: 1000, job: 500 }, consumerClass: "job" },
  "cache-standard-v1": { id: "cache-standard-v1", capacity: { read: 20000, write: 10000 }, credits: 80, lat: L(1, 2, 200) },
  "sql-standard-v1": { id: "sql-standard-v1", capacity: { read: 2000, write: 500 }, credits: 300, lat: L(5, 10, 500) },
  "nosql-standard-v1": { id: "nosql-standard-v1", capacity: { read: 5000, write: 2000 } },
  "queue-standard-v1": { id: "queue-standard-v1", capacity: { message: 10000 } },
  "log-standard-v1": { id: "log-standard-v1", capacity: { message: 50000 } },
  "cdn-standard-v1": { id: "cdn-standard-v1", capacity: { read: 100000 } },
  "objstore-standard-v1": { id: "objstore-standard-v1", capacity: { read: 5000, write: 1000 } },
  "search-standard-v1": { id: "search-standard-v1", capacity: { read: 3000, write: 500 } },
  "ws-standard-v1": { id: "ws-standard-v1", capacity: { message: 20000, compute: 20000 } },
  "dns-standard-v1": { id: "dns-standard-v1", capacity: { compute: 50000 } },
  "auth-standard-v1": { id: "auth-standard-v1", capacity: { compute: 2000 } },
  "notify-standard-v1": { id: "notify-standard-v1", capacity: { message: 1000, compute: 1500 }, consumerClass: "message" },
  // ── ampliação: IoT, plataforma de contêineres, serverless, dados especializados e apoio (valores de ensino, não benchmarks) ──
  "iot-gateway-v1": { id: "iot-gateway-v1", capacity: { compute: 8000, message: 20000 }, consumerClass: "message", credits: 60, lat: L(3, 6, 300) },
  "mqtt-broker-v1": { id: "mqtt-broker-v1", capacity: { message: 100000 }, credits: 120, lat: L(1, 3, 200) },
  "iot-platform-v1": { id: "iot-platform-v1", capacity: { compute: 6000, message: 30000 }, consumerClass: "message", credits: 200, lat: L(8, 20, 500) },
  "edge-compute-v1": { id: "edge-compute-v1", capacity: { compute: 600, job: 300 }, consumerClass: "job", credits: 40, lat: L(6, 12, 500) },
  "waf-standard-v1": { id: "waf-standard-v1", capacity: { compute: 30000 }, credits: 100, lat: L(2, 4, 200) },
  "mesh-standard-v1": { id: "mesh-standard-v1", capacity: { compute: 30000 }, credits: 40, lat: L(1, 2, 100) },
  "k8s-cluster-v1": { id: "k8s-cluster-v1", capacity: { compute: 12000, job: 6000 }, consumerClass: "job", credits: 400, lat: L(5, 10, 500) },
  "serverless-v1": { id: "serverless-v1", capacity: { compute: 1000, job: 1000 }, consumerClass: "job", credits: 30, lat: L(20, 80, 800) },
  "vm-standard-v1": { id: "vm-standard-v1", capacity: { compute: 4000, job: 2000 }, consumerClass: "job", credits: 120, lat: L(5, 10, 500) },
  "scheduler-v1": { id: "scheduler-v1", capacity: { compute: 5000, job: 2000 }, consumerClass: "job", credits: 20, lat: L(5, 10, 300) },
  "stream-proc-v1": { id: "stream-proc-v1", capacity: { message: 40000, job: 20000, compute: 20000 }, consumerClass: "message", credits: 300, lat: L(10, 25, 800) },
  "batch-proc-v1": { id: "batch-proc-v1", capacity: { job: 2000, compute: 2000 }, consumerClass: "job", credits: 350, lat: L(40, 150, 2000) },
  "ml-infer-v1": { id: "ml-infer-v1", capacity: { compute: 200, job: 100 }, consumerClass: "job", credits: 900, lat: L(30, 80, 1000) },
  "workflow-v1": { id: "workflow-v1", capacity: { compute: 2000, job: 1000 }, consumerClass: "job", credits: 150, lat: L(8, 20, 500) },
  "tsdb-standard-v1": { id: "tsdb-standard-v1", capacity: { read: 8000, write: 20000 }, credits: 250, lat: L(5, 12, 500) },
  "graph-standard-v1": { id: "graph-standard-v1", capacity: { read: 3000, write: 800 }, credits: 300, lat: L(8, 20, 600) },
  "vector-standard-v1": { id: "vector-standard-v1", capacity: { read: 1500, write: 400 }, credits: 350, lat: L(8, 20, 600) },
  "warehouse-v1": { id: "warehouse-v1", capacity: { read: 200, write: 5000 }, credits: 800, lat: L(50, 200, 3000) },
  "eventbus-standard-v1": { id: "eventbus-standard-v1", capacity: { message: 20000 }, credits: 60, lat: L(5, 15, 300) },
  "secrets-v1": { id: "secrets-v1", capacity: { compute: 5000 }, credits: 20, lat: L(3, 8, 300) },
  "discovery-v1": { id: "discovery-v1", capacity: { compute: 20000 }, credits: 40, lat: L(1, 3, 200) },
  "observability-v1": { id: "observability-v1", capacity: { message: 100000, compute: 8000 }, credits: 250, lat: L(10, 30, 800) },
  "payment-ext-v1": { id: "payment-ext-v1", capacity: { compute: 800 }, lat: L(40, 120, 2000) },
  "external-api-v1": { id: "external-api-v1", capacity: { compute: 1000 }, lat: L(30, 100, 1500) },
  "ratelimit-v1": { id: "ratelimit-v1", capacity: { compute: 50000 }, credits: 30, lat: L(1, 2, 100) },
};

/** Perfil padrão por tipo de componente; `null` = exige escolha (ex.: `database` abstrato). */
export const DEFAULT_PROFILE_BY_TYPE: Record<string, string | null> = {
  client: "source-v1", "web-app": "source-v1", "mobile-app": "source-v1", "iot-device": "source-v1", "external-system": "source-v1",
  "api-gateway": "lb-standard-v1", "load-balancer": "lb-standard-v1",
  backend: "compute-standard-v1", microservice: "compute-standard-v1", worker: "worker-standard-v1",
  database: null, "sql-database": "sql-standard-v1", "nosql-database": "nosql-standard-v1",
  redis: "cache-standard-v1", kafka: "log-standard-v1", queue: "queue-standard-v1", cdn: "cdn-standard-v1",
  "object-storage": "objstore-standard-v1", "search-engine": "search-standard-v1", websocket: "ws-standard-v1",
  dns: "dns-standard-v1", "authentication-service": "auth-standard-v1", "notification-service": "notify-standard-v1",
  "iot-gateway": "iot-gateway-v1", "mqtt-broker": "mqtt-broker-v1", "iot-platform": "iot-platform-v1", "edge-compute": "edge-compute-v1",
  waf: "waf-standard-v1", "service-mesh": "mesh-standard-v1", container: "compute-standard-v1", kubernetes: "k8s-cluster-v1",
  serverless: "serverless-v1", vm: "vm-standard-v1", scheduler: "scheduler-v1", "stream-processor": "stream-proc-v1",
  "batch-processor": "batch-proc-v1", "ml-service": "ml-infer-v1", "workflow-engine": "workflow-v1",
  "timeseries-db": "tsdb-standard-v1", "graph-db": "graph-standard-v1", "vector-db": "vector-standard-v1", "data-warehouse": "warehouse-v1",
  "event-bus": "eventbus-standard-v1", "secrets-manager": "secrets-v1", "service-discovery": "discovery-v1", observability: "observability-v1",
  "payment-gateway": "payment-ext-v1", "third-party-api": "external-api-v1", "rate-limiter": "ratelimit-v1",
};

export interface QueueStats {
  enqueued: number; consumed: number; consumers: number; consumerCapacity: number;
  /** mensagens/s acumuladas (enqueued − consumed) */
  backlogGrowthPerSec: number;
}
export interface NodeLoad {
  offered: number; admitted: number; capacity: number | null;
  /** null = unknown (sem perfil/capacidade) */
  utilization: number | null; admissionRatio: number;
  /** latência p95 proxy do nó (ms): base + penalidade de saturação + extra de falhas; null em fontes */
  latencyP95Ms: number | null;
  source?: boolean; queue?: QueueStats;
}
/** Efeito de uma falha sobre um nó. Fatores multiplicam, latências somam, indisponível prevalece (spec §10.4). */
export interface NodeEffect { capacityFactor?: number; errorRate?: number; extraLatencyMs?: number; unavailable?: boolean }
export interface EdgeEffect { dropRate?: number; extraLatencyMs?: number }
export interface Effects { nodes?: Record<string, NodeEffect>; edges?: Record<string, EdgeEffect> }

export interface DemandOptions {
  /** carga externa base (req/s) */
  rps: number;
  /** fração da carga base por flow (padrão 1) */
  weights?: Record<string, number>;
  /** nós inativos (evento service-unavailable) */
  inactiveNodeIds?: string[];
  /** falhas injetadas (modo caos) */
  effects?: Effects;
}

const QUEUE_TYPES = new Set(["queue", "kafka", "mqtt-broker", "event-bus"]);

export interface FlowStats {
  offered: number;
  /** concluídas dentro do prazo (deadline) */
  completed: number;
  /** concluídas, mas depois do prazo (contam como erro) */
  timedOut: number;
  /** p95 proxy das respostas bem-sucedidas, em ms; null se nenhuma */
  p95Ms: number | null;
}
export interface DemandResult { loads: Map<string, NodeLoad>; flows: Map<string, FlowStats> }

export function computeDemand(doc: any, opts: DemandOptions): Map<string, NodeLoad> {
  return solveDemand(doc, opts).loads;
}

type Bucket = { lat: number; w: number };
const MAX_BUCKETS = 48;
function tidy(bs: Bucket[]): Bucket[] {
  const m = new Map<number, number>();
  for (const b of bs) if (b.w > 1e-12) { const k = Math.round(b.lat * 10) / 10; m.set(k, (m.get(k) ?? 0) + b.w); }
  let out = [...m.entries()].sort((a, b) => a[0] - b[0]).map(([lat, w]) => ({ lat, w }));
  while (out.length > MAX_BUCKETS) { // funde os dois buckets mais próximos
    let bi = 0, bd = Infinity;
    for (let i = 0; i < out.length - 1; i++) { const d = out[i + 1]!.lat - out[i]!.lat; if (d < bd) { bd = d; bi = i; } }
    const a = out[bi]!, b = out[bi + 1]!; const w = a.w + b.w;
    out.splice(bi, 2, { lat: b.lat, w }); // conservador: usa a maior latência
  }
  return out;
}
const serial = (a: Bucket[], b: Bucket[]) => tidy(a.flatMap((x) => b.map((y) => ({ lat: x.lat + y.lat, w: x.w * y.w }))));
const parallel = (a: Bucket[], b: Bucket[]) => tidy(a.flatMap((x) => b.map((y) => ({ lat: Math.max(x.lat, y.lat), w: x.w * y.w }))));

/** Como computeDemand, mas também estima por fluxo sucesso, timeout e latência p95 proxy (spec §10.3). */
export function solveDemand(doc: any, opts: DemandOptions): DemandResult {
  const nodes = new Map<string, any>(doc.nodes.map((n: any) => [n.id, n]));
  const edgeById = new Map<string, any>(doc.edges.map((e: any) => [e.id, e]));
  const inactive = new Set(opts.inactiveNodeIds ?? []);
  const flows: any[] = doc.traffic.flows;
  const nodeEff = (id: string): NodeEffect => opts.effects?.nodes?.[id] ?? {};
  const edgeEff = (id: string): EdgeEffect => opts.effects?.edges?.[id] ?? {};
  const isDown = (id: string) => inactive.has(id) || !!nodeEff(id).unavailable;

  const orderOf = (steps: any[]) => {
    const done = new Set<string>(); const order: any[] = [];
    const place = (s: any) => {
      if (done.has(s.id)) return;
      for (const dep of [s.parentStepId, s.conditionStepId]) {
        const d = steps.find((x) => x.id === dep);
        if (d) place(d);
      }
      done.add(s.id); order.push(s);
    };
    steps.forEach(place);
    return order;
  };
  const ordered = flows.map((f) => ({ flow: f, order: orderOf(f.steps) }));

  const profileOf = (id: string): Profile | undefined => PROFILES[nodes.get(id)?.properties?.profileId];
  const replicasOf = (id: string) => (isDown(id) ? 0 : nodes.get(id)?.properties?.replicas ?? 1);
  const capFactor = (id: string) => Math.max(0, nodeEff(id).capacityFactor ?? 1);

  // consumidores implícitos: arestas saindo de fila/log
  const consumersOf = new Map<string, string[]>();
  for (const n of nodes.values()) {
    if (QUEUE_TYPES.has(n.type)) {
      consumersOf.set(n.id, doc.edges.filter((e: any) => e.source === n.id && nodes.has(e.target)).map((e: any) => e.target));
    }
  }

  let ratio = new Map<string, number>(); // admissão por nó (iteração anterior)
  let result = new Map<string, NodeLoad>();

  // Iteração global determinística (spec §10.3): demanda ↔ admissão, até 20 passos.
  for (let iter = 0; iter < 20; iter++) {
    const classLoad = new Map<string, Partial<Record<OpClass, number>>>();
    const offeredTotal = new Map<string, number>();
    const admittedTotal = new Map<string, number>();
    const add = (nodeId: string, cls: OpClass, v: number, adm: number) => {
      const c = classLoad.get(nodeId) ?? {}; c[cls] = (c[cls] ?? 0) + v; classLoad.set(nodeId, c);
      offeredTotal.set(nodeId, (offeredTotal.get(nodeId) ?? 0) + v);
      admittedTotal.set(nodeId, (admittedTotal.get(nodeId) ?? 0) + adm);
    };

    for (const { flow, order } of ordered) {
      const rootRps = opts.rps * (opts.weights?.[flow.id] ?? 1);
      const admittedStep = new Map<string, number>();
      for (const s of order) {
        let offered: number;
        if (!s.parentStepId) offered = rootRps;
        else if (!edgeById.has(s.edgeId)) offered = 0; // conexão cortada: o caminho deixa de existir
        else {
          let share = s.branchShare;
          if (s.condition === "cache-miss" || s.condition === "cache-hit") {
            const lookup = flow.steps.find((x: any) => x.id === s.conditionStepId);
            const cacheNode = lookup && nodes.get(lookup.nodeId);
            const hit = cacheNode?.properties?.cache?.hitRate ?? 0;
            const down = lookup ? isDown(lookup.nodeId) : false;
            const missShare = down ? (cacheNode?.properties?.cache?.failureMode === "bypass" ? 1 : 0) : 1 - hit;
            share = s.condition === "cache-miss" ? missShare : down ? 0 : hit;
          }
          offered = (admittedStep.get(s.parentStepId) ?? 0) * s.visitsPerRequest * share * (1 - (edgeEff(s.edgeId).dropRate ?? 0));
        }
        const adm = offered * (ratio.get(s.nodeId) ?? 1);
        admittedStep.set(s.id, adm);
        add(s.nodeId, s.operationClass as OpClass, offered, adm);
      }
    }

    // consumo implícito de filas: o backlog absorve o excesso, então não rejeita upstream
    const queueStats = new Map<string, QueueStats>();
    for (const [qid, consumers] of consumersOf) {
      const enq = admittedTotal.get(qid) ?? 0;
      let capSum = 0;
      for (const cid of consumers) {
        const p = profileOf(cid); const cls = p?.consumerClass ?? "compute";
        capSum += (p?.capacity[cls] ?? 0) * replicasOf(cid) * capFactor(cid);
      }
      const consumed = Math.min(enq, capSum);
      queueStats.set(qid, { enqueued: enq, consumed, consumers: consumers.length, consumerCapacity: capSum, backlogGrowthPerSec: enq - consumed });
      for (const cid of consumers) {
        const cls = profileOf(cid)?.consumerClass ?? "compute";
        add(cid, cls, enq / consumers.length, Math.min(enq, capSum) / consumers.length);
      }
    }

    const next = new Map<string, number>();
    const out = new Map<string, NodeLoad>();
    let delta = 0;
    for (const [nid, loads] of classLoad) {
      const profile = profileOf(nid);
      const replicas = replicasOf(nid) * capFactor(nid);
      const offered = offeredTotal.get(nid) ?? 0;
      let util: number | null = null;
      let capacity: number | null = null;
      if (profile && !profile.source) {
        let sum = 0; let known = true; let dominant: OpClass | undefined; let best = -1;
        for (const [cls, v] of Object.entries(loads) as [OpClass, number][]) {
          const per = profile.capacity[cls];
          if (per === undefined) { if (v > 0) known = false; continue; }
          sum += replicas === 0 ? (v > 0 ? Infinity : 0) : v / (per * replicas);
          if (v > best) { best = v; dominant = cls; }
        }
        util = known ? sum : null;
        const domCap = dominant ? profile.capacity[dominant] : undefined;
        capacity = domCap === undefined ? null : domCap * replicas;
      }
      const r = util === null || util === 0 ? 1 : Math.min(1, 1 / util);
      next.set(nid, r);
      delta = Math.max(delta, Math.abs(r - (ratio.get(nid) ?? 1)));
      out.set(nid, {
        offered, admitted: admittedTotal.get(nid) ?? 0, capacity, utilization: util, admissionRatio: r, latencyP95Ms: null,
        source: profile?.source, queue: queueStats.get(nid),
      });
    }
    ratio = next; result = out;
    if (delta < 1e-6) break;
  }

  // latência proxy por nó: p95 base + penalidade de saturação + extra das falhas (spec §10.3)
  const nodeLat = (id: string): number => {
    const p = profileOf(id);
    if (p?.source) return 0;
    const lat = p?.lat ?? DEFAULT_LAT;
    const u = result.get(id)?.utilization;
    const uc = u === null || u === undefined ? 0 : Math.min(Number.isFinite(u) ? u : 1, 0.95);
    return lat.p95 + Math.min(lat.max, (lat.base * uc) / (1 - uc)) + (nodeEff(id).extraLatencyMs ?? 0);
  };
  for (const [id, l] of result) l.latencyP95Ms = l.source ? null : nodeLat(id);
  const edgeLat = (edgeId: string) => Number(edgeById.get(edgeId)?.configuration?.networkLatencyMs ?? 0) + (edgeEff(edgeId).extraLatencyMs ?? 0);

  // distribuição de sucesso x latência por fluxo; cache-aside combina hit e miss
  const flowStats = new Map<string, FlowStats>();
  for (const { flow } of ordered) {
    const rootRps = opts.rps * (opts.weights?.[flow.id] ?? 1);
    const deadline = Number(doc.traffic.workloads?.find((w: any) => w.id === flow.workloadId)?.deadlineMs ?? 500);
    const kids = (id: string) => flow.steps.filter((x: any) => x.parentStepId === id);
    const dist = (st: any): Bucket[] => {
      if (st.parentStepId && !edgeById.has(st.edgeId)) return [];
      const ok = (ratio.get(st.nodeId) ?? 1) * (1 - Math.min(1, nodeEff(st.nodeId).errorRate ?? 0)) *
        (st.parentStepId ? 1 - (edgeEff(st.edgeId).dropRate ?? 0) : 1);
      let d: Bucket[] = [{ lat: nodeLat(st.nodeId) + (st.parentStepId ? edgeLat(st.edgeId) : 0), w: ok }];
      for (const c of kids(st.id)) {
        if (c.condition !== "always") continue; // ramos condicionais entram via o lookup
        const dependents = flow.steps.filter((x: any) => x.conditionStepId === c.id && x.parentStepId === st.id);
        if (c.required) { d = c.join === "parallel-all" ? parallel(d, dist(c)) : serial(d, dist(c)); continue; }
        if (!dependents.length) continue;
        const cacheNode = nodes.get(c.nodeId);
        const hit = cacheNode?.properties?.cache?.hitRate ?? 0;
        const down = isDown(c.nodeId);
        const bypass = cacheNode?.properties?.cache?.failureMode === "bypass";
        const lk = down ? 5 : nodeLat(c.nodeId) + edgeLat(c.edgeId); // timeout curto do lookup quando o cache caiu
        const missShare = down ? (bypass ? 1 : 0) : 1 - hit;
        const hitShare = down ? 0 : hit;
        const missDist = dependents.filter((x: any) => x.required).reduce((acc: Bucket[], x: any) => serial(acc, dist(x)), [{ lat: 0, w: 1 }]);
        const group = tidy([{ lat: lk, w: hitShare }, ...serial([{ lat: lk, w: missShare }], missDist)]);
        d = serial(d, group);
      }
      return d;
    };
    const root = flow.steps.find((x: any) => !x.parentStepId);
    const d = root ? dist(root) : [];
    const within = d.filter((b) => b.lat <= deadline).reduce((a, b) => a + b.w, 0);
    const total = d.reduce((a, b) => a + b.w, 0);
    let p95: number | null = null;
    if (total > 0) { let cum = 0; for (const b of d) { cum += b.w; if (cum >= 0.95 * total) { p95 = b.lat; break; } } }
    flowStats.set(flow.id, { offered: rootRps, completed: rootRps * within, timedOut: rootRps * (total - within), p95Ms: p95 });
  }
  return { loads: result, flows: flowStats };
}
