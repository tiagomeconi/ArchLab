import type { Check } from "./requirements";
import type { Session } from "./session";
import { t } from "./i18n";

/** Roteiro de entrevista de system design: etapas com o tempo sugerido e o que checar em cada uma. */
export interface Stage {
  id: string; title: string; minutes: number; icon: string;
  /** perguntas que o entrevistador faria */
  asks: string[];
  /** dica contextual com os números do caso */
  hint?: string;
  /** quais verificações automáticas pertencem a esta etapa */
  pick: (c: Check) => boolean;
}
export const TOTAL_MINUTES = 45;

export function buildStages(s: Session): Stage[] {
  const r = s.requirements, sc = r.scale, tg = r.targets;
  const first = r.functional[0];
  const fact = (label: string, v: string) => (v ? `${t(label)}: ${t(v)}` : "");
  return [
    { id: "scope", title: t("Esclarecer requisitos"), minutes: 5, icon: "forum",
      asks: [t("Quais são as funcionalidades essenciais e o que fica fora do escopo?"), t("Quais requisitos não funcionais pesam mais: latência, disponibilidade, consistência?"), t("Quem são os usuários e como eles usam o sistema?")],
      hint: first ? t("Comece por “{item}” e confirme o que é essencial.", { item: t(first) }) : undefined, pick: () => false },
    { id: "scale", title: t("Estimar a escala"), minutes: 5, icon: "calculate",
      asks: [t("Quantos usuários e quantas requisições por segundo no pico?"), t("Qual a proporção entre leitura e escrita?"), t("Quanto de armazenamento e de banda isso exige?")],
      hint: [fact("Usuários", sc.users), fact("Requisições", sc.rps), fact("Leitura/escrita", sc.readWrite), fact("Armazenamento", sc.storage)].filter(Boolean).join(" · ") || undefined, pick: () => false },
    { id: "high", title: t("Desenho de alto nível"), minutes: 10, icon: "schema",
      asks: [t("Qual é o caminho principal de uma requisição, do cliente ao dado?"), t("Onde ficam as responsabilidades: entrada, serviço, cache, banco?"), t("Qual caminho de escrita e qual de leitura?")],
      hint: t("Monte o caminho principal e defina os fluxos na aba Fluxos."), pick: (c) => c.id.startsWith("path:") },
    { id: "deep", title: t("Aprofundar os componentes"), minutes: 10, icon: "deployed_code",
      asks: [t("Por que cada componente está ali e qual alternativa você descartou?"), t("Que banco, fila ou cache você escolhe e por quê?"), t("Como os dados são particionados e replicados?")],
      hint: t("Escolha o provedor de cada peça e justifique em voz alta."), pick: (c) => c.id.startsWith("need:") },
    { id: "bottleneck", title: t("Gargalos e escala"), minutes: 8, icon: "speed",
      asks: [t("O que quebra primeiro quando o tráfego dobra?"), t("Como você reduz a carga no banco (cache, réplicas, filas)?"), t("A latência da meta se mantém no pico?")],
      hint: tg.latency ? t("Meta de latência: {meta}. Rode a simulação no pico e procure o gargalo.", { meta: t(tg.latency) }) : t("Rode a simulação no pico e procure o gargalo."), pick: (c) => c.id === "capacity" || c.id === "p95" || c.id === "hit" },
    { id: "failures", title: t("Falhas e trade-offs"), minutes: 5, icon: "local_fire_department",
      asks: [t("O que acontece se esta peça cair?"), t("Onde você aceita consistência eventual e onde exige consistência forte?"), t("Como o sistema degrada sem derrubar tudo?")],
      hint: [fact("Disponibilidade", tg.availability), fact("Consistência", tg.consistency)].filter(Boolean).join(" · ") || t("Use o modo caos com as falhas sugeridas."), pick: (c) => c.id === "spof" },
    { id: "wrap", title: t("Fechamento"), minutes: 2, icon: "flag",
      asks: [t("Resuma as decisões e os trade-offs principais."), t("O que você melhoraria com mais tempo?")],
      hint: t("Compare seu desenho com a solução de referência."), pick: () => false },
  ];
}
