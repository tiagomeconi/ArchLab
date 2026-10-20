import { describe, expect, it } from "vitest";
import { autoLayout, type LEdge, type LNode } from "../../../apps/web/src/autolayout";

const N = (id: string, o: Partial<LNode> = {}): LNode => ({ id, w: 240, h: 110, x: 0, y: 0, ...o });
const E = (a: string, b: string): LEdge => ({ source: a, target: b });
const overlaps = (ns: LNode[], p: Map<string, { x: number; y: number }>) => {
  for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
    const a = p.get(ns[i]!.id)!, b = p.get(ns[j]!.id)!;
    if (a.x < b.x + ns[j]!.w && a.x + ns[i]!.w > b.x && a.y < b.y + ns[j]!.h && a.y + ns[i]!.h > b.y) return [ns[i]!.id, ns[j]!.id];
  }
  return null;
};

describe("organizar automaticamente", () => {
  it("corrente: cada nó numa coluna à direita do anterior, na mesma altura", () => {
    const ns = [N("c", { origin: true }), N("lb"), N("app"), N("db")];
    const p = autoLayout(ns, [E("c", "lb"), E("lb", "app"), E("app", "db")]);
    const xs = ["c", "lb", "app", "db"].map((id) => p.get(id)!.x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b)); expect(new Set(xs).size).toBe(4);
    expect(new Set(["c", "lb", "app", "db"].map((id) => p.get(id)!.y)).size).toBe(1);
  });
  it("ramificação: os filhos ficam na mesma coluna, empilhados, e o pai no meio deles", () => {
    const ns = [N("c", { origin: true }), N("app"), N("cache"), N("db")];
    const p = autoLayout(ns, [E("c", "app"), E("app", "cache"), E("app", "db")]);
    expect(p.get("cache")!.x).toBe(p.get("db")!.x);
    expect(overlaps(ns, p)).toBeNull();
    const mid = (p.get("cache")!.y + p.get("db")!.y) / 2;
    expect(Math.abs(p.get("app")!.y - mid)).toBeLessThanOrEqual(1);
  });
  it("origem fica sempre na primeira coluna, mesmo com conexão chegando nela", () => {
    const ns = [N("a"), N("c", { origin: true }), N("b")];
    const p = autoLayout(ns, [E("c", "a"), E("a", "b"), E("b", "c")]);
    expect(p.get("c")!.x).toBeLessThan(p.get("a")!.x);
  });
  it("ciclos não travam e respeitam a ordem de ida", () => {
    const ns = [N("a", { origin: true }), N("b"), N("c")];
    const p = autoLayout(ns, [E("a", "b"), E("b", "c"), E("c", "b"), E("c", "a")]);
    expect(p.get("a")!.x).toBeLessThan(p.get("b")!.x); expect(p.get("b")!.x).toBeLessThan(p.get("c")!.x);
  });
  it("componentes separados não se misturam; nós soltos e de apoio vão para baixo", () => {
    const ns = [N("a", { origin: true }), N("b"), N("x", { origin: true }), N("y"), N("solto"), N("obs", { side: true })];
    const p = autoLayout(ns, [E("a", "b"), E("x", "y"), E("obs", "b")]);
    expect(overlaps(ns, p)).toBeNull();
    const main = ["a", "b", "x", "y"].map((id) => p.get(id)!);
    const mainBottom = Math.max(...main.map((q) => q.y + 110));
    expect(p.get("solto")!.y).toBeGreaterThanOrEqual(mainBottom); expect(p.get("obs")!.y).toBeGreaterThanOrEqual(p.get("solto")!.y);
    expect(Math.abs(p.get("a")!.y - p.get("x")!.y)).toBeGreaterThan(110); // dois blocos, um em cima do outro
  });
  it("nó de apoio fica embaixo de quem ele atende", () => {
    const ns = [N("a", { origin: true }), N("b"), N("c"), N("obs", { side: true })];
    const p = autoLayout(ns, [E("a", "b"), E("b", "c"), E("obs", "c")]);
    expect(Math.abs(p.get("obs")!.x - p.get("c")!.x)).toBeLessThanOrEqual(1);
  });
  it("tamanhos diferentes não se sobrepõem e o canto superior esquerdo não muda", () => {
    const ns = [N("c", { origin: true, x: 500, y: 300, h: 80 }), N("app", { x: 900, y: 320, h: 160 }), N("db", { x: 1200, y: 700, w: 300, h: 124 }), N("cache", { x: 1200, y: 100, h: 96 })];
    const p = autoLayout(ns, [E("c", "app"), E("app", "db"), E("app", "cache")]);
    expect(overlaps(ns, p)).toBeNull();
    expect(Math.min(...[...p.values()].map((q) => q.x))).toBe(500); expect(Math.min(...[...p.values()].map((q) => q.y))).toBe(100);
  });
  it("é determinístico e idempotente", () => {
    const ns = [N("c", { origin: true }), N("lb"), N("a1"), N("a2"), N("db"), N("q"), N("w")];
    const es = [E("c", "lb"), E("lb", "a1"), E("lb", "a2"), E("a1", "db"), E("a2", "db"), E("a1", "q"), E("q", "w"), E("w", "db")];
    const p1 = autoLayout(ns, es);
    const again = autoLayout(ns.map((n) => ({ ...n, x: p1.get(n.id)!.x, y: p1.get(n.id)!.y })), es);
    expect([...again.entries()]).toEqual([...p1.entries()]);
    expect(overlaps(ns, p1)).toBeNull();
  });
  it("grafos aleatórios nunca sobrepõem nem perdem nós", () => {
    let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
    for (let t = 0; t < 60; t++) {
      const n = 2 + Math.floor(rnd() * 14);
      const ns = Array.from({ length: n }, (_, i) => N(`n${i}`, { origin: rnd() < 0.15, side: rnd() < 0.1, w: 200 + Math.floor(rnd() * 100), h: 80 + Math.floor(rnd() * 90), x: rnd() * 800, y: rnd() * 800 }));
      const es: LEdge[] = []; for (let k = 0; k < n * 1.4; k++) es.push(E(`n${Math.floor(rnd() * n)}`, `n${Math.floor(rnd() * n)}`));
      const p = autoLayout(ns, es);
      expect(p.size).toBe(n); expect(overlaps(ns, p), `grafo ${t}`).toBeNull();
      for (const q of p.values()) { expect(Number.isFinite(q.x) && Number.isFinite(q.y)).toBe(true); }
    }
  });
  it("sem nós devolve vazio; um nó fica onde estava", () => {
    expect(autoLayout([], []).size).toBe(0);
    expect(autoLayout([N("a", { x: 40, y: 70 })], []).get("a")).toEqual({ x: 40, y: 70 });
  });
});
