import { useSyncExternalStore } from "react";
import { EN } from "./en";
import { isLang, LANG_BY_CODE, pickLang, type Lang } from "./languages";

export { LANGUAGES, LANG_BY_CODE, pickLang, type Lang, type LanguageInfo } from "./languages";

/**
 * Idioma da interface. A chave de tradução é o próprio texto em português; o inglês vem junto do código e os demais idiomas
 * são carregados sob demanda (um arquivo por idioma). O que não tiver tradução cai para o inglês e, por fim, para o português.
 */
type Dict = Record<string, string>;
const KEY = "archlab:lang";

const loaders: Partial<Record<Lang, () => Promise<Dict>>> = {
  es: () => import("./lang/es.json").then((m) => m.default as Dict),
  fr: () => import("./lang/fr.json").then((m) => m.default as Dict),
  de: () => import("./lang/de.json").then((m) => m.default as Dict),
  it: () => import("./lang/it.json").then((m) => m.default as Dict),
  ja: () => import("./lang/ja.json").then((m) => m.default as Dict),
  zh: () => import("./lang/zh.json").then((m) => m.default as Dict),
  ko: () => import("./lang/ko.json").then((m) => m.default as Dict),
  ru: () => import("./lang/ru.json").then((m) => m.default as Dict),
};
const dicts: Partial<Record<Lang, Dict>> = { en: EN };

const detect = (): Lang => {
  try { const s = localStorage.getItem(KEY); if (isLang(s)) return s; } catch { /* ignora */ }
  return typeof navigator !== "undefined" ? pickLang(navigator.languages?.length ? navigator.languages : [navigator.language]) : "en";
};
let current: Lang = detect();
const listeners = new Set<() => void>();
const apply = () => { if (typeof document !== "undefined") document.documentElement.lang = LANG_BY_CODE.get(current)!.html; };
apply();

/** Carrega o dicionário do idioma (se ainda não estiver na memória). */
export async function loadLang(l: Lang): Promise<void> {
  if (l === "pt" || dicts[l]) return;
  const load = loaders[l]; if (!load) return;
  try { dicts[l] = await load(); } catch { /* sem rede: segue com o inglês até a próxima tentativa */ }
}
/** Garante o dicionário do idioma atual antes da primeira tela (idiomas além do português e do inglês). */
export const initLang = () => loadLang(current);

const commit = (l: Lang) => {
  current = l;
  try { localStorage.setItem(KEY, l); } catch { /* ignora */ }
  apply(); listeners.forEach((f) => f());
};
/** Troca o idioma. É imediato quando o dicionário já está na memória (português, inglês ou já carregado); senão busca o arquivo do idioma antes. */
export function setLang(l: Lang): Promise<void> {
  if (l === current) return Promise.resolve();
  if (l === "pt" || dicts[l]) { commit(l); return Promise.resolve(); }
  return loadLang(l).then(() => commit(l));
}
export const getLang = () => current;
/** BCP 47 do idioma atual, para datas e números. */
export const localeOf = (l: Lang = current) => LANG_BY_CODE.get(l)!.locale;
/** Faz o componente re-renderizar quando o idioma muda. */
export const useLang = (): Lang => useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => current, () => "pt");

/** Textos sem tradução vistos fora do português (apenas para depuração e testes). */
export const missing = new Set<string>();

const fill = (s: string, vars?: Record<string, string | number>) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s);

/** Traduz um texto escrito em português. Aceita `{nome}` para valores. */
export function t(pt: string, vars?: Record<string, string | number>): string {
  if (current === "pt") return fill(pt, vars);
  const v = dicts[current]?.[pt] ?? EN[pt];
  if (v === undefined) { if (/[a-zà-ÿ]{2}/.test(pt) && pt.length > 3) missing.add(pt); return fill(pt, vars); }
  return fill(v, vars);
}
if (typeof window !== "undefined") (window as any).__i18nMissing = missing;
