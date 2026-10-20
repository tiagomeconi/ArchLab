import { describe, expect, it } from "vitest";
import { LEAGUES, leagueOf, leagueProgress, profileOverall } from "../../../apps/web/src/leagues";
import { cropRect } from "../../../apps/web/src/avatar";

describe("ligas", () => {
  it("são 10, na ordem do material, uma a cada 10 pontos", () => {
    expect(LEAGUES.map((l) => l.id)).toEqual(["bronze", "silver", "gold", "sapphire", "ruby", "emerald", "amethyst", "pearl", "obsidian", "diamond"]);
    expect([0, 9, 10, 19, 29, 30, 49, 59, 69, 79, 89, 90, 99, 100].map((n) => leagueOf(n).index)).toEqual([0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9]);
  });
  it("valores fora da faixa ficam nas pontas", () => { expect(leagueOf(-5).id).toBe("bronze"); expect(leagueOf(250).id).toBe("diamond"); });
  it("progresso dentro da liga e o que falta para a próxima", () => {
    expect(leagueProgress(37)).toMatchObject({ into: 7, pct: 70, toNext: 3, next: { id: "ruby" } });
    expect(leagueProgress(30)).toMatchObject({ into: 0, toNext: 10 });
    expect(leagueProgress(99)).toMatchObject({ league: { id: "diamond" }, next: null, toNext: 0, pct: 100 });
  });
  it("overall do perfil é a média das melhores notas dos casos jogados", () => {
    expect(profileOverall([])).toBeNull(); expect(profileOverall([undefined, 0])).toBeNull();
    expect(profileOverall([80, 60, undefined])).toBe(70); expect(profileOverall([71, 72])).toBe(72);
  });
  it("todas as ligas têm cores válidas e formatos distintos por faixa", () => {
    for (const l of LEAGUES) { expect(l.c1).toMatch(/^#[0-9a-f]{6}$/i); expect(l.c2).toMatch(/^#[0-9a-f]{6}$/i); }
    expect(new Set(LEAGUES.map((l) => l.shape)).size).toBe(4);
  });
});

describe("foto de perfil", () => {
  it("recorta o quadrado central", () => {
    expect(cropRect(400, 200)).toEqual({ sx: 100, sy: 0, s: 200 }); expect(cropRect(100, 300)).toEqual({ sx: 0, sy: 100, s: 100 }); expect(cropRect(50, 50)).toEqual({ sx: 0, sy: 0, s: 50 });
  });
});
