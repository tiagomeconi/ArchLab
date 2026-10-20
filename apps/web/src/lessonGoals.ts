/** Metas das tarefas das aulas: funções puras que olham o estado do canvas e dizem se a tarefa foi cumprida. */
export type Goal =
  | { kind: "node"; types: string[]; min: number }
  | { kind: "edge"; from: string[]; to: string[] }
  | { kind: "noEdge"; from: string[]; to: string[] }
  | { kind: "replicas"; types: string[]; min: number }
  | { kind: "replicasMax"; types: string[]; max: number }
  | { kind: "simulated" }
  | { kind: "selected"; types: string[] }
  | { kind: "tab"; tab: string }
  | { kind: "hit"; min: number }
  | { kind: "util"; types: string[]; max: number }
  | { kind: "chaos" }
  | { kind: "ok" };

export interface LessonState {
  nodes: { id: string; type: string; replicas: number; hitRate?: number; util: number | null }[];
  edges: { source: string; target: string }[];
  /** a simulação já rodou por alguns segundos */
  simulated: boolean;
  selectedType: string | null;
  tab: string;
  /** quantas falhas do modo caos estão ativas */
  chaos: number;
  /** maior utilização entre os componentes (fora as origens de carga); null sem carga */
  maxUtil: number | null;
}

export const emptyLessonState = (): LessonState => ({ nodes: [], edges: [], simulated: false, selectedType: null, tab: "components", chaos: 0, maxUtil: null });

export function goalMet(g: Goal, s: LessonState): boolean {
  const typeOf = new Map(s.nodes.map((n) => [n.id, n.type]));
  const linked = (from: string[], to: string[]) => s.edges.some((e) => from.includes(typeOf.get(e.source) ?? "") && to.includes(typeOf.get(e.target) ?? ""));
  switch (g.kind) {
    case "node": return s.nodes.filter((n) => g.types.includes(n.type)).length >= g.min;
    case "edge": return linked(g.from, g.to);
    case "noEdge": return !linked(g.from, g.to);
    case "replicas": return s.nodes.some((n) => g.types.includes(n.type) && n.replicas >= g.min);
    case "replicasMax": return s.nodes.some((n) => g.types.includes(n.type)) && s.nodes.filter((n) => g.types.includes(n.type)).every((n) => n.replicas <= g.max);
    case "simulated": return s.simulated;
    case "selected": return s.selectedType !== null && g.types.includes(s.selectedType);
    case "tab": return s.tab === g.tab;
    case "hit": return s.nodes.some((n) => n.type === "redis" && (n.hitRate ?? 0) >= g.min);
    case "util": return s.nodes.some((n) => g.types.includes(n.type) && n.util !== null && n.util <= g.max);
    case "chaos": return s.chaos > 0;
    case "ok": return s.maxUtil !== null && s.maxUtil <= 1;
  }
}
/** Metas que só valem naquele instante (o que está selecionado ou aberto): uma vez cumpridas num passo, ficam cumpridas. */
export const isTransient = (g: Goal) => g.kind === "selected" || g.kind === "tab";
