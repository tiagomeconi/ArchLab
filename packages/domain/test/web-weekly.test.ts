import { describe, expect, it } from "vitest";
import { weekStart, weeklyChallenge } from "../../../apps/web/src/home";

describe("desafio da semana", () => {
  it("a semana começa na segunda às 00:00", () => {
    const s = weekStart(new Date(2026, 9, 21, 15, 30)); // quarta, 21/10/2026
    expect(s.getDay()).toBe(1); expect([s.getFullYear(), s.getMonth(), s.getDate(), s.getHours()]).toEqual([2026, 9, 19, 0]);
    expect(weekStart(new Date(2026, 9, 25)).getDate()).toBe(19); // domingo ainda é a mesma semana
    expect(weekStart(new Date(2026, 9, 26)).getDate()).toBe(26);
  });
  it("é o mesmo caso a semana inteira e muda na semana seguinte (em geral)", () => {
    const a = weeklyChallenge(new Date(2026, 9, 19, 8)), b = weeklyChallenge(new Date(2026, 9, 25, 23)), c = weeklyChallenge(new Date(2026, 9, 28));
    expect(a!.case.id).toBe(b!.case.id);
    const ids = new Set(Array.from({ length: 20 }, (_, i) => weeklyChallenge(new Date(2026, 0, 5 + i * 7))!.case.id));
    expect(ids.size).toBeGreaterThan(8); expect(c).toBeTruthy();
  });
  it("faltam entre 1 e 7 dias e sem casos não há desafio", () => {
    const w = weeklyChallenge(new Date(2026, 9, 21))!; expect(w.daysLeft).toBeGreaterThanOrEqual(1); expect(w.daysLeft).toBeLessThanOrEqual(7);
    expect(weeklyChallenge(new Date(), [])).toBeNull();
  });
});
