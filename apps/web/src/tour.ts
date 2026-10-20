/** Tutorial de primeiro uso: passos e a conta de onde colocar o balão ao lado do elemento destacado. Funções puras (testadas no vitest). */
export interface TourStep { target?: string; title: string; text: string; side?: "top" | "bottom" | "left" | "right" }
export const TOUR_STEPS: TourStep[] = [
  { title: "Bem-vindo ao laboratório", text: "Em um minuto você vê onde fica cada coisa: monte uma arquitetura, simule o tráfego, quebre de propósito e leia a sua nota." },
  { target: "palette", side: "left", title: "Componentes", text: "Arraste da paleta para o canvas, ou clique no + do componente. Dá para buscar pelo nome (tecla /)." },
  { target: "canvas", side: "top", title: "Ligue as peças", text: "Puxe pelas bolinhas dos cards para criar conexões. Ao soltar, você escolhe o protocolo. Dica: a tecla L organiza o diagrama sozinha." },
  { target: "flows", side: "left", title: "Fluxos", text: "O caminho de cada requisição é montado a partir das suas conexões. Aqui você confere e ajusta cada passo." },
  { target: "brief", side: "right", title: "Enunciado e requisitos", text: "O caso traz requisitos e verificações automáticas. Elas ficam verdes à medida que o seu desenho atende cada uma." },
  { target: "simulate", side: "bottom", title: "Simular", text: "Roda 300 segundos com a carga do caso. Veja a utilização de cada componente, a latência p95 e quem satura primeiro." },
  { target: "chaos", side: "bottom", title: "Modo caos", text: "Derrube um banco, injete latência, parta a rede. O melhor jeito de aprender é ver o desenho quebrar." },
  { target: "rating", side: "bottom", title: "Nota e liga", text: "Seis atributos viram uma nota geral e uma liga, do Bronze ao Diamante. Clique para ver o porquê de cada nota e como subir." },
  { target: "share", side: "bottom", title: "Compartilhar", text: "Copie o link, baixe o relatório em imagem ou o cartão da nota para o LinkedIn. Seus desenhos ficam salvos em Meus desenhos." },
];

export interface Box { x: number; y: number; w: number; h: number }
/** Posição do balão (`size`) em relação ao destaque (`rect`), sempre dentro da janela (`vp`). Tenta o lado pedido, depois os outros, por último o centro. */
export function placePopover(rect: Box, size: { w: number; h: number }, vp: { w: number; h: number }, side: TourStep["side"] = "bottom", gap = 14, margin = 12): { x: number; y: number; side: string } {
  const fits = (x: number, y: number) => x >= margin && y >= margin && x + size.w <= vp.w - margin && y + size.h <= vp.h - margin;
  const clampX = (x: number) => Math.min(Math.max(x, margin), Math.max(margin, vp.w - size.w - margin));
  const clampY = (y: number) => Math.min(Math.max(y, margin), Math.max(margin, vp.h - size.h - margin));
  const cand: Record<string, { x: number; y: number }> = {
    bottom: { x: clampX(rect.x + rect.w / 2 - size.w / 2), y: rect.y + rect.h + gap },
    top: { x: clampX(rect.x + rect.w / 2 - size.w / 2), y: rect.y - size.h - gap },
    right: { x: rect.x + rect.w + gap, y: clampY(rect.y + rect.h / 2 - size.h / 2) },
    left: { x: rect.x - size.w - gap, y: clampY(rect.y + rect.h / 2 - size.h / 2) },
  };
  for (const s of [side, "bottom", "top", "right", "left"]) if (fits(cand[s]!.x, cand[s]!.y)) return { ...cand[s]!, side: s };
  return { x: clampX(vp.w / 2 - size.w / 2), y: clampY(vp.h / 2 - size.h / 2), side: "center" };
}
