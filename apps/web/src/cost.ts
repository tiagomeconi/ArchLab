import { PROFILES } from "@archlab/domain";

/** Custo estimado do desenho em créditos fictícios por mês (preço por instância × réplicas). Valor de ensino, não de nuvem. */
export interface CostLine { id: string; name: string; credits: number; replicas: number }
export interface CostEstimate { total: number; unknown: number; lines: CostLine[] }

export function estimateCost(nodes: { id: string; name: string; properties: { profileId: string; replicas: number } }[]): CostEstimate {
  const lines: CostLine[] = []; let total = 0, unknown = 0;
  for (const n of nodes) {
    const p = PROFILES[n.properties.profileId];
    if (!p || p.source) continue;
    if (p.credits === undefined) { unknown++; continue; }
    const credits = p.credits * n.properties.replicas;
    total += credits; lines.push({ id: n.id, name: n.name, credits, replicas: n.properties.replicas });
  }
  return { total, unknown, lines: lines.sort((a, b) => b.credits - a.credits) };
}
