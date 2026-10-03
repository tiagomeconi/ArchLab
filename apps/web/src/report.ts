import { LOGOS } from "./logos.generated";
import { INVERT_ON_DARK, SOFT_INVERT_ON_DARK, logoBox } from "./ProviderLogo";
import { protoOf } from "./protocols";
import { t } from "./i18n";
import type { Rating, Tier } from "./rating";

/** Entrada do relatório: tudo o que aparece na imagem vem daqui, sem ler o DOM. */
export interface ReportNode {
  id: string; x: number; y: number; w: number; h: number; name: string; type: string; icon: string; cat: string; replicas: number;
  providerId?: string; providerName?: string;
  /** utilização 0–1+ (null = desconhecida) e carga oferecida em req/s; ausentes quando o nó não recebe carga */
  util?: number | null; offered?: number; health: string; status: string; hasLoad: boolean; backlog?: number;
}
export interface ReportEdge { source: string; target: string; protocol: string; mode: string; flow: number; hot: boolean; unused: boolean }
export interface ReportInput {
  title: string;
  summary?: string;
  level?: string;
  mode: "study" | "free";
  /** id do logo da empresa (co-*) ou nome de um ícone Material quando o caso não é de empresa */
  logoId?: string;
  iconName?: string;
  rating: Rating;
  met: number;
  total: number;
  nodes: ReportNode[];
  edges: ReportEdge[];
}

const DPR = 2;
const C = { bg0: "#070d1b", bg1: "#0d1730", card: "#0f1a33", line: "#22325a", text: "#eaf0fa", sub: "#9fb1cf", dim: "#6f82a6", accent: "#38bdf8" };
const HEALTH: Record<string, { fg: string; bg: string }> = {
  healthy: { fg: "#34d399", bg: "#34d3991f" }, degraded: { fg: "#fbbf24", bg: "#fbbf241f" }, saturated: { fg: "#f87171", bg: "#f871711f" },
  unavailable: { fg: "#f87171", bg: "#f871711f" }, unknown: { fg: "#9fb1cf", bg: "#9fb1cf1f" }, idle: { fg: "#9fb1cf", bg: "#9fb1cf1a" },
  origin: { fg: "#38bdf8", bg: "#38bdf81f" }, noprofile: { fg: "#9fb1cf", bg: "#9fb1cf1a" },
};
const TIER: Record<Tier, { name: string; color: string }> = {
  bronze: { name: "Bronze", color: "#cd8a55" }, silver: { name: "Prata", color: "#b9c4d6" }, gold: { name: "Ouro", color: "#f0c23a" }, elite: { name: "Elite", color: "#38bdf8" },
};
const CAT_COLOR: Record<string, string> = { origin: "#22d3ee", iot: "#a3e635", network: "#a78bfa", compute: "#60a5fa", data: "#e879f9", messaging: "#fb923c", support: "#2dd4bf" };
const SANS = `"Inter Variable", Inter, -apple-system, "Segoe UI", system-ui, sans-serif`;
const num = (n: number) => (n >= 10000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(".", ",")}k` : Math.round(n).toLocaleString("pt-BR"));

const svgImage = (logo: { w: number; h: number; body: string }, color?: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const body = color ? logo.body.replace(/currentColor/g, color) : logo.body;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logo.w} ${logo.h}" width="${logo.w * 4}" height="${logo.h * 4}">${body}</svg>`;
    const img = new Image();
    img.onload = () => resolve(img); img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
const pngImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => resolve(null); i.src = src; });

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const k = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + k, y); ctx.arcTo(x + w, y, x + w, y + h, k); ctx.arcTo(x + w, y + h, x, y + h, k); ctx.arcTo(x, y + h, x, y, k); ctx.arcTo(x, y, x + w, y, k); ctx.closePath();
}
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
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
function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
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

/**
 * Desenha o relatório como um "print" do laboratório: coluna lateral compacta (caso, nota, requisitos) e o mapa em destaque,
 * com componentes, provedores, protocolos, carga e utilização. Formato horizontal para compartilhar.
 */
export async function renderReport(r: ReportInput): Promise<Blob> {
  try { await Promise.all([document.fonts.load(`700 24px ${SANS}`), document.fonts.load(`500 16px ${SANS}`), document.fonts.load(`24px "Material Symbols Rounded Variable"`)]); } catch { /* usa a fonte do sistema */ }

  const caseLogo = r.logoId ? LOGOS[r.logoId] : undefined;
  const [logoImg, brandImg] = await Promise.all([caseLogo ? svgImage(caseLogo, "#f4f7fb") : Promise.resolve(null), pngImage("/logo.png")]);
  const provImgs = new Map<string, HTMLImageElement>();
  await Promise.all([...new Set(r.nodes.map((n) => n.providerId).filter(Boolean) as string[])].map(async (id) => {
    const l = LOGOS[id]; if (!l) return;
    const img = await svgImage(l, "#f4f7fb"); if (img) provImgs.set(id, img);
  }));

  // ── geometria ──
  const PAD = 48, SIDE = 440, GAP = 32;
  const minX = Math.min(...r.nodes.map((n) => n.x)), maxX = Math.max(...r.nodes.map((n) => n.x + n.w));
  const minY = Math.min(...r.nodes.map((n) => n.y)), maxY = Math.max(...r.nodes.map((n) => n.y + n.h));
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
  const mapH = r.nodes.length ? Math.round(Math.max(860, Math.min(maxH, spanH0 + inner * 2 + 30))) : 760;
  const H = mapH + PAD * 2;

  const cv = document.createElement("canvas"); cv.width = W * DPR; cv.height = H * DPR;
  const ctx = cv.getContext("2d")!; ctx.scale(DPR, DPR); ctx.textBaseline = "alphabetic";

  const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, C.bg0); bg.addColorStop(1, C.bg1);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const tier = r.rating.tier ? TIER[r.rating.tier] : { name: "—", color: C.dim };
  const glow = ctx.createRadialGradient(PAD + 80, PAD, 0, PAD + 80, PAD, 520); glow.addColorStop(0, `${tier.color}2e`); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, 700);

  // ── coluna lateral ──
  let y = PAD;
  const lh = 40, lw = logoImg && caseLogo ? Math.min(120, Math.round(lh * (caseLogo.w / caseLogo.h))) : lh;
  const tileW = lw + 28, tileH = 68;
  rr(ctx, PAD, y, tileW, tileH, 18); ctx.fillStyle = "#12203f"; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
  if (logoImg && caseLogo) {
    const ar = caseLogo.w / caseLogo.h; const dw = ar >= lw / lh ? lw : lh * ar, dh = ar >= lw / lh ? lw / ar : lh;
    ctx.drawImage(logoImg, PAD + (tileW - dw) / 2, y + (tileH - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = C.accent; ctx.font = `30px "Material Symbols Rounded Variable"`; ctx.textAlign = "center";
    ctx.fillText(r.iconName ?? "account_tree", PAD + tileW / 2, y + 45); ctx.textAlign = "left";
  }
  const tx = PAD + tileW + 18;
  ctx.fillStyle = C.text; ctx.font = `700 32px ${SANS}`; ctx.fillText(fit(ctx, t(r.title), PAD + SIDE - tx), tx, y + 34);
  ctx.fillStyle = C.sub; ctx.font = `500 15px ${SANS}`;
  ctx.fillText(fit(ctx, [r.mode === "study" ? t("Modo estudo") : t("Modo livre"), r.level ? t(r.level) : ""].filter(Boolean).join("  ·  "), PAD + SIDE - tx), tx, y + 58);
  y += tileH + 22;

  if (r.summary) {
    ctx.fillStyle = C.sub; ctx.font = `500 17px ${SANS}`;
    const lines = wrap(ctx, t(r.summary), SIDE, 6);
    lines.forEach((ln, i) => ctx.fillText(ln, PAD, y + 16 + i * 25)); y += lines.length * 25 + 26;
  }

  // nota, compacta
  const nh = 74;
  rr(ctx, PAD, y, SIDE, nh, 16); ctx.fillStyle = `${tier.color}18`; ctx.fill(); ctx.strokeStyle = `${tier.color}66`; ctx.lineWidth = 1.2; ctx.stroke(); ctx.lineWidth = 1;
  ctx.fillStyle = tier.color; ctx.font = `800 50px ${SANS}`; ctx.fillText(r.rating.overall === null ? "—" : String(r.rating.overall), PAD + 20, y + 56);
  const nx0 = PAD + 20 + ctx.measureText(r.rating.overall === null ? "—" : String(r.rating.overall)).width + 16;
  ctx.fillStyle = C.sub; ctx.font = `700 12px ${SANS}`; ctx.fillText("OVR", nx0, y + 30);
  ctx.fillStyle = tier.color; ctx.font = `800 17px ${SANS}`; ctx.fillText((r.rating.tier ? t(tier.name) : t("Sem nota")).toUpperCase(), nx0, y + 52);
  if (r.total > 0) { ctx.textAlign = "right"; ctx.fillStyle = C.sub; ctx.font = `500 13px ${SANS}`;
    ctx.fillText(t("{met} de {total} requisitos", { met: r.met, total: r.total }), PAD + SIDE - 16, y + 44); ctx.textAlign = "left"; }
  y += nh + 18;
  // atributos, em miniatura
  r.rating.attrs.forEach((a, i) => {
    const ry = y + i * 30;
    ctx.fillStyle = C.sub; ctx.font = `600 14px ${SANS}`; ctx.fillText(t(a.label), PAD, ry + 12);
    const bx = PAD + 130, bwid = SIDE - 130 - 34;
    rr(ctx, bx, ry + 5, bwid, 6, 3); ctx.fillStyle = "#1b2a4d"; ctx.fill();
    if (a.score !== null) {
      const col = a.score >= 90 ? "#38bdf8" : a.score >= 75 ? "#f0c23a" : a.score >= 60 ? "#b9c4d6" : "#cd8a55";
      rr(ctx, bx, ry + 5, Math.max(6, (bwid * a.score) / 100), 6, 3); ctx.fillStyle = col; ctx.fill();
    }
    ctx.textAlign = "right"; ctx.fillStyle = a.score === null ? C.dim : C.text; ctx.font = `700 14px ${SANS}`;
    ctx.fillText(a.score === null ? "—" : String(a.score), PAD + SIDE, ry + 13); ctx.textAlign = "left";
  });
  // marca e data no pé da coluna
  const fy = H - PAD;
  ctx.fillStyle = C.dim; ctx.font = `500 12px ${SANS}`;
  const date = new Date().toLocaleDateString(document.documentElement.lang === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  ctx.fillText(date, PAD, fy);
  ctx.fillText(fit(ctx, t("Modelo pedagógico com perfis fictícios, não são benchmarks"), SIDE), PAD, fy - 18);
  if (brandImg) ctx.drawImage(brandImg, PAD, fy - 80, 34, 34);
  ctx.fillStyle = C.text; ctx.font = `700 20px ${SANS}`; ctx.fillText("ArchLab", PAD + 44, fy - 61);
  ctx.fillStyle = C.dim; ctx.font = `500 12px ${SANS}`; ctx.fillText(t("Laboratório de system design"), PAD + 44, fy - 44);

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

    // conexões: linha, partículas de tráfego; o rótulo de protocolo é posicionado depois, fora dos cards
    const labels: { x: number; y: number; e: ReportEdge; pts: number[]; compact?: boolean }[] = [];
    for (const e of r.edges) {
      const a = byId.get(e.source), b = byId.get(e.target); if (!a || !b) continue;
      const sx = PX(a.x) + a.w * WF * s, sy = PY(a.y) + (a.h * s) / 2, tx2 = PX(b.x), ty = PY(b.y) + (b.h * s) / 2;
      const c1 = sx + off(sx - tx2), c2 = tx2 - off(tx2 - sx);
      const pts = [sx, sy, c1, sy, c2, ty, tx2, ty];
      const col = protoOf(e.protocol).color;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(pts[2]!, pts[3]!, pts[4]!, pts[5]!, tx2, ty);
      ctx.strokeStyle = e.unused ? "#3a4c78" : `${col}b0`; ctx.lineWidth = Math.max(1.6, 2.2 * s); ctx.lineCap = "round";
      ctx.setLineDash(e.unused ? [6, 6] : e.mode === "async" ? [2, 7] : []); ctx.stroke(); ctx.setLineDash([]);
      if (e.flow > 0) { // partículas: o tráfego "parado" no instante do print, espaçado ao longo da conexão
        for (const u of [0.12, 0.3, 0.48, 0.66, 0.84]) { const [qx, qy] = bez(pts, u); ctx.beginPath(); ctx.arc(qx, qy, Math.max(2.4, 3.4 * s), 0, Math.PI * 2); ctx.fillStyle = e.hot ? "#f87171" : col; ctx.fill(); }
      }
      ctx.beginPath(); ctx.arc(tx2, ty, Math.max(2.5, 3.4 * s), 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      labels.push({ x: 0, y: 0, e, pts });
    }
    // posição dos rótulos: tenta o meio da conexão e, se cair sobre um card ou outro rótulo, procura outro ponto da mesma curva
    const nodeRects = r.nodes.map((n) => ({ x: PX(n.x) - 4, y: PY(n.y) - 4, w: n.w * WF * s + 8, h: n.h * s + 8 }));
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const hit = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const kk = Math.max(0.9, Math.min(1.1, s + 0.1));
    for (const L of labels) {
      ctx.font = `700 ${12 * kk}px ${SANS}`; const nw = ctx.measureText(protoOf(L.e.protocol).name).width;
      ctx.font = `600 ${10.5 * kk}px ${SANS}`; const mw = ctx.measureText(L.e.mode).width;
      const withFlow = L.e.flow > 0 && !L.e.unused;
      let found: [number, number] | null = null;
      for (const compact of [false, true]) { // sem espaço para "HTTPS sync", usa só o nome do protocolo (o modo continua no traço da linha)
        const lw = 12 * kk + nw + (compact ? 0 : 8 * kk + mw) + 12 * kk, lh2 = 24 * kk + (withFlow ? 26 * kk : 0);
        for (const u of [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74, 0.18, 0.82]) {
          const [qx, qy] = bez(L.pts, u); const box = { x: qx - lw / 2, y: qy - 14 * kk, w: lw, h: lh2 };
          if (!nodeRects.some((n) => hit(n, box)) && !placed.some((p) => hit(p, box))) { found = [qx, qy]; L.compact = compact; placed.push(box); break; }
        }
        if (found) break;
      }
      if (!found) { found = bez(L.pts, 0.5); L.compact = true; placed.push({ x: found[0] - 40, y: found[1] - 14 * kk, w: 80, h: 24 * kk }); }
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
      ctx.fillStyle = color; ctx.font = `22px "Material Symbols Rounded Variable"`; ctx.textAlign = "center"; ctx.fillText(n.icon, 32, 42); ctx.textAlign = "left";
      const prov = n.providerId ? provImgs.get(n.providerId) : undefined; const bx = n.providerId ? logoBox(n.providerId, 34) : { w: 0, h: 0 }; const pw = prov ? bx.w : 0;
      ctx.fillStyle = C.text; ctx.font = `700 15px ${SANS}`; ctx.fillText(fit(ctx, n.name, w - 62 - 12 - pw - (pw ? 6 : 0)), 62, 32);
      ctx.fillStyle = C.dim; ctx.font = `500 11.5px ${SANS}`; ctx.fillText(fit(ctx, n.providerName ?? n.type, w - 62 - 12 - pw - (pw ? 6 : 0)), 62, 48);
      if (prov && n.providerId) {
        if (INVERT_ON_DARK.has(n.providerId)) ctx.filter = "brightness(0) invert(1)"; // logos de traço escuro viram silhueta clara
        else if (SOFT_INVERT_ON_DARK.has(n.providerId)) ctx.filter = "invert(1)";
        const lg = LOGOS[n.providerId]!; const ar = lg.w / lg.h; const dw = Math.min(pw, bx.h * ar), dh = dw / ar; // cabe na caixa sem deformar
        ctx.drawImage(prov, w - 12 - pw + (pw - dw) / 2, 16 + (bx.h - dh) / 2, dw, dh); ctx.filter = "none";
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
