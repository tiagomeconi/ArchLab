import { describe, expect, it } from "vitest";
import { shapeFactor } from "../../../apps/web/src/trafficShape";

describe("formato do tráfego", () => {
  it("constante vale 1 o tempo todo", () => { for (const t of [0, 100, 300]) expect(shapeFactor("flat", t)).toBe(1); });
  it("pico repentino: 1× antes, 3× no meio da janela e volta a 1×", () => {
    expect(shapeFactor("spike", 50)).toBe(1);
    expect(shapeFactor("spike", 130)).toBe(3);
    expect(shapeFactor("spike", 200)).toBe(1);
    expect(shapeFactor("spike", 105)).toBeGreaterThan(1); expect(shapeFactor("spike", 105)).toBeLessThan(3);
  });
  it("ciclo diário: vale nas pontas e pico no meio, nunca acima de 1", () => {
    expect(shapeFactor("daily", 0)).toBeCloseTo(0.35); expect(shapeFactor("daily", 150)).toBeCloseTo(1); expect(shapeFactor("daily", 300)).toBeCloseTo(0.35);
    for (let t = 0; t <= 300; t += 10) expect(shapeFactor("daily", t)).toBeLessThanOrEqual(1.0001);
  });
  it("crescimento sobe de 25% a 150%", () => {
    expect(shapeFactor("ramp", 0)).toBeCloseTo(0.25); expect(shapeFactor("ramp", 300)).toBeCloseTo(1.5);
  });
});
