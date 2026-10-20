/** Biblioteca de padrões: pequenas arquiteturas prontas para inserir no canvas. Gerado de uma fonte PT; o inglês fica em i18n/en.review.ts. */
export interface PatternNode { key: string; type: string; name: string; replicas: number; x: number; y: number }
export interface PatternEdge { from: string; to: string; protocol?: string; mode?: "sync" | "async" }
export interface PatternGroup { name: string; keys: string[] }
export interface Pattern { id: string; icon: string; title: string; summary: string; nodes: PatternNode[]; edges: PatternEdge[]; groups: PatternGroup[] }
export const PATTERNS: Pattern[] = [
  { id: "web-cache", icon: "bolt", title: "API escalável com cache", summary: "Balanceador na frente de várias réplicas, cache para as leituras e banco com réplica. Ligue o seu cliente ao balanceador.",
    nodes: [
      { key: "lb", type: "load-balancer", name: "Balanceador", replicas: 2, x: 0, y: 0 },
      { key: "api", type: "backend", name: "API", replicas: 3, x: 320, y: 0 },
      { key: "cache", type: "redis", name: "Cache", replicas: 2, x: 640, y: -110 },
      { key: "db", type: "sql-database", name: "Banco", replicas: 2, x: 640, y: 110 },
    ],
    edges: [{ from: "lb", to: "api" }, { from: "api", to: "cache" }, { from: "api", to: "db" }],
    groups: [] },
  { id: "fila-workers", icon: "stacks", title: "Fila e workers", summary: "A API só enfileira e responde rápido; workers processam em segundo plano e gravam no banco. Absorve picos.",
    nodes: [
      { key: "api", type: "backend", name: "API", replicas: 2, x: 0, y: 0 },
      { key: "q", type: "queue", name: "Fila", replicas: 1, x: 320, y: 0 },
      { key: "w", type: "worker", name: "Workers", replicas: 3, x: 640, y: 0 },
      { key: "db", type: "sql-database", name: "Banco", replicas: 2, x: 960, y: 0 },
    ],
    edges: [{ from: "api", to: "q" }, { from: "q", to: "w" }, { from: "w", to: "db" }],
    groups: [] },
  { id: "cqrs", icon: "call_split", title: "CQRS", summary: "Escrita e leitura separadas: a escrita vai a um banco, as mudanças viram eventos e um projetor alimenta um banco de leitura.",
    nodes: [
      { key: "api", type: "backend", name: "API", replicas: 3, x: 0, y: 0 },
      { key: "wdb", type: "sql-database", name: "Banco de escrita", replicas: 2, x: 320, y: -130 },
      { key: "log", type: "kafka", name: "Eventos", replicas: 1, x: 640, y: -130 },
      { key: "proj", type: "worker", name: "Projetor", replicas: 2, x: 960, y: -130 },
      { key: "rdb", type: "nosql-database", name: "Banco de leitura", replicas: 2, x: 960, y: 110 },
    ],
    edges: [{ from: "api", to: "wdb" }, { from: "wdb", to: "log" }, { from: "log", to: "proj" }, { from: "proj", to: "rdb" }, { from: "api", to: "rdb" }],
    groups: [] },
  { id: "midia", icon: "movie", title: "Mídia com CDN", summary: "Arquivos grandes ficam em object storage e são entregues por CDN; a API só cuida de envios e metadados.",
    nodes: [
      { key: "cdn", type: "cdn", name: "CDN", replicas: 1, x: 0, y: -100 },
      { key: "store", type: "object-storage", name: "Armazenamento de arquivos", replicas: 1, x: 320, y: -100 },
      { key: "api", type: "backend", name: "API", replicas: 2, x: 0, y: 100 },
    ],
    edges: [{ from: "cdn", to: "store" }, { from: "api", to: "store" }],
    groups: [] },
  { id: "gateway", icon: "hub", title: "Gateway e microsserviços", summary: "Porta de entrada única e dois serviços, cada um dono do seu banco: nenhum acessa o banco do outro.",
    nodes: [
      { key: "gw", type: "api-gateway", name: "Gateway", replicas: 2, x: 0, y: 0 },
      { key: "a", type: "microservice", name: "Serviço A", replicas: 2, x: 320, y: -130 },
      { key: "b", type: "microservice", name: "Serviço B", replicas: 2, x: 320, y: 130 },
      { key: "adb", type: "sql-database", name: "Banco do A", replicas: 2, x: 640, y: -130 },
      { key: "bdb", type: "nosql-database", name: "Banco do B", replicas: 2, x: 640, y: 130 },
    ],
    edges: [{ from: "gw", to: "a" }, { from: "gw", to: "b" }, { from: "a", to: "adb" }, { from: "b", to: "bdb" }],
    groups: [] },
  { id: "autenticacao", icon: "key", title: "Autenticação na entrada", summary: "O gateway confere o token com um serviço de autenticação antes de deixar a requisição chegar ao backend.",
    nodes: [
      { key: "gw", type: "api-gateway", name: "Gateway", replicas: 2, x: 0, y: 0 },
      { key: "auth", type: "authentication-service", name: "Autenticação", replicas: 2, x: 320, y: -110 },
      { key: "api", type: "backend", name: "API", replicas: 3, x: 320, y: 110 },
    ],
    edges: [{ from: "gw", to: "auth" }, { from: "gw", to: "api" }],
    groups: [] },
  { id: "multi-zona", icon: "domain_disabled", title: "Duas zonas de disponibilidade", summary: "A mesma pilha em duas zonas: se uma cair, a outra segura o tráfego. Use o modo caos para derrubar o grupo de uma zona.",
    nodes: [
      { key: "lb", type: "load-balancer", name: "Balanceador", replicas: 2, x: 0, y: 0 },
      { key: "a", type: "backend", name: "API (zona A)", replicas: 2, x: 360, y: -170 },
      { key: "b", type: "backend", name: "API (zona B)", replicas: 2, x: 360, y: 170 },
      { key: "db", type: "sql-database", name: "Banco", replicas: 2, x: 760, y: 0 },
    ],
    edges: [{ from: "lb", to: "a" }, { from: "lb", to: "b" }, { from: "a", to: "db" }, { from: "b", to: "db" }],
    groups: [{ name: "Zona A", keys: ["a"] }, { name: "Zona B", keys: ["b"] }] },
];

/** Posição, ids únicos e conexões válidas para inserir um padrão. `optionFor` devolve a configuração da conexão entre dois tipos (ou null se as regras não permitem). */
export interface BuiltPattern {
  nodes: { id: string; type: string; name: string; replicas: number; x: number; y: number }[];
  edges: { id: string; source: string; target: string; protocol: string; mode: "sync" | "async"; timeoutMs: number; networkLatencyMs: number; tls: boolean }[];
  groups: { name: string; ids: string[] }[];
}
export function buildPattern(
  p: Pattern, origin: { x: number; y: number }, taken: Set<string>, tr: (s: string) => string,
  optionFor: (sourceType: string, targetType: string, protocol?: string, mode?: "sync" | "async") => { protocol: string; mode: "sync" | "async"; timeoutMs: number; networkLatencyMs: number; tls: boolean } | null,
): BuiltPattern {
  const idOf = new Map<string, string>(); const used = new Set(taken);
  for (const n of p.nodes) { let i = 1; let id = `${n.type}-${n.key}-${i}`; while (used.has(id)) id = `${n.type}-${n.key}-${++i}`; used.add(id); idOf.set(n.key, id); }
  const typeOfKey = new Map(p.nodes.map((n) => [n.key, n.type]));
  const nodes = p.nodes.map((n) => ({ id: idOf.get(n.key)!, type: n.type, name: tr(n.name), replicas: n.replicas, x: origin.x + n.x, y: origin.y + n.y }));
  const edges: BuiltPattern["edges"] = [];
  for (const e of p.edges) {
    const o = optionFor(typeOfKey.get(e.from)!, typeOfKey.get(e.to)!, e.protocol, e.mode); if (!o) continue;
    edges.push({ id: `${idOf.get(e.from)}-${idOf.get(e.to)}`, source: idOf.get(e.from)!, target: idOf.get(e.to)!, ...o });
  }
  return { nodes, edges, groups: p.groups.map((g) => ({ name: tr(g.name), ids: g.keys.map((k) => idOf.get(k)!) })) };
}
