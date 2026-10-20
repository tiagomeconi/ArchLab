/** Progresso nas aulas, guardado só neste navegador. */
export interface LessonProgress { step: number; done: boolean; at: number }
const KEY = "archlab:lessons";

export function loadLessons(): Record<string, LessonProgress> {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) ?? "{}"); if (!r || typeof r !== "object") return {};
    const out: Record<string, LessonProgress> = {};
    for (const [id, v] of Object.entries(r as Record<string, any>)) if (v && Number.isInteger(v.step) && v.step >= 0 && typeof v.done === "boolean") out[id] = { step: v.step, done: v.done, at: Number(v.at) || 0 };
    return out;
  } catch { return {}; }
}
export function saveLesson(id: string, p: Omit<LessonProgress, "at">, now = Date.now()) {
  try {
    const all = loadLessons(); const prev = all[id];
    // concluir nunca volta atrás; o passo só avança
    localStorage.setItem(KEY, JSON.stringify({ ...all, [id]: { step: Math.max(p.step, prev?.step ?? 0), done: p.done || !!prev?.done, at: now } }));
  } catch { /* armazenamento bloqueado */ }
}
export function resetLesson(id: string) { try { const all = loadLessons(); delete all[id]; localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* ignora */ } }
export const lessonsDone = (all: Record<string, LessonProgress>) => Object.values(all).filter((l) => l.done).length;
