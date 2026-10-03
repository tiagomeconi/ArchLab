import type { Effects, NodeEffect, EdgeEffect } from "@archlab/domain";

/** Catálogo do modo caos. Os números são intensidades de ensino (spec §10.5), editáveis no futuro. */
export interface ChaosNode { id: string; type: string; name: string; replicas: number; source: boolean }
export interface ChaosEdge { id: string; source: string; target: string; tls: boolean }
export interface ChaosCtx { nodes: ChaosNode[]; edges: ChaosEdge[] }
export interface Patch { nodes: Record<string, NodeEffect>; edges: Record<string, EdgeEffect>; traffic: number }
export interface ChaosItem {
  id: string; cat: string; icon: string; title: string; desc: string;
  scope: "global" | "target";
  /** tipos de componente que podem ser alvo (se ausente, qualquer um que não seja origem de carga) */
  types?: string[];
  apply: (ctx: ChaosCtx, target: string | null) => Patch;
}

const DBS = ["database", "sql-database", "nosql-database", "timeseries-db", "graph-db", "vector-db", "data-warehouse"];
const STORAGE = [...DBS, "object-storage", "search-engine", "redis", "queue", "kafka", "mqtt-broker", "event-bus"];
const empty = (): Patch => ({ nodes: {}, edges: {}, traffic: 1 });
const nodeFx = (id: string | null, fx: NodeEffect): Patch => { const p = empty(); if (id) p.nodes[id] = fx; return p; };
const inEdges = (ctx: ChaosCtx, id: string | null, fx: EdgeEffect, only?: (e: ChaosEdge) => boolean): Patch => {
  const p = empty(); if (!id) return p;
  for (const e of ctx.edges) if (e.target === id && (!only || only(e))) p.edges[e.id] = fx;
  return p;
};
const allNodes = (ctx: ChaosCtx, fx: NodeEffect): Patch => { const p = empty(); for (const n of ctx.nodes) if (!n.source) p.nodes[n.id] = fx; return p; };
const allEdges = (ctx: ChaosCtx, fx: EdgeEffect, only?: (e: ChaosEdge) => boolean): Patch => {
  const p = empty(); for (const e of ctx.edges) if (!only || only(e)) p.edges[e.id] = fx; return p;
};
/** perder uma instância: com 1 réplica o componente cai; com N, a capacidade cai para (N−1)/N */
const loseOne = (ctx: ChaosCtx, id: string | null): Patch => {
  const n = ctx.nodes.find((x) => x.id === id);
  if (!n) return empty();
  return nodeFx(id, n.replicas <= 1 ? { unavailable: true } : { capacityFactor: (n.replicas - 1) / n.replicas });
};

export const CHAOS_CATEGORIES = [
  { id: "infra", title: "Falhas de infraestrutura" },
  { id: "network", title: "Caos de rede" },
  { id: "deps", title: "Dependências e dados" },
  { id: "traffic", title: "Tráfego e carga" },
];

export const CHAOS: ChaosItem[] = [
  { id: "az", cat: "infra", icon: "domain_disabled", title: "Zona de disponibilidade", scope: "global",
    desc: "Uma AZ inteira cai: toda camada perde cerca de metade da capacidade.", apply: (c) => allNodes(c, { capacityFactor: 0.5 }) },
  { id: "dc", cat: "infra", icon: "local_fire_department", title: "Data center", scope: "global",
    desc: "Queda do data center reduz a frota inteira a ~40% e atrasa as respostas.", apply: (c) => allNodes(c, { capacityFactor: 0.4, extraLatencyMs: 30 }) },
  { id: "crash", cat: "infra", icon: "car_crash", title: "Queda de instância", scope: "target",
    desc: "Uma instância do alvo cai e para de atender. Com 1 réplica, o componente inteiro cai.", apply: (c, t) => loseOne(c, t) },
  { id: "slow", cat: "infra", icon: "slow_motion_video", title: "Instância lenta", scope: "target",
    desc: "Uma instância degradada responde bem mais devagar e rende menos.", apply: (_, t) => nodeFx(t, { extraLatencyMs: 150, capacityFactor: 0.7 }) },
  { id: "disk", cat: "infra", icon: "hard_drive", title: "Falha de disco", scope: "target", types: STORAGE,
    desc: "Falha de disco gera erros e reduz a vazão.", apply: (_, t) => nodeFx(t, { errorRate: 0.2, capacityFactor: 0.6 }) },
  { id: "corrupt", cat: "infra", icon: "bug_report", title: "Corrupção de dados", scope: "target", types: STORAGE,
    desc: "Dados corrompidos provocam pico de erros.", apply: (_, t) => nodeFx(t, { errorRate: 0.15, extraLatencyMs: 20 }) },
  { id: "iops", cat: "infra", icon: "speed", title: "IOPS do armazenamento", scope: "target", types: STORAGE,
    desc: "Throttling de IOPS deixa o nó lento e corta a capacidade.", apply: (_, t) => nodeFx(t, { capacityFactor: 0.5, extraLatencyMs: 80 }) },
  { id: "fs", cat: "infra", icon: "folder_off", title: "Sistema de arquivos", scope: "target",
    desc: "Problemas no sistema de arquivos somam latência e erros.", apply: (_, t) => nodeFx(t, { extraLatencyMs: 60, errorRate: 0.05 }) },
  { id: "cpu", cat: "infra", icon: "thermostat", title: "CPU da VM", scope: "target",
    desc: "Starvation de CPU reduz a capacidade à metade e atrasa respostas (high-cpu).", apply: (_, t) => nodeFx(t, { capacityFactor: 0.5, extraLatencyMs: 40 }) },
  { id: "mem", cat: "infra", icon: "memory_alt", title: "Pressão de memória", scope: "target",
    desc: "Memória disponível cai pela metade e o recurso passa a limitar (memory-pressure).", apply: (_, t) => nodeFx(t, { capacityFactor: 0.5, extraLatencyMs: 30 }) },
  { id: "host", cat: "infra", icon: "power_off", title: "Hardware do host", scope: "target",
    desc: "Falha de hardware derruba o componente alvo.", apply: (_, t) => nodeFx(t, { unavailable: true }) },

  { id: "partition", cat: "network", icon: "content_cut", title: "Partição de rede", scope: "target",
    desc: "Uma partição derruba a maior parte das conexões que chegam ao alvo.", apply: (c, t) => inEdges(c, t, { dropRate: 0.8 }) },
  { id: "xregion", cat: "network", icon: "public_off", title: "Perda entre regiões", scope: "global",
    desc: "Perda de pacotes em toda a rede adiciona descartes e latência.", apply: (c) => allEdges(c, { dropRate: 0.05, extraLatencyMs: 60 }) },
  { id: "loss", cat: "network", icon: "package_2", title: "Perda de pacotes", scope: "target",
    desc: "Perda aleatória de pacotes nas conexões do alvo degrada a vazão.", apply: (c, t) => inEdges(c, t, { dropRate: 0.1 }) },
  { id: "highlat", cat: "network", icon: "hourglass_top", title: "Latência alta", scope: "target",
    desc: "A latência de rede até o alvo salta +300 ms.", apply: (c, t) => inEdges(c, t, { extraLatencyMs: 300 }) },
  { id: "netlat", cat: "network", icon: "network_ping", title: "Latência em toda a rede", scope: "global",
    desc: "Todas as conexões ganham +100 ms (network-latency).", apply: (c) => allEdges(c, { extraLatencyMs: 100 }) },
  { id: "bw", cat: "network", icon: "water_drop", title: "Banda limitada", scope: "target",
    desc: "Banda estrangulada limita a capacidade e adiciona latência.", apply: (_, t) => nodeFx(t, { capacityFactor: 0.5, extraLatencyMs: 50 }) },
  { id: "flap", cat: "network", icon: "sync_problem", title: "Conexões oscilando", scope: "target",
    desc: "Conexões caem e voltam: perde-se uma fatia do tráfego do alvo.", apply: (c, t) => inEdges(c, t, { dropRate: 0.25 }) },
  { id: "lb", cat: "network", icon: "alt_route", title: "Load balancer degradado", scope: "target", types: ["load-balancer", "api-gateway", "waf", "service-mesh", "rate-limiter"],
    desc: "Degradação do balanceador corta capacidade e derruba requisições.", apply: (_, t) => nodeFx(t, { capacityFactor: 0.5, errorRate: 0.05 }) },
  { id: "port", cat: "network", icon: "door_front", title: "Porta do backend fechada", scope: "target", types: ["backend", "microservice", "container", "kubernetes", "vm"],
    desc: "Porta fechada: o backend recusa conexões.", apply: (_, t) => nodeFx(t, { unavailable: true }) },
  { id: "health", cat: "network", icon: "monitor_heart", title: "Health check falhando", scope: "target",
    desc: "A checagem falha e uma instância sai da rotação.", apply: (c, t) => loseOne(c, t) },
  { id: "tls", cat: "network", icon: "lock_open", title: "Certificado TLS inválido", scope: "target",
    desc: "Certificado inválido quebra as conexões seguras que chegam ao alvo.", apply: (c, t) => inEdges(c, t, { dropRate: 1 }, (e) => e.tls) },
  { id: "dns", cat: "network", icon: "travel_explore", title: "Resolução de DNS", scope: "global",
    desc: "Falhas de DNS impedem parte dos clientes de chegar ao sistema.", apply: (c) => {
      const src = new Set(c.nodes.filter((n) => n.source).map((n) => n.id));
      return allEdges(c, { dropRate: 0.3, extraLatencyMs: 100 }, (e) => src.has(e.source));
    } },

  { id: "redis", cat: "deps", icon: "memory", title: "Cache indisponível", scope: "target", types: ["redis"],
    desc: "O cache cai; o fluxo usa bypass ou falha conforme a configuração (redis-unavailable).", apply: (_, t) => nodeFx(t, { unavailable: true }) },
  { id: "dbdown", cat: "deps", icon: "database_off", title: "Banco indisponível", scope: "target", types: DBS,
    desc: "Todas as instâncias do banco ficam fora do ar (database-unavailable).", apply: (_, t) => nodeFx(t, { unavailable: true }) },
  { id: "dblat", cat: "deps", icon: "timer", title: "Banco lento", scope: "target", types: DBS,
    desc: "O banco responde +200 ms mais devagar (database-latency).", apply: (_, t) => nodeFx(t, { extraLatencyMs: 200 }) },
  { id: "svc", cat: "deps", icon: "cloud_off", title: "Serviço indisponível", scope: "target",
    desc: "O componente alvo sai do ar (service-unavailable).", apply: (_, t) => nodeFx(t, { unavailable: true }) },

  { id: "t10", cat: "traffic", icon: "trending_up", title: "Tráfego 10×", scope: "global",
    desc: "A carga externa multiplica por 10 (traffic-10x).", apply: () => ({ ...empty(), traffic: 10 }) },
  { id: "t100", cat: "traffic", icon: "rocket_launch", title: "Tráfego 100×", scope: "global",
    desc: "Ataque ou viralização: carga ×100 (traffic-100x).", apply: () => ({ ...empty(), traffic: 100 }) },
  { id: "spike", cat: "traffic", icon: "show_chart", title: "Pico repentino", scope: "global",
    desc: "Rampa curta para ×5 sobre a carga atual (traffic-spike).", apply: () => ({ ...empty(), traffic: 5 }) },
];

/** Alvo de uma falha direcionada: o componente selecionado, senão o gargalo, senão o primeiro compatível. */
export function pickTarget(item: ChaosItem, ctx: ChaosCtx, selected: string | null, bottleneck: (ids: string[]) => string | null): { id: string; why: string } | null {
  if (item.scope !== "target") return null;
  const pool = ctx.nodes.filter((n) => !n.source && (!item.types || item.types.includes(n.type))).map((n) => n.id);
  if (selected && pool.includes(selected)) return { id: selected, why: "selecionado" };
  const b = bottleneck(pool);
  if (b) return { id: b, why: "gargalo" };
  return pool[0] ? { id: pool[0], why: "primeiro compatível" } : null;
}

export interface Resolved { effects: Effects; traffic: number; targets: Record<string, { id: string; why: string } | null>; faultNodes: Set<string>; faultEdges: Set<string> }

/** Compõe falhas simultâneas (spec §10.4): fatores multiplicam, latências somam, indisponível prevalece. */
export function resolveChaos(active: Set<string>, ctx: ChaosCtx, selected: string | null, bottleneck: (ids: string[]) => string | null): Resolved {
  const out: Resolved = { effects: { nodes: {}, edges: {} }, traffic: 1, targets: {}, faultNodes: new Set(), faultEdges: new Set() };
  const nodes = out.effects.nodes!, edges = out.effects.edges!;
  for (const item of CHAOS) {
    if (!active.has(item.id)) continue;
    let target: string | null = null;
    if (item.scope === "target") {
      const t = pickTarget(item, ctx, selected, bottleneck);
      out.targets[item.id] = t;
      if (!t) continue;
      target = t.id;
    }
    const p = item.apply(ctx, target);
    out.traffic *= p.traffic;
    for (const [id, fx] of Object.entries(p.nodes)) {
      const cur = nodes[id] ?? {};
      nodes[id] = {
        capacityFactor: (cur.capacityFactor ?? 1) * (fx.capacityFactor ?? 1),
        extraLatencyMs: (cur.extraLatencyMs ?? 0) + (fx.extraLatencyMs ?? 0),
        errorRate: 1 - (1 - (cur.errorRate ?? 0)) * (1 - (fx.errorRate ?? 0)),
        unavailable: cur.unavailable || fx.unavailable,
      };
      out.faultNodes.add(id);
    }
    for (const [id, fx] of Object.entries(p.edges)) {
      const cur = edges[id] ?? {};
      edges[id] = { dropRate: 1 - (1 - (cur.dropRate ?? 0)) * (1 - (fx.dropRate ?? 0)), extraLatencyMs: (cur.extraLatencyMs ?? 0) + (fx.extraLatencyMs ?? 0) };
      out.faultEdges.add(id);
    }
  }
  return out;
}
