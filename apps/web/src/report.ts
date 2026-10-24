import { LEAGUES, leagueOf, type League } from "./leagues";
import { badgeInner } from "./leagueSvg";
import { LOGOS } from "./logos.generated";
import { INVERT_ON_DARK, SOFT_INVERT_ON_DARK, logoBox } from "./ProviderLogo";
import { protoOf } from "./protocols";
import { localeOf, t } from "./i18n";
import type { Rating } from "./rating";

/** `ctx.filter` não existe em Safari antigo; nele os logos escuros são recoloridos pixel a pixel num canvas auxiliar. */
const CTX_FILTER = typeof document !== "undefined" && "filter" in document.createElement("canvas").getContext("2d")!;
const LABEL_US = Array.from({ length: 33 }, (_, i) => 0.1 + i * 0.025).sort((a, b) => Math.abs(a - 0.5) - Math.abs(b - 0.5));
const tintCache = new Map<string, HTMLCanvasElement>();
function tintedLogo(img: CanvasImageSource, mode: "silhouette" | "invert", id: string, w: number, h: number): HTMLCanvasElement {
  const key = `${id}:${mode}:${w}x${h}`; const hit = tintCache.get(key); if (hit) return hit;
  const c = document.createElement("canvas"); c.width = Math.max(1, w); c.height = Math.max(1, h);
  const g = c.getContext("2d")!; g.drawImage(img, 0, 0, c.width, c.height);
  const d = g.getImageData(0, 0, c.width, c.height), px = d.data;
  for (let i = 0; i < px.length; i += 4) { if (mode === "silhouette") px[i] = px[i + 1] = px[i + 2] = 255; else { px[i] = 255 - px[i]!; px[i + 1] = 255 - px[i + 1]!; px[i + 2] = 255 - px[i + 2]!; } }
  g.putImageData(d, 0, 0); tintCache.set(key, c); return c;
}

/** Entrada do relatório: tudo o que aparece na imagem vem daqui, sem ler o DOM. */
export interface ReportNode {
  id: string; x: number; y: number; w: number; h: number; name: string; type: string; icon: string; cat: string; replicas: number;
  providerId?: string; providerName?: string;
  /** utilização 0–1+ (null = desconhecida) e carga oferecida em req/s; ausentes quando o nó não recebe carga */
  util?: number | null; offered?: number; health: string; status: string; hasLoad: boolean; backlog?: number;
}
import type { Side } from "./ports";
export interface ReportEdge { source: string; target: string; protocol: string; mode: string; flow: number; hot: boolean; unused: boolean; sp?: Side; tp?: Side; both?: boolean }
export interface ReportGroup { name: string; color: string; x: number; y: number; w: number; h: number }
export interface ReportInput {
  title: string;
  summary?: string;
  level?: string;
  mode: "study" | "free";
  /** id do logo da empresa (co-*) ou nome de um ícone Material quando o caso não é de empresa */
  logoId?: string;
  iconName?: string;
  rating: Rating;
  /** Entrega competitiva não aprovada: não mostra liga; o texto é o rótulo no lugar do nome da liga. */
  noLeague?: string;
  met: number;
  total: number;
  nodes: ReportNode[];
  groups?: ReportGroup[];
  edges: ReportEdge[];
}

const DPR = 2;
export const C = { bg0: "#070d1b", bg1: "#0d1730", card: "#0f1a33", line: "#22325a", text: "#eaf0fa", sub: "#9fb1cf", dim: "#6f82a6", accent: "#38bdf8" };
const HEALTH: Record<string, { fg: string; bg: string }> = {
  healthy: { fg: "#34d399", bg: "#34d3991f" }, degraded: { fg: "#fbbf24", bg: "#fbbf241f" }, saturated: { fg: "#f87171", bg: "#f871711f" },
  unavailable: { fg: "#f87171", bg: "#f871711f" }, unknown: { fg: "#9fb1cf", bg: "#9fb1cf1f" }, idle: { fg: "#9fb1cf", bg: "#9fb1cf1a" },
  origin: { fg: "#38bdf8", bg: "#38bdf81f" }, noprofile: { fg: "#9fb1cf", bg: "#9fb1cf1a" },
};
const CAT_COLOR: Record<string, string> = { origin: "#22d3ee", iot: "#a3e635", network: "#a78bfa", compute: "#60a5fa", data: "#e879f9", messaging: "#fb923c", support: "#2dd4bf" };
export const SANS = `"Inter Variable", Inter, -apple-system, "Segoe UI", system-ui, sans-serif`;
const num = (n: number) => (n >= 10000 ? `${new Intl.NumberFormat(localeOf(), { maximumFractionDigits: n >= 100000 ? 0 : 1 }).format(n / 1000)}k` : Math.round(n).toLocaleString(localeOf()));

export const svgImage = (logo: { w: number; h: number; body: string }, color?: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const body = color ? logo.body.replace(/currentColor/g, color) : logo.body;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logo.w} ${logo.h}" width="${logo.w * 4}" height="${logo.h * 4}">${body}</svg>`;
    const img = new Image();
    img.onload = () => resolve(img); img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
export const badgeImage = (lg: League): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 72" width="256" height="288">${badgeInner(lg, "r")}</svg>`)}`;
  });
export const pngImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => resolve(null); i.src = src; });

/** Desenha um ícone Material centrado em (cx, cy) pelo contorno real do glifo (a fonte de ícones não tem o centro óptico no meio da caixa de texto). */
export function drawIcon(ctx: CanvasRenderingContext2D, name: string, cx: number, cy: number, size: number, color: string) {
  ctx.save(); ctx.font = `${size}px "Material Symbols Rounded Variable"`; ctx.fillStyle = color; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const m = ctx.measureText(name);
  ctx.fillText(name, cx - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2, cy + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
  ctx.restore();
}
export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const k = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + k, y); ctx.arcTo(x + w, y, x + w, y + h, k); ctx.arcTo(x + w, y + h, x, y + h, k); ctx.arcTo(x, y + h, x, y, k); ctx.arcTo(x, y, x + w, y, k); ctx.closePath();
}
export function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width <= maxW) { cur = next; continue; }
    lines.push(cur); cur = w;
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) lines[maxLines - 1] = lines[maxLines - 1]!.replace(/[\s,.;:]*$/, "") + "…";
  return lines;
}
export function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text; while (s.length > 1 && ctx.measureText(`${s}…`).width > maxW) s = s.slice(0, -1);
  return `${s}…`;
}


/** Ponto do bezier cúbico no parâmetro u. */
const bez = (p: number[], u: number): [number, number] => {
  const k = 1 - u, a = k * k * k, b = 3 * k * k * u, c = 3 * k * u * u, d = u * u * u;
  return [a * p[0]! + b * p[2]! + c * p[4]! + d * p[6]!, a * p[1]! + b * p[3]! + c * p[5]! + d * p[7]!];
};
/** Mesma curva do React Flow (getBezierPath, curvatura 0,25): ida suave, volta em laço largo. */
const off = (d: number) => (d >= 0 ? 0.5 * d : 0.25 * 25 * Math.sqrt(-d));
/** Ponto de controle do bezier a partir do lado do bloco (idêntico ao getBezierPath do React Flow). */
const ctrl = (side: Side, x1: number, y1: number, x2: number, y2: number): [number, number] =>
  side === "left" ? [x1 - off(x1 - x2), y1] : side === "right" ? [x1 + off(x2 - x1), y1] : side === "top" ? [x1, y1 - off(y1 - y2)] : [x1, y1 + off(y2 - y1)];
const anchor = (n: { x: number; y: number; w: number; h: number }, side: Side): [number, number] =>
  side === "left" ? [n.x, n.y + n.h / 2] : side === "right" ? [n.x + n.w, n.y + n.h / 2] : side === "top" ? [n.x + n.w / 2, n.y] : [n.x + n.w / 2, n.y + n.h];
/** Ponta de seta em (x,y) apontando na direção (dx,dy). */
function arrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, size: number, color: string) {
  const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - ux * size - uy * size * 0.5, y - uy * size + ux * size * 0.5); ctx.lineTo(x - ux * size + uy * size * 0.5, y - uy * size - ux * size * 0.5); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}

/**
 * Desenha o relatório como um "print" do laboratório: coluna lateral compacta (caso, nota, requisitos) e o mapa em destaque,
 * com componentes, provedores, protocolos, carga e utilização. Formato horizontal para compartilhar.
 */
export async function renderReport(r: ReportInput): Promise<Blob> {
  try { await Promise.all([document.fonts.load(`700 24px ${SANS}`), document.fonts.load(`500 16px ${SANS}`), document.fonts.load(`24px "Material Symbols Rounded Variable"`)]); } catch { /* usa a fonte do sistema */ }

  const caseLogo = r.logoId ? LOGOS[r.logoId] : undefined;
  const lgNow = r.rating.overall === null || r.noLeague ? LEAGUES[0]! : leagueOf(r.rating.overall);
  const [logoImg, brandImg, badgeImg] = await Promise.all([caseLogo ? svgImage(caseLogo, "#f4f7fb") : Promise.resolve(null), pngImage("/logo.png"), badgeImage(lgNow)]);
  const provImgs = new Map<string, HTMLImageElement>();
  await Promise.all([...new Set(r.nodes.map((n) => n.providerId).filter(Boolean) as string[])].map(async (id) => {
    const l = LOGOS[id]; if (!l) return;
    const img = await svgImage(l, "#f4f7fb"); if (img) provImgs.set(id, img);
  }));

  // ── geometria ──
  const PAD = 48, SIDE = 440, GAP = 32;
  const gs = r.groups ?? [];
  const minX = Math.min(...r.nodes.map((n) => n.x), ...gs.map((g) => g.x)), maxX = Math.max(...r.nodes.map((n) => n.x + n.w), ...gs.map((g) => g.x + g.w));
  const minY = Math.min(...r.nodes.map((n) => n.y), ...gs.map((g) => g.y)), maxY = Math.max(...r.nodes.map((n) => n.y + n.h), ...gs.map((g) => g.y + g.h));
  const bw = Math.max(1, maxX - minX), bh = Math.max(1, maxY - minY);
  // desenhos largos ganham uma imagem mais larga: os cards mantêm o tamanho do laboratório e sobra espaço para o protocolo de cada conexão
  const W = Math.max(2400, Math.min(3400, Math.round(bw * 1.0 + PAD * 2 + SIDE + GAP + 56 * 2 + 160)));
  const mapX = PAD + SIDE + GAP, mapW = W - mapX - PAD;
  const inner = 56, maxH = 1060;
  const availW = mapW - inner * 2, availH = maxH - inner * 2 - 30;
  const wMax = Math.max(...r.nodes.map((n) => n.w), 1), hMax = Math.max(...r.nodes.map((n) => n.h), 1);
  const WF = 1; // os cards do relatório são mais estreitos que no laboratório: sobra espaço entre colunas para o protocolo e a vazão de cada conexão
  const bwEff = bw - wMax * (1 - WF);
  // tamanho dos componentes (sN) e afastamento entre eles (kx, ky)
  const sN = r.nodes.length ? Math.min(1.1, availW / bwEff, availH / bh) : 1;
  const kx = bw > wMax ? Math.max(sN, Math.min(1.8, (availW - wMax * WF * sN) / (bw - wMax))) : sN;
  const ky = bh > hMax ? Math.max(sN, Math.min(1.8, (availH - hMax * sN) / (bh - hMax))) : sN;
  const spanW0 = (bw - wMax) * kx + wMax * WF * sN, spanH0 = (bh - hMax) * ky + hMax * sN;
  const mapH = r.nodes.length ? Math.round(Math.max(1040, Math.min(maxH, spanH0 + inner * 2 + 30))) : 1040; // a coluna lateral (liga, radar e destaques) pede ~1040 px
  const H = mapH + PAD * 2;

  const cv = document.createElement("canvas"); cv.width = W * DPR; cv.height = H * DPR;
  const ctx = cv.getContext("2d")!; ctx.scale(DPR, DPR); ctx.textBaseline = "alphabetic";

  const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, C.bg0); bg.addColorStop(1, C.bg1);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const lg = r.rating.overall === null || r.noLeague ? null : leagueOf(r.rating.overall);
  const tier = lg ? { name: lg.name, color: lg.c1 } : { name: "—", color: C.dim };
  const glow = ctx.createRadialGradient(PAD + 80, PAD, 0, PAD + 80, PAD, 520); glow.addColorStop(0, `${tier.color}2e`); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, 700);

  // ── coluna lateral: marca, caso, liga, requisitos, radar de atributos e destaques ──
  const lgDraw = lg ?? LEAGUES[0]!;
  const lang = localeOf();
  let y = PAD;
  if (brandImg) ctx.drawImage(brandImg, PAD, y, 40, 40);
  ctx.fillStyle = C.text; ctx.font = `700 22px ${SANS}`; ctx.fillText("ArchLab", PAD + 52, y + 19);
  ctx.fillStyle = C.dim; ctx.font = `500 13px ${SANS}`; ctx.fillText(t("Relatório de arquitetura"), PAD + 52, y + 38);
  ctx.textAlign = "right"; ctx.fillText(new Date().toLocaleDateString(lang, { day: "2-digit", month: "long", year: "numeric" }), PAD + SIDE, y + 38); ctx.textAlign = "left";
  ctx.fillStyle = C.line; ctx.fillRect(PAD, y + 58, SIDE, 1);
  y += 80;

  const lh = 40, lw = logoImg && caseLogo ? Math.min(120, Math.round(lh * (caseLogo.w / caseLogo.h))) : lh;
  const tileW = lw + 28, tileH = 68;
  rr(ctx, PAD, y, tileW, tileH, 18); ctx.fillStyle = "#12203f"; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
  if (logoImg && caseLogo) {
    const ar = caseLogo.w / caseLogo.h; const dw = ar >= lw / lh ? lw : lh * ar, dh = ar >= lw / lh ? lw / ar : lh;
    ctx.drawImage(logoImg, PAD + (tileW - dw) / 2, y + (tileH - dh) / 2, dw, dh);
  } else {
    drawIcon(ctx, r.iconName ?? "account_tree", PAD + tileW / 2, y + tileH / 2, 30, C.accent);
  }
  const tx = PAD + tileW + 18;
  ctx.fillStyle = C.text; ctx.font = `700 32px ${SANS}`; ctx.fillText(fit(ctx, t(r.title), PAD + SIDE - tx), tx, y + 34);
  ctx.fillStyle = C.sub; ctx.font = `500 15px ${SANS}`;
  ctx.fillText(fit(ctx, [r.mode === "study" ? t("Modo estudo") : t("Modo livre"), r.level ? t(r.level) : ""].filter(Boolean).join("  ·  "), PAD + SIDE - tx), tx, y + 58);
  y += tileH + 18;

  if (r.summary) {
    ctx.fillStyle = C.sub; ctx.font = `500 16px ${SANS}`;
    const lines = wrap(ctx, t(r.summary), SIDE, 3);
    lines.forEach((ln, i) => ctx.fillText(ln, PAD, y + 16 + i * 24)); y += lines.length * 24 + 22;
  }

  // liga: emblema grande, nome do material e a nota
  const hh = 172;
  const hg = ctx.createLinearGradient(PAD, y, PAD + SIDE, y + hh); hg.addColorStop(0, `${tier.color}38`); hg.addColorStop(1, `${lgDraw.c2}10`);
  rr(ctx, PAD, y, SIDE, hh, 24); ctx.fillStyle = hg; ctx.fill(); ctx.strokeStyle = `${tier.color}88`; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 1;
  const bW = 108, bH = Math.round((bW * 72) / 64);
  if (badgeImg) { ctx.save(); if (!lg) ctx.globalAlpha = 0.3; ctx.drawImage(badgeImg, PAD + 26, y + (hh - bH) / 2, bW, bH); ctx.restore(); }
  const hx = PAD + 26 + bW + 26;
  ctx.fillStyle = C.sub; ctx.font = `700 12px ${SANS}`; ctx.fillText(r.noLeague ? t("ENTREGA") : t("LIGA"), hx, y + 40);
  ctx.fillStyle = tier.color; ctx.font = `800 32px ${SANS}`; ctx.fillText(fit(ctx, lg ? t(lg.name) : r.noLeague ?? t("Sem nota"), PAD + SIDE - hx - 16), hx, y + 76);
  const ov = r.rating.overall === null ? "—" : String(r.rating.overall);
  ctx.fillStyle = C.text; ctx.font = `800 70px ${SANS}`; ctx.fillText(ov, hx, y + 144);
  const ow = ctx.measureText(ov).width; ctx.fillStyle = C.sub; ctx.font = `700 16px ${SANS}`; ctx.fillText("OVR", hx + ow + 10, y + 144);
  y += hh + 22;

  if (r.total > 0) {
    ctx.fillStyle = C.sub; ctx.font = `600 14px ${SANS}`; ctx.fillText(t("Requisitos"), PAD, y + 12);
    ctx.textAlign = "right"; ctx.fillStyle = C.text; ctx.font = `700 14px ${SANS}`; ctx.fillText(t("{met} de {total} requisitos", { met: r.met, total: r.total }), PAD + SIDE, y + 12); ctx.textAlign = "left";
    rr(ctx, PAD, y + 22, SIDE, 8, 4); ctx.fillStyle = "#1b2a4d"; ctx.fill();
    rr(ctx, PAD, y + 22, Math.max(8, (SIDE * r.met) / r.total), 8, 4); ctx.fillStyle = r.met >= r.total ? "#34d399" : C.accent; ctx.fill();
    y += 52;
  }

  // radar dos seis atributos
  const attrs = r.rating.attrs, na = attrs.length;
  if (na >= 3) {
    const R = 120, cx = PAD + SIDE / 2, cy = y + R + 46;
    const pt = (i: number, k: number): [number, number] => { const a2 = -Math.PI / 2 + (i * 2 * Math.PI) / na; return [cx + R * k * Math.cos(a2), cy + R * k * Math.sin(a2)]; };
    const poly = (k: (i: number) => number) => { ctx.beginPath(); for (let i = 0; i < na; i++) { const [px, py] = pt(i, k(i)); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.closePath(); };
    for (const k of [0.25, 0.5, 0.75, 1]) { poly(() => k); ctx.strokeStyle = k === 1 ? "#ffffff30" : "#ffffff16"; ctx.lineWidth = 1; ctx.stroke(); }
    for (let i = 0; i < na; i++) { const [px, py] = pt(i, 1); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.strokeStyle = "#ffffff14"; ctx.stroke(); }
    poly((i) => (attrs[i]!.score ?? 0) / 100);
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); rg.addColorStop(0, `${tier.color}22`); rg.addColorStop(1, `${tier.color}66`);
    ctx.fillStyle = rg; ctx.fill(); ctx.strokeStyle = tier.color; ctx.lineWidth = 2.6; ctx.lineJoin = "round"; ctx.stroke(); ctx.lineWidth = 1;
    attrs.forEach((a, i) => {
      const [vx, vy] = pt(i, (a.score ?? 0) / 100);
      if (a.score !== null) { ctx.beginPath(); ctx.arc(vx, vy, 4.6, 0, Math.PI * 2); ctx.fillStyle = tier.color; ctx.fill(); ctx.strokeStyle = C.bg0; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1; }
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / na, ca = Math.cos(ang), sa = Math.sin(ang);
      const lx0 = cx + (R + 20) * ca, ly0 = cy + (R + 20) * sa;
      ctx.textAlign = Math.abs(ca) < 0.25 ? "center" : ca > 0 ? "left" : "right";
      const oy = sa < -0.5 ? -26 : sa > 0.5 ? 14 : -4;
      ctx.fillStyle = C.sub; ctx.font = `600 13px ${SANS}`; ctx.fillText(t(a.label), lx0, ly0 + oy);
      ctx.fillStyle = a.score === null ? C.dim : C.text; ctx.font = `800 17px ${SANS}`; ctx.fillText(a.score === null ? "—" : String(a.score), lx0, ly0 + oy + 19);
    });
    ctx.textAlign = "left";
    y = cy + R + 74;
  }

  // destaques: o ponto mais forte e o que mais merece atenção
  const scored = attrs.filter((a) => a.score !== null);
  if (scored.length >= 2) {
    const best = scored.reduce((m, a) => (a.score! > m.score! ? a : m)), worst = scored.reduce((m, a) => (a.score! < m.score! ? a : m));
    const block = (tag: string, color: string, a: typeof best, text: string) => {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(PAD + 5, y + 8, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.font = `800 12px ${SANS}`; ctx.fillText(tag, PAD + 18, y + 12);
      ctx.fillStyle = C.text; ctx.font = `700 15px ${SANS}`; ctx.fillText(`${t(a.label)} · ${a.score}`, PAD + 18 + ctx.measureText(tag).width + 12, y + 12);
      ctx.fillStyle = C.sub; ctx.font = `500 13.5px ${SANS}`;
      wrap(ctx, text, SIDE - 18, 2).forEach((ln, i) => ctx.fillText(ln, PAD + 18, y + 34 + i * 19));
      y += 82;
    };
    block(t("PONTO FORTE"), "#34d399", best, best.why);
    if (worst.score! < 90 && worst !== best) block(t("PARA MELHORAR"), "#fbbf24", worst, worst.tip ?? worst.why);
  }

  // rodapé
  const fy = H - PAD;
  ctx.fillStyle = C.dim; ctx.font = `500 12px ${SANS}`;
  ctx.fillText(fit(ctx, t("Modelo pedagógico com perfis fictícios, não são benchmarks"), SIDE), PAD, fy);

  // ── mapa ──
  const my = PAD;
  rr(ctx, mapX, my, mapW, mapH, 26); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke();
  ctx.save(); rr(ctx, mapX, my, mapW, mapH, 26); ctx.clip();
  ctx.fillStyle = "#ffffff14"; for (let gx = mapX + 14; gx < mapX + mapW; gx += 22) for (let gy = my + 14; gy < my + mapH; gy += 22) ctx.fillRect(gx, gy, 1.4, 1.4);
  if (!r.nodes.length) {
    ctx.fillStyle = C.dim; ctx.font = `500 22px ${SANS}`; ctx.textAlign = "center"; ctx.fillText(t("Nenhum componente no desenho"), mapX + mapW / 2, my + mapH / 2); ctx.textAlign = "left";
  } else {
    const spanW = spanW0, spanH = spanH0;
    const offX = mapX + (mapW - spanW) / 2, offY = my + (mapH - 30 - spanH) / 2;
    const PX = (x: number) => offX + (x - minX) * kx, PY = (y: number) => offY + (y - minY) * ky;
    const byId = new Map(r.nodes.map((n) => [n.id, n]));
    const s = sN;

    // grupos: molduras atrás de tudo, com o nome no canto
    const GCOL: Record<string, string> = { sky: "#38bdf8", green: "#34d399", amber: "#fbbf24", rose: "#fb7185", violet: "#a78bfa", slate: "#94a3b8" };
    for (const g of gs) {
      const gx = PX(g.x), gy = PY(g.y), gw = PX(g.x + g.w) - gx, gh = PY(g.y + g.h) - gy, col = GCOL[g.color] ?? GCOL.sky!;
      rr(ctx, gx, gy, gw, gh, 22 * s); ctx.fillStyle = `${col}14`; ctx.fill();
      ctx.setLineDash([10, 8]); ctx.strokeStyle = `${col}99`; ctx.lineWidth = Math.max(1.6, 2.2 * s); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = `700 ${Math.max(13, 15 * s)}px ${SANS}`; ctx.fillStyle = col; ctx.textBaseline = "alphabetic";
      ctx.fillText(fit(ctx, g.name, Math.max(60, gw - 32)), gx + 16, gy + Math.max(22, 26 * s));
    }

    // conexões: linha, partículas de tráfego; o rótulo de protocolo é posicionado depois, fora dos cards
    const labels: { x: number; y: number; e: ReportEdge; pts: number[]; compact?: boolean }[] = [];
    for (const e of r.edges) {
      const a = byId.get(e.source), b = byId.get(e.target); if (!a || !b) continue;
      const ra = { x: PX(a.x), y: PY(a.y), w: a.w * WF * s, h: a.h * s }, rb = { x: PX(b.x), y: PY(b.y), w: b.w * WF * s, h: b.h * s };
      const sp = e.sp ?? "right", tp = e.tp ?? "left";
      const [sx, sy] = anchor(ra, sp), [tx2, ty] = anchor(rb, tp);
      const [c1x, c1y] = ctrl(sp, sx, sy, tx2, ty), [c2x, c2y] = ctrl(tp, tx2, ty, sx, sy);
      const pts = [sx, sy, c1x, c1y, c2x, c2y, tx2, ty];
      const col = protoOf(e.protocol).color;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(c1x, c1y, c2x, c2y, tx2, ty);
      ctx.strokeStyle = e.unused ? "#3a4c78" : `${col}b0`; ctx.lineWidth = Math.max(1.6, 2.2 * s); ctx.lineCap = "round";
      ctx.setLineDash(e.unused ? [6, 6] : e.mode === "async" ? [2, 7] : []); ctx.stroke(); ctx.setLineDash([]);
      if (e.flow > 0) { // partículas: o tráfego "parado" no instante do print, espaçado ao longo da conexão
        for (const u of [0.12, 0.3, 0.48, 0.66, 0.84]) { const [qx, qy] = bez(pts, u); ctx.beginPath(); ctx.arc(qx, qy, Math.max(2.4, 3.4 * s), 0, Math.PI * 2); ctx.fillStyle = e.hot ? "#f87171" : col; ctx.fill(); }
      }
      const ah = Math.max(8, 11 * s), acol = e.unused ? "#3a4c78" : col;
      const endDir = tx2 === c2x && ty === c2y ? [tx2 - sx, ty - sy] : [tx2 - c2x, ty - c2y], startDir = sx === c1x && sy === c1y ? [sx - tx2, sy - ty] : [sx - c1x, sy - c1y];
      arrowHead(ctx, tx2, ty, endDir[0]!, endDir[1]!, ah, acol);
      if (e.both) arrowHead(ctx, sx, sy, startDir[0]!, startDir[1]!, ah, acol);
      labels.push({ x: 0, y: 0, e, pts });
    }
    // posição dos rótulos: tenta o meio da conexão e, se cair sobre um card ou outro rótulo, procura outro ponto da mesma curva
    const nodeRects = r.nodes.map((n) => ({ x: PX(n.x) - 4, y: PY(n.y) - 4, w: n.w * WF * s + 8, h: n.h * s + 8 }));
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const hit = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const overlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const kk = Math.max(0.9, Math.min(1.1, s + 0.1));
    for (const L of labels) {
      ctx.font = `700 ${12 * kk}px ${SANS}`; const nw = ctx.measureText(protoOf(L.e.protocol).name).width;
      ctx.font = `600 ${10.5 * kk}px ${SANS}`; const mw = ctx.measureText(L.e.mode).width;
      const withFlow = L.e.flow > 0 && !L.e.unused;
      let found: [number, number] | null = null;
      for (const compact of [false, true]) { // sem espaço para "HTTPS sync", usa só o nome do protocolo (o modo continua no traço da linha)
        const lw = 12 * kk + nw + (compact ? 0 : 8 * kk + mw) + 12 * kk, lh2 = 24 * kk + (withFlow ? 26 * kk : 0);
        for (const u of LABEL_US) {
          const [qx, qy] = bez(L.pts, u); const box = { x: qx - lw / 2, y: qy - 14 * kk, w: lw, h: lh2 };
          if (!nodeRects.some((n) => hit(n, box)) && !placed.some((p) => hit(p, box))) { found = [qx, qy]; L.compact = compact; placed.push(box); break; }
        }
        if (found) break;
      }
      if (!found) { // nenhum ponto livre: escolhe o da curva que menos cobre os cards, em vez de cair no meio
        const lw = 24 * kk + nw, lh2 = 24 * kk; let best = Infinity;
        for (const u of LABEL_US) {
          const [qx, qy] = bez(L.pts, u); const box = { x: qx - lw / 2, y: qy - 14 * kk, w: lw, h: lh2 };
          const cost = nodeRects.reduce((a, n) => a + overlap(n, box), 0) * 3 + placed.reduce((a, p) => a + overlap(p, box), 0);
          if (cost < best) { best = cost; found = [qx, qy]; }
        }
        found = found ?? bez(L.pts, 0.5); L.compact = true;
        placed.push({ x: found[0] - lw / 2, y: found[1] - 14 * kk, w: lw, h: lh2 });
      }
      L.x = found[0]; L.y = found[1];
    }

    // componentes
    for (const n of r.nodes) {
      const nx = PX(n.x), ny = PY(n.y); const w = n.w * WF, h = n.h; const color = CAT_COLOR[n.cat] ?? CAT_COLOR.compute!; const hs = HEALTH[n.health] ?? HEALTH.idle!;
      const bad = n.health === "saturated" || n.health === "unavailable";
      ctx.save(); ctx.translate(nx, ny); ctx.scale(s, s);
      ctx.shadowColor = "#00000066"; ctx.shadowBlur = 18 * s; ctx.shadowOffsetY = 6 * s;
      rr(ctx, 0, 0, w, h, 18); ctx.fillStyle = "#13203f"; ctx.fill(); ctx.shadowColor = "transparent";
      ctx.strokeStyle = bad ? "#f8717199" : "#2a3d6b"; ctx.lineWidth = bad ? 1.8 : 1.2; ctx.stroke();
      ctx.save(); rr(ctx, 0, 0, w, h, 18); ctx.clip(); ctx.fillStyle = color; ctx.fillRect(0, 0, w, 4); ctx.restore();
      // cabeçalho: ícone, nome, provedor/tipo e logo do provedor
      rr(ctx, 14, 16, 36, 36, 11); ctx.fillStyle = `${color}33`; ctx.fill();
      drawIcon(ctx, n.icon, 32, 34, 22, color);
      const prov = n.providerId ? provImgs.get(n.providerId) : undefined; const bx = n.providerId ? logoBox(n.providerId, 34) : { w: 0, h: 0 }; const pw = prov ? bx.w : 0;
      ctx.fillStyle = C.text; ctx.font = `700 15px ${SANS}`; ctx.fillText(fit(ctx, n.name, w - 62 - 12 - pw - (pw ? 6 : 0)), 62, 32);
      ctx.fillStyle = C.dim; ctx.font = `500 11.5px ${SANS}`; ctx.fillText(fit(ctx, n.providerName ?? n.type, w - 62 - 12 - pw - (pw ? 6 : 0)), 62, 48);
      if (prov && n.providerId) {
        const mode = INVERT_ON_DARK.has(n.providerId) ? "silhouette" : SOFT_INVERT_ON_DARK.has(n.providerId) ? "invert" : null; // traço escuro vira silhueta clara
        const lg = LOGOS[n.providerId]!; const ar = lg.w / lg.h; const dw = Math.min(pw, bx.h * ar), dh = dw / ar; // cabe na caixa sem deformar
        const dx = w - 12 - pw + (pw - dw) / 2, dy = 16 + (bx.h - dh) / 2;
        if (!mode) ctx.drawImage(prov, dx, dy, dw, dh);
        else if (CTX_FILTER) { ctx.filter = mode === "silhouette" ? "brightness(0) invert(1)" : "invert(1)"; ctx.drawImage(prov, dx, dy, dw, dh); ctx.filter = "none"; }
        else ctx.drawImage(tintedLogo(prov, mode, n.providerId, Math.ceil(dw * s * 2), Math.ceil(dh * s * 2)), dx, dy, dw, dh); // Safari antigo: sem ctx.filter
      }
      let cy = 66;
      if (n.hasLoad) {
        const u = n.util ?? null; const pct = u === null ? 0 : Math.min(100, u * 100);
        rr(ctx, 14, cy, w - 28, 6, 3); ctx.fillStyle = "#1b2a4d"; ctx.fill();
        if (pct > 0) { rr(ctx, 14, cy, Math.max(6, ((w - 28) * pct) / 100), 6, 3); ctx.fillStyle = bad ? "#f87171" : n.health === "degraded" ? "#fbbf24" : "#34d399"; ctx.fill(); }
        cy += 24;
        ctx.fillStyle = C.text; ctx.font = `700 13px ${SANS}`; const off2 = num(n.offered ?? 0); ctx.fillText(off2, 14, cy);
        const ow = ctx.measureText(off2).width; ctx.fillStyle = C.dim; ctx.font = `500 12px ${SANS}`; ctx.fillText("/s", 14 + ow + 2, cy);
        ctx.textAlign = "right"; ctx.fillStyle = C.text; ctx.font = `700 13px ${SANS}`; ctx.fillText(u === null ? "—" : `${Math.round(u * 100)}%`, w - 14, cy); ctx.textAlign = "left";
        cy += 14;
      }
      // status e réplicas
      const ry = Math.max(cy, h - 38);
      const rep = `×${n.replicas}`; ctx.font = `700 12px ${SANS}`; const rw = ctx.measureText(rep).width + 18;
      ctx.font = `700 11.5px ${SANS}`; const bmax = w - 28 - rw - 8, bwid = Math.min(ctx.measureText(n.status).width + 28, bmax);
      rr(ctx, 14, ry, bwid, 22, 11); ctx.fillStyle = hs.bg; ctx.fill();
      ctx.fillStyle = hs.fg; ctx.beginPath(); ctx.arc(25, ry + 11, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(fit(ctx, n.status, bwid - 28), 33, ry + 15.5);
      ctx.font = `700 12px ${SANS}`;
      rr(ctx, w - 14 - rw, ry, rw, 22, 11); ctx.fillStyle = "#1f3160"; ctx.fill(); ctx.fillStyle = C.text; ctx.textAlign = "center"; ctx.fillText(rep, w - 14 - rw / 2, ry + 15); ctx.textAlign = "left";
      ctx.restore();
    }

    // rótulos das conexões por cima dos componentes: protocolo, modo e vazão
    for (const { x, y: ly, e, compact } of labels) {
      const st = protoOf(e.protocol); const k = kk;
      const name = st.name, mode = e.mode;
      ctx.font = `700 ${12 * k}px ${SANS}`; const nw = ctx.measureText(name).width; ctx.font = `600 ${10.5 * k}px ${SANS}`; const mw = ctx.measureText(mode).width;
      const w = 12 * k + nw + (compact ? 0 : 8 * k + mw) + 12 * k, h = 24 * k;
      rr(ctx, x - w / 2, ly - h / 2, w, h, h / 2); ctx.fillStyle = "#0d1730f2"; ctx.fill(); ctx.strokeStyle = `${st.color}99`; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = st.color; ctx.beginPath(); ctx.arc(x - w / 2 + 12 * k, ly, 3.4 * k, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.text; ctx.font = `700 ${12 * k}px ${SANS}`; ctx.fillText(name, x - w / 2 + 19 * k, ly + 4.2 * k);
      if (!compact) { ctx.fillStyle = C.dim; ctx.font = `600 ${10.5 * k}px ${SANS}`; ctx.fillText(mode, x - w / 2 + 19 * k + nw + 6 * k, ly + 3.8 * k); }
      if (e.flow > 0 && !e.unused) {
        const f = `${num(e.flow)}/s`; ctx.font = `700 ${11 * k}px ${SANS}`; const fw = ctx.measureText(f).width + 14 * k; const fh = 20 * k;
        rr(ctx, x - fw / 2, ly + h / 2 + 3 * k, fw, fh, fh / 2); ctx.fillStyle = e.hot ? "#f871712e" : "#0d1730e6"; ctx.fill();
        ctx.fillStyle = e.hot ? "#fca5a5" : C.sub; ctx.textAlign = "center"; ctx.fillText(f, x, ly + h / 2 + 3 * k + 14 * k); ctx.textAlign = "left";
      }
    }

    // legenda de protocolos em uso
    const used = [...new Set(r.edges.map((e) => e.protocol))]; let lx = mapX + 26; const ly = my + mapH - 22;
    ctx.font = `600 14px ${SANS}`;
    for (const p of used.slice(0, 10)) {
      const st = protoOf(p); ctx.fillStyle = st.color; ctx.beginPath(); ctx.arc(lx + 5, ly - 5, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.sub; ctx.fillText(st.name, lx + 16, ly); lx += 16 + ctx.measureText(st.name).width + 22;
    }
  }
  ctx.restore();

  return await new Promise<Blob>((resolve, reject) => cv.toBlob((b) => (b ? resolve(b) : reject(new Error("png"))), "image/png"));
}
