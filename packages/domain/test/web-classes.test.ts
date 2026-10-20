import { describe, expect, it } from "vitest";
import { groupProgress, JOIN_CODE, normalizeCode, studentLabel } from "../../../apps/web/src/classes";

describe("turmas (cliente)", () => {
  it("código de entrada: normaliza espaços e caixa, e valida 8 letras ou números", () => {
    expect(normalizeCode("  ab12 cd34 ")).toBe("AB12CD34");
    expect(JOIN_CODE.test(normalizeCode("ab12cd34"))).toBe(true);
    for (const bad of ["", "abc", "ab12cd3", "ab12cd345", "ab12-cd3"]) expect(JOIN_CODE.test(normalizeCode(bad)), bad).toBe(false);
  });
  it("agrupa o progresso por aluno e por caso", () => {
    const rows = [
      { user_id: "u1", full_name: "Ana Souza", case_id: "netflix", met: 6, total: 6, status: "done", ovr: 84 },
      { user_id: "u1", full_name: "Ana Souza", case_id: "uber", met: 0, total: 0, status: "none", ovr: null },
      { user_id: "u2", full_name: "", case_id: "netflix", met: 2, total: 6, status: "started", ovr: 50 },
    ];
    const s = groupProgress(rows);
    expect(s).toHaveLength(2);
    expect(s[0]!.cells.netflix).toMatchObject({ status: "done", ovr: 84 });
    expect(s[0]!.cells.uber!.status).toBe("none");
    expect(studentLabel(s[1]!, 1, "Aluno")).toBe("Aluno 2");
    expect(studentLabel(s[0]!, 0, "Aluno")).toBe("Ana Souza");
  });
});
