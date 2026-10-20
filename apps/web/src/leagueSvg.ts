import type { League } from "./leagues";

export const SHAPES: Record<League["shape"], string> = {
  shield: "M10 8 Q10 4 14 4 H50 Q54 4 54 8 V38 Q54 58 32 67 Q10 58 10 38 Z",
  hex: "M16 5 H48 L57 13 V46 L32 69 L7 46 V13 Z",
  gem: "M21 5 H43 L59 21 V47 L43 63 H21 L5 47 V21 Z",
  crystal: "M32 2 L58 17 V47 L32 70 L6 47 V17 Z",
};

/** Miolo do SVG do emblema (viewBox 0 0 64 72), compartilhado pela tela (React) e pelo relatório em imagem (canvas). `uid` isola os ids de gradiente. */
export function badgeInner(league: League, uid: string): string {
  const d = SHAPES[league.shape];
  const crystal = league.shape === "crystal"
    ? `<path d="M32 2 L58 17 L32 30 L6 17 Z" fill="#fff" opacity=".38"/><path d="M32 30 L58 17 V47 Z" fill="${league.c2}" opacity=".25"/><path d="M32 30 L6 17 V47 Z" fill="#fff" opacity=".12"/>`
    : "";
  return `<defs><linearGradient id="g${uid}" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${league.c1}"/><stop offset="1" stop-color="${league.c2}"/></linearGradient><clipPath id="c${uid}"><path d="${d}"/></clipPath></defs>`
    + `<path d="${d}" fill="url(#g${uid})" stroke="${league.c2}" stroke-width="2.5" stroke-linejoin="round"/>`
    + `<g clip-path="url(#c${uid})"><path d="${d}" transform="translate(32 36) scale(.72) translate(-32 -36)" fill="#fff" opacity=".28"/>${crystal}<path d="M-6 46 L38 -8 L52 -8 L-6 60 Z" fill="#fff" opacity=".24"/></g>`;
}
