import { describe, expect, it } from "vitest";
import { clock, PHASES, phaseAt } from "../../../apps/web/src/interview";
import { EN } from "../../../apps/web/src/i18n/en";

describe("modo entrevista", () => {
  it("as fases somam 100% do tempo", () => { expect(PHASES.reduce((a, p) => a + p.share, 0)).toBeCloseTo(1); });
  it("a fase muda no tempo certo e termina em 'tempo esgotado'", () => {
    const total = 45 * 60;
    expect(phaseAt(0, total).phase.id).toBe("req");
    expect(phaseAt(total * 0.13, total).phase.id).toBe("est");
    expect(phaseAt(total * 0.3, total).phase.id).toBe("hld");
    expect(phaseAt(total * 0.8, total).phase.id).toBe("deep");
    expect(phaseAt(total * 0.95, total).phase.id).toBe("wrap");
    const end = phaseAt(total + 1, total); expect(end.over).toBe(true); expect(end.phase.id).toBe("wrap");
  });
  it("segundos até a próxima fase diminuem", () => {
    const a = phaseAt(10, 1800).secondsLeft, b = phaseAt(20, 1800).secondsLeft; expect(b).toBeLessThan(a);
  });
  it("relógio mm:ss, sem negativos", () => { expect(clock(65)).toBe("01:05"); expect(clock(-3)).toBe("00:00"); expect(clock(3600)).toBe("60:00"); });
  it("fases e dicas têm tradução", () => { for (const p of PHASES) { expect(EN[p.label], p.label).toBeTruthy(); expect(EN[p.tip], p.tip).toBeTruthy(); } });
});
