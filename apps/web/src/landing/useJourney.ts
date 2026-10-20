import { useMemo } from "react";
import { ALL_CASES } from "../home";
import { evaluateAchievements } from "../achievements";
import { loadDays } from "../activity";
import { leagueProgress, profileOverall } from "../leagues";
import { loadProgress, type CaseProgress } from "../progress";

/** Tudo o que a "jornada" da pessoa mostra: nota do perfil, liga, conquistas e dias. Sem argumentos usa os dados locais (já unidos à nuvem no login). */
export function journeyOf(progress: Record<string, CaseProgress>, days: string[]) {
  const overall = profileOverall(ALL_CASES.map((c) => progress[c.id]?.ovr));
  const ach = evaluateAchievements({ progress, days, cases: ALL_CASES });
  return { progress, days, overall, league: overall === null ? null : leagueProgress(overall), ach, unlocked: ach.filter((a) => a.unlocked).length };
}
export const useJourney = () => useMemo(() => journeyOf(loadProgress(), loadDays()), []);
