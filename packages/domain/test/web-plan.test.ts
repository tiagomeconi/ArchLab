import { describe, expect, it } from "vitest";
import { isLocked, planOf } from "../../../apps/web/src/plan";

describe("planos", () => {
  it("com a restrição desligada, tudo fica liberado", () => {
    for (const l of ["Iniciante", "Intermediário", "Avançado"] as const) expect(isLocked(l, "free", false)).toBe(false);
  });
  it("com a restrição ligada, o gratuito só abre o nível Iniciante e o Pro abre todos", () => {
    expect(isLocked("Iniciante", "free", true)).toBe(false);
    expect(isLocked("Intermediário", "free", true)).toBe(true);
    expect(isLocked("Avançado", "free", true)).toBe(true);
    for (const l of ["Iniciante", "Intermediário", "Avançado"] as const) expect(isLocked(l, "pro", true)).toBe(false);
  });
  it("o plano vem de app_metadata (que o usuário não consegue editar), nunca de user_metadata", () => {
    expect(planOf({ app_metadata: { plan: "pro" }, user_metadata: {} } as any)).toBe("pro");
    expect(planOf({ app_metadata: {}, user_metadata: { plan: "pro" } } as any)).toBe("free");
    expect(planOf(null)).toBe("free");
  });
});
