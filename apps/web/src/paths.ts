/** Trilhas de estudo: sequências de casos que levam do básico ao avançado em um tema. Gerado a partir de uma única fonte (PT) com o inglês em i18n/en.review.ts. */
export interface PathStep { caseId: string; goal: string }
export interface LearningPath { id: string; title: string; summary: string; icon: string; steps: PathStep[] }
export const PATHS: LearningPath[] = [
  { id: "fundamentos", title: "Fundamentos", summary: "Do primeiro sistema ao cache, às filas e ao controle de tráfego: a base de qualquer entrevista.", icon: "school", steps: [
    { caseId: "url-shortener", goal: "Leitura pesada, cache e geração de IDs" },
    { caseId: "photo-sharing", goal: "Arquivos grandes: object storage e CDN" },
    { caseId: "wikipedia", goal: "Cache em camadas e leitura global" },
    { caseId: "rate-limiter", goal: "Proteger o sistema com limites e contadores" },
    { caseId: "notification-system", goal: "Filas, workers e idempotência" },
  ] },
  { id: "tempo-real", title: "Tempo real e mensageria", summary: "Conexões persistentes, presença, ordenação e entrega de mensagens em escala.", icon: "bolt", steps: [
    { caseId: "chat", goal: "WebSocket, pub/sub e ordenação" },
    { caseId: "slack", goal: "Isolamento por workspace e busca com permissão" },
    { caseId: "discord", goal: "Partições quentes e presença" },
    { caseId: "whatsapp", goal: "Armazena e encaminha, criptografia ponta a ponta" },
    { caseId: "video-call", goal: "Vídeo ao vivo: SFU e latência" },
  ] },
  { id: "midia", title: "Mídia em escala", summary: "Armazenar, transcodificar e entregar vídeo e imagens para milhões de pessoas.", icon: "movie", steps: [
    { caseId: "photo-sharing", goal: "Object storage, CDN e miniaturas" },
    { caseId: "video-streaming", goal: "Transcodificação e entrega por CDN" },
    { caseId: "youtube", goal: "Contagem de views e uploads gigantes" },
    { caseId: "netflix", goal: "CDN própria e bitrate adaptativo" },
    { caseId: "twitch", goal: "Ingestão ao vivo e chat em massa" },
  ] },
  { id: "dinheiro", title: "Dinheiro e consistência", summary: "Pagamentos, livros-razão, idempotência e o que fazer quando não pode dar errado.", icon: "payments", steps: [
    { caseId: "payments", goal: "Idempotência, ledger e reconciliação" },
    { caseId: "ecommerce", goal: "Transações distribuídas e saga" },
    { caseId: "stripe", goal: "Webhooks e livro-razão" },
    { caseId: "pix", goal: "Liquidação instantânea e diretório de chaves" },
    { caseId: "nubank", goal: "Event sourcing e consistência forte" },
    { caseId: "ticketmaster", goal: "Concorrência: fila virtual e reserva temporária" },
  ] },
  { id: "dados-busca", title: "Dados e busca", summary: "Armazenamento distribuído, índices e como achar informação rápido.", icon: "search", steps: [
    { caseId: "search-autocomplete", goal: "Trie, índice invertido e cache" },
    { caseId: "web-crawler", goal: "Fila de URLs e deduplicação" },
    { caseId: "file-storage", goal: "Chunking, deduplicação e sincronização" },
    { caseId: "key-value-store", goal: "Sharding, replicação e CAP" },
    { caseId: "google-search", goal: "Índice invertido e ranking em camadas" },
  ] },
  { id: "geo", title: "Geolocalização e despacho", summary: "Mapas, índices geoespaciais e casar quem pede com quem atende.", icon: "map", steps: [
    { caseId: "food-delivery", goal: "Estados do pedido e geolocalização" },
    { caseId: "ifood", goal: "Despacho geográfico e picos de refeição" },
    { caseId: "ride-hailing", goal: "Geoindexação e matching" },
    { caseId: "uber", goal: "Preço dinâmico e índice geoespacial" },
    { caseId: "google-maps", goal: "Blocos de mapa e trânsito em tempo real" },
  ] },
];

/** Progresso de uma trilha: quantos casos foram concluídos e qual é o próximo. */
export function pathProgress(p: LearningPath, done: (caseId: string) => boolean): { done: number; total: number; next: PathStep | undefined } {
  const n = p.steps.filter((s) => done(s.caseId)).length;
  return { done: n, total: p.steps.length, next: p.steps.find((s) => !done(s.caseId)) };
}
