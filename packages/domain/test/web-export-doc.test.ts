import { describe, expect, it } from "vitest";
import { toDesignDoc, toMermaid, type DocEdge, type DocNode } from "../../../apps/web/src/exportDoc";

const nodes: DocNode[] = [
  { id: "client-1", name: "Cliente", type: "client", replicas: 1 },
  { id: "api", name: 'API "principal"', type: "backend", replicas: 3, provider: "Node", note: "Escolhi stateless." },
  { id: "db", name: "Banco | SQL", type: "sql-database", replicas: 2 },
];
const edges: DocEdge[] = [
  { source: "client-1", target: "api", protocol: "https", mode: "sync" },
  { source: "api", target: "db", protocol: "sql", mode: "sync", bidirectional: true },
];

describe("exportação do desenho", () => {
  it("Mermaid: nós, réplicas, setas, dois sentidos e grupos", () => {
    const m = toMermaid(nodes, [...edges, { source: "api", target: "db", protocol: "kafka", mode: "async" }], [{ name: "Cluster QA", nodeIds: ["api", "db"] }]);
    expect(m.startsWith("flowchart LR")).toBe(true);
    expect(m).toContain('subgraph g0["Cluster QA"]');
    expect(m).toContain("×3");
    expect(m).toContain('n_client_1 -->|"https"| n_api');
    expect(m).toContain('n_api <-->|"sql"| n_db');
    expect(m).toContain("-.->");
    expect(m).not.toContain('API "principal"'); // aspas escapadas
  });
  it("documento de design: seções, tabelas escapadas e riscos", () => {
    const md = toDesignDoc({ title: "Meu sistema", nodes, edges, groups: [], findings: [{ id: "x", rule: "spof", severity: "alta", nodeIds: ["api"], title: "API é um ponto único", why: "Cai tudo.", fix: "Dê réplicas." }],
      cost: { total: 780, unknown: 0, lines: [{ id: "db", name: "Banco", credits: 600, replicas: 2 }] }, notes: "Pensar em multi-região." });
    expect(md).toContain("# Meu sistema");
    expect(md).toContain("```mermaid");
    expect(md).toContain("Banco \\| SQL");
    expect(md).toContain("### API \"principal\"");
    expect(md).toContain("**API é um ponto único**");
    expect(md).toContain("780");
    expect(md).toContain("Pensar em multi-região.");
  });
});
