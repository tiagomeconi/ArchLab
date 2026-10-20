/**
 * Organização automática do diagrama: colunas da esquerda para a direita seguindo o caminho da requisição
 * (origem → entrada → serviços → dados), sem sobreposição, com poucos cruzamentos e cada nó perto de quem fala com ele.
 * Função pura: recebe tamanhos e conexões e devolve posições (testada no vitest).
 */
export interface LNode {
  id: string; w: number; h: number; x: number; y: number;
  /** fonte de carga (cliente, app, dispositivo…): sempre na primeira coluna */
  origin?: boolean;
  /** serviço de apoio (observabilidade, segredos, descoberta): vai para uma faixa própria embaixo */
  side?: boolean;
}
export interface LEdge { source: string; target: string }
export interface LayoutOptions { gapX?: number; gapY?: number }
export type Pos = { x: number; y: number };

const byPos = (a: LNode, b: LNode) => a.y - b.y || a.x - b.x || (a.id < b.id ? -1 : 1);

export function autoLayout(input: LNode[], edgesIn: LEdge[], opt: LayoutOptions = {}): Map<string, Pos> {
  const gapX = opt.gapX ?? 130, gapY = opt.gapY ?? 44, GAP_BLOCK = 90;
  const out = new Map<string, Pos>();
  if (!input.length) return out;
  const byId = new Map(input.map((n) => [n.id, n]));
  const main = input.filter((n) => !n.side), side = input.filter((n) => n.side);
  const inMain = new Set(main.map((n) => n.id));
  const seen = new Set<string>();
  const edges = edgesIn.filter((e) => e.source !== e.target && inMain.has(e.source) && inMain.has(e.target) && !seen.has(`${e.source}>${e.target}`) && seen.add(`${e.source}>${e.target}`));

  // ── componentes conexos (dentro do conjunto principal) ──
  const parent = new Map(main.map((n) => [n.id, n.id]));
  const find = (a: string): string => { let r = a; while (parent.get(r) !== r) r = parent.get(r)!; parent.set(a, r); return r; };
  for (const e of edges) parent.set(find(e.source), find(e.target));
  const groups = new Map<string, LNode[]>();
  for (const n of main) groups.set(find(n.id), [...(groups.get(find(n.id)) ?? []), n]);
  const comps = [...groups.values()].filter((g) => g.length > 1).sort((a, b) => Math.min(...a.map((n) => n.y)) - Math.min(...b.map((n) => n.y)));
  const loose = [...groups.values()].filter((g) => g.length === 1).map((g) => g[0]!).sort(byPos);

  let cursorY = 0, totalW = 0;
  for (const comp of comps) {
    const ids = new Set(comp.map((n) => n.id));
    const es = edges.filter((e) => ids.has(e.source));
    const sorted = [...comp].sort(byPos);
    const succ = new Map<string, string[]>(), pred = new Map<string, string[]>();
    for (const n of comp) { succ.set(n.id, []); pred.set(n.id, []); }

    // ── ciclos: arestas que voltam (respostas, replicação) não entram no cálculo das colunas ──
    const adj = new Map<string, string[]>(); for (const n of comp) adj.set(n.id, []);
    for (const e of es) adj.get(e.source)!.push(e.target);
    const indeg = new Map<string, number>(); for (const n of comp) indeg.set(n.id, 0);
    for (const e of es) indeg.set(e.target, indeg.get(e.target)! + 1);
    const starts = [...sorted.filter((n) => n.origin), ...sorted.filter((n) => !n.origin && indeg.get(n.id) === 0), ...sorted];
    const color = new Map<string, number>(); const back = new Set<string>();
    const dfs = (u: string) => {
      color.set(u, 1);
      for (const v of adj.get(u)!) { if (color.get(v) === 1) back.add(`${u}>${v}`); else if (!color.has(v)) dfs(v); }
      color.set(u, 2);
    };
    for (const s of starts) if (!color.has(s.id)) dfs(s.id);
    const dag = es.filter((e) => !back.has(`${e.source}>${e.target}`) && !byId.get(e.target)!.origin);
    for (const e of dag) { succ.get(e.source)!.push(e.target); pred.get(e.target)!.push(e.source); }

    // ── coluna de cada nó: o caminho mais longo desde a origem ──
    const layer = new Map<string, number>(); const order: string[] = [];
    const rem = new Map(comp.map((n) => [n.id, pred.get(n.id)!.length]));
    const queue = sorted.filter((n) => rem.get(n.id) === 0).map((n) => n.id);
    while (queue.length) {
      const u = queue.shift()!; order.push(u);
      layer.set(u, Math.max(0, ...pred.get(u)!.map((p) => layer.get(p)! + 1)));
      for (const v of succ.get(u)!) { rem.set(v, rem.get(v)! - 1); if (rem.get(v) === 0) queue.push(v); }
    }
    // quem só tem saídas (e não é origem) fica colado ao primeiro destino, em vez de ir para a borda
    for (const id of [...order].reverse()) {
      const n = byId.get(id)!;
      if (!n.origin && !pred.get(id)!.length && succ.get(id)!.length) layer.set(id, Math.max(0, Math.min(...succ.get(id)!.map((s) => layer.get(s)!)) - 1));
    }
    const L = Math.max(...layer.values());
    const layers: string[][] = Array.from({ length: L + 1 }, () => []);
    for (const n of sorted) layers[layer.get(n.id)!]!.push(n.id);

    // ── ordem dentro da coluna: baricentro dos vizinhos, varrendo para a frente e para trás ──
    const idx = new Map<string, number>(); const reindex = () => layers.forEach((col) => col.forEach((id, i) => idx.set(id, i)));
    reindex();
    const bary = (id: string, ns: string[], size: (id: string) => number) => (ns.length ? ns.reduce((a, v) => a + (idx.get(v)! + 0.5) / size(v), 0) / ns.length : (idx.get(id)! + 0.5) / size(id));
    const sizeOf = (id: string) => layers[layer.get(id)!]!.length;
    for (let it = 0; it < 8; it++) {
      const forward = it % 2 === 0;
      const cols = forward ? layers.slice(1).map((_, i) => i + 1) : layers.slice(0, -1).map((_, i) => L - 1 - i);
      for (const li of cols) {
        const col = layers[li]!; const keys = new Map(col.map((id) => [id, bary(id, forward ? pred.get(id)! : succ.get(id)!, sizeOf)]));
        col.sort((a, b) => keys.get(a)! - keys.get(b)! || idx.get(a)! - idx.get(b)!); reindex();
      }
    }

    // ── posição vertical: empilha sem sobrepor e puxa cada nó para a altura de quem fala com ele ──
    const cy = new Map<string, number>(); // centro vertical
    const H = (id: string) => byId.get(id)!.h;
    for (const col of layers) { let y = 0; for (const id of col) { cy.set(id, y + H(id) / 2); y += H(id) + gapY; } const tot = y - gapY; for (const id of col) cy.set(id, cy.get(id)! - tot / 2); }
    const settle = (col: string[], want: Map<string, number>) => {
      let top = -Infinity; const pos = new Map<string, number>();
      for (const id of col) { const t = Math.max(want.get(id)! - H(id) / 2, top); pos.set(id, t); top = t + H(id) + gapY; }
      const shift = col.reduce((a, id) => a + (want.get(id)! - H(id) / 2 - pos.get(id)!), 0) / col.length;
      for (const id of col) cy.set(id, pos.get(id)! + shift + H(id) / 2);
    };
    for (let it = 0; it < 6; it++) {
      const forward = it % 2 === 0;
      const cols = forward ? layers.slice(1).map((_, i) => i + 1) : layers.slice(0, -1).map((_, i) => L - 1 - i);
      for (const li of cols) {
        const col = layers[li]!; const want = new Map<string, number>();
        for (const id of col) { const ns = forward ? pred.get(id)! : succ.get(id)!; want.set(id, ns.length ? ns.reduce((a, v) => a + cy.get(v)!, 0) / ns.length : cy.get(id)!); }
        settle(col, want);
      }
    }

    // ── posição horizontal: uma coluna por camada, com folga para o rótulo do protocolo ──
    const colX: number[] = []; let x = 0;
    for (const col of layers) { colX.push(x); x += Math.max(...col.map((id) => byId.get(id)!.w), 0) + gapX; }
    let minTop = Infinity, maxBottom = -Infinity;
    for (const id of comp.map((n) => n.id)) { minTop = Math.min(minTop, cy.get(id)! - H(id) / 2); maxBottom = Math.max(maxBottom, cy.get(id)! + H(id) / 2); }
    for (const id of cy.keys()) out.set(id, { x: colX[layer.get(id)!]!, y: cursorY + cy.get(id)! - H(id) / 2 - minTop });
    cursorY += maxBottom - minTop + GAP_BLOCK; totalW = Math.max(totalW, x - gapX);
  }
  const mainBottom = comps.length ? cursorY - GAP_BLOCK : 0;

  // ── nós soltos: uma fileira embaixo, em grade ──
  let rowY = comps.length ? mainBottom + GAP_BLOCK : 0;
  if (loose.length) {
    const limit = Math.max(totalW, 3 * 240 + 2 * gapX); let x = 0, rowH = 0;
    for (const n of loose) {
      if (x > 0 && x + n.w > limit) { x = 0; rowY += rowH + gapY; rowH = 0; }
      out.set(n.id, { x, y: rowY }); x += n.w + gapX / 2; rowH = Math.max(rowH, n.h);
    }
    rowY += rowH + GAP_BLOCK;
  }

  // ── serviços de apoio: faixa embaixo, cada um sob a média dos nós principais com que conversa ──
  if (side.length) {
    const centerX = (id: string) => { const p = out.get(id); return p ? p.x + byId.get(id)!.w / 2 : null; };
    const want = new Map<string, number>();
    for (const s of side) {
      const xs = edgesIn.flatMap((e) => (e.source === s.id ? [e.target] : e.target === s.id ? [e.source] : [])).map(centerX).filter((v): v is number => v !== null);
      want.set(s.id, xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : s.x);
    }
    let right = -Infinity, rowH = 0;
    for (const s of [...side].sort((a, b) => want.get(a.id)! - want.get(b.id)! || byPos(a, b))) {
      const x = Math.max(want.get(s.id)! - s.w / 2, right); out.set(s.id, { x, y: rowY }); right = x + s.w + gapX / 2; rowH = Math.max(rowH, s.h);
    }
  }

  // ── mantém o diagrama onde estava: o canto superior esquerdo não muda ──
  const ox = Math.min(...input.map((n) => n.x)), oy = Math.min(...input.map((n) => n.y));
  const nx = Math.min(...[...out.values()].map((p) => p.x)), ny = Math.min(...[...out.values()].map((p) => p.y));
  for (const [id, p] of out) out.set(id, { x: Math.round(p.x - nx + ox), y: Math.round(p.y - ny + oy) });
  return out;
}
