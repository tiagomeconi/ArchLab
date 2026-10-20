import { CATEGORY_OF } from "./catalog";

/** Miniatura de um desenho salvo: posições e conexões normalizadas para caber numa caixa, sem renderizar nada do laboratório. */
export interface ThumbNode { x: number; y: number; w: number; h: number; cat: string }
export interface ThumbEdge { x1: number; y1: number; x2: number; y2: number }
export interface Thumb { w: number; h: number; nodes: ThumbNode[]; edges: ThumbEdge[] }
interface SnapLike { n?: { id: string; x: number; y: number; w?: number; d?: { type?: string } }[]; e?: { source: string; target: string }[] }

export function thumbOf(snap: SnapLike | null | undefined, box = { w: 240, h: 132, pad: 12 }): Thumb {
  const ns = (snap?.n ?? []).filter((n) => Number.isFinite(n.x) && Number.isFinite(n.y));
  if (!ns.length) return { w: box.w, h: box.h, nodes: [], edges: [] };
  const NH = 96;
  const minX = Math.min(...ns.map((n) => n.x)), maxX = Math.max(...ns.map((n) => n.x + (n.w ?? 240)));
  const minY = Math.min(...ns.map((n) => n.y)), maxY = Math.max(...ns.map((n) => n.y + NH));
  const sw = Math.max(1, maxX - minX), sh = Math.max(1, maxY - minY);
  const k = Math.min((box.w - box.pad * 2) / sw, (box.h - box.pad * 2) / sh);
  const ox = (box.w - sw * k) / 2, oy = (box.h - sh * k) / 2;
  const nodes = ns.map((n) => ({ id: n.id, x: ox + (n.x - minX) * k, y: oy + (n.y - minY) * k, w: (n.w ?? 240) * k, h: NH * k, cat: CATEGORY_OF.get(String(n.d?.type)) ?? "compute" }));
  const by = new Map(nodes.map((n) => [n.id, n]));
  const edges: ThumbEdge[] = [];
  for (const e of snap?.e ?? []) {
    const a = by.get(e.source), b = by.get(e.target); if (!a || !b) continue;
    edges.push({ x1: a.x + a.w, y1: a.y + a.h / 2, x2: b.x, y2: b.y + b.h / 2 });
  }
  return { w: box.w, h: box.h, nodes: nodes.map(({ id: _id, ...r }) => r), edges };
}
