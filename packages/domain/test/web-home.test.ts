import { describe, expect, it } from "vitest";
import { ALL_CASES, dayPart, homeSummary } from "../../../apps/web/src/home";
import type { CaseProgress } from "../../../apps/web/src/progress";

const p = (o: Partial<CaseProgress>): CaseProgress => ({ met: 1, total: 4, stages: 0, status: "started", updatedAt: 1, ...o });

describe("home", () => {
  it("sem progresso: sugere o caso mais fácil e conta zero", () => {
    const h = homeSummary({});
    expect(h.resume).toBeUndefined(); expect(h.done).toBe(0); expect(h.started).toBe(0); expect(h.best).toBe(0);
    expect(h.next!.level).toBe("Iniciante"); expect(h.suggestions).toHaveLength(3); expect(h.suggestions).not.toContain(h.next);
  });
  it("retoma o caso em andamento mexido por último", () => {
    const [a, b, c] = ALL_CASES;
    const h = homeSummary({ [a!.id]: p({ updatedAt: 10 }), [b!.id]: p({ updatedAt: 99, ovr: 70 }), [c!.id]: p({ status: "done", met: 4, updatedAt: 500, ovr: 88 }) });
    expect(h.resume).toBe(b); expect(h.next).toBe(b); expect(h.done).toBe(1); expect(h.started).toBe(2); expect(h.best).toBe(88);
    expect(h.suggestions.every((s) => ![a, b, c].includes(s))).toBe(true);
  });
  it("ignora progresso de caso que não existe", () => {
    const h = homeSummary({ fantasma: p({ status: "done", ovr: 100 }) });
    expect(h.done).toBe(0); expect(h.best).toBe(0);
  });
  it("tudo concluído: não há o que sugerir", () => {
    const all = Object.fromEntries(ALL_CASES.map((c) => [c.id, p({ status: "done" })]));
    const h = homeSummary(all); expect(h.next).toBeUndefined(); expect(h.suggestions).toEqual([]); expect(h.done).toBe(ALL_CASES.length);
  });
  it("saudação por horário", () => { expect(dayPart(3)).toBe("night"); expect(dayPart(9)).toBe("morning"); expect(dayPart(15)).toBe("afternoon"); expect(dayPart(21)).toBe("night"); });
});
