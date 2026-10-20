import { describe, expect, it } from "vitest";
import { lintArchitecture, longestSyncChain, type LintEdge, type LintNode } from "../../../apps/web/src/lint";

const n = (id: string, type: string, replicas = 1): LintNode => ({ id, type, name: id, replicas });
const e = (source: string, target: string, mode = "sync", extra: Partial<LintEdge> = {}): LintEdge => ({ source, target, protocol: "https", mode, ...extra });
const rules = (f: { rule: string }[]) => f.map((x) => x.rule);

describe("revisão de arquitetura", () => {
  it("aponta ponto único de falha e banco sem réplica", () => {
    const nodes = [n("c", "client"), n("api", "backend"), n("db", "sql-database")];
    const f = lintArchitecture({ nodes, edges: [e("c", "api"), e("api", "db")], inFlow: new Set(["c", "api", "db"]) });
    expect(rules(f)).toEqual(expect.arrayContaining(["spof", "db-replica"]));
    expect(f[0]!.severity).toBe("alta");
  });
  it("um desenho redundante, com cache, não tem alertas graves", () => {
    const nodes = [n("c", "client"), n("lb", "load-balancer", 2), n("api", "backend", 3), n("r", "redis", 2), n("db", "sql-database", 2), n("o", "observability")];
    const f = lintArchitecture({ nodes, edges: [e("c", "lb"), e("lb", "api"), e("api", "r"), e("api", "db"), e("api", "o", "async")], inFlow: new Set(nodes.map((x) => x.id)), readPct: 90 });
    expect(f.filter((x) => x.severity === "alta")).toEqual([]);
    expect(rules(f)).not.toContain("no-cache");
  });
  it("leitura pesada sem cache ou CDN", () => {
    const nodes = [n("c", "client"), n("api", "backend", 2), n("db", "sql-database", 2)];
    const f = lintArchitecture({ nodes, edges: [e("c", "api"), e("api", "db")], inFlow: new Set(nodes.map((x) => x.id)), readPct: 95 });
    expect(rules(f)).toContain("no-cache");
    expect(rules(f)).toContain("no-entry");
  });
  it("fila sem consumidor e componente solto", () => {
    const nodes = [n("c", "client"), n("api", "backend", 2), n("q", "queue"), n("x", "worker")];
    const f = lintArchitecture({ nodes, edges: [e("c", "api"), e("api", "q", "async")], inFlow: new Set(["c", "api", "q"]) });
    expect(rules(f)).toEqual(expect.arrayContaining(["queue-no-consumer", "orphan"]));
  });
  it("cadeia síncrona longa só conta chamadas síncronas", () => {
    const ids = ["c", "a", "b", "d", "e", "f", "g"];
    const edges = ids.slice(0, -1).map((id, i) => e(id, ids[i + 1]!));
    expect(longestSyncChain(edges, ["c"]).len).toBe(6);
    const mixed = edges.map((x, i) => (i === 2 ? { ...x, mode: "async" } : x));
    expect(longestSyncChain(mixed, ["c"]).len).toBe(2);
  });
  it("saturação e TLS desligado no tráfego do cliente", () => {
    const nodes = [n("c", "client"), n("api", "backend", 2)];
    const f = lintArchitecture({ nodes, edges: [e("c", "api", "sync", { tls: false })], inFlow: new Set(["c", "api"]), utilization: new Map([["api", 1.4]]) });
    expect(rules(f)).toEqual(expect.arrayContaining(["saturated", "no-tls"]));
  });
  it("DNS é apoio: não vira ponto único de falha", () => {
    const nodes = [n("c", "client"), n("dns", "dns"), n("api", "backend", 2)];
    const f = lintArchitecture({ nodes, edges: [e("c", "dns"), e("c", "api")], inFlow: new Set(["c", "api"]) });
    expect(f.some((x) => x.rule === "spof" && x.nodeIds.includes("dns"))).toBe(false);
  });
});

import { estimateCost } from "../../../apps/web/src/cost";
describe("custo estimado", () => {
  it("soma preço por instância vezes réplicas, ignora origens de carga e conta o que não tem preço", () => {
    const nodes = [
      { id: "c", name: "c", properties: { profileId: "source-v1", replicas: 1 } },
      { id: "api", name: "api", properties: { profileId: "compute-standard-v1", replicas: 3 } },
      { id: "db", name: "db", properties: { profileId: "sql-standard-v1", replicas: 2 } },
      { id: "q", name: "q", properties: { profileId: "queue-standard-v1", replicas: 1 } },
    ];
    const c = estimateCost(nodes);
    expect(c.total).toBe(80 * 3 + 300 * 2);
    expect(c.unknown).toBe(1);
    expect(c.lines.map((l) => l.id)).toEqual(["db", "api"]);
  });
});
