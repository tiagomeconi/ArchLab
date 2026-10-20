import { t } from "./i18n";

/**
 * Revisão automática do desenho: procura problemas clássicos de arquitetura (ponto único de falha, banco sem réplica,
 * leitura sem cache, cadeia síncrona longa…) e explica o porquê e como corrigir. Funções puras: mesmo desenho, mesma revisão.
 */
export type Severity = "alta" | "media" | "info";
export interface Finding { id: string; rule: string; severity: Severity; nodeIds: string[]; title: string; why: string; fix: string }
export interface LintNode { id: string; type: string; name: string; replicas: number }
export interface LintEdge { source: string; target: string; protocol: string; mode: string; tls?: boolean }
export interface LintInput {
  nodes: LintNode[];
  edges: LintEdge[];
  /** componentes por onde passa alguma requisição (união dos fluxos) */
  inFlow: Set<string>;
  /** utilização por componente (0–1+), quando houver simulação */
  utilization?: Map<string, number | null>;
  /** % de leituras na carga (0–100) */
  readPct?: number;
}

const SOURCE = new Set(["client", "web-app", "mobile-app", "iot-device", "external-system"]);
const DBS = new Set(["database", "sql-database", "nosql-database", "timeseries-db", "graph-db", "vector-db", "data-warehouse"]);
const QUEUES = new Set(["queue", "kafka", "mqtt-broker", "event-bus"]);
const ENTRY = new Set(["load-balancer", "api-gateway", "cdn", "waf", "dns"]);
const COMPUTE = new Set(["backend", "microservice", "container", "kubernetes", "vm", "serverless", "worker", "ml-service"]);
const SIDE = new Set(["observability", "secrets-manager", "service-discovery", "dns"]);
const SYNC_CHAIN_LIMIT = 5;
const FANOUT_LIMIT = 5;

/** maior sequência de chamadas síncronas encadeadas a partir de cada origem (ignora ciclos) */
export function longestSyncChain(edges: LintEdge[], roots: string[]): { len: number; path: string[] } {
  const out = new Map<string, string[]>();
  for (const e of edges) if (e.mode === "sync") out.set(e.source, [...(out.get(e.source) ?? []), e.target]);
  let best: string[] = [];
  const walk = (id: string, path: string[]) => {
    if (path.length > best.length) best = path;
    for (const next of out.get(id) ?? []) if (!path.includes(next)) walk(next, [...path, next]);
  };
  for (const r of roots) walk(r, [r]);
  return { len: Math.max(0, best.length - 1), path: best };
}

export function lintArchitecture(inp: LintInput): Finding[] {
  const out: Finding[] = [];
  const by = new Map(inp.nodes.map((n) => [n.id, n]));
  const name = (id: string) => by.get(id)?.name ?? id;
  const add = (f: Omit<Finding, "id">) => out.push({ ...f, id: `${f.rule}:${f.nodeIds.join(",") || "geral"}` });
  const types = new Set(inp.nodes.map((n) => n.type));
  const served = inp.nodes.filter((n) => inp.inFlow.has(n.id) && !SOURCE.has(n.type) && !SIDE.has(n.type));

  // ponto único de falha: componente de processamento ou entrada com uma só instância no caminho das requisições
  for (const n of served) {
    if (DBS.has(n.type) || QUEUES.has(n.type) || n.replicas >= 2) continue;
    add({ rule: "spof", severity: ENTRY.has(n.type) || COMPUTE.has(n.type) ? "alta" : "media", nodeIds: [n.id],
      title: t("{nome} é um ponto único de falha", { nome: n.name }),
      why: t("Com uma só instância, se {nome} cair, todo o tráfego que passa por ele para junto.", { nome: n.name }),
      fix: t("Dê 2 ou mais réplicas a {nome} (e, se possível, em zonas diferentes).", { nome: n.name }) });
  }
  // banco sem réplica: o dado é o que mais custa perder
  for (const n of served.filter((x) => DBS.has(x.type) && x.replicas < 2)) {
    add({ rule: "db-replica", severity: "alta", nodeIds: [n.id],
      title: t("{nome} não tem réplica", { nome: n.name }),
      why: t("Se a única instância do banco falhar, o sistema fica sem acesso aos dados e, sem backup recente, pode perdê-los."),
      fix: t("Adicione uma réplica de leitura ou standby para failover em {nome}.", { nome: n.name }) });
  }
  // leitura pesada batendo direto no banco, sem cache nem CDN
  if ((inp.readPct ?? 0) >= 60 && !types.has("redis") && !types.has("cdn")) {
    const dbs = served.filter((n) => DBS.has(n.type));
    if (dbs.length) add({ rule: "no-cache", severity: "media", nodeIds: dbs.map((d) => d.id),
      title: t("Leituras vão direto ao banco"),
      why: t("Com {pct}% de leituras, sem cache cada requisição chega ao banco, que vira o gargalo e encarece o sistema.", { pct: Math.round(inp.readPct ?? 0) }),
      fix: t("Coloque um cache (Redis) na frente do banco, ou uma CDN para conteúdo estático.") });
  }
  // cadeia longa de chamadas síncronas: a latência soma e qualquer falha se propaga
  const roots = inp.nodes.filter((n) => SOURCE.has(n.type)).map((n) => n.id);
  const chain = longestSyncChain(inp.edges.filter((e) => !SIDE.has(by.get(e.target)?.type ?? "")), roots);
  if (chain.len >= SYNC_CHAIN_LIMIT) add({ rule: "sync-chain", severity: "media", nodeIds: chain.path.slice(1),
    title: t("Cadeia síncrona com {n} saltos", { n: chain.len }),
    why: t("Cada salto síncrono soma latência e propaga falhas: se o último atrasa, o cliente espera por todos."),
    fix: t("Torne assíncronos os passos que o cliente não precisa esperar (fila ou evento) e agrupe chamadas.") });
  // fan-out: um componente chamando muitos outros de forma síncrona
  const outCount = new Map<string, number>();
  for (const e of inp.edges) if (e.mode === "sync" && !SIDE.has(by.get(e.target)?.type ?? "")) outCount.set(e.source, (outCount.get(e.source) ?? 0) + 1);
  for (const [id, c] of outCount) if (c >= FANOUT_LIMIT && !SOURCE.has(by.get(id)?.type ?? "") && !ENTRY.has(by.get(id)?.type ?? "")) {
    add({ rule: "fanout", severity: "info", nodeIds: [id], title: t("{nome} chama {n} componentes de forma síncrona", { nome: name(id), n: c }),
      why: t("Muitas dependências síncronas deixam o serviço tão disponível quanto a pior delas."),
      fix: t("Reduza dependências com eventos, ou isole as menos críticas com timeout e fallback.") });
  }
  // cliente falando direto com várias réplicas sem balanceador
  for (const e of inp.edges) {
    const s = by.get(e.source), d = by.get(e.target);
    if (s && d && SOURCE.has(s.type) && COMPUTE.has(d.type) && d.replicas >= 2 && !types.has("load-balancer") && !types.has("api-gateway")) {
      add({ rule: "no-entry", severity: "media", nodeIds: [d.id], title: t("{nome} tem várias réplicas e nenhum ponto de entrada", { nome: d.name }),
        why: t("Sem load balancer ou gateway, o cliente não tem como dividir as requisições entre as réplicas."),
        fix: t("Coloque um Load balancer ou API Gateway entre o cliente e {nome}.", { nome: d.name }) });
      break;
    }
  }
  // fila sem consumidor: as mensagens se acumulam para sempre
  for (const n of inp.nodes.filter((x) => QUEUES.has(x.type))) {
    const consumed = inp.edges.some((e) => e.source === n.id);
    const fed = inp.edges.some((e) => e.target === n.id);
    if (fed && !consumed) add({ rule: "queue-no-consumer", severity: "alta", nodeIds: [n.id], title: t("{nome} não tem consumidor", { nome: n.name }),
      why: t("As mensagens entram, mas ninguém as processa: a fila só cresce e o trabalho nunca é feito."),
      fix: t("Ligue {nome} a um Worker ou serviço que consuma as mensagens.", { nome: n.name }) });
  }
  // componente solto
  for (const n of inp.nodes) {
    if (!inp.edges.some((e) => e.source === n.id || e.target === n.id) && inp.nodes.length > 1) {
      add({ rule: "orphan", severity: "info", nodeIds: [n.id], title: t("{nome} não está ligado a nada", { nome: n.name }),
        why: t("Um componente sem conexões não participa de nenhum fluxo, então não afeta a simulação."),
        fix: t("Ligue {nome} ao resto do desenho ou remova-o.", { nome: n.name }) });
    }
  }
  // conexão sem TLS entre origem de carga e o sistema
  const plain = inp.edges.filter((e) => e.tls === false && (e.protocol === "https" || e.protocol === "http" || e.protocol === "websocket") && SOURCE.has(by.get(e.source)?.type ?? ""));
  if (plain.length) add({ rule: "no-tls", severity: "media", nodeIds: [...new Set(plain.map((e) => e.target))],
    title: t("Tráfego do cliente sem criptografia"),
    why: t("Dados que saem do cliente sem TLS podem ser lidos ou alterados no caminho."),
    fix: t("Ative TLS nessas conexões (HTTPS / WSS).") });
  // saturação
  for (const n of served) {
    const u = inp.utilization?.get(n.id);
    if (u != null && u > 1) add({ rule: "saturated", severity: "alta", nodeIds: [n.id], title: t("{nome} está saturado ({pct}%)", { nome: n.name, pct: Math.round(u * 100) }),
      why: t("A demanda passa da capacidade: o excesso é rejeitado e a latência dispara."),
      fix: t("Aumente as réplicas de {nome}, coloque um cache na frente ou divida a carga.", { nome: n.name }) });
  }
  // sem observabilidade em sistemas maiores
  if (served.length >= 4 && !types.has("observability")) add({ rule: "no-observability", severity: "info", nodeIds: [], title: t("Nenhuma observabilidade"),
    why: t("Sem métricas, logs e traces você descobre os problemas pelos usuários, não pelos alarmes."),
    fix: t("Adicione um componente de Observabilidade e ligue os serviços principais a ele.") });

  const rank: Record<Severity, number> = { alta: 0, media: 1, info: 2 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
