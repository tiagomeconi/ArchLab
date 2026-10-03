/** Progresso por caso, guardado só no navegador. */
export interface CaseProgress { met: number; total: number; stages: number; status: "started" | "done"; updatedAt: number; /** melhor nota geral (overall) já alcançada */ ovr?: number }
const KEY = "archlab:progress";

export function loadProgress(): Record<string, CaseProgress> {
  try { const r = localStorage.getItem(KEY); const p = r ? JSON.parse(r) : {}; return p && typeof p === "object" ? p : {}; } catch { return {}; }
}
export function saveCaseProgress(id: string, p: Omit<CaseProgress, "updatedAt">) {
  try {
    const all = loadProgress(); const prev = all[id];
    // nunca regride: guarda o melhor placar e as etapas já cumpridas
    const next: CaseProgress = { ...p, met: Math.max(p.met, prev?.met ?? 0), stages: Math.max(p.stages, prev?.stages ?? 0), updatedAt: Date.now(), ovr: Math.max(p.ovr ?? 0, prev?.ovr ?? 0) || undefined };
    next.status = next.total > 0 && next.met >= next.total ? "done" : prev?.status === "done" ? "done" : p.status;
    localStorage.setItem(KEY, JSON.stringify({ ...all, [id]: next }));
  } catch { /* armazenamento bloqueado */ }
}
export function clearProgress() { try { localStorage.removeItem(KEY); } catch { /* ignora */ } }
