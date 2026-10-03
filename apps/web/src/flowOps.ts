/** Operações puras sobre fluxos (árvores de steps, spec §7.1/§10.2). */
export interface Step {
  id: string; nodeId: string; ordinal: number; operationClass: string; visitsPerRequest: number; branchShare: number;
  condition: "always" | "cache-hit" | "cache-miss"; join: "serial" | "parallel-all" | "alternative"; required: boolean;
  parentStepId?: string; edgeId?: string; conditionStepId?: string;
}
export interface Flow { id: string; workloadId: string; ackStepId: string; steps: Step[] }
export interface FlowMeta { name: string; weight: number }

const uid = (prefix: string, taken: Set<string>) => {
  let i = 1; while (taken.has(`${prefix}-${i}`)) i++;
  return `${prefix}-${i}`;
};

export function createFlow(existing: Flow[], rootNodeId: string): { flow: Flow; workload: any } {
  const id = uid("flow", new Set(existing.map((f) => f.id)));
  const rootId = `${id}-s1`;
  return {
    flow: { id, workloadId: `wl-${id}`, ackStepId: rootId, steps: [{
      id: rootId, nodeId: rootNodeId, ordinal: 0, operationClass: "compute", visitsPerRequest: 1, branchShare: 1,
      condition: "always", join: "serial", required: true,
    }] },
    workload: { id: `wl-${id}`, operationId: id, source: "external", averageRps: 1000, peakRps: 5000, payloadBytes: 500,
      deadlineMs: 500, mutable: false, manual: false },
  };
}

export interface NewStep {
  parent: Step; nodeId: string; edgeId: string; operationClass: string; visits: number;
  /** ramo condicional: o lookup de cache anterior (irmão) cujo miss ativa este passo */
  missOf?: Step; isCacheLookup?: boolean; missShare?: number;
}
export function addStep(flow: Flow, n: NewStep): Flow {
  const id = uid(`${flow.id}-s`, new Set(flow.steps.map((s) => s.id)));
  const step: Step = {
    id, nodeId: n.nodeId, ordinal: flow.steps.filter((s) => s.parentStepId === n.parent.id).length,
    operationClass: n.operationClass, visitsPerRequest: n.visits,
    branchShare: n.missOf ? (n.missShare ?? 1) : 1,
    condition: n.missOf ? "cache-miss" : "always",
    join: n.isCacheLookup ? "alternative" : "serial", required: !n.isCacheLookup,
    parentStepId: n.parent.id, edgeId: n.edgeId, conditionStepId: n.missOf?.id,
  };
  const steps = [...flow.steps, step];
  return { ...flow, steps, ackStepId: n.isCacheLookup ? flow.ackStepId : id };
}

/** Remove o step e todos os seus descendentes (parent ou conditionStep). */
export function removeStep(flow: Flow, stepId: string): Flow {
  const gone = new Set([stepId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const s of flow.steps) {
      if (!gone.has(s.id) && ((s.parentStepId && gone.has(s.parentStepId)) || (s.conditionStepId && gone.has(s.conditionStepId)))) {
        gone.add(s.id); grew = true;
      }
    }
  }
  const steps = flow.steps.filter((s) => !gone.has(s.id));
  const ack = steps.some((s) => s.id === flow.ackStepId) ? flow.ackStepId : steps[steps.length - 1]?.id ?? flow.ackStepId;
  return { ...flow, steps, ackStepId: ack };
}

/** Remove todos os steps que usam um nó; se a raiz some, o fluxo inteiro é descartado (retorna null). */
export function removeNodeFromFlow(flow: Flow, nodeId: string): Flow | null {
  let cur: Flow | null = flow;
  for (const s of flow.steps.filter((x) => x.nodeId === nodeId)) {
    if (!cur) break;
    if (!s.parentStepId) return null;
    cur = removeStep(cur, s.id);
  }
  return cur;
}

export const depthOf = (flow: Flow, s: Step) => {
  let d = 0; let cur: Step | undefined = s;
  while (cur?.parentStepId) { cur = flow.steps.find((x) => x.id === cur!.parentStepId); d++; if (d > 50) break; }
  return d;
};
/** Ordem de exibição em pré-ordem (pai antes dos filhos). */
export function displayOrder(flow: Flow): Step[] {
  const out: Step[] = [];
  const walk = (parent?: string) => {
    for (const s of flow.steps.filter((x) => x.parentStepId === parent)) { out.push(s); walk(s.id); }
  };
  walk(undefined);
  return out;
}

/* ── fluxos derivados das conexões do desenho ── */
export interface AutoNode { id: string; type: string; name: string }
export interface AutoEdge { id: string; source: string; target: string }
export interface AutoFlow { flow: Flow; workload: any; name: string; weight: number; write: boolean }

export const SOURCE_TYPES = new Set(["client", "web-app", "mobile-app", "iot-device", "external-system"]);
/** componentes de apoio (telemetria, segredos, descoberta): ficam fora dos fluxos de requisição */
export const SIDE_TYPES = new Set(["observability", "secrets-manager", "service-discovery"]);
const DB_TYPES = new Set(["sql-database", "nosql-database", "database", "timeseries-db", "graph-db", "vector-db", "data-warehouse"]);
const MSG_TYPES = new Set(["kafka", "queue", "mqtt-broker", "event-bus"]);
const OP_BY_TYPE: Record<string, string> = {
  kafka: "message", queue: "message", "mqtt-broker": "message", "event-bus": "message", "notification-service": "message",
  redis: "read", cdn: "read", "object-storage": "read", "search-engine": "read",
};
/** papel de cada ramo que sai de um componente: ramos de papéis diferentes viram fluxos diferentes */
const roleOf = (type: string) =>
  type === "redis" || DB_TYPES.has(type) ? "data" : MSG_TYPES.has(type) ? "events" : type === "search-engine" ? "search"
  : type === "object-storage" || type === "cdn" ? "media" : type === "notification-service" ? "notify" : type === "websocket" ? "realtime" : "next";
export const AUTO_LABEL: Record<string, string> = { read: "Leitura", write: "Escrita", events: "Eventos", search: "Busca", media: "Mídia", notify: "Notificações", realtime: "Tempo real" };

interface Variant { edges: AutoEdge[]; keys: string[] }

/**
 * Deriva os fluxos a partir das conexões desenhadas, a partir de uma origem de carga.
 * Ramos de papéis diferentes (dados, eventos, busca, mídia…) viram fluxos separados; cache + banco no mesmo ramo viram
 * "consulta de cache e ramo de miss" (leitura) e "escrita direta no banco". Depois de uma fila/log o fluxo termina, porque o
 * motor calcula o consumo pela aresta fila → worker (incluir o worker contaria a carga em dobro).
 */
export function buildAutoFlows(rootId: string, nodes: AutoNode[], edges: AutoEdge[], hitRate = 0.9): AutoFlow[] {
  const typeOf = new Map(nodes.map((n) => [n.id, n.type]));
  const out = new Map<string, AutoEdge[]>();
  for (const e of edges) if (typeOf.has(e.source) && typeOf.has(e.target)) out.set(e.source, [...(out.get(e.source) ?? []), e]);

  const variants = (nodeId: string, seen: Set<string>): Variant[] => {
    const kids = (out.get(nodeId) ?? []).filter((e) => !seen.has(e.target) && !SIDE_TYPES.has(typeOf.get(e.target) ?? ""));
    if (!kids.length || MSG_TYPES.has(typeOf.get(nodeId) ?? "")) return [{ edges: [], keys: [] }];
    const data = kids.filter((e) => roleOf(typeOf.get(e.target) ?? "") === "data");
    const result: Variant[] = [];
    if (data.length) {
      const cache = data.filter((e) => typeOf.get(e.target) === "redis"), dbs = data.filter((e) => DB_TYPES.has(typeOf.get(e.target) ?? ""));
      result.push({ edges: [...cache, ...dbs], keys: ["read"] });
      if (dbs.length) result.push({ edges: dbs, keys: ["write"] });
    }
    for (const e of kids.filter((x) => roleOf(typeOf.get(x.target) ?? "") !== "data")) {
      const role = roleOf(typeOf.get(e.target) ?? "");
      for (const v of variants(e.target, new Set([...seen, e.target]))) result.push({ edges: [e, ...v.edges], keys: role === "next" ? v.keys : [role, ...v.keys] });
    }
    return result;
  };

  const used = new Map<string, number>();
  const flows: AutoFlow[] = [];
  for (const v of variants(rootId, new Set([rootId]))) {
    if (!v.edges.length) continue;
    const write = v.keys.includes("write");
    const base = `auto-${rootId}-${v.keys.join("-") || "main"}`;
    const n = used.get(base) ?? 0; used.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    const rootStep: Step = { id: `${id}-s1`, nodeId: rootId, ordinal: 0, operationClass: "compute", visitsPerRequest: 1, branchShare: 1, condition: "always", join: "serial", required: true };
    let flow: Flow = { id, workloadId: `wl-${id}`, ackStepId: rootStep.id, steps: [rootStep] };
    const stepOf = new Map<string, Step>([[rootId, rootStep]]);
    let cacheStep: Step | undefined;
    for (const e of v.edges) {
      const type = typeOf.get(e.target) ?? "";
      const parent = stepOf.get(e.source); if (!parent) continue;
      const isCache = type === "redis" && !write;
      const isMiss = DB_TYPES.has(type) && !write && !!cacheStep && cacheStep.parentStepId === parent.id;
      flow = addStep(flow, { parent, nodeId: e.target, edgeId: e.id, operationClass: DB_TYPES.has(type) ? (write ? "write" : "read") : OP_BY_TYPE[type] ?? "compute", visits: 1,
        isCacheLookup: isCache, missOf: isMiss ? cacheStep : undefined, missShare: isMiss ? 1 - hitRate : undefined });
      const step = flow.steps[flow.steps.length - 1]!;
      stepOf.set(e.target, step);
      if (isCache) cacheStep = step;
    }
    const names = v.keys.filter((k, i) => k !== v.keys[i - 1]).map((k) => AUTO_LABEL[k] ?? k); // "media → media" (CDN e depois storage) conta uma vez
    flows.push({ flow, name: names.join(" · ") || "Fluxo", write, weight: write ? 0.6 : v.keys.includes("read") || !v.keys.length ? 1 : 0.5,
      workload: { id: `wl-${id}`, operationId: id, source: "external", averageRps: 1000, peakRps: 5000, payloadBytes: 500, deadlineMs: 500, mutable: false, manual: false } });
  }
  // dois fluxos com o mesmo papel (ex.: mídia pela CDN e mídia direto do backend) se distinguem pelo primeiro componente do caminho
  const count = new Map<string, number>(); for (const f of flows) count.set(f.name, (count.get(f.name) ?? 0) + 1);
  const nameOf = new Map(nodes.map((n) => [n.id, n.name]));
  for (const f of flows) if ((count.get(f.name) ?? 0) > 1) f.name = `${f.name} · ${nameOf.get(f.flow.steps[1]?.nodeId ?? "") ?? ""}`.trim();
  return flows;
}
