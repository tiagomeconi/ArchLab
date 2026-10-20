import { describe, expect, it } from "vitest";
import { birthError, fullNameOk, handleError, initials, needsProfile, passwordOk, sanitizeHandle, suggestedName } from "../../../apps/web/src/account";

describe("regras de cadastro", () => {
  it("senha exige maiúscula, minúscula, número, símbolo e 8+ caracteres", () => {
    for (const bad of ["", "abc", "senhasegura1!", "SENHASEGURA1!", "SenhaSegura!", "SenhaSegura1", "Aa1!", "A".repeat(80) + "a1!"]) expect(passwordOk(bad), bad).toBe(false);
    for (const ok of ["SenhaSegura1!", "Ação#2026x", "x9$Yzzzz"]) expect(passwordOk(ok), ok).toBe(true);
  });
  it("nome completo precisa de nome e sobrenome", () => {
    expect(fullNameOk("Tiago")).toBe(false); expect(fullNameOk("  ")).toBe(false); expect(fullNameOk("Tiago Meconi")).toBe(true);
  });
  it("data de nascimento: formato, calendário, futuro e idade mínima", () => {
    const today = new Date(2026, 9, 19);
    expect(birthError("", today)).not.toBeNull(); expect(birthError("2000-02-30", today)).not.toBeNull();
    expect(birthError("2027-01-01", today)).not.toBeNull(); expect(birthError("1899-01-01", today)).not.toBeNull();
    expect(birthError("2013-10-20", today)).not.toBeNull(); // 12 anos e 364 dias
    expect(birthError("2013-10-19", today)).toBeNull(); expect(birthError("1990-05-17", today)).toBeNull();
  });
  it("iniciais do avatar", () => {
    expect(initials("Tiago Meconi")).toBe("TM"); expect(initials("Ana Maria de Souza")).toBe("AS"); expect(initials("", "zé@x.com")).toBe("ZÉ");
  });
  it("@usuário do perfil público", () => {
    expect(sanitizeHandle("  Tiago.Meconi-99 ")).toBe("tiagomeconi99"); expect(sanitizeHandle("a".repeat(40))).toHaveLength(20);
    for (const ok of ["tiago", "t_m_99", "abc"]) expect(handleError(ok), ok).toBeNull();
    for (const bad of ["", "ab", "Tiago", "tiago!", "a".repeat(21), "admin", "login", "u"]) expect(handleError(bad), bad).not.toBeNull();
  });
});

describe("login social", () => {
  it("cadastro incompleto: falta nascimento ou aceite dos termos", () => {
    expect(needsProfile(undefined)).toBe(true);
    expect(needsProfile({ name: "A B" })).toBe(true);
    expect(needsProfile({ birth_date: "2000-01-01" })).toBe(true);
    expect(needsProfile({ birth_date: "2000-01-01", terms_accepted_at: "2026-10-20T00:00:00Z" })).toBe(false);
  });
  it("nome sugerido vem do provedor e é normalizado", () => {
    expect(suggestedName({ full_name: "  Ana   Souza " })).toBe("Ana Souza");
    expect(suggestedName({ user_name: "anasouza" })).toBe("anasouza");
    expect(suggestedName(null)).toBe("");
  });
});
