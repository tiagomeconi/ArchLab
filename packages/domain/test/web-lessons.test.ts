import { describe, expect, it } from "vitest";
import { LESSONS, UNITS } from "../../../apps/web/src/lessons";
import { emptyLessonState, goalMet, type Goal, type LessonState } from "../../../apps/web/src/lessonGoals";
import { buildAutoFlows } from "../../../apps/web/src/flowOps";
import { docOf, weightsOf, type Snapshot } from "../../../apps/web/src/reference";
import { connectionOptions, solveDemand } from "../src";
import { PALETTE } from "../../../apps/web/src/catalog";
import { EN } from "../../../apps/web/src/i18n/en";

type SolNode = { key: string; type: string; replicas: number; hit?: number };
/** O desenho em que cada aula termina (partindo do ponto de partida). */
const SOLUTIONS: Record<string, { nodes: SolNode[]; edges: [string, string][]; chaos?: boolean }> = {
  "cliente-servidor": { nodes: [{ key: "client", type: "client", replicas: 1 }, { key: "api", type: "backend", replicas: 1 }], edges: [["client", "api"]] },
  dados: { nodes: [{ key: "client", type: "client", replicas: 1 }, { key: "api", type: "backend", replicas: 1 }, { key: "db", type: "sql-database", replicas: 1 }], edges: [["client", "api"], ["api", "db"]] },
  replicas: { nodes: [{ key: "client", type: "client", replicas: 1 }, { key: "lb", type: "load-balancer", replicas: 1 }, { key: "api", type: "backend", replicas: 3 }, { key: "db", type: "sql-database", replicas: 1 }], edges: [["client", "lb"], ["lb", "api"], ["api", "db"]] },
  cache: { nodes: [{ key: "client", type: "client", replicas: 1 }, { key: "lb", type: "load-balancer", replicas: 2 }, { key: "api", type: "backend", replicas: 3 }, { key: "db", type: "sql-database", replicas: 1 }, { key: "cache", type: "redis", replicas: 1, hit: 0.9 }], edges: [["client", "lb"], ["lb", "api"], ["api", "db"], ["api", "cache"]] },
  volume: { nodes: [{ key: "client", type: "client", replicas: 1 }, { key: "lb", type: "load-balancer", replicas: 2 }, { key: "api", type: "backend", replicas: 3 }, { key: "db", type: "sql-database", replicas: 2 }, { key: "cache", type: "redis", replicas: 1, hit: 0.9 }], edges: [["client", "lb"], ["lb", "api"], ["api", "db"], ["api", "cache"]] },
  filas: { nodes: [{ key: "client", type: "client", replicas: 1 }, { key: "api", type: "backend", replicas: 3 }, { key: "db", type: "sql-database", replicas: 3 }, { key: "q", type: "queue", replicas: 1 }, { key: "w", type: "worker", replicas: 4 }], edges: [["client", "api"], ["api", "db"], ["api", "q"], ["q", "w"]] },
  resiliencia: { chaos: true, nodes: [{ key: "client", type: "client", replicas: 1 }, { key: "lb", type: "load-balancer", replicas: 2 }, { key: "api", type: "backend", replicas: 3 }, { key: "cache", type: "redis", replicas: 2, hit: 0.9 }, { key: "db", type: "sql-database", replicas: 2 }], edges: [["client", "lb"], ["lb", "api"], ["api", "cache"], ["api", "db"]] },
};

const optionFor = (a: string, b: string) => connectionOptions(a, b)[0];
/** Monta o estado do canvas como o laboratório faria (fluxos automáticos, carga de pico de 5.000 req/s, 99% de leitura) e mede as utilizações. */
function stateOf(nodes: SolNode[], edges: [string, string][], opts: { crashBackend?: boolean } = {}): LessonState {
  const typeOf = new Map(nodes.map((n) => [n.key, n.type]));
  const auto = buildAutoFlows("client", nodes.map((n) => ({ id: n.key, type: n.type, name: n.key })), edges.map(([a, b]) => ({ id: `${a}-${b}`, source: a, target: b })), 0.9);
  const flows = auto.map((a) => a.flow); const meta = Object.fromEntries(auto.map((a) => [a.flow.id, { name: a.name, weight: a.weight }]));
  const snap: Snapshot = {
    n: nodes.map((n) => ({ id: n.key, x: 0, y: 0, w: 240, d: { name: n.key, type: n.type, replicas: n.replicas, hitRate: n.hit } })),
    e: edges.map(([a, b]) => { const o = optionFor(typeOf.get(a)!, typeOf.get(b)!); return { id: `${a}-${b}`, source: a, sourcePort: "right", target: b, targetPort: "left", configuration: { mode: o!.mode, protocol: o!.protocol, required: true, timeoutMs: o!.timeoutMs, networkLatencyMs: o!.networkLatencyMs, maxAttempts: 1, backoffMs: 0, retryable: false, tls: o!.tls } }; }),
    f: flows, w: auto.map((a) => a.workload), m: meta,
  };
  const effects = opts.crashBackend ? { nodes: { api: { capacityFactor: (nodes.find((n) => n.key === "api")!.replicas - 1) / nodes.find((n) => n.key === "api")!.replicas } } } : undefined;
  const res = solveDemand(docOf(snap) as any, { rps: 5000, weights: weightsOf(flows, meta, 99), effects });
  const utils = nodes.map((n) => res.loads.get(n.key)?.utilization ?? null);
  const finite = nodes.map((n, i) => (n.type === "client" ? null : utils[i])).filter((u): u is number => u !== null && Number.isFinite(u));
  return { nodes: nodes.map((n, i) => ({ id: n.key, type: n.type, replicas: n.replicas, hitRate: n.hit, util: utils[i] ?? null })), edges: edges.map(([a, b]) => ({ source: a, target: b })),
    simulated: true, selectedType: null, tab: "components", chaos: opts.crashBackend ? 1 : 0, maxUtil: finite.length ? Math.max(...finite) : null };
}
const withTransient = (s: LessonState, g: Goal): LessonState => (g.kind === "selected" ? { ...s, selectedType: g.types[0]! } : g.kind === "tab" ? { ...s, tab: g.tab } : s);

describe("aulas guiadas", () => {
  const known = new Set(PALETTE.flatMap((g) => g.items.map((i) => i.type)));
  it("a estrutura é coerente: ids únicos, unidades válidas, passos com tarefa e tipos conhecidos", () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
    expect(new Set(LESSONS.map((l) => l.designId)).size).toBe(LESSONS.length);
    for (const l of LESSONS) {
      expect(l.unit).toBeLessThan(UNITS.length); expect(l.designId).toMatch(/^[a-z0-9]{4,16}$/);
      expect(l.steps.length).toBeGreaterThanOrEqual(3);
      for (const s of l.steps) { expect(s.tasks.length, `${l.id}: ${s.title}`).toBeGreaterThan(0); expect(s.explain.length).toBeGreaterThan(0); }
      for (const n of l.starter?.nodes ?? []) expect(known.has(n.type), `${l.id}: ${n.type}`).toBe(true);
      for (const e of l.starter?.edges ?? []) { const t = new Map((l.starter?.nodes ?? []).map((n) => [n.key, n.type])); expect(optionFor(t.get(e.from)!, t.get(e.to)!), `${l.id}: ${e.from}→${e.to}`).toBeTruthy(); }
    }
  });
  it("nenhuma tarefa já vem cumprida no ponto de partida (senão o passo seria vazio), exceto metas de seleção/aba", () => {
    for (const l of LESSONS) {
      const start = l.starter ? stateOf(l.starter.nodes.map((n) => ({ key: n.key, type: n.type, replicas: n.replicas, hit: n.hitRate })), l.starter.edges.map((e) => [e.from, e.to])) : emptyLessonState();
      const st = { ...start, simulated: false, chaos: 0 };
      l.steps.forEach((s, i) => { if (i === 0 && l.id === "resiliencia") return; for (const t of s.tasks) if (["node", "edge", "replicas", "hit", "simulated", "chaos"].includes(t.goal.kind)) {
        // a primeira tarefa de cada passo não pode estar pronta de saída; as seguintes podem depender de passos anteriores
        if (t === s.tasks[0] && i === 0) expect(goalMet(t.goal, st), `${l.id} passo ${i + 1}: ${t.text}`).toBe(false);
      } });
    }
  });
  it("toda aula tem solução: no desenho final todas as tarefas de todos os passos são cumpridas", () => {
    for (const l of LESSONS) {
      const sol = SOLUTIONS[l.id]!; expect(sol, l.id).toBeTruthy();
      const st = stateOf(sol.nodes, sol.edges, { crashBackend: sol.chaos });
      for (const s of l.steps) for (const t of s.tasks) {
        // "reduzir réplicas" e metas que só valem num passo intermediário são conferidas no estado em que o passo as pede
        if (t.goal.kind === "replicasMax" || (l.id === "volume" && t.goal.kind === "replicas" && t.goal.types[0] === "sql-database")) continue;
        expect(goalMet(t.goal, withTransient(st, t.goal)), `${l.id}: ${t.text}`).toBe(true);
      }
    }
  });
  it("as metas de utilização realmente dependem da arquitetura: os números mudam entre o começo e o fim", () => {
    const util = (id: string, ty: string, crash = false) => { const s = SOLUTIONS[id]!; return stateOf(s.nodes, s.edges, { crashBackend: crash }).nodes.find((n) => n.type === ty)!.util!; };
    expect(util("cliente-servidor", "backend")).toBeGreaterThan(1.5);          // um backend só não aguenta os 5.000 req/s
    expect(util("dados", "sql-database")).toBeGreaterThan(1.3);                // e o banco vira gargalo
    expect(util("replicas", "sql-database")).toBeGreaterThan(2);               // com mais tráfego chegando a ele
    expect(util("filas", "worker")).toBeLessThanOrEqual(0.9);                  // 4 workers dão conta da fila
    expect(stateOf(SOLUTIONS.filas!.nodes.map((n) => (n.key === "w" ? { ...n, replicas: 2 } : n)), SOLUTIONS.filas!.edges).nodes.find((n) => n.type === "worker")!.util!).toBeGreaterThan(1.2); // com 2 não dão
    expect(util("replicas", "backend")).toBeLessThanOrEqual(0.8);              // 3 réplicas resolvem
    expect(util("cache", "sql-database")).toBeLessThanOrEqual(0.8);            // cache alivia o banco
    expect(util("volume", "sql-database")).toBeLessThanOrEqual(0.8);
    const sem = stateOf([{ key: "client", type: "client", replicas: 1 }, { key: "lb", type: "load-balancer", replicas: 2 }, { key: "api", type: "backend", replicas: 3 }, { key: "db", type: "sql-database", replicas: 3 }], [["client", "lb"], ["lb", "api"], ["api", "db"]]);
    expect(sem.nodes.find((n) => n.type === "sql-database")!.util!).toBeLessThanOrEqual(0.9);   // 3 réplicas sem cache
    expect(util("resiliencia", "backend", true)).toBeLessThanOrEqual(1);       // perde 1 de 3 e aguenta
    const dois = stateOf(SOLUTIONS.resiliencia!.nodes.map((n) => (n.key === "api" ? { ...n, replicas: 2 } : n)), SOLUTIONS.resiliencia!.edges, { crashBackend: true });
    expect(dois.maxUtil!).toBeGreaterThan(1);                                  // com 2 réplicas, perder 1 não aguenta: é a lição do N+1
  });
  it("todo texto tem tradução para o inglês", () => {
    for (const u of UNITS) { expect(EN[u.title], u.title).toBeTruthy(); expect(EN[u.summary], u.summary).toBeTruthy(); }
    for (const l of LESSONS) {
      const all = [l.title, l.summary, ...l.recap, ...l.steps.flatMap((s) => [s.title, s.hint, s.done, ...s.explain, ...s.tasks.map((t) => t.text)]), ...(l.starter?.nodes.map((n) => n.name) ?? [])];
      for (const s of all) expect(EN[s], s).toBeTruthy();
    }
  });
});

describe("metas", () => {
  const st: LessonState = { ...emptyLessonState(), nodes: [{ id: "a", type: "backend", replicas: 3, util: 0.5 }, { id: "c", type: "client", replicas: 1, util: null }, { id: "r", type: "redis", replicas: 1, hitRate: 0.9, util: 0.1 }], edges: [{ source: "c", target: "a" }], maxUtil: 0.9, simulated: true };
  it("cada tipo de meta", () => {
    expect(goalMet({ kind: "node", types: ["backend"], min: 1 }, st)).toBe(true);
    expect(goalMet({ kind: "node", types: ["queue"], min: 1 }, st)).toBe(false);
    expect(goalMet({ kind: "edge", from: ["client"], to: ["backend"] }, st)).toBe(true);
    expect(goalMet({ kind: "noEdge", from: ["client"], to: ["backend"] }, st)).toBe(false);
    expect(goalMet({ kind: "replicas", types: ["backend"], min: 3 }, st)).toBe(true);
    expect(goalMet({ kind: "replicasMax", types: ["backend"], max: 2 }, st)).toBe(false);
    expect(goalMet({ kind: "hit", min: 0.9 }, st)).toBe(true); expect(goalMet({ kind: "hit", min: 0.95 }, st)).toBe(false);
    expect(goalMet({ kind: "util", types: ["backend"], max: 0.6 }, st)).toBe(true);
    expect(goalMet({ kind: "ok" }, st)).toBe(true); expect(goalMet({ kind: "ok" }, { ...st, maxUtil: 1.2 })).toBe(false); expect(goalMet({ kind: "ok" }, emptyLessonState())).toBe(false);
    expect(goalMet({ kind: "chaos" }, st)).toBe(false); expect(goalMet({ kind: "chaos" }, { ...st, chaos: 1 })).toBe(true);
  });
});
