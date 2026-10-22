import { describe, expect, it } from "vitest";
import { PROVIDERS, FALLBACK_ICON } from "../../../apps/web/src/providers";
import { LOGOS } from "../../../apps/web/src/logos.generated";
import { PALETTE } from "../../../apps/web/src/catalog";

describe("tecnologias da paleta", () => {
  const all = new Map<string, { name: string; types: string[] }>();
  for (const [type, list] of Object.entries(PROVIDERS)) for (const p of list) { const e = all.get(p.id) ?? { name: p.name, types: [] }; e.types.push(type); all.set(p.id, e); }

  it("todo componente da paleta tem tecnologias para escolher", () => {
    for (const g of PALETTE) for (const i of g.items) expect(PROVIDERS[i.type]?.length, i.type).toBeGreaterThan(0);
  });
  it("toda tecnologia tem logo vetorial ou, no mínimo, um ícone próprio (nunca só a inicial)", () => {
    const sem = [...all].filter(([id]) => !LOGOS[id] && !FALLBACK_ICON[id]).map(([id, e]) => `${id} (${e.name})`);
    expect(sem).toEqual([]);
  });
  it("a maioria das tecnologias tem a marca de verdade", () => {
    const comLogo = [...all.keys()].filter((id) => LOGOS[id]).length;
    expect(comLogo / all.size).toBeGreaterThan(0.85);
  });
  it("ids de tecnologia são únicos dentro de cada componente", () => {
    for (const [type, list] of Object.entries(PROVIDERS)) expect(new Set(list.map((p) => p.id)).size, type).toBe(list.length);
  });
  it("n8n e Node-RED são achados pelo nome e dizem em que componente moram", () => {
    const where = (id: string) => Object.entries(PROVIDERS).filter(([, l]) => l.some((p) => p.id === id)).map(([t]) => t);
    expect(where("n8n")).toContain("workflow-engine");
    expect(where("nodered")).toEqual(expect.arrayContaining(["iot-gateway", "edge-compute"]));
  });
});
