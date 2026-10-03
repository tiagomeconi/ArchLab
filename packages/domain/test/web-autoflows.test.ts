import { describe, expect, it } from "vitest";
import { buildAutoFlows, SOURCE_TYPES } from "../../../apps/web/src/flowOps";
import { buildReference, docOf, weightsOf } from "../../../apps/web/src/reference";
import { evaluate } from "../../../apps/web/src/requirements";
import { CASES, COMPANY_CASES, checksOf, loadOf } from "../../../apps/web/src/cases";
import { solveDemand, validateArchitecture } from "../src";

const ALL = [...COMPANY_CASES, ...CASES];
const node = (id: string, type: string) => ({ id, type, name: id });
const edge = (source: string, target: string) => ({ id: `${source}-${target}`, source, target });

describe("fluxos derivados das conexões", () => {
  const nodes = ["client", "lb", "app", "cache", "db", "stream", "search", "obj"].map((id) => node(id, { client: "client", lb: "load-balancer", app: "backend", cache: "redis", db: "sql-database", stream: "kafka", search: "search-engine", obj: "object-storage" }[id]!));
  const edges = [edge("client", "lb"), edge("lb", "app"), edge("app", "cache"), edge("app", "db"), edge("app", "stream"), edge("app", "search"), edge("app", "obj")];
  const built = buildAutoFlows("client", nodes, edges);

  it("cada ramo vira um fluxo, e dados geram leitura e escrita", () => {
    expect(built.map((b) => b.name).sort()).toEqual(["Busca", "Escrita", "Eventos", "Leitura", "Mídia"]);
  });
  it("leitura consulta o cache e só vai ao banco no miss; escrita vai direto ao banco", () => {
    const leitura = built.find((b) => b.name === "Leitura")!.flow, escrita = built.find((b) => b.name === "Escrita")!.flow;
    const cache = leitura.steps.find((s) => s.nodeId === "cache")!, db = leitura.steps.find((s) => s.nodeId === "db")!;
    expect(cache.join).toBe("alternative");
    expect(db.condition).toBe("cache-miss");
    expect(db.conditionStepId).toBe(cache.id);
    expect(db.branchShare).toBeCloseTo(0.1);
    expect(escrita.steps.some((s) => s.nodeId === "cache")).toBe(false);
    expect(escrita.steps.find((s) => s.nodeId === "db")!.operationClass).toBe("write");
  });
  it("o fluxo termina na fila (o motor calcula o consumo)", () => {
    const nodes2 = [...nodes, node("worker", "worker")], edges2 = [...edges, edge("stream", "worker")];
    const ev = buildAutoFlows("client", nodes2, edges2).find((b) => b.name === "Eventos")!.flow;
    expect(ev.steps.some((s) => s.nodeId === "worker")).toBe(false);
  });
  it("ids são estáveis (nome e peso ajustados pela pessoa sobrevivem)", () => {
    expect(buildAutoFlows("client", nodes, edges).map((b) => b.flow.id)).toEqual(built.map((b) => b.flow.id));
  });
  it("sem conexões de saída não há fluxo, e conexão solta não entra", () => {
    expect(buildAutoFlows("client", nodes, [])).toEqual([]);
    expect(buildAutoFlows("client", nodes, [edge("app", "db")])).toEqual([]);
  });
  it("o documento gerado é válido e leva carga a todos os componentes ligados", () => {
    const snap = { n: nodes.map((n) => ({ id: n.id, x: 0, y: 0, w: 196, d: { name: n.name, type: n.type, replicas: 3, hitRate: n.type === "redis" ? 0.9 : undefined } })), e: [] as any[], f: built.map((b) => b.flow), w: built.map((b) => b.workload), m: {} };
    snap.e = edges.map((e) => ({ ...e, sourcePort: "out", targetPort: "in", configuration: { mode: "sync", protocol: "https", required: true, timeoutMs: 500, networkLatencyMs: 1, maxAttempts: 1, backoffMs: 0, retryable: false, tls: true } }));
    const doc = docOf(snap as any);
    expect(validateArchitecture(doc)).toEqual([]);
    const r = solveDemand(doc as any, { rps: 1000 });
    for (const id of ["lb", "app", "cache", "db", "stream", "search", "obj"]) expect(r.loads.get(id)?.offered, id).toBeGreaterThan(0);
  });
});

describe("desenho de referência refeito a partir das conexões", () => {
  it.each(ALL.map((c) => [c.id] as const))("%s: os fluxos derivados mantêm o caminho exigido (sem perder nenhuma regra de caminho)", (id) => {
    const checks = checksOf(id)!, load = loadOf(id)!;
    const snap = buildReference(checks, load);
    const an = snap.n.map((n) => ({ id: n.id, type: n.d.type, name: n.d.name }));
    const derived = snap.n.filter((n) => SOURCE_TYPES.has(n.d.type)).flatMap((n) => buildAutoFlows(n.id, an, snap.e, 0.9));
    expect(derived.length).toBeGreaterThan(0);
    const doc = docOf({ ...snap, f: derived.map((d) => d.flow), w: derived.map((d) => d.workload), m: {} });
    expect(validateArchitecture(doc)).toEqual([]);
    const r = solveDemand(doc as any, { rps: load.peakRps, weights: weightsOf(derived.map((d) => d.flow), Object.fromEntries(derived.map((d) => [d.flow.id, { name: d.name, weight: d.weight }])), load.readPct) });
    const session = { mode: "study" as const, title: id, checks, requirements: { functional: [], nonFunctional: [], scale: { users: "", rps: "", readWrite: "", storage: "" }, targets: { latency: "", availability: "", consistency: "" }, constraints: "" } };
    const results = evaluate(session, { nodes: doc.nodes, flows: derived.map((d) => d.flow), loads: r.loads, p95Ms: null });
    const paths = results.filter((c) => c.id.startsWith("path:") && c.status !== "meets").map((c) => c.label);
    expect(paths).toEqual([]);
  });
});
