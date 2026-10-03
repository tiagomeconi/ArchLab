import { solveDemand } from "@archlab/domain";
import type { Check } from "./requirements";
import { t } from "./i18n";

/**
 * Nota geral do desenho (estilo "overall" de jogo): seis atributos de 0 a 99, calculados a partir do que o simulador já mede
 * (cargas, p95, erro) e de testes de perda de instância. Determinístico: mesmo desenho e mesma carga dão a mesma nota.
 */
export type AttrId = "cap" | "res" | "lat" | "arq" | "com" | "efi";
export interface Attr { id: AttrId; abbr: string; label: string; weight: number; score: number | null; why: string; tip?: string }
export type Tier = "bronze" | "silver" | "gold" | "elite";
export interface Rating { overall: number | null; tier: Tier | null; attrs: Attr[] }

export interface RateInput {
  nodes: { id: string; type: string; name: string; properties?: { replicas?: number } }[];
  edges: { source: string; target: string; configuration: { protocol: string; mode: string; tls?: unknown } }[];
  flows: { steps: { nodeId: string }[] }[];
  loads: Map<string, { utilization: number | null; source?: boolean }>;
  /** fração de requisições rejeitadas ou perdidas na carga atual (0–1) */
  errFrac: number;
  p95Ms: number | null;
  p95Target?: number;
  /** erro extra (0–1) quando se perde uma instância de cada componente do fluxo */
  lossErr: Record<string, number>;
  /** verificações do caso (componentes e caminhos exigidos); vazio no modo livre */
  checks: Check[];
  readPct: number;
}

export const WEIGHTS: Record<AttrId, number> = { cap: 0.25, res: 0.2, arq: 0.2, lat: 0.15, com: 0.1, efi: 0.1 };
const SOURCE = new Set(["client", "web-app", "mobile-app", "iot-device", "external-system"]);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pts = (v: number) => Math.round(99 * clamp(v));
const pct = (v: number) => Math.round(v * 100);

export const tierOf = (overall: number): Tier => (overall >= 90 ? "elite" : overall >= 75 ? "gold" : overall >= 60 ? "silver" : "bronze");

/** Erro extra de cada componente do fluxo ao perder uma instância (ou ficar fora do ar, se só houver uma). */
export function lossErrors(doc: any, rps: number, weights: Record<string, number>, baseErr: number): Record<string, number> {
  const out: Record<string, number> = {};
  const inFlow = new Set<string>(doc.traffic.flows.flatMap((f: any) => f.steps.map((s: any) => s.nodeId)));
  for (const n of doc.nodes) {
    if (!inFlow.has(n.id) || SOURCE.has(n.type)) continue;
    const r = n.properties?.replicas ?? 1;
    const effect = r <= 1 ? { unavailable: true } : { capacityFactor: (r - 1) / r };
    const res = solveDemand(doc, { rps, weights, effects: { nodes: { [n.id]: effect } } });
    out[n.id] = Math.max(0, errorOf(res) - baseErr);
  }
  return out;
}
export function errorOf(res: { flows: Map<string, { offered: number; completed: number }> }): number {
  let o = 0, c = 0; for (const f of res.flows.values()) { o += f.offered; c += f.completed; }
  return o > 0 ? Math.max(0, 1 - c / o) : 0;
}

export function rate(inp: RateInput): Rating {
  const nameOf = (id: string) => inp.nodes.find((n) => n.id === id)?.name ?? id;
  const inFlow = new Set(inp.flows.flatMap((f) => f.steps.map((s) => s.nodeId)));
  const flowNodes = inp.nodes.filter((n) => inFlow.has(n.id) && !SOURCE.has(n.type));
  const reps = (n: { properties?: { replicas?: number } }) => n.properties?.replicas ?? 1;
  const attrs: Attr[] = [];
  const add = (id: AttrId, abbr: string, label: string, score: number | null, why: string, tip?: string) => attrs.push({ id, abbr, label, weight: WEIGHTS[id], score, why, tip });

  // ── capacidade: o componente mais carregado e o erro na carga atual ──
  const loaded = [...inp.loads.entries()].filter(([id, l]) => !l.source && l.utilization !== null && inFlow.has(id));
  if (!loaded.length) add("cap", "CAP", t("Capacidade"), null, t("Defina um fluxo e simule para medir."));
  else {
    const [wid, wl] = loaded.reduce((a, b) => ((b[1].utilization ?? 0) > (a[1].utilization ?? 0) ? b : a));
    const u = wl.utilization ?? 0;
    const base = u <= 0.7 ? 1 : u <= 1 ? 1 - ((u - 0.7) / 0.3) * 0.4 : clamp(0.6 - (u - 1) * 0.6);
    add("cap", "CAP", t("Capacidade"), pts(base * (1 - Math.min(0.8, inp.errFrac * 4))),
      t("Mais carregado: {nome} a {pct}%; erro de {erro}%.", { nome: nameOf(wid), pct: pct(u), erro: (inp.errFrac * 100).toFixed(1) }),
      u > 0.8 || inp.errFrac > 0.001 ? t("Dê mais réplicas ou um cache a {nome}.", { nome: nameOf(wid) }) : undefined);
  }

  // ── resiliência: perder uma instância de cada componente ──
  if (!flowNodes.length) add("res", "RES", t("Resiliência"), null, t("Sem componentes em fluxos ainda."));
  else {
    const pass = flowNodes.filter((n) => (inp.lossErr[n.id] ?? 1) <= 0.02);
    const redundant = flowNodes.filter((n) => reps(n) >= 2);
    const worst = flowNodes.reduce((a, b) => ((inp.lossErr[b.id] ?? 1) > (inp.lossErr[a.id] ?? 1) ? b : a));
    const w = inp.lossErr[worst.id] ?? 1;
    add("res", "RES", t("Resiliência"), pts(0.7 * (pass.length / flowNodes.length) + 0.3 * (redundant.length / flowNodes.length)),
      w > 0.02 ? t("Perder uma instância de {nome} derruba {pct}% das requisições.", { nome: nameOf(worst.id), pct: pct(w) }) : t("O sistema aguenta perder uma instância de qualquer componente."),
      w > 0.02 ? (reps(worst) < 2 ? t("Dê 2 ou mais réplicas a {nome}.", { nome: nameOf(worst.id) }) : t("Folga a {nome}: sem ela, perder uma instância satura o resto.", { nome: nameOf(worst.id) })) : undefined);
  }

  // ── latência ──
  if (inp.p95Ms === null) add("lat", "LAT", t("Latência"), null, t("Sem fluxo de leitura com carga."));
  else {
    const p = inp.p95Ms;
    let s: number;
    if (inp.p95Target) { const r = p / inp.p95Target; s = r <= 0.5 ? 1 : r <= 1 ? 1 - (r - 0.5) * 0.28 : r <= 2 ? 0.85 - (r - 1) * 0.45 : 0.2; }
    else s = p <= 100 ? 1 : p <= 200 ? 1 - ((p - 100) / 100) * 0.15 : p <= 500 ? 0.85 - ((p - 200) / 300) * 0.3 : p <= 1000 ? 0.55 - ((p - 500) / 500) * 0.35 : 0.1;
    add("lat", "LAT", t("Latência"), pts(s), inp.p95Target ? t("p95 de {ms} ms para uma meta de {meta} ms.", { ms: Math.round(p), meta: inp.p95Target }) : t("p95 de {ms} ms.", { ms: Math.round(p) }),
      s < 0.85 ? t("Reduza saltos no caminho ou tire o gargalo do caminho crítico.") : undefined);
  }

  // ── arquitetura: aderência ao que o caso pede (ou boas práticas, no modo livre) ──
  const rule = inp.checks.filter((c) => c.id.startsWith("need:") || c.id.startsWith("path:") || c.id === "hit");
  if (rule.length) {
    const met = rule.reduce((a, c) => a + (c.status === "meets" ? 1 : c.status === "partial" ? 0.5 : 0), 0);
    const miss = rule.filter((c) => c.status !== "meets");
    add("arq", "ARQ", t("Arquitetura"), pts(met / rule.length), t("{a} de {b} requisitos de arquitetura atendidos.", { a: Math.floor(met), b: rule.length }),
      miss.length ? t("Falta: {item}.", { item: miss[0]!.label }) : undefined);
  } else if (!inp.nodes.length) add("arq", "ARQ", t("Arquitetura"), null, t("Monte o desenho para avaliar."));
  else {
    const types = new Set(inp.nodes.map((n) => n.type));
    const good: [boolean, string][] = [
      [inp.flows.length > 0, t("tem fluxo definido")], [["sql-database", "nosql-database", "database"].some((x) => types.has(x)), t("guarda os dados em um banco")],
      [types.has("load-balancer") || types.has("api-gateway"), t("tem ponto de entrada")], [inp.readPct < 80 || types.has("redis") || types.has("cdn"), t("protege a leitura com cache ou CDN")],
      [inp.nodes.filter((n) => ["backend", "microservice"].includes(n.type)).every((n) => reps(n) >= 2) && types.has("backend"), t("serviços com réplicas")],
    ];
    const ok = good.filter(([c]) => c);
    const falta = good.find(([c]) => !c);
    add("arq", "ARQ", t("Arquitetura"), pts(ok.length / good.length), t("Boas práticas básicas: {a} de {b}.", { a: ok.length, b: good.length }), falta ? t("Falta: {item}.", { item: falta[1] }) : undefined);
  }

  // ── comunicação: profundidade de chamadas síncronas, fan-out e conexões inseguras ──
  if (!inp.edges.length) add("com", "COM", t("Comunicação"), null, t("Ligue os componentes para avaliar."));
  else {
    const sync = new Map<string, string[]>();
    for (const e of inp.edges) if (e.configuration.mode === "sync") sync.set(e.source, [...(sync.get(e.source) ?? []), e.target]);
    const memo = new Map<string, number>();
    const depth = (id: string, seen: Set<string>): number => {
      if (memo.has(id)) return memo.get(id)!; if (seen.has(id)) return 0;
      const d = 1 + Math.max(0, ...(sync.get(id) ?? []).map((x) => depth(x, new Set([...seen, id]))));
      memo.set(id, d); return d;
    };
    const maxDepth = Math.max(...inp.nodes.map((n) => depth(n.id, new Set())));
    const fan = inp.nodes.map((n) => ({ n, k: (sync.get(n.id) ?? []).filter((x) => !["redis", "sql-database", "nosql-database", "database", "timeseries-db", "graph-db", "vector-db", "data-warehouse"].includes(inp.nodes.find((m) => m.id === x)?.type ?? "")).length })).filter((x) => x.k > 4);
    const insecure = inp.edges.filter((e) => SOURCE.has(inp.nodes.find((n) => n.id === e.source)?.type ?? "") && e.configuration.tls === false);
    const score = 1 - Math.max(0, maxDepth - 6) * 0.09 - fan.length * 0.06 - insecure.length * 0.1;
    const issues = [maxDepth > 6 ? t("{n} chamadas síncronas em cadeia", { n: maxDepth }) : "", fan.length ? t("{nome} chama {n} serviços", { nome: fan[0]!.n.name, n: fan[0]!.k }) : "", insecure.length ? t("entrada sem TLS") : ""].filter(Boolean);
    add("com", "COM", t("Comunicação"), pts(score), issues.length ? t("Atenção: {lista}.", { lista: issues.join("; ") }) : t("Cadeia de {n} chamadas síncronas, sem excesso de acoplamento.", { n: maxDepth }),
      issues.length ? t("Quebre cadeias longas com filas ou agregue chamadas.") : undefined);
  }

  // ── eficiência: réplicas que sobram ──
  const used = flowNodes.filter((n) => inp.loads.get(n.id)?.utilization != null);
  if (!used.length) add("efi", "EFI", t("Eficiência"), null, t("Sem carga para medir uso."));
  else {
    const idle = used.filter((n) => reps(n) >= 3 && (inp.loads.get(n.id)!.utilization ?? 0) < 0.2);
    const o = idle[0];
    add("efi", "EFI", t("Eficiência"), pts(1 - (idle.length / used.length) * 1.5),
      o ? t("{nome} usa {r} réplicas com só {pct}% de uso.", { nome: o.name, r: reps(o), pct: pct(inp.loads.get(o.id)!.utilization ?? 0) }) : t("Réplicas proporcionais à carga."),
      o ? t("Reduza as réplicas de {nome}: o custo sobe sem ganho.", { nome: o.name }) : undefined);
  }

  const have = attrs.filter((a) => a.score !== null);
  if (have.length < 2) return { overall: null, tier: null, attrs };
  const wsum = have.reduce((a, x) => a + x.weight, 0);
  const overall = Math.round(have.reduce((a, x) => a + x.score! * x.weight, 0) / wsum);
  return { overall, tier: tierOf(overall), attrs };
}
