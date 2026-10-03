/** Catálogo de componentes exibido na paleta (spec §6.4). Textos pt-BR provisórios até a camada de i18n. */
export interface PaletteItem { type: string; label: string; icon: string; desc: string; profileId: string }
export type Category = "origin" | "iot" | "network" | "compute" | "data" | "messaging" | "support";
export interface PaletteGroup { title: string; cat: Category; items: PaletteItem[] }

const item = (type: string, label: string, icon: string, desc: string, profileId = "unprofiled-v0"): PaletteItem =>
  ({ type, label, icon, desc, profileId });

export const PALETTE: PaletteGroup[] = [
  { title: "Origem de carga", cat: "origin", items: [
    item("client", "Cliente", "language", "Fonte de requisições", "source-v1"),
    item("web-app", "Aplicação web", "web", "SPA ou site no navegador", "source-v1"),
    item("mobile-app", "App mobile", "smartphone", "Aplicativo iOS/Android", "source-v1"),
    item("iot-device", "Dispositivo IoT", "sensors", "Sensor, atuador ou microcontrolador", "source-v1"),
    item("external-system", "Sistema externo", "domain", "Parceiro, ERP ou sistema legado", "source-v1"),
  ] },
  { title: "IoT e borda", cat: "iot", items: [
    item("iot-gateway", "Gateway IoT", "router", "Agrega dispositivos e fala com a nuvem"),
    item("mqtt-broker", "Broker MQTT", "swap_vert", "Publicar/assinar de tópicos para dispositivos"),
    item("iot-platform", "Plataforma IoT", "memory_alt", "Registro de dispositivos, regras e shadow"),
    item("edge-compute", "Computação de borda", "developer_board", "Processa perto do dispositivo ou do usuário"),
  ] },
  { title: "Entrada e rede", cat: "network", items: [
    item("dns", "DNS", "travel_explore", "Resolução de nomes"),
    item("cdn", "CDN", "public", "Cache na borda e entrega de mídia"),
    item("load-balancer", "Load balancer", "alt_route", "Distribui tráfego entre instâncias", "lb-standard-v1"),
    item("api-gateway", "API Gateway", "hub", "Roteamento, auth e limites", "lb-standard-v1"),
    item("websocket", "WebSocket", "bolt", "Conexões persistentes"),
    item("waf", "WAF / Firewall", "shield", "Filtra ataques e tráfego malicioso"),
    item("service-mesh", "Service mesh", "grid_view", "mTLS, retries e roteamento entre serviços"),
    item("rate-limiter", "Rate limiter", "speed", "Limita requisições por cliente"),
  ] },
  { title: "Computação", cat: "compute", items: [
    item("backend", "Backend", "dns", "Serviço de aplicação", "compute-standard-v1"),
    item("microservice", "Microsserviço", "deployed_code", "Serviço de domínio isolado", "compute-standard-v1"),
    item("worker", "Worker", "settings", "Consome filas e executa jobs", "compute-standard-v1"),
    item("container", "Contêiner (Docker)", "deployed_code_update", "Imagem de contêiner rodando um serviço", "compute-standard-v1"),
    item("kubernetes", "Cluster Kubernetes", "lan", "Orquestra contêineres e escala pods", "k8s-cluster-v1"),
    item("serverless", "Função serverless", "function", "Código sob demanda, com cold start", "serverless-v1"),
    item("vm", "Máquina virtual", "computer", "Instância de VM (EC2, GCE…)", "vm-standard-v1"),
    item("scheduler", "Agendador (cron)", "schedule", "Dispara jobs em horários definidos", "scheduler-v1"),
    item("workflow-engine", "Orquestrador de workflow", "account_tree", "Sagas e pipelines com retries e estado", "workflow-v1"),
    item("stream-processor", "Processador de streams", "stream", "Flink, Kafka Streams e afins em tempo real", "stream-proc-v1"),
    item("batch-processor", "Processamento em lote", "database_upload", "Spark/Hadoop em grandes volumes", "batch-proc-v1"),
    item("ml-service", "Serviço de ML", "psychology", "Inferência de modelos e embeddings", "ml-infer-v1"),
  ] },
  { title: "Dados e cache", cat: "data", items: [
    item("database", "Banco (abstrato)", "database", "Exige escolher o engine"),
    item("sql-database", "Banco SQL", "database", "Relacional transacional", "sql-standard-v1"),
    item("nosql-database", "Banco NoSQL", "table_chart", "Documento, chave-valor ou colunar"),
    item("redis", "Cache / KV", "memory", "Memória rápida", "cache-standard-v1"),
    item("object-storage", "Object storage", "hard_drive", "Arquivos e blobs"),
    item("search-engine", "Busca", "search", "Índice de texto"),
    item("timeseries-db", "Série temporal", "monitoring", "Métricas e telemetria ao longo do tempo"),
    item("graph-db", "Banco de grafos", "hub", "Relações entre entidades"),
    item("vector-db", "Banco vetorial", "scatter_plot", "Busca por similaridade (embeddings)"),
    item("data-warehouse", "Data warehouse", "analytics", "Análise colunar de grandes volumes"),
  ] },
  { title: "Mensageria", cat: "messaging", items: [
    item("queue", "Fila", "stacks", "Desacopla produtor e consumidor"),
    item("kafka", "Log de eventos", "swap_horiz", "Stream particionado e durável"),
    item("event-bus", "Barramento de eventos", "cable", "Roteia eventos por regras (EventBridge)"),
  ] },
  { title: "Serviços de apoio", cat: "support", items: [
    item("authentication-service", "Autenticação", "key", "Identidade e sessões"),
    item("notification-service", "Notificações", "notifications", "E-mail, push e SMS"),
    item("secrets-manager", "Gestão de segredos", "lock_person", "Cofre de chaves e credenciais"),
    item("service-discovery", "Descoberta de serviços", "radar", "Registro e configuração distribuída"),
    item("observability", "Observabilidade", "monitor_heart", "Métricas, logs e traces"),
    item("payment-gateway", "Gateway de pagamento", "credit_card", "Cobrança por provedor externo"),
    item("third-party-api", "API de terceiros", "api", "SaaS ou serviço fora do seu controle"),
  ] },
];
export const ITEM_BY_TYPE = new Map(PALETTE.flatMap((g) => g.items).map((i) => [i.type, i]));

export const CATEGORY_OF = new Map<string, Category>(PALETTE.flatMap((g) => g.items.map((i) => [i.type, g.cat] as const)));
