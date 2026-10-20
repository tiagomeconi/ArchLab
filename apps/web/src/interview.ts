/** Modo entrevista: um relógio com as fases típicas de uma entrevista de system design. */
export interface Phase { id: string; label: string; tip: string; share: number }
export const PHASES: Phase[] = [
  { id: "req", label: "Requisitos e escopo", share: 0.12, tip: "Faça perguntas: quem usa, quantos usuários, o que fica fora do escopo. Escreva os requisitos." },
  { id: "est", label: "Estimativas", share: 0.1, tip: "Estime requisições por segundo, armazenamento e leitura versus escrita. Defina o tráfego do desenho." },
  { id: "hld", label: "Desenho de alto nível", share: 0.33, tip: "Monte os componentes principais e os fluxos de ponta a ponta. Primeiro simples, depois refine." },
  { id: "deep", label: "Aprofundamento", share: 0.3, tip: "Escolha os pontos difíceis: banco, cache, filas, consistência. Explique cada decisão nas observações." },
  { id: "wrap", label: "Gargalos e fechamento", share: 0.15, tip: "Rode o modo caos, veja o gargalo, revise os pontos da aba Revisão e resuma os trade-offs." },
];
export const DURATIONS = [30, 45, 60] as const;

/** Fase em que a entrevista está a `elapsed` segundos de um total de `total`; `secondsLeft` é o que falta para trocar de fase. */
export function phaseAt(elapsed: number, total: number): { index: number; phase: Phase; secondsLeft: number; over: boolean } {
  const e = Math.max(0, elapsed);
  let acc = 0;
  for (let i = 0; i < PHASES.length; i++) {
    acc += PHASES[i]!.share * total;
    if (e < acc) return { index: i, phase: PHASES[i]!, secondsLeft: Math.ceil(acc - e), over: false };
  }
  return { index: PHASES.length - 1, phase: PHASES[PHASES.length - 1]!, secondsLeft: 0, over: true };
}
export const clock = (sec: number) => { const s = Math.max(0, Math.floor(sec)); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
