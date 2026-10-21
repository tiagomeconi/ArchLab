import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { isLang, LANGUAGES, pickLang } from "../../../apps/web/src/i18n/languages";
import { EN } from "../../../apps/web/src/i18n/en";

const ph = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort();
const dir = new URL("../../../apps/web/src/i18n/lang/", import.meta.url);
const LAZY = LANGUAGES.map((l) => l.code).filter((c) => c !== "pt" && c !== "en");

describe("idiomas disponíveis", () => {
  it("cada idioma tem código único, bandeira, sigla e locale", () => {
    expect(new Set(LANGUAGES.map((l) => l.code)).size).toBe(LANGUAGES.length);
    for (const l of LANGUAGES) { expect(l.flag).toMatch(/^[A-Z]{2}$/); expect(l.short).toMatch(/^[A-Z]{2}$/); expect(l.locale).toMatch(/^[a-z]{2}-[A-Z]{2}$/); expect(l.name.length).toBeGreaterThan(1); }
    expect(isLang("pt") && isLang("ja") && !isLang("xx") && !isLang(undefined)).toBe(true);
  });
  it("o idioma do navegador escolhe o idioma da interface", () => {
    expect(pickLang(["es-MX", "en"])).toBe("es");
    expect(pickLang(["pt-PT"])).toBe("pt");
    expect(pickLang(["zh-Hans-CN"])).toBe("zh");
    expect(pickLang(["fr-CA", "de"])).toBe("fr");
    expect(pickLang(["ko", "ja"])).toBe("ko");
    expect(pickLang(["ru-RU"])).toBe("ru");
    expect(pickLang(["xx", "it-IT"])).toBe("it");     // pula o que não existe e usa a próxima preferência
    expect(pickLang(["ar", "hi"])).toBe("en");        // sem correspondência: inglês
    expect(pickLang([])).toBe("en"); expect(pickLang(undefined)).toBe("en");
  });
});

describe.each(LAZY)("tradução: %s", (code) => {
  const file = new URL(`${code}.json`, dir);
  const dict: Record<string, string> = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  const keys = Object.keys(EN);
  it("cobre quase todos os textos da interface", () => {
    const have = keys.filter((k) => dict[k] !== undefined).length;
    expect(have / keys.length, `${code}: ${have}/${keys.length}`).toBeGreaterThanOrEqual(0.97);
  });
  it("não tem chaves que não existem mais, nem tradução vazia", () => {
    const stale = Object.keys(dict).filter((k) => EN[k] === undefined);
    expect(stale.slice(0, 5), `${code}: chaves órfãs`).toEqual([]);
    for (const [k, v] of Object.entries(dict)) expect(v.trim(), k).not.toBe("");
  });
  it("preserva {valores} e marcadores **negrito** de cada texto", () => {
    for (const [k, v] of Object.entries(dict)) {
      if (EN[k] === undefined) continue;
      expect(ph(v), `${code}: ${k}`).toEqual(ph(k));
      expect(v.split("**").length, `${code}: ** em ${k}`).toBe(k.split("**").length);
    }
  });
});
