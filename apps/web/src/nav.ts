import { useEffect, useState } from "react";

/** Roteador mínimo: "/" é a landing e "/app" é o laboratório. */
export function go(path: string) {
  if (location.pathname === path) { window.scrollTo({ top: 0 }); return; }
  history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0 });
}
export function usePath() {
  const [p, setP] = useState(location.pathname);
  useEffect(() => {
    const on = () => setP(location.pathname);
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);
  return p;
}
export const link = (path: string) => ({
  href: path,
  onClick: (e: React.MouseEvent) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); go(path); },
});
