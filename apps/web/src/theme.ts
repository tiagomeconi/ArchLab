import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const KEY = "archlab:theme";

function readInitial(): Theme {
  try { const s = localStorage.getItem(KEY); if (s === "light" || s === "dark") return s; } catch { /* armazenamento bloqueado */ }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function apply(t: Theme) {
  const root = document.documentElement;
  root.dataset.theme = t;
  root.classList.toggle("dark", t === "dark"); // componentes do Magic UI usam a classe .dark
  root.style.colorScheme = t;
}

let current: Theme = typeof document === "undefined" ? "dark" : ((document.documentElement.dataset.theme as Theme | undefined) ?? readInitial());
if (typeof document !== "undefined") apply(current);
const listeners = new Set<() => void>();

/** Aplica o tema de forma síncrona (necessário para a View Transition capturar o novo visual). */
export function setTheme(t: Theme) {
  current = t; apply(t);
  try { localStorage.setItem(KEY, t); } catch { /* ignorado */ }
  listeners.forEach((l) => l());
}
export function useTheme(): Theme {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => current, () => "dark");
}
