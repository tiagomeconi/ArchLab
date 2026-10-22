import { describe, expect, it } from "vitest";
import { DOCS, DOC_LEVELS, DOC_SECTIONS, bi } from "../../../apps/web/src/docs";

import type { Bi, DocBlock } from "../../../apps/web/src/docs";
const pairs = (b: DocBlock): Bi[] => (b.k === "code" ? [] : b.k === "ul" ? [...b.x] : b.k === "table" ? [...b.head, ...b.rows.flat()] : b.k === "fig" ? [b.cap, ...b.cols.flat().map((n) => n.label).filter((x): x is Bi => typeof x !== "string"), ...b.edges.map((e) => e.label).filter((x): x is Bi => !!x && typeof x !== "string")] : [b.x]);
const size = (b: DocBlock) => (b.k === "code" ? b.x.length : b.k === "fig" ? 0 : pairs(b).reduce((n, x) => n + x[0].length, 0));

/** Piso de texto por artigo (caracteres em português, sem contar diagramas). */
const MIN_CHARS = 5000;

describe("aulas em formato de documentação", () => {
  it("ids únicos, cada artigo numa seção válida e toda seção tem artigos", () => {
    expect(new Set(DOCS.map((d) => d.id)).size).toBe(DOCS.length);
    const secs = new Set(DOC_SECTIONS.map((s) => s.id));
    for (const d of DOCS) { expect(secs.has(d.section), d.id).toBe(true); expect(DOC_LEVELS[d.level], d.id).toBeDefined(); expect(d.minutes, d.id).toBeGreaterThan(0); }
    for (const s of DOC_SECTIONS) expect(DOCS.some((d) => d.section === s.id), s.id).toBe(true);
  });
  it("artigos são densos: subtítulos, texto longo e pelo menos um recurso visual (diagrama, tabela ou código)", () => {
    for (const d of DOCS) {
      expect(d.body.filter((b) => b.k === "h").length, d.id).toBeGreaterThanOrEqual(3);
      expect(d.body.reduce((n, b) => n + size(b), 0), d.id).toBeGreaterThan(MIN_CHARS);
      expect(d.body.some((b) => b.k === "fig" || b.k === "table" || b.k === "code"), d.id).toBe(true);
    }
  });
  it("diagramas: setas ligam nós que existem e ids de nó são únicos", () => {
    for (const d of DOCS) for (const b of d.body) if (b.k === "fig") {
      const ids = b.cols.flat().map((n) => n.id);
      expect(new Set(ids).size, d.id).toBe(ids.length);
      for (const e of b.edges) { expect(ids, `${d.id}: ${e.from}`).toContain(e.from); expect(ids, `${d.id}: ${e.to}`).toContain(e.to); }
    }
  });
  it("todo texto existe em português e inglês e a marcação está fechada", () => {
    for (const d of DOCS) {
      for (const [pt, en] of [d.title, d.summary, ...d.body.flatMap(pairs)]) {
        expect(pt.trim().length, d.id).toBeGreaterThan(0);
        expect(en.trim().length, d.id).toBeGreaterThan(0);
        for (const s of [pt, en]) { expect((s.match(/\*\*/g) ?? []).length % 2, `${d.id}: ${s}`).toBe(0); expect((s.match(/`/g) ?? []).length % 2, `${d.id}: ${s}`).toBe(0); }
      }
      expect(d.body.some((b) => b.k === "h"), d.id).toBe(true);
    }
  });
  it("bi escolhe pt ou en (outros idiomas usam o inglês)", () => {
    expect(bi(["a", "b"], "pt")).toBe("a");
    expect(bi(["a", "b"], "de")).toBe("b");
    expect(pairs({ k: "p", x: ["a", "b"] })).toEqual([["a", "b"]]);
  });
});
