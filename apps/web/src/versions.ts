/** Versões nomeadas de um desenho, guardadas só neste navegador (ficam junto do desenho, por chave). */
export interface Version { id: string; name: string; at: number; snap: string }
const MAX = 20, MAX_SNAP = 1_500_000;
const k = (key: string) => `archlab:versions:${key}`;

export function loadVersions(key: string): Version[] {
  try {
    const r = JSON.parse(localStorage.getItem(k(key)) ?? "[]");
    return Array.isArray(r) ? r.filter((v): v is Version => !!v && typeof v.id === "string" && typeof v.name === "string" && typeof v.at === "number" && typeof v.snap === "string") : [];
  } catch { return []; }
}
const write = (key: string, list: Version[]) => { try { localStorage.setItem(k(key), JSON.stringify(list)); return true; } catch { return false; } };

/** Guarda uma versão (a mais nova primeiro). Devolve `null` se o desenho for grande demais ou o armazenamento estiver bloqueado. */
export function saveVersion(key: string, name: string, snap: string, now = Date.now()): Version[] | null {
  if (snap.length > MAX_SNAP) return null;
  const list = [{ id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`, name: name.trim().slice(0, 60) || "Versão", at: now, snap }, ...loadVersions(key)].slice(0, MAX);
  return write(key, list) ? list : null;
}
export function deleteVersion(key: string, id: string): Version[] { const list = loadVersions(key).filter((v) => v.id !== id); write(key, list); return list; }
