import { describe, expect, it } from "vitest";
import { CASES, COMPANY_CASES, checksOf, loadOf } from "../../../apps/web/src/cases";
import { PALETTE } from "../../../apps/web/src/catalog";
import { CHAOS } from "../../../apps/web/src/chaos";
import { evaluate, type Design } from "../../../apps/web/src/requirements";
import { buildReference, docOf, weightsOf } from "../../../apps/web/src/reference";
import { solveDemand } from "../src";
import type { Session } from "../../../apps/web/src/session";

const ALL = [...COMPANY_CASES, ...CASES];
const PALETTE_TYPES = new Set(PALETTE.flatMap((g) => g.items.map((i) => i.type)));
const CHAOS_IDS = new Set(CHAOS.map((c) => c.id));

describe("catálogo de casos de estudo", () => {
  it("tem ids únicos", () => {
    expect(new Set(ALL.map((c) => c.id)).size).toBe(ALL.length);
  });
  it.each(ALL.map((c) => [c.id, c] as const))("%s tem carga, verificações e requisitos coerentes", (id, c) => {
    const load = loadOf(id)!;
    expect(load, "carga").toBeDefined();
    expect(load.peakRps).toBeGreaterThan(0);
    expect(load.readPct).toBeGreaterThanOrEqual(10); // o controle do laboratório vai de 10 a 100
    expect(load.readPct).toBeLessThanOrEqual(100);
    const checks = checksOf(id)!;
    expect(checks.needs.length).toBeGreaterThan(0);
    for (const n of checks.needs) for (const t of n.any) expect(PALETTE_TYPES.has(t), `${id}: tipo desconhecido "${t}"`).toBe(true);
    for (const k of checks.chaos ?? []) expect(CHAOS_IDS.has(k), `${id}: falha desconhecida "${k}"`).toBe(true);
    expect(c.req.functional.length).toBeGreaterThan(0);
    expect(c.req.nonFunctional.length).toBeGreaterThan(0);
  });
  it("casos de empresa trazem logo, cor e foco", () => {
    for (const c of COMPANY_CASES) expect(c.company && c.company.logo && c.company.brand && c.company.focus, c.id).toBeTruthy();
  });
});

describe("verificações automáticas do desenho", () => {
  const session: Session = { mode: "study", title: "t", requirements: { functional: [], nonFunctional: [], scale: { users: "", rps: "", readWrite: "", storage: "" }, targets: { latency: "", availability: "", consistency: "" }, constraints: "" },
    checks: { p95Ms: 200, needs: [{ label: "Cache", any: ["redis"], why: "" }] } };
  const node = (id: string, type: string, replicas = 1) => ({ id, type, name: id, properties: { replicas } });
  const status = (d: Design, id: string) => evaluate(session, d).find((c) => c.id === id)?.status;
  const empty: Design = { nodes: [], flows: [], loads: new Map(), p95Ms: null };

  it("sem desenho, tudo é desconhecido (nunca 'atendido' por omissão)", () => {
    for (const c of evaluate(session, empty)) expect(c.status).toBe("unknown");
  });
  it("componente exigido: atendido só se existir no desenho", () => {
    expect(status({ ...empty, nodes: [node("a", "backend")] }, "need:Cache")).toBe("fails");
    expect(status({ ...empty, nodes: [node("a", "redis")] }, "need:Cache")).toBe("meets");
  });
  it("p95 respeita a meta", () => {
    expect(status({ ...empty, p95Ms: 150 }, "p95")).toBe("meets");
    expect(status({ ...empty, p95Ms: 250 }, "p95")).toBe("fails");
  });
  it("ponto único de falha: réplica 1 em componente de um fluxo reprova", () => {
    const flows = [{ steps: [{ nodeId: "b" }] }];
    expect(status({ ...empty, nodes: [node("b", "backend", 1)], flows }, "spof")).toBe("fails");
    expect(status({ ...empty, nodes: [node("b", "backend", 2)], flows }, "spof")).toBe("meets");
  });
  it("capacidade: saturação reprova, folga atende", () => {
    const load = (u: number) => new Map([["b", { utilization: u, source: false } as any]]);
    expect(status({ ...empty, nodes: [node("b", "backend")], loads: load(1.2) }, "capacity")).toBe("fails");
    expect(status({ ...empty, nodes: [node("b", "backend")], loads: load(0.5) }, "capacity")).toBe("meets");
  });
});

describe("desenhos de referência", () => {
  /** p95 de leitura, igual ao laboratório: maior p95 entre fluxos sem escrita. */
  const readP95 = (flows: any[], r: ReturnType<typeof solveDemand>) => {
    let p: number | null = null;
    for (const f of flows) { if (f.steps.some((s: any) => s.operationClass === "write")) continue; const st = r.flows.get(f.id); if (st && st.offered > 0 && st.p95Ms !== null && (p === null || st.p95Ms > p)) p = st.p95Ms; }
    return p;
  };
  it.each(ALL.map((c) => [c.id, c] as const))("%s: a referência atende todas as próprias verificações", (id) => {
    const checks = checksOf(id)!, load = loadOf(id)!;
    const snap = buildReference(checks, load);
    const doc = docOf(snap) as any;
    const r = solveDemand(doc, { rps: load.peakRps, weights: weightsOf(snap.f, snap.m, load.readPct) });
    const session: Session = { mode: "study", title: id, checks, requirements: { functional: [], nonFunctional: [], scale: { users: "", rps: "", readWrite: "", storage: "" }, targets: { latency: "", availability: "", consistency: "" }, constraints: "" } };
    const results = evaluate(session, { nodes: doc.nodes, flows: snap.f, loads: r.loads, p95Ms: readP95(snap.f, r) });
    const bad = results.filter((c) => c.status !== "meets").map((c) => `${c.label} [${c.status}]`);
    expect(bad).toEqual([]);
  });
});
