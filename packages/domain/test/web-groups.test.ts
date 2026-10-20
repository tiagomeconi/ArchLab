import { describe, expect, it } from "vitest";
import { cleanGroups } from "../../../apps/web/src/GroupNode";

describe("grupos de blocos", () => {
  it("aceita grupo válido e normaliza nome, cor e tamanho mínimo", () => {
    const [g] = cleanGroups([{ id: "grp-1", name: "  Cluster QA  ", color: "green", x: 10, y: 20, w: 50, h: 9000 }]);
    expect(g).toEqual({ id: "grp-1", name: "Cluster QA", color: "green", x: 10, y: 20, w: 200, h: 4000 });
  });
  it("descarta lixo vindo de arquivo ou link compartilhado", () => {
    expect(cleanGroups(undefined)).toEqual([]);
    expect(cleanGroups("x")).toEqual([]);
    const out = cleanGroups([null, 3, { id: "<img>", name: "a", color: "sky", x: 0, y: 0, w: 300, h: 200 }, { id: "a", x: "1", y: 0, w: 300, h: 200 },
      { id: "ok", name: "", color: "neon", x: 0, y: 0, w: 300, h: 200 }, { id: "ok", name: "dup", color: "sky", x: 0, y: 0, w: 300, h: 200 }]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: "ok", name: "Grupo", color: "sky" });
  });
  it("limita a quantidade de grupos", () => {
    const many = Array.from({ length: 100 }, (_, i) => ({ id: `g${i}`, name: "g", color: "sky", x: 0, y: 0, w: 300, h: 200 }));
    expect(cleanGroups(many)).toHaveLength(40);
  });
});

import { groupChaos } from "../../../apps/web/src/chaos";
import { inGroup } from "../../../apps/web/src/GroupNode";

describe("grupo como zona de falha", () => {
  it("pertence ao grupo quem tem o centro dentro da moldura", () => {
    const g = { x: 0, y: 0, w: 500, h: 300 };
    expect(inGroup(g, { x: 100, y: 100 })).toBe(true);
    expect(inGroup(g, { x: 480, y: 100 })).toBe(false); // centro (600) fora
  });
  it("a falha do grupo derruba os blocos de dentro e poupa as origens de carga", () => {
    const ctx = { nodes: [{ id: "c", type: "client", name: "c", replicas: 1, source: true }, { id: "a", type: "backend", name: "a", replicas: 1, source: false }, { id: "b", type: "backend", name: "b", replicas: 1, source: false }],
      edges: [], groups: [{ id: "g1", name: "Cluster QA", nodeIds: ["c", "a"] }, { id: "vazio", name: "x", nodeIds: [] }] };
    const items = groupChaos(ctx);
    expect(items.map((i) => i.id)).toEqual(["grp:g1"]);
    const p = items[0]!.apply(ctx, null);
    expect(Object.keys(p.nodes)).toEqual(["a"]);
    expect(p.nodes.a).toEqual({ unavailable: true });
  });
});
