import { describe, expect, it } from "vitest";
import { dayKey, streakOf, weekStrip } from "../../../apps/web/src/activity";
import { ACHIEVEMENTS, evaluateAchievements } from "../../../apps/web/src/achievements";
import { thumbOf } from "../../../apps/web/src/thumbnail";
import { ALL_CASES } from "../../../apps/web/src/home";
import type { CaseProgress } from "../../../apps/web/src/progress";

const today = new Date(2026, 9, 19); // 19/10/2026
const d = (back: number) => dayKey(new Date(2026, 9, 19 - back));
const p = (o: Partial<CaseProgress> = {}): CaseProgress => ({ met: 1, total: 4, stages: 0, status: "started", updatedAt: 1, ...o });

describe("sequência de dias", () => {
  it("conta dias seguidos terminando hoje", () => { expect(streakOf([d(0), d(1), d(2)], today)).toMatchObject({ current: 3, best: 3, practicedToday: true }); });
  it("não zera antes do dia acabar: ontem ainda vale", () => { expect(streakOf([d(1), d(2)], today)).toMatchObject({ current: 2, practicedToday: false }); });
  it("zera quando passa um dia inteiro sem praticar", () => { expect(streakOf([d(2), d(3)], today)).toMatchObject({ current: 0, best: 2 }); });
  it("guarda a melhor sequência da história", () => { expect(streakOf([d(0), d(10), d(11), d(12), d(13)], today)).toMatchObject({ current: 1, best: 4 }); });
  it("atravessa virada de mês e de ano e ignora lixo e repetidos", () => {
    const t = new Date(2027, 0, 2);
    expect(streakOf(["2027-01-02", "2027-01-01", "2026-12-31", "2026-12-31", "lixo", "2026-13-99x"], t).current).toBe(3);
    expect(streakOf([], today)).toEqual({ current: 0, best: 0, practicedToday: false, total: 0 });
  });
  it("fileira dos últimos 7 dias", () => {
    const w = weekStrip([d(0), d(2)], today);
    expect(w).toHaveLength(7); expect(w[6]).toMatchObject({ today: true, on: true }); expect(w[4]!.on).toBe(true); expect(w.filter((x) => x.on)).toHaveLength(2);
  });
});

describe("conquistas", () => {
  const ctx = (progress: Record<string, CaseProgress>, days: string[] = []) => ({ progress, days, cases: ALL_CASES });
  const get = (list: ReturnType<typeof evaluateAchievements>, id: string) => list.find((a) => a.id === id)!;
  it("tem ids únicos e começa tudo bloqueado", () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    expect(evaluateAchievements(ctx({})).every((a) => !a.unlocked && a.pct === 0)).toBe(true);
  });
  it("progresso parcial mostra quanto falta", () => {
    const [a, b] = ALL_CASES; const l = evaluateAchievements(ctx({ [a!.id]: p({ status: "done" }), [b!.id]: p() }));
    expect(get(l, "first-step").unlocked).toBe(true); expect(get(l, "first-clear").unlocked).toBe(true);
    expect(get(l, "warm-up")).toMatchObject({ unlocked: false, have: 1, goal: 3, pct: 33 });
  });
  it("notas altas liberam as de nota", () => {
    const [a] = ALL_CASES; const l = evaluateAchievements(ctx({ [a!.id]: p({ ovr: 91 }) }));
    expect(get(l, "high-score").unlocked).toBe(true); expect(get(l, "diamond").unlocked).toBe(true);
    expect(get(evaluateAchievements(ctx({ [a!.id]: p({ ovr: 85 }) })), "diamond").unlocked).toBe(false);
  });
  it("versátil exige todas as categorias; sequência usa a melhor", () => {
    const all = Object.fromEntries(ALL_CASES.map((c) => [c.id, p({ status: "done" })]));
    const l = evaluateAchievements(ctx(all, [d(0), d(1), d(2), d(3), d(4), d(5), d(6)]));
    expect(get(l, "versatile").unlocked).toBe(true); expect(get(l, "marathon").unlocked).toBe(true);
    expect(get(l, "streak-7").unlocked).toBe(true); expect(get(l, "streak-30").unlocked).toBe(false);
  });
  it("ignora progresso de casos que não existem mais", () => { expect(get(evaluateAchievements(ctx({ fantasma: p({ status: "done", ovr: 99 }) })), "first-step").unlocked).toBe(false); });
});

describe("miniatura do desenho", () => {
  it("cabe na caixa e mantém as conexões", () => {
    const t = thumbOf({ n: [{ id: "a", x: 0, y: 0, d: { type: "client" } }, { id: "b", x: 900, y: 400, w: 240, d: { type: "redis" } }], e: [{ source: "a", target: "b" }, { source: "a", target: "zz" }] });
    expect(t.nodes).toHaveLength(2); expect(t.edges).toHaveLength(1);
    for (const n of t.nodes) { expect(n.x).toBeGreaterThanOrEqual(0); expect(n.x + n.w).toBeLessThanOrEqual(t.w); expect(n.y + n.h).toBeLessThanOrEqual(t.h); }
    expect(t.nodes[1]!.cat).toBe("data");
  });
  it("desenho vazio ou inválido não quebra", () => { expect(thumbOf(null).nodes).toEqual([]); expect(thumbOf({ n: [{ id: "x", x: NaN, y: 0 }] }).nodes).toEqual([]); });
});

import { heatmapWeeks, monthStarts } from "../../../apps/web/src/heatmap";
describe("calendário de atividade", () => {
  const t0 = new Date(2026, 9, 19); // segunda, 19/10/2026
  it("tem N colunas de 7 dias, termina na semana de hoje e marca o que é futuro", () => {
    const g = heatmapWeeks([], 26, t0);
    expect(g).toHaveLength(26); expect(g.every((c) => c.length === 7)).toBe(true);
    const cells = g.flat(); expect(cells.filter((c) => c.today)).toHaveLength(1);
    expect(g[25]![1]!.today).toBe(true); // segunda-feira = índice 1
    expect(g[25]!.slice(2).every((c) => c.future)).toBe(true); expect(cells.filter((c) => c.future)).toHaveLength(5);
    expect(g[0]![0]!.key < g[25]![0]!.key).toBe(true);
  });
  it("marca os dias praticados, ignora datas fora da janela e não repete dias", () => {
    const g = heatmapWeeks([dayKey(t0), d(1), d(1), "2020-01-01"], 4, t0);
    expect(g.flat().filter((c) => c.on)).toHaveLength(2);
  });
  it("janela de uma semana funciona e os meses começam em colunas crescentes", () => {
    expect(heatmapWeeks([], 1, t0)).toHaveLength(1);
    const ms = monthStarts(heatmapWeeks([], 40, t0)); expect(ms.length).toBeGreaterThan(5);
    expect(ms.every((m, i) => i === 0 || m.col > ms[i - 1]!.col)).toBe(true);
  });
});
