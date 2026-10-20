import { describe, expect, it } from "vitest";
import { buildPattern, PATTERNS } from "../../../apps/web/src/patterns";
import { connectionOptions, DEFAULT_PROFILE_BY_TYPE } from "../src";
import { PALETTE } from "../../../apps/web/src/catalog";
import { EN } from "../../../apps/web/src/i18n/en";

const optionFor = (s: string, t: string, protocol?: string, mode?: string) => {
  const opts = connectionOptions(s, t); const o = (protocol || mode ? opts.find((x) => (!protocol || x.protocol === protocol) && (!mode || x.mode === mode)) : undefined) ?? opts[0];
  return o ? { protocol: o.protocol, mode: o.mode, timeoutMs: o.timeoutMs, networkLatencyMs: o.networkLatencyMs, tls: o.tls } : null;
};

describe("biblioteca de padrões", () => {
  const known = new Set(PALETTE.flatMap((g) => g.items.map((i) => i.type)));
  it("todo componente existe na paleta e tem perfil de capacidade", () => {
    for (const p of PATTERNS) for (const n of p.nodes) { expect(known.has(n.type), `${p.id}: ${n.type}`).toBe(true); expect(DEFAULT_PROFILE_BY_TYPE[n.type], `${p.id}: ${n.type}`).toBeTruthy(); }
  });
  it("toda conexão é permitida pelas regras do domínio e aponta para nós do padrão", () => {
    for (const p of PATTERNS) {
      const keys = new Set(p.nodes.map((n) => n.key)); const type = new Map(p.nodes.map((n) => [n.key, n.type]));
      for (const e of p.edges) { expect(keys.has(e.from) && keys.has(e.to), `${p.id}: ${e.from}→${e.to}`).toBe(true); expect(optionFor(type.get(e.from)!, type.get(e.to)!, e.protocol, e.mode), `${p.id}: ${type.get(e.from)}→${type.get(e.to)}`).not.toBeNull(); }
      for (const g of p.groups) for (const k of g.keys) expect(keys.has(k), `${p.id} grupo ${k}`).toBe(true);
    }
  });
  it("ids são únicos e não colidem com os existentes; inserir duas vezes não repete", () => {
    const p = PATTERNS[0]!;
    const a = buildPattern(p, { x: 0, y: 0 }, new Set(), (s) => s, optionFor);
    const b = buildPattern(p, { x: 0, y: 0 }, new Set(a.nodes.map((n) => n.id)), (s) => s, optionFor);
    const ids = [...a.nodes, ...b.nodes].map((n) => n.id); expect(new Set(ids).size).toBe(ids.length);
    expect(a.edges).toHaveLength(p.edges.length);
    for (const e of b.edges) expect(b.nodes.some((n) => n.id === e.source) && b.nodes.some((n) => n.id === e.target)).toBe(true);
  });
  it("o posicionamento é relativo à origem e há tradução", () => {
    const b = buildPattern(PATTERNS[0]!, { x: 1000, y: 500 }, new Set(), (s) => s, optionFor);
    expect(b.nodes[0]!.x).toBe(1000 + PATTERNS[0]!.nodes[0]!.x);
    for (const p of PATTERNS) for (const s of [p.title, p.summary, ...p.nodes.map((n) => n.name)]) expect(EN[s], s).toBeTruthy();
  });
  it("o padrão de duas zonas cria um grupo por zona", () => { const z = PATTERNS.find((p) => p.id === "multi-zona")!; expect(z.groups).toHaveLength(2); });
});
