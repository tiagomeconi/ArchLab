import { useEffect, useState } from "react";
import { authEnabled, useAuth } from "../auth";
import { listDesigns } from "../cloud";

export interface DesignItem { key: string; title: string; snap: any; updatedAt: number }
export const DESIGN_PREFIX = "archlab:design:";
const validSnap = (s: any) => s && Array.isArray(s.n) && Array.isArray(s.e);

/** Desenhos guardados só neste navegador (modo sem conta, ou quando a nuvem não responde). */
export function localDesigns(): DesignItem[] {
  const out: DesignItem[] = [];
  try {
    for (const k of Object.keys(localStorage)) {
      if (!k.startsWith(DESIGN_PREFIX)) continue;
      const key = k.slice(DESIGN_PREFIX.length);
      if (key === "shared" || key === "reference" || key.endsWith(":mine")) continue;
      const raw = JSON.parse(localStorage.getItem(k) ?? "null"); const snap = typeof raw?.snap === "string" ? JSON.parse(raw.snap) : null;
      if (validSnap(snap) && snap.n.length) out.push({ key, title: typeof raw.title === "string" ? raw.title : "", snap, updatedAt: Number(raw.savedAt) || 0 });
    }
  } catch { /* dado antigo ou corrompido */ }
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Desenhos da pessoa: da nuvem quando logada (somados ao que só existe aqui), senão do navegador. `null` enquanto carrega. */
export function useMyDesigns() {
  const auth = useAuth();
  const [items, setItems] = useState<DesignItem[] | null>(null);
  useEffect(() => {
    let alive = true;
    const local = localDesigns();
    if (!authEnabled || auth.status !== "in") { setItems(local); return; }
    listDesigns().then((cloud) => {
      if (!alive) return;
      if (!cloud) { setItems(local); return; }
      const map = new Map<string, DesignItem>();
      for (const d of cloud) if (validSnap(d.snap) && d.snap.n.length) map.set(d.caseKey, { key: d.caseKey, title: d.title, snap: d.snap, updatedAt: d.updatedAt });
      for (const l of local) { const c = map.get(l.key); if (!c || l.updatedAt > c.updatedAt) map.set(l.key, l); }
      setItems([...map.values()].sort((a, b) => b.updatedAt - a.updatedAt));
    });
    return () => { alive = false; };
  }, [auth.status]);
  return [items, setItems] as const;
}
