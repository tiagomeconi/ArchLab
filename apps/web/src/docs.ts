import { ARTICLES as fundamentos } from "./docs/fundamentos";
import { ARTICLES as estilos } from "./docs/estilos";
import { ARTICLES as escalabilidade } from "./docs/escalabilidade";
import { ARTICLES as bancos } from "./docs/bancos";
import { ARTICLES as consistencia } from "./docs/consistencia";
import { ARTICLES as balanceamento } from "./docs/balanceamento";
import { ARTICLES as cache } from "./docs/cache";
import { ARTICLES as rede } from "./docs/rede";
import { ARTICLES as mensageria } from "./docs/mensageria";
import { ARTICLES as distribuidos } from "./docs/distribuidos";
import { ARTICLES as operacao } from "./docs/operacao";
import { ARTICLES as lld } from "./docs/lld";
import { ARTICLES as entrevistas } from "./docs/entrevistas";

/**
 * Aulas em formato de documentação: artigos de system design, do básico ao avançado.
 * O texto fica em PT e EN lado a lado (os artigos são longos demais para a chave-é-o-português do i18n);
 * os demais idiomas caem para o inglês. Marcação inline: **negrito** e `código`.
 */
export type Bi = readonly [pt: string, en: string];
export type DocBlock =
  | { k: "h"; x: Bi }
  | { k: "p"; x: Bi }
  | { k: "ul"; x: readonly Bi[] }
  | { k: "tip"; x: Bi }
  | { k: "code"; x: string }
  | { k: "table"; head: readonly Bi[]; rows: readonly (readonly Bi[])[] }
  | { k: "fig"; cap: Bi; cols: readonly (readonly FigNode[])[]; edges: readonly FigEdge[] };
/** Diagrama: nós organizados em colunas (da esquerda para a direita) e setas entre eles. Rótulo `string` = igual nos dois idiomas. */
export type FigKind = "client" | "edge" | "service" | "data" | "cache" | "queue" | "ext";
export interface FigNode { id: string; label: Bi | string; kind?: FigKind; /** linha tracejada */ dashed?: boolean }
export interface FigEdge { from: string; to: string; label?: Bi | string; dashed?: boolean; /** seta nos dois sentidos */ both?: boolean }
export interface DocArticle { id: string; section: string; /** dificuldade: 0 básico, 1 intermediário, 2 avançado */ level: 0 | 1 | 2; icon: string; title: Bi; summary: Bi; minutes: number; body: DocBlock[] }
export interface DocLevel { title: Bi; summary: Bi }

export interface DocSection { id: string; icon: string; title: Bi; summary: Bi }
export const DOC_SECTIONS: DocSection[] = [
  { id: "fundamentos", icon: "flag", title: ["Fundamentos", "Fundamentals"], summary: ["O que é system design, como levantar requisitos e fazer contas de capacidade.", "What system design is, how to gather requirements and do capacity math."] },
  { id: "estilos", icon: "deployed_code", title: ["Estilos arquiteturais", "Architectural styles"], summary: ["Monolito, microsserviços, eventos, serverless e a diferença entre sistemas com e sem estado.", "Monolith, microservices, events, serverless and the difference between stateful and stateless systems."] },
  { id: "escalabilidade", icon: "trending_up", title: ["Escalabilidade", "Scalability"], summary: ["Crescer na vertical e na horizontal, e onde os sistemas costumam engasgar.", "Scaling up and out, and where systems usually choke."] },
  { id: "bancos", icon: "database", title: ["Bancos de dados e armazenamento", "Databases and storage"], summary: ["Modelos, índices, replicação, sharding e os tipos de armazenamento.", "Models, indexes, replication, sharding and the kinds of storage."] },
  { id: "consistencia", icon: "balance", title: ["Disponibilidade, consistência e confiabilidade", "Availability, consistency and reliability"], summary: ["Nove noves, CAP, tolerância a falhas e manutenção.", "Nines, CAP, fault tolerance and maintainability."] },
  { id: "balanceamento", icon: "alt_route", title: ["Balanceamento de carga", "Load balancing"], summary: ["Distribuir tráfego, hashing consistente e failover.", "Spreading traffic, consistent hashing and failover."] },
  { id: "cache", icon: "bolt", title: ["Cache, CDN e latência", "Caching, CDN and latency"], summary: ["Guardar respostas perto de quem pede, em vários níveis.", "Keeping answers close to whoever asks, at several levels."] },
  { id: "rede", icon: "lan", title: ["Rede, protocolos e proxies", "Networking, protocols and proxies"], summary: ["DNS, HTTP, proxies, API gateway e comunicação em tempo real.", "DNS, HTTP, proxies, API gateways and real-time communication."] },
  { id: "mensageria", icon: "stacks", title: ["Filas, eventos e limites", "Queues, events and limits"], summary: ["Mensageria, arquitetura orientada a eventos e controle de tráfego.", "Messaging, event-driven architecture and traffic control."] },
  { id: "distribuidos", icon: "hub", title: ["Sistemas distribuídos", "Distributed systems"], summary: ["Resiliência, transações, consenso e rastreamento entre serviços.", "Resilience, transactions, consensus and tracing across services."] },
  { id: "operacao", icon: "verified_user", title: ["Testes, segurança e operação", "Testing, security and operations"], summary: ["Testar, proteger, observar, recuperar de desastres e controlar custos.", "Testing, securing, observing, recovering from disasters and controlling costs."] },
  { id: "lld", icon: "schema", title: ["Low Level Design", "Low Level Design"], summary: ["Orientação a objetos, princípios SOLID, UML e padrões de projeto.", "Object orientation, SOLID principles, UML and design patterns."] },
  { id: "entrevistas", icon: "record_voice_over", title: ["Entrevistas de system design", "System design interviews"], summary: ["Um roteiro para a entrevista, perguntas comuns e erros a evitar.", "A roadmap for the interview, common questions and mistakes to avoid."] },
];

export const DOC_LEVELS: DocLevel[] = [
  { title: ["Básico", "Basics"], summary: ["Os blocos de qualquer sistema e as palavras que você vai ouvir o tempo todo.", "The building blocks of any system and the words you will hear all the time."] },
  { title: ["Intermediário", "Intermediate"], summary: ["Como crescer: distribuir carga, guardar respostas e tirar trabalho do caminho do usuário.", "How to grow: spread load, keep answers close and take work off the user's path."] },
  { title: ["Avançado", "Advanced"], summary: ["Dados em várias máquinas, consistência e o que fazer quando as peças falham.", "Data across many machines, consistency, and what to do when parts fail."] },
];

const SECTION_ARTICLES: Record<string, DocArticle[]> = { fundamentos, estilos, escalabilidade, bancos, consistencia, balanceamento, cache, rede, mensageria, distribuidos, operacao, lld, entrevistas };
export const DOCS: DocArticle[] = DOC_SECTIONS.flatMap((sec) => SECTION_ARTICLES[sec.id] ?? []);

export const docById = (id: string | null | undefined) => DOCS.find((d) => d.id === id);
export const docUrl = (d: DocArticle) => `/start/aulas/${d.id}`;
/** Texto no idioma atual: português ou inglês (os demais idiomas usam o inglês). */
export const bi = (x: Bi, lang: string) => (lang === "pt" ? x[0] : x[1]);
