import { describe, expect, it } from "vitest";
import { PATHS, pathProgress } from "../../../apps/web/src/paths";
import { caseById } from "../../../apps/web/src/cases";
import { EN } from "../../../apps/web/src/i18n/en";

describe("trilhas de estudo", () => {
  it("todo passo aponta para um caso que existe, sem repetir na mesma trilha", () => {
    for (const p of PATHS) {
      const ids = p.steps.map((s) => s.caseId);
      for (const id of ids) expect(caseById(id), `${p.id}: ${id}`).toBeTruthy();
      expect(new Set(ids).size, p.id).toBe(ids.length);
    }
  });
  it("cada trilha sobe de dificuldade (nunca volta para um nível mais fácil)", () => {
    const rank = { Iniciante: 0, "Intermediário": 1, "Avançado": 2 } as const;
    for (const p of PATHS) { const lv = p.steps.map((s) => rank[caseById(s.caseId)!.level]); expect(lv, p.id).toEqual([...lv].sort((a, b) => a - b)); }
  });
  it("tudo tem tradução", () => {
    for (const p of PATHS) for (const s of [p.title, p.summary, ...p.steps.map((x) => x.goal)]) expect(EN[s], s).toBeTruthy();
  });
  it("progresso: conta os concluídos e indica o próximo", () => {
    const p = PATHS[0]!;
    const r = pathProgress(p, (id) => id === p.steps[0]!.caseId || id === p.steps[1]!.caseId);
    expect(r.done).toBe(2); expect(r.total).toBe(p.steps.length); expect(r.next?.caseId).toBe(p.steps[2]!.caseId);
    expect(pathProgress(p, () => true).next).toBeUndefined();
  });
});
