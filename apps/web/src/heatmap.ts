import { dayKey } from "./activity";

/** Calendário de atividade (estilo GitHub): colunas de semanas (domingo a sábado); a última coluna contém hoje. Função pura (testada no vitest). */
export interface HeatCell { key: string; on: boolean; today: boolean; future: boolean; month: number; day: number }
export function heatmapWeeks(days: Iterable<string>, weeks = 26, today = new Date()): HeatCell[][] {
  const set = new Set(days); const todayKey = dayKey(today);
  const lastSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const first = new Date(lastSunday.getFullYear(), lastSunday.getMonth(), lastSunday.getDate() - (weeks - 1) * 7);
  return Array.from({ length: weeks }, (_, w) => Array.from({ length: 7 }, (_, d) => {
    const dt = new Date(first.getFullYear(), first.getMonth(), first.getDate() + w * 7 + d); const key = dayKey(dt);
    return { key, on: set.has(key), today: key === todayKey, future: key > todayKey, month: dt.getMonth(), day: dt.getDate() };
  }));
}
/** Em que colunas começa um mês novo (para os rótulos acima do calendário). */
export function monthStarts(grid: HeatCell[][]): { col: number; month: number }[] {
  const all: { col: number; month: number }[] = []; let prev = -1;
  grid.forEach((col, i) => { const m = col[0]!.month; if (m !== prev) { all.push({ col: i, month: m }); prev = m; } });
  // um rótulo só cabe se o próximo mês começar pelo menos 3 colunas depois (senão o texto se sobrepõe)
  return all.filter((x, i) => (all[i + 1] ? all[i + 1]!.col - x.col >= 3 : true));
}
