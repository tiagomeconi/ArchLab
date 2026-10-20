import { useMemo } from "react";
import { thumbOf } from "../thumbnail";
import { t } from "../i18n";

/** Miniatura de um desenho: cada card na cor da categoria e as conexões por trás. */
export function DesignThumb({ snap, w = 240, h = 132 }: { snap: unknown; w?: number; h?: number }) {
  const th = useMemo(() => thumbOf(snap as any, { w, h, pad: 12 }), [snap, w, h]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={t("Miniatura do desenho")} style={{ display: "block" }}>
      {th.edges.map((e, i) => <path key={i} d={`M${e.x1} ${e.y1} C${e.x1 + 14} ${e.y1} ${e.x2 - 14} ${e.y2} ${e.x2} ${e.y2}`} fill="none" stroke="var(--text-2)" strokeOpacity=".4" strokeWidth="1.2" />)}
      {th.nodes.map((n, i) => (
        <rect key={i} x={n.x} y={n.y} width={Math.max(6, n.w)} height={Math.max(5, n.h)} rx={Math.min(5, n.h / 3)}
          fill={`color-mix(in srgb, var(--c-${n.cat}) 38%, var(--surface-solid))`} stroke={`var(--c-${n.cat})`} strokeWidth="1.2" />
      ))}
      {!th.nodes.length && <text x={w / 2} y={h / 2} textAnchor="middle" fontSize="12" fill="var(--text-2)">{t("Desenho vazio")}</text>}
    </svg>
  );
}
