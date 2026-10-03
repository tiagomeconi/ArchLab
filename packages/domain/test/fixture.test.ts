import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { validateArchitecture, computeDemand, solveDemand } from "../src";

const doc = JSON.parse(readFileSync(new URL("../../../fixtures/url-shortener-baseline.json", import.meta.url), "utf8"));
const near = (a: number | null, b: number) => expect(a).toBeCloseTo(b, 6);

describe("fixture URL (Apêndice B)", () => {
  it("valida schema e integridade", () => {
    expect(validateArchitecture(doc)).toEqual([]);
  });
  it("baseline: app u=0,556; cache u=0,25; DB 500 reads/s u=0,25", () => {
    const l = computeDemand(doc, { rps: 5000 });
    near(l.get("app")!.utilization, 5000 / 9000);
    near(l.get("cache")!.utilization, 0.25);
    near(l.get("db")!.offered, 500);
    near(l.get("db")!.utilization, 0.25);
  });
  it("sem cache (bypass): DB recebe 5.000/s, u=2,5, rejeita 3.000/s", () => {
    const l = computeDemand(doc, { rps: 5000, inactiveNodeIds: ["cache"] });
    near(l.get("db")!.offered, 5000);
    near(l.get("db")!.utilization, 2.5);
    near(l.get("db")!.offered - l.get("db")!.admitted, 3000);
  });
});

describe("validação", () => {
  it("detecta edge dangling", () => {
    const bad = structuredClone(doc);
    bad.edges[0].target = "nope";
    expect(validateArchitecture(bad).some((d) => d.code === "dangling-edge")).toBe(true);
  });
});

const withNodes = (extra: any[], edges: any[], flows: any[]) => {
  const d = structuredClone(doc);
  d.nodes.push(...extra); d.edges.push(...edges); d.traffic.flows.push(...flows);
  return d;
};
const node = (id: string, type: string, profileId: string, replicas = 1) =>
  ({ id, type, componentVersion: "1.0.0", name: id, properties: { profileId, replicas, placements: [], policy: {} } });
const edge = (id: string, source: string, target: string) =>
  ({ id, source, sourcePort: "out", target, targetPort: "in", configuration: { mode: "sync", protocol: "https" } });
const step = (id: string, nodeId: string, parent?: string, edgeId?: string, extra: any = {}) =>
  ({ id, nodeId, ordinal: 0, operationClass: "compute", visitsPerRequest: 1, branchShare: 1, condition: "always", join: "serial", required: true,
     parentStepId: parent, edgeId, ...extra });

describe("novos componentes e fluxos", () => {
  it("fluxo extra passa a carregar tráfego e soma com o existente (agregação por nó)", () => {
    const d = withNodes([node("svc", "backend", "compute-standard-v1")], [edge("lb-svc", "lb", "svc")], [
      { id: "flow-x", workloadId: "wl-redirect", ackStepId: "x-svc", steps: [step("x-c", "client"), step("x-lb", "lb", "x-c", "client-lb"), step("x-svc", "svc", "x-lb", "lb-svc")] },
    ]);
    const l = computeDemand(d, { rps: 1000, weights: { "flow-redirect": 0, "flow-x": 1 } });
    near(l.get("svc")!.offered, 1000);
    near(l.get("svc")!.utilization, 1000 / 3000);
    near(l.get("lb")!.offered, 1000);
  });
  it("fila: consumidor lento gera backlog crescente", () => {
    const d = withNodes([node("q", "queue", "queue-standard-v1"), node("w", "worker", "worker-standard-v1")],
      [edge("app-q", "app", "q"), edge("q-w", "q", "w")], [
      { id: "flow-q", workloadId: "wl-redirect", ackStepId: "q-q", steps: [step("q-c", "client"), step("q-lb", "lb", "q-c", "client-lb"),
        step("q-app", "app", "q-lb", "lb-app"), step("q-q", "q", "q-app", "app-q", { operationClass: "message" })] },
    ]);
    const l = computeDemand(d, { rps: 800, weights: { "flow-redirect": 0, "flow-q": 1 } });
    near(l.get("q")!.queue!.enqueued, 800);
    near(l.get("q")!.queue!.backlogGrowthPerSec, 300); // worker consome 500/s
    near(l.get("w")!.utilization, 1.6);
  });
  it("tipo sem capacidade para a classe usada fica unknown, não saudável", () => {
    const d = withNodes([node("s", "search-engine", "search-standard-v1")], [edge("app-s", "app", "s")], [
      { id: "flow-s", workloadId: "wl-redirect", ackStepId: "s-s", steps: [step("s-c", "client"), step("s-lb", "lb", "s-c", "client-lb"),
        step("s-app", "app", "s-lb", "lb-app"), step("s-s", "s", "s-app", "app-s", { operationClass: "message" })] },
    ]);
    expect(computeDemand(d, { rps: 100, weights: { "flow-redirect": 0, "flow-s": 1 } }).get("s")!.utilization).toBeNull();
  });
});

describe("sucesso por fluxo", () => {
  it("baseline conclui tudo; sem cache o DB rejeita 60%", () => {
    const base = solveDemand(doc, { rps: 5000 }).flows.get("flow-redirect")!;
    near(base.completed, 5000);
    const down = solveDemand(doc, { rps: 5000, inactiveNodeIds: ["cache"] }).flows.get("flow-redirect")!;
    near(down.completed, 2000);
  });
});

describe("modo caos (efeitos)", () => {
  it("latência extra no DB ultrapassa o deadline e vira timeout", () => {
    const base = solveDemand(doc, { rps: 5000, inactiveNodeIds: ["cache"] }).flows.get("flow-redirect")!;
    expect(base.p95Ms).toBeLessThan(200);
    // cache fora + DB +600ms: o ramo miss estoura o deadline de 500 ms
    const slow = solveDemand(doc, { rps: 1000, inactiveNodeIds: ["cache"], effects: { nodes: { db: { extraLatencyMs: 600 } } } }).flows.get("flow-redirect")!;
    near(slow.completed, 0); near(slow.timedOut, 1000);
  });
  it("taxa de erro e perda de pacotes reduzem o sucesso e a carga a jusante", () => {
    const r = solveDemand(doc, { rps: 1000, effects: { nodes: { app: { errorRate: 0.2 } }, edges: { "lb-app": { dropRate: 0.5 } } } });
    near(r.flows.get("flow-redirect")!.completed, 1000 * 0.5 * 0.8);
    near(r.loads.get("app")!.offered, 500);
  });
  it("fator de capacidade satura o nó", () => {
    const r = solveDemand(doc, { rps: 5000, effects: { nodes: { app: { capacityFactor: 0.5 } } } });
    near(r.loads.get("app")!.utilization, 5000 / (9000 * 0.5));
  });
});
