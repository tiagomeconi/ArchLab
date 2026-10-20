import { describe, expect, it } from "vitest";
import { placePopover, TOUR_STEPS } from "../../../apps/web/src/tour";

const vp = { w: 1400, h: 900 }, size = { w: 340, h: 170 };
const inside = (p: { x: number; y: number }) => p.x >= 0 && p.y >= 0 && p.x + size.w <= vp.w && p.y + size.h <= vp.h;
const overlap = (p: { x: number; y: number }, r: { x: number; y: number; w: number; h: number }) => p.x < r.x + r.w && p.x + size.w > r.x && p.y < r.y + r.h && p.y + size.h > r.y;

describe("tutorial", () => {
  it("os passos têm texto e alvos únicos", () => {
    const t = TOUR_STEPS.filter((s) => s.target).map((s) => s.target); expect(new Set(t).size).toBe(t.length);
    for (const s of TOUR_STEPS) { expect(s.title.length).toBeGreaterThan(3); expect(s.text.length).toBeGreaterThan(20); }
  });
  it("balão no lado pedido quando cabe", () => {
    const r = { x: 600, y: 300, w: 120, h: 40 };
    expect(placePopover(r, size, vp, "bottom").y).toBeGreaterThan(r.y + r.h);
    expect(placePopover(r, size, vp, "top").y + size.h).toBeLessThan(r.y);
    expect(placePopover(r, size, vp, "left").x + size.w).toBeLessThan(r.x);
    expect(placePopover(r, size, vp, "right").x).toBeGreaterThan(r.x + r.w);
  });
  it("troca de lado quando não cabe e nunca sai da janela nem cobre o destaque", () => {
    const cases = [{ x: 600, y: 850, w: 100, h: 40 }, { x: 5, y: 400, w: 200, h: 60 }, { x: 1250, y: 20, w: 140, h: 40 }, { x: 20, y: 20, w: 40, h: 40 }];
    for (const r of cases) for (const side of ["top", "bottom", "left", "right"] as const) {
      const p = placePopover(r, size, vp, side); expect(inside(p), JSON.stringify([r, side, p])).toBe(true); expect(overlap(p, r), JSON.stringify([r, side, p])).toBe(false);
    }
  });
  it("destaque gigante: cai no centro, dentro da janela", () => {
    const p = placePopover({ x: 0, y: 0, w: 1400, h: 900 }, size, vp, "bottom"); expect(p.side).toBe("center"); expect(inside(p)).toBe(true);
  });
  it("janela pequena: o balão continua dentro (encolhe a margem, não sai)", () => {
    const p = placePopover({ x: 50, y: 50, w: 100, h: 40 }, { w: 300, h: 160 }, { w: 360, h: 640 }, "right");
    expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x + 300).toBeLessThanOrEqual(360);
  });
});
