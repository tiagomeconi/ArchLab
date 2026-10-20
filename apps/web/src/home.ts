import { CASES, COMPANY_CASES, type StudyCase } from "./cases";
import type { CaseProgress } from "./progress";

export const LEVELS: StudyCase["level"][] = ["Iniciante", "Intermediário", "Avançado"];
export const ALL_CASES: StudyCase[] = [...COMPANY_CASES, ...CASES];

/** Dados da home: o que retomar, o que sugerir e os números da pessoa. Ignora progresso de casos que não existem mais. */
export function homeSummary(progress: Record<string, CaseProgress>, all: StudyCase[] = ALL_CASES) {
  const done = all.filter((c) => progress[c.id]?.status === "done").length;
  const started = all.filter((c) => progress[c.id]?.status === "started");
  const best = Math.max(0, ...all.map((c) => progress[c.id]?.ovr ?? 0));
  const resume = [...started].sort((a, b) => progress[b.id]!.updatedAt - progress[a.id]!.updatedAt)[0];
  // ainda não tocados, do mais fácil ao mais difícil (a ordem da lista desempata)
  const fresh = all.filter((c) => !progress[c.id]).sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
  const next = resume ?? fresh[0];
  return { total: all.length, done, started: started.length, best, resume, next, suggestions: fresh.filter((c) => c !== next).slice(0, 3) };
}

export const dayPart = (hour: number): "morning" | "afternoon" | "night" => (hour < 5 ? "night" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : "night");
