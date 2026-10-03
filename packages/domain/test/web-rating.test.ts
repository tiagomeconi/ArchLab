import { describe, expect, it } from "vitest";
import { errorOf, lossErrors, rate, tierOf, WEIGHTS, type RateInput } from "../../../apps/web/src/rating";
import { buildReference, docOf, weightsOf, type Snapshot } from "../../../apps/web/src/reference";
import { evaluate } from "../../../apps/web/src/requirements";
import { CASES, COMPANY_CASES, checksOf, loadOf } from "../../../apps/web/src/cases";
import { solveDemand } from "../src";

const ALL = [...COMPANY_CASES, ...CASES];
const readP95 = (flows: any[], r: ReturnType<typeof solveDemand>) => {
  let p: number | null = null;
  for (const f of flows) { if (f.steps.some((s: any) => s.operationClass === "write")) continue; const st = r.flows.get(f.id); if (st && st.offered > 0 && st.p95Ms !== null && (p === null || st.p95Ms > p)) p = st.p95Ms; }
  return p;
};

function rateSnapshot(snap: Snapshot, id: string, tweak?: (s: Snapshot) => void, rpsFactor = 1) {
  if (tweak) tweak(snap);
  const checks = checksOf(id)!, load = loadOf(id)!;
  const doc = docOf(snap) as any; const rps = Math.round(load.peakRps * rpsFactor);
  const weights = weightsOf(snap.f, snap.m, load.readPct);
  const res = solveDemand(doc, { rps, weights });
  const session = { mode: "study" as const, title: id, checks, requirements: { functional: [], nonFunctional: [], scale: { users: "", rps: "", readWrite: "", storage: "" }, targets: { latency: "", availability: "", consistency: "" }, constraints: "" } };
  const design = { nodes: doc.nodes, flows: snap.f, loads: res.loads, p95Ms: readP95(snap.f, res) };
  const inp: RateInput = { nodes: doc.nodes, edges: doc.edges, flows: snap.f, loads: res.loads, errFrac: errorOf(res), p95Ms: design.p95Ms, p95Target: checks.p95Ms,
    lossErr: lossErrors(doc, rps, weights, errorOf(res)), checks: evaluate(session, design), readPct: load.readPct };
  return rate(inp);
}

describe("overall do desenho", () => {
  it("os pesos somam 1", () => { expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1); });
  it("faixas de nível", () => { expect([59, 60, 74, 75, 89, 90, 99].map(tierOf)).toEqual(["bronze", "silver", "silver", "gold", "gold", "elite", "elite"]); });

  it.each(ALL.map((c) => [c.id] as const))("%s: a referência é um desenho de nível ouro ou melhor, com todos os atributos medidos", (id) => {
    const r = rateSnapshot(buildReference(checksOf(id)!, loadOf(id)!), id);
    expect(r.attrs.filter((a) => a.score === null).map((a) => a.id)).toEqual([]);
    expect(r.overall!, `${id}: ${r.attrs.map((a) => `${a.id}=${a.score}`).join(" ")}`).toBeGreaterThanOrEqual(80);
  });

  it("um desenho ruim (1 réplica em tudo e carga acima da capacidade) fica abaixo da referência e do ouro", () => {
    const id = "netflix";
    const bom = rateSnapshot(buildReference(checksOf(id)!, loadOf(id)!), id);
    const ruim = rateSnapshot(buildReference(checksOf(id)!, loadOf(id)!), id, (s) => { for (const n of s.n) n.d.replicas = 1; });
    expect(ruim.overall!).toBeLessThan(bom.overall!);
    expect(ruim.overall!).toBeLessThan(60);
    expect(ruim.attrs.find((a) => a.id === "res")!.score!).toBeLessThan(bom.attrs.find((a) => a.id === "res")!.score!);
    expect(ruim.tier).toBe("bronze");
  });

  it("dobrar o tráfego sobre a referência derruba a capacidade, não a arquitetura", () => {
    const id = "chat";
    const base = rateSnapshot(buildReference(checksOf(id)!, loadOf(id)!), id);
    const dobro = rateSnapshot(buildReference(checksOf(id)!, loadOf(id)!), id, undefined, 2);
    expect(dobro.attrs.find((a) => a.id === "cap")!.score!).toBeLessThan(base.attrs.find((a) => a.id === "cap")!.score!);
    expect(dobro.attrs.find((a) => a.id === "arq")!.score).toBe(base.attrs.find((a) => a.id === "arq")!.score);
  });

  it("sem desenho não há nota, e cada atributo diz o que falta", () => {
    const r = rate({ nodes: [], edges: [], flows: [], loads: new Map(), errFrac: 0, p95Ms: null, lossErr: {}, checks: [], readPct: 99 });
    expect(r.overall).toBeNull(); expect(r.tier).toBeNull();
    for (const a of r.attrs) expect(a.why.length).toBeGreaterThan(5);
  });

  it("explica a causa: o pior componente aparece no porquê e na dica", () => {
    const id = "netflix";
    const r = rateSnapshot(buildReference(checksOf(id)!, loadOf(id)!), id, (s) => { const app = s.n.find((n) => n.id === "app")!; app.d.replicas = 1; });
    const res = r.attrs.find((a) => a.id === "res")!;
    expect(res.why).toContain("Backend"); expect(res.tip).toContain("Backend");
  });
});
