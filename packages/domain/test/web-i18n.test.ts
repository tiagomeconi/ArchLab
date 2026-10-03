import { describe, expect, it } from "vitest";
import { EN } from "../../../apps/web/src/i18n/en";
import { getLang, setLang, t } from "../../../apps/web/src/i18n";
import { CASES, COMPANY_CASES, checksOf } from "../../../apps/web/src/cases";

const ph = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort();

describe("traduções (en)", () => {
  it("nenhuma tradução está vazia", () => {
    for (const [k, v] of Object.entries(EN)) expect(v.trim(), k).not.toBe("");
  });
  it("os {valores} do texto original aparecem na tradução, e só eles", () => {
    for (const [k, v] of Object.entries(EN)) expect(ph(v), `"${k}"`).toEqual(ph(k));
  });
  it("todo texto dos casos de estudo tem tradução", () => {
    const missing = new Set<string>();
    const ids = new Set(["cdn", "redis", "kafka", "api-gateway", "nosql-database", "object-storage", "queue", "worker", "sql-database", "search-engine", "websocket", "load-balancer", "notification-service"]);
    const walk = (v: unknown) => {
      if (typeof v === "string") { if (/[a-zA-Zà-ÿ]{3}/.test(v) && !ids.has(v) && EN[v] === undefined) missing.add(v); }
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    for (const c of [...COMPANY_CASES, ...CASES]) {
      walk({ title: c.title, summary: c.summary, concepts: c.concepts, req: c.req, focus: c.company?.focus });
      const k = checksOf(c.id); if (k) { walk(k.needs); walk((k.paths ?? []).map((p) => [p.label, p.why])); }
    }
    expect([...missing]).toEqual([]);
  });
});

describe("t()", () => {
  it("em português devolve o texto e preenche valores", () => {
    setLang("pt");
    expect(t("Seu progresso")).toBe("Seu progresso");
    expect(t("{n} em andamento", { n: 3 })).toBe("3 em andamento");
  });
  it("em inglês traduz, preenche valores e cai para o português quando não há tradução", () => {
    setLang("en");
    expect(getLang()).toBe("en");
    expect(t("Seu progresso")).toBe("Your progress");
    expect(t("{n} em andamento", { n: 3 })).toBe("3 in progress");
    expect(t("texto sem tradução {x}", { x: 1 })).toBe("texto sem tradução 1");
    setLang("pt");
  });
});
