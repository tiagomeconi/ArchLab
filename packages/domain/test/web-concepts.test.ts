import { describe, expect, it } from "vitest";
import { PALETTE } from "../../../apps/web/src/catalog";
import { CONCEPTS } from "../../../apps/web/src/concepts";
import { EN } from "../../../apps/web/src/i18n/en";

describe("cartões de conceito", () => {
  it("todo componente da paleta (exceto origens de carga) tem um cartão", () => {
    const missing = PALETTE.filter((g) => g.cat !== "origin").flatMap((g) => g.items.map((i) => i.type)).filter((ty) => !CONCEPTS[ty]);
    expect(missing).toEqual([]);
  });
  it("todo texto tem tradução para o inglês", () => {
    for (const [k, c] of Object.entries(CONCEPTS)) for (const s of [c.what, c.when, c.cost]) expect(EN[s], `${k}: ${s}`).toBeTruthy();
  });
});
