/** Ligas: a nota geral (0–100) vira um material a cada 10 pontos. Funções puras (testadas no vitest). */
export interface League { id: string; index: number; name: string; c1: string; c2: string; shape: "shield" | "hex" | "gem" | "crystal" }
const L = (index: number, id: string, name: string, c1: string, c2: string, shape: League["shape"]): League => ({ index, id, name, c1, c2, shape });
export const LEAGUES: League[] = [
  L(0, "bronze", "Bronze", "#e2a572", "#b4713c", "shield"),
  L(1, "silver", "Prata", "#dde5ef", "#98a6b8", "shield"),
  L(2, "gold", "Ouro", "#ffd54a", "#e0a100", "shield"),
  L(3, "sapphire", "Safira", "#46bcff", "#1773d4", "hex"),
  L(4, "ruby", "Rubi", "#ff7373", "#c92a3a", "hex"),
  L(5, "emerald", "Esmeralda", "#86df33", "#3f9d1d", "hex"),
  L(6, "amethyst", "Ametista", "#bc85f7", "#7a3fc7", "gem"),
  L(7, "pearl", "Pérola", "#ffbde0", "#e06aae", "gem"),
  L(8, "obsidian", "Obsidiana", "#7a7684", "#2f2d36", "gem"),
  L(9, "diamond", "Diamante", "#86eef5", "#22aebf", "crystal"),
];
export const STEP = 10;

const clamp = (n: number) => Math.min(100, Math.max(0, n));
export const leagueOf = (score: number): League => LEAGUES[Math.min(LEAGUES.length - 1, Math.floor(clamp(score) / STEP))]!;

/** Onde a nota está dentro da liga e quanto falta para a próxima (`next` é `null` no Diamante). */
export function leagueProgress(score: number) {
  const s = clamp(score), league = leagueOf(s), next = LEAGUES[league.index + 1] ?? null;
  const into = league.index === LEAGUES.length - 1 ? STEP : s - league.index * STEP;
  return { league, next, into, pct: Math.round((into / STEP) * 100), toNext: next ? Math.max(1, Math.ceil(next.index * STEP - s)) : 0 };
}

/** Overall do perfil: média das melhores notas dos casos jogados (`null` se ainda não há nenhuma). */
export function profileOverall(bests: (number | undefined)[]): number | null {
  const v = bests.filter((n): n is number => typeof n === "number" && n > 0);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
}
