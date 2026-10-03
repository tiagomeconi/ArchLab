import { useSyncExternalStore } from "react";
import { EN } from "./en";

/** Idioma da interface. A chave de tradução é o próprio texto em português: o que não tiver tradução aparece em português. */
export type Lang = "pt" | "en";
const KEY = "archlab:lang";

const detect = (): Lang => {
  try { const s = localStorage.getItem(KEY); if (s === "pt" || s === "en") return s; } catch { /* ignora */ }
  return typeof navigator !== "undefined" && /^pt/i.test(navigator.language) ? "pt" : "en";
};
let current: Lang = detect();
const listeners = new Set<() => void>();
const apply = () => { if (typeof document !== "undefined") document.documentElement.lang = current === "pt" ? "pt-BR" : "en"; };
apply();

export function setLang(l: Lang) {
  if (l === current) return;
  current = l;
  try { localStorage.setItem(KEY, l); } catch { /* ignora */ }
  apply(); listeners.forEach((f) => f());
}
export const getLang = () => current;
/** Faz o componente re-renderizar quando o idioma muda. */
export const useLang = (): Lang => useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => current, () => "pt");

/** Textos sem tradução vistos em inglês (apenas para depuração e testes). */
export const missing = new Set<string>();

const fill = (s: string, vars?: Record<string, string | number>) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s);

/** Traduz um texto escrito em português. Aceita `{nome}` para valores. */
export function t(pt: string, vars?: Record<string, string | number>): string {
  if (current === "pt") return fill(pt, vars);
  const en = EN[pt];
  if (en === undefined) { if (/[a-zà-ÿ]{2}/.test(pt) && pt.length > 3) missing.add(pt); return fill(pt, vars); }
  return fill(en, vars);
}
if (typeof window !== "undefined") (window as any).__i18nMissing = missing;
