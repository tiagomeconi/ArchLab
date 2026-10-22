import { LEAGUES, leagueOf } from "./leagues";
import { LOGOS } from "./logos.generated";
import { badgeImage, C, drawIcon, fit, pngImage, rr, SANS, svgImage, wrap } from "./report";
import { initials } from "./account";
import { localeOf, t } from "./i18n";

/** Cartão vertical (1080×1350, o formato do feed do LinkedIn e do Instagram) com a liga, a nota e o caso ou o perfil. */
export interface CardInput {
  kind: "case" | "profile";
  title: string; subtitle?: string;
  /** id do logo da empresa (co-*) ou nome de um ícone Material quando o caso não é de empresa */
  logoId?: string; iconName?: string;
  overall: number | null; competitive?: boolean; points?: number;
  /** caso: os seis atributos (radar) */
  attrs?: { label: string; score: number | null }[];
  /** perfil: três números de destaque */
  stats?: { label: string; value: string }[];
  author?: string; handle?: string;
  /** perfil: foto (URL pública), desde quando é membro e as conquistas desbloqueadas (ícone Material + nome) */
  photoUrl?: string | null; memberSince?: string; achievements?: { icon: string; title: string }[];
}

/** Baixa a foto como blob (sem "sujar" o canvas com imagem de outra origem); se falhar, o cartão usa as iniciais. */
async function loadPhoto(url?: string | null): Promise<HTMLImageElement | null> {
  if (!url) return null;
  try {
    const r = await fetch(url, { mode: "cors" }); if (!r.ok) return null;
    const href = URL.createObjectURL(await r.blob());
    return await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = href; });
  } catch { return null; }
}

const W = 1080, H = 1350, DPR = 2;

export async function renderSocialCard(c: CardInput): Promise<Blob> {
  try { await Promise.all([document.fonts.load(`800 40px ${SANS}`), document.fonts.load(`600 20px ${SANS}`), document.fonts.load(`28px "Material Symbols Rounded Variable"`)]); } catch { /* usa a fonte do sistema */ }
  const lg = !c.competitive || c.kind === "profile" || c.overall === null ? null : leagueOf(c.overall);
  const draw = lg ?? LEAGUES[0]!; const color = lg ? lg.c1 : C.dim;
  const logo = c.logoId ? LOGOS[c.logoId] : undefined;
  const [brand, badge, logoImg, photo] = await Promise.all([pngImage("/logo.png"), badgeImage(draw), logo ? svgImage(logo, "#f4f7fb") : Promise.resolve(null), c.kind === "profile" ? loadPhoto(c.photoUrl) : Promise.resolve(null)]);

  const cv = document.createElement("canvas"); cv.width = W * DPR; cv.height = H * DPR;
  const ctx = cv.getContext("2d")!; ctx.scale(DPR, DPR); ctx.textBaseline = "alphabetic";
  const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, C.bg0); bg.addColorStop(1, C.bg1); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 330, 0, W / 2, 330, 640); glow.addColorStop(0, `${color}40`); glow.addColorStop(1, "transparent"); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff10"; for (let x = 24; x < W; x += 28) for (let y = 24; y < H; y += 28) ctx.fillRect(x, y, 1.4, 1.4);
  ctx.textAlign = "center";

  // topo: marca
  if (brand) ctx.drawImage(brand, 64, 56, 52, 52);
  ctx.textAlign = "left"; ctx.fillStyle = C.text; ctx.font = `700 34px ${SANS}`; ctx.fillText("ArchLab", 130, 92);
  ctx.textAlign = "right"; ctx.fillStyle = C.dim; ctx.font = `500 22px ${SANS}`; ctx.fillText(c.kind === "case" ? t("Relatório de arquitetura") : t("Perfil de arquitetura"), W - 64, 90);

  if (c.kind === "profile") {
    // ── perfil: a pessoa em primeiro plano (foto, nome, @usuário), a liga como selo e a nota como detalhe ──
    const cx = W / 2, cy = 330, R = 140;
    ctx.beginPath(); ctx.arc(cx, cy, R + 16, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    if (photo) { const sz = Math.min(photo.width, photo.height); ctx.drawImage(photo, (photo.width - sz) / 2, (photo.height - sz) / 2, sz, sz, cx - R, cy - R, R * 2, R * 2); }
    else { ctx.fillStyle = C.accent; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.fillStyle = "#04121f"; ctx.font = `700 120px ${SANS}`; ctx.textAlign = "center"; ctx.fillText(initials(c.title), cx, cy + 42); }
    ctx.restore();
    const sw = 104, sh = Math.round((sw * 72) / 64), sx = cx + R * 0.62, sy = cy + R * 0.5;
    ctx.beginPath(); ctx.arc(sx + sw / 2, sy + sh / 2, sw * 0.62, 0, Math.PI * 2); ctx.fillStyle = C.bg0; ctx.fill();
    ctx.save(); if (!lg) ctx.globalAlpha = 0.3; if (lg && badge) ctx.drawImage(badge, sx, sy, sw, sh); else drawIcon(ctx, "emoji_events", sx+sw/2, sy+sh/2, 50, C.accent); ctx.restore();

    ctx.textAlign = "center"; ctx.fillStyle = C.text; ctx.font = `800 68px ${SANS}`; ctx.fillText(fit(ctx, c.title, W - 128), cx, 600);
    if (c.handle) { ctx.fillStyle = C.sub; ctx.font = `600 32px ${SANS}`; ctx.fillText(`@${c.handle}`, cx, 648); }
    if (c.memberSince) { ctx.fillStyle = C.dim; ctx.font = `500 24px ${SANS}`; ctx.fillText(t("Membro desde {data}", { data: c.memberSince }), cx, c.handle ? 690 : 650); }

    // liga e nota em uma linha, com a nota discreta
    const ly = c.handle || c.memberSince ? 780 : 740;
    const name = `${c.points ?? "—"} ${t("pontos")}`.toUpperCase();
    ctx.font = `800 50px ${SANS}`; const nw = ctx.measureText(name).width;
    const ovTxt = c.overall === null ? "" : `OVR ${c.overall}`; ctx.font = `700 36px ${SANS}`; const ow = ovTxt ? ctx.measureText(ovTxt).width : 0;
    const total = nw + (ovTxt ? 44 + ow : 0); const x0 = cx - total / 2;
    ctx.textAlign = "left"; ctx.fillStyle = color; ctx.font = `800 50px ${SANS}`; ctx.fillText(name, x0, ly);
    if (ovTxt) { ctx.fillStyle = C.dim; ctx.fillRect(x0 + nw + 20, ly - 34, 3, 34); ctx.fillStyle = C.sub; ctx.font = `700 36px ${SANS}`; ctx.fillText(ovTxt, x0 + nw + 44, ly - 3); }

    // números de destaque
    let y = ly + 64;
    if (c.stats?.length) {
      const k = c.stats.length, gap = 24, tw = (W - 128 - gap * (k - 1)) / k, th = 150;
      c.stats.forEach((st, i) => {
        const x = 64 + i * (tw + gap);
        rr(ctx, x, y, tw, th, 24); ctx.fillStyle = "#ffffff0d"; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.textAlign = "center"; ctx.fillStyle = C.text; ctx.font = `800 54px ${SANS}`; ctx.fillText(st.value, x + tw / 2, y + 78);
        ctx.fillStyle = C.sub; ctx.font = `600 22px ${SANS}`; ctx.fillText(fit(ctx, st.label, tw - 24), x + tw / 2, y + 120);
      });
      y += th + 44;
    }
    // conquistas: as mais difíceis que a pessoa já desbloqueou, cada uma com ícone e nome
    const all = c.achievements ?? [];
    if (all.length) {
      const shown = all.slice(-5), gap = 16, tw = (W - 128 - gap * 4) / 5, th = 148;
      ctx.textAlign = "left"; ctx.fillStyle = C.sub; ctx.font = `700 22px ${SANS}`; ctx.fillText(t("Conquistas").toUpperCase(), 64, y);
      ctx.textAlign = "right"; ctx.fillStyle = C.dim; ctx.font = `600 22px ${SANS}`; ctx.fillText(t("{n} desbloqueadas", { n: all.length }), W - 64, y);
      y += 18;
      const x0 = W / 2 - (shown.length * tw + (shown.length - 1) * gap) / 2;
      shown.forEach((a, i) => {
        const x = x0 + i * (tw + gap);
        const g = ctx.createLinearGradient(x, y, x, y + th); g.addColorStop(0, `${color}30`); g.addColorStop(1, `${color}0d`);
        rr(ctx, x, y, tw, th, 24); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = `${color}66`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(x + tw / 2, y + 46, 30, 0, Math.PI * 2); ctx.fillStyle = `${color}33`; ctx.fill(); ctx.strokeStyle = `${color}99`; ctx.lineWidth = 1.5; ctx.stroke();
        drawIcon(ctx, a.icon, x + tw / 2, y + 46, 34, color);
        ctx.textAlign = "center"; ctx.fillStyle = C.text; ctx.font = `600 19px ${SANS}`;
        wrap(ctx, t(a.title), tw - 20, 2).forEach((ln, k) => ctx.fillText(ln, x + tw / 2, y + 100 + k * 23));
      });
    }
  } else {
  // emblema, liga e nota
  const bW = 250, bH = Math.round((bW * 72) / 64);
  ctx.save(); if (!lg) ctx.globalAlpha = 0.3; if (lg && badge) ctx.drawImage(badge, (W - bW) / 2, 150, bW, bH); ctx.restore();
  ctx.textAlign = "center";
  ctx.fillStyle = color; ctx.font = `800 62px ${SANS}`; ctx.fillText((lg ? t(lg.name) : t("Nota de prática")).toUpperCase(), W / 2, 150 + bH + 78);
  const ov = c.overall === null ? "—" : String(c.overall);
  ctx.fillStyle = C.text; ctx.font = `800 200px ${SANS}`; const ovw = ctx.measureText(ov).width;
  ctx.fillText(ov, W / 2 - 34, 150 + bH + 270);
  ctx.textAlign = "left"; ctx.fillStyle = C.sub; ctx.font = `700 34px ${SANS}`; ctx.fillText("OVR", W / 2 - 34 + ovw / 2 + 14, 150 + bH + 270);

  // caso ou perfil
  let y = 150 + bH + 330;
  const lh = 46, lw = logoImg && logo ? Math.min(150, Math.round(lh * (logo.w / logo.h))) : lh; const tileW = lw + 40, tileH = 92;
  ctx.font = `700 46px ${SANS}`; const tw0 = ctx.measureText(c.title).width; ctx.font = `500 25px ${SANS}`; const sw0 = c.subtitle ? ctx.measureText(c.subtitle).width : 0;
  const titleW = Math.min(Math.max(tw0, sw0), W - 128 - tileW - 28);
  const rowW = tileW + 28 + titleW, rx = (W - rowW) / 2;
  rr(ctx, rx, y, tileW, tileH, 24); ctx.fillStyle = "#12203f"; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
  if (logoImg && logo) { const ar = logo.w / logo.h; const dw = ar >= lw / lh ? lw : lh * ar, dh = ar >= lw / lh ? lw / ar : lh; ctx.drawImage(logoImg, rx + (tileW - dw) / 2, y + (tileH - dh) / 2, dw, dh); }
  else drawIcon(ctx, c.iconName ?? "person", rx + tileW / 2, y + tileH / 2, 46, C.accent);
  ctx.textAlign = "left"; ctx.fillStyle = C.text; ctx.font = `700 46px ${SANS}`; ctx.fillText(fit(ctx, c.title, titleW), rx + tileW + 28, y + 44);
  if (c.subtitle) { ctx.fillStyle = C.sub; ctx.font = `500 25px ${SANS}`; ctx.fillText(fit(ctx, c.subtitle, titleW), rx + tileW + 28, y + 78); }
  y += tileH + 38;

  if (c.kind === "case" && c.attrs && c.attrs.length >= 3) {
    // radar dos seis atributos
    const n = c.attrs.length, R = 108, cx = W / 2, cy = y + R + 44;
    const pt = (i: number, k: number): [number, number] => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + R * k * Math.cos(a), cy + R * k * Math.sin(a)]; };
    const poly = (k: (i: number) => number) => { ctx.beginPath(); for (let i = 0; i < n; i++) { const [px, py] = pt(i, k(i)); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.closePath(); };
    for (const k of [0.25, 0.5, 0.75, 1]) { poly(() => k); ctx.strokeStyle = k === 1 ? "#ffffff30" : "#ffffff16"; ctx.lineWidth = 1; ctx.stroke(); }
    poly((i) => (c.attrs![i]!.score ?? 0) / 100); ctx.fillStyle = `${color}55`; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.stroke();
    c.attrs.forEach((a, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n, ca = Math.cos(ang), sa = Math.sin(ang);
      const lx = cx + (R + 26) * ca, ly = cy + (R + 26) * sa;
      ctx.textAlign = Math.abs(ca) < 0.25 ? "center" : ca > 0 ? "left" : "right";
      const oy = sa < -0.5 ? -28 : sa > 0.5 ? 18 : -2;
      ctx.fillStyle = C.sub; ctx.font = `600 22px ${SANS}`; ctx.fillText(t(a.label), lx, ly + oy);
      ctx.fillStyle = a.score === null ? C.dim : C.text; ctx.font = `800 28px ${SANS}`; ctx.fillText(a.score === null ? "—" : String(a.score), lx, ly + oy + 30);
    });
  } else if (c.stats?.length) {
    const k = c.stats.length, gap = 24, tw = (W - 128 - gap * (k - 1)) / k, th = 150;
    c.stats.forEach((s, i) => {
      const x = 64 + i * (tw + gap);
      rr(ctx, x, y, tw, th, 24); ctx.fillStyle = "#ffffff0d"; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.textAlign = "center"; ctx.fillStyle = C.text; ctx.font = `800 58px ${SANS}`; ctx.fillText(s.value, x + tw / 2, y + 78);
      ctx.fillStyle = C.sub; ctx.font = `600 22px ${SANS}`; ctx.fillText(fit(ctx, s.label, tw - 24), x + tw / 2, y + 120);
    });
  }

  }

  // rodapé: autoria, endereço do perfil e aviso
  ctx.textAlign = "left"; ctx.fillStyle = C.sub; ctx.font = `600 26px ${SANS}`;
  const who = [c.author, c.handle ? `archlab/u/${c.handle}` : ""].filter(Boolean).join("  ·  ");
  if (who) ctx.fillText(fit(ctx, who, W - 128), 64, H - 96);
  ctx.fillStyle = C.dim; ctx.font = `500 21px ${SANS}`;
  ctx.fillText(fit(ctx, t("Modelo pedagógico com perfis fictícios, não são benchmarks"), W - 340), 64, H - 56);
  ctx.textAlign = "right"; ctx.fillText(new Date().toLocaleDateString(localeOf(), { day: "2-digit", month: "short", year: "numeric" }), W - 64, H - 56);

  return await new Promise<Blob>((resolve, reject) => cv.toBlob((b) => (b ? resolve(b) : reject(new Error("png"))), "image/png"));
}
