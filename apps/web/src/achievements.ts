import type { StudyCase } from "./cases";
import type { CaseProgress } from "./progress";
import { streakOf } from "./activity";

/** Conquistas: derivadas do progresso e dos dias praticados (sem armazenar nada além do que já existe). */
export interface AchContext { progress: Record<string, CaseProgress>; days: string[]; cases: StudyCase[] }
export interface AchDef { id: string; icon: string; title: string; desc: string; goal: number; value: (c: AchContext) => number }
export interface Ach extends AchDef { have: number; unlocked: boolean; pct: number }

const mine = (c: AchContext) => c.cases.filter((x) => c.progress[x.id]);
const done = (c: AchContext) => c.cases.filter((x) => c.progress[x.id]?.status === "done");
const best = (c: AchContext) => Math.max(0, ...mine(c).map((x) => c.progress[x.id]!.ovr ?? 0));

export const ACHIEVEMENTS: AchDef[] = [
  { id: "first-step", icon: "flag", title: "Primeiro passo", desc: "Comece o seu primeiro caso.", goal: 1, value: (c) => mine(c).length },
  { id: "first-clear", icon: "task_alt", title: "Missão cumprida", desc: "Conclua um caso.", goal: 1, value: (c) => done(c).length },
  { id: "warm-up", icon: "bolt", title: "Aquecimento", desc: "Conclua 3 casos.", goal: 3, value: (c) => done(c).length },
  { id: "explorer", icon: "explore", title: "Explorador", desc: "Comece 10 casos diferentes.", goal: 10, value: (c) => mine(c).length },
  { id: "veteran", icon: "school", title: "Veterano", desc: "Conclua 10 casos.", goal: 10, value: (c) => done(c).length },
  { id: "marathon", icon: "emoji_events", title: "Maratonista", desc: "Conclua 25 casos.", goal: 25, value: (c) => done(c).length },
  { id: "high-score", icon: "military_tech", title: "Nota alta", desc: "Chegue a 80 de nota geral em um caso.", goal: 80, value: best },
  { id: "diamond", icon: "diamond", title: "Perfeição", desc: "Chegue a 90 de nota geral em um caso (liga Diamante).", goal: 90, value: best },
  { id: "big-tech", icon: "business", title: "Grandes empresas", desc: "Conclua 5 casos de empresas.", goal: 5, value: (c) => done(c).filter((x) => x.company).length },
  { id: "classics", icon: "hub", title: "Clássicos", desc: "Conclua 5 sistemas clássicos.", goal: 5, value: (c) => done(c).filter((x) => !x.company).length },
  { id: "hard-mode", icon: "rocket_launch", title: "Desafio avançado", desc: "Conclua um caso de nível Avançado.", goal: 1, value: (c) => done(c).filter((x) => x.level === "Avançado").length },
  { id: "versatile", icon: "category", title: "Versátil", desc: "Conclua pelo menos um caso de cada categoria.", goal: 0, value: (c) => new Set(done(c).map((x) => x.group)).size },
  { id: "streak-3", icon: "local_fire_department", title: "Constância", desc: "Pratique 3 dias seguidos.", goal: 3, value: (c) => streakOf(c.days).best },
  { id: "streak-7", icon: "local_fire_department", title: "Semana de fogo", desc: "Pratique 7 dias seguidos.", goal: 7, value: (c) => streakOf(c.days).best },
  { id: "streak-30", icon: "calendar_month", title: "Mês de foco", desc: "Pratique 30 dias seguidos.", goal: 30, value: (c) => streakOf(c.days).best },
];

export function evaluateAchievements(ctx: AchContext): Ach[] {
  const groups = new Set(ctx.cases.map((x) => x.group)).size;
  return ACHIEVEMENTS.map((a) => {
    const goal = a.id === "versatile" ? groups : a.goal; const have = a.value(ctx);
    return { ...a, goal, have: Math.min(have, goal), unlocked: have >= goal, pct: goal ? Math.min(100, Math.round((have / goal) * 100)) : 0 };
  });
}

const SEEN = "archlab:ach-seen";
/** Conquistas desbloqueadas que a pessoa ainda não viu (e as marca como vistas). A primeira abertura não dispara aviso de nada antigo se `silent`. */
export function takeNewlyUnlocked(list: Ach[], silent = false): Ach[] {
  try {
    const first = localStorage.getItem(SEEN) === null;
    const seen = new Set<string>(JSON.parse(localStorage.getItem(SEEN) ?? "[]"));
    const fresh = list.filter((a) => a.unlocked && !seen.has(a.id));
    localStorage.setItem(SEEN, JSON.stringify([...new Set([...seen, ...list.filter((a) => a.unlocked).map((a) => a.id)])]));
    return first || silent ? [] : fresh;
  } catch { return []; }
}
