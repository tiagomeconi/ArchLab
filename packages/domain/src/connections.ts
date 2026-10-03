/** Opções de conexão válidas conforme os tipos de origem e destino (spec §6.2 "portas tipadas"). */
export type Protocol =
  | "https" | "http" | "tcp" | "sql" | "redis" | "kafka" | "amqp" | "websocket" | "dns" | "internal"
  | "grpc" | "graphql" | "mqtt" | "coap" | "sse" | "opcua" | "modbus" | "lorawan" | "ble" | "smtp";
export interface ConnectionOption {
  protocol: Protocol;
  mode: "sync" | "async";
  label: string;
  hint: string;
  timeoutMs: number;
  networkLatencyMs: number;
  tls: boolean;
}

const opt = (
  protocol: ConnectionOption["protocol"], mode: ConnectionOption["mode"], label: string, hint: string,
  timeoutMs = 500, networkLatencyMs = 1, tls = true,
): ConnectionOption => ({ protocol, mode, label, hint, timeoutMs, networkLatencyMs, tls });

/** origens de carga: só emitem conexões */
const CLIENTS = ["client", "web-app", "mobile-app", "iot-device", "external-system"];
/** armazenamentos terminais: só recebem conexões */
const DBS = ["database", "sql-database", "nosql-database", "timeseries-db", "graph-db", "vector-db", "data-warehouse"];
const QUEUES = ["kafka", "queue", "mqtt-broker", "event-bus"];
/** componentes que falam entre si por RPC (HTTPS, gRPC, chamada interna) */
const SERVICES = [
  "backend", "microservice", "worker", "container", "kubernetes", "serverless", "vm", "edge-compute", "ml-service",
  "workflow-engine", "stream-processor", "batch-processor", "scheduler", "authentication-service", "notification-service",
  "iot-platform", "iot-gateway", "rate-limiter", "service-mesh",
];
const GRPC_OK = new Set([...SERVICES, "api-gateway", "load-balancer", "vector-db", "observability", "service-discovery"]);
const EXTERNAL = ["payment-gateway", "third-party-api"];
const GRAPHQL_OK = new Set(["backend", "microservice", "api-gateway", "container", "serverless", "kubernetes", "vm"]);

/** Conexões que saem de um banco ou cache: replicação, carga de cache, CDC, exportação e avisos de mudança. */
function storageOut(target: string): ConnectionOption[] {
  const proto: Protocol = target === "redis" ? "redis" : target === "sql-database" || target === "database" || target === "data-warehouse" ? "sql"
    : DBS.includes(target) ? "tcp" : "https";
  if (target === "redis" || DBS.includes(target)) {
    const kind = target === "redis" ? "Carga do cache (async)" : "Replicação / sincronização (async)";
    return [
      opt(proto, "async", kind, "Copia ou propaga dados entre os dois em segundo plano", 1000, 2),
      opt(proto, "sync", "Escrita direta (sync)", "O armazenamento de origem grava no destino na mesma operação", 200, 1),
    ];
  }
  if (QUEUES.includes(target)) {
    const p: Protocol = target === "mqtt-broker" ? "mqtt" : target === "event-bus" ? "https" : "kafka";
    return [opt(p, "async", "Captura de mudanças (CDC, async)", "Cada alteração vira um evento publicado", 1000, 2)];
  }
  if (target === "search-engine" || target === "object-storage") {
    return [opt("https", "async", "Indexação / exportação (async)", "Envia os dados para busca, backup ou data lake em segundo plano", 2000, 3)];
  }
  return [
    opt("https", "async", "Aviso de mudança (async)", "Notifica o consumidor quando os dados mudam", 1000, 3),
    opt("tcp", "sync", "TCP (sync)", "Conexão direta", 300, 1),
  ];
}

export function connectionOptions(sourceType: string, targetType: string): ConnectionOption[] {
  if (CLIENTS.includes(targetType)) return [];
  if (DBS.includes(sourceType) || sourceType === "redis") return storageOut(targetType);
  if (CLIENTS.includes(sourceType)) {
    if (targetType === "websocket") return [opt("websocket", "sync", "WebSocket", "Conexão persistente e bidirecional")];
    if (targetType === "dns") return [opt("dns", "sync", "Resolução DNS", "Resolução no início da sessão, não por request", 100, 5, false)];
    if (targetType === "mqtt-broker") {
      return sourceType === "iot-device"
        ? [opt("mqtt", "async", "MQTT (publicar telemetria)", "Publicação leve em tópico, QoS 0/1; não espera a resposta do consumidor", 2000, 20)]
        : [opt("mqtt", "async", "MQTT sobre WebSocket", "Assinatura de tópicos pelo navegador ou app", 2000, 15)];
    }
    if (sourceType === "iot-device") {
      if (targetType === "iot-gateway") {
        return [
          opt("mqtt", "async", "MQTT (async)", "Telemetria publicada ao gateway local", 2000, 5, false),
          opt("coap", "sync", "CoAP (sync)", "Requisição leve sobre UDP para dispositivos restritos", 800, 8, false),
          opt("ble", "async", "Bluetooth LE (async)", "Curto alcance e baixo consumo", 2000, 30, false),
          opt("lorawan", "async", "LoRaWAN (async)", "Longo alcance, banda mínima e latência alta", 5000, 400, false),
          opt("modbus", "sync", "Modbus (sync)", "Barramento industrial mestre/escravo", 300, 10, false),
          opt("opcua", "sync", "OPC UA (sync)", "Dados industriais com segurança e modelo de informação", 500, 8),
        ];
      }
      if (targetType === "iot-platform") {
        return [
          opt("mqtt", "async", "MQTT (async)", "Telemetria direto à plataforma IoT, com TLS", 2000, 25),
          opt("https", "sync", "HTTPS (sync)", "Envio por HTTP; mais pesado que MQTT", 800, 30),
          opt("coap", "sync", "CoAP (sync)", "Requisição leve sobre UDP (DTLS)", 800, 25),
        ];
      }
      return [
        opt("https", "sync", "HTTPS (sync)", "Chamada HTTP com TLS; pesado para dispositivos pequenos", 800, 30),
        opt("http", "sync", "HTTP sem TLS (sync)", "Sem criptografia: só em rede local isolada", 800, 20, false),
        opt("coap", "sync", "CoAP (sync)", "Requisição leve sobre UDP", 800, 25, false),
        opt("tcp", "sync", "TCP (sync)", "Socket direto, protocolo próprio", 800, 25, false),
      ];
    }
    if (sourceType === "external-system") {
      return [opt("https", "sync", "HTTPS / webhook", "Parceiro ou sistema legado chamando a API"), opt("tcp", "sync", "TCP / SFTP", "Integração em lote ou protocolo legado", 2000, 20)];
    }
    const out = [opt("https", "sync", "HTTPS", "Requisição síncrona com resposta, TLS na fronteira pública")];
    if (GRAPHQL_OK.has(targetType)) out.push(opt("graphql", "sync", "GraphQL", "Consulta flexível sobre HTTPS; o cliente escolhe os campos"));
    if (targetType === "backend" || targetType === "api-gateway") out.push(opt("sse", "sync", "Server-Sent Events", "Servidor empurra eventos por uma conexão HTTP aberta"));
    return out;
  }
  if (targetType === "sql-database" || targetType === "database") {
    return [opt("sql", "sync", "SQL (sync)", "Consulta ou transação síncrona", 200)];
  }
  if (targetType === "data-warehouse") {
    return [opt("sql", "sync", "SQL analítico (sync)", "Consulta pesada sobre dados colunares; a latência é de segundos", 5000, 3)];
  }
  if (targetType === "nosql-database") {
    return [opt("tcp", "sync", "TCP (sync)", "Protocolo nativo do banco, resposta síncrona", 200)];
  }
  if (targetType === "timeseries-db") {
    return [
      opt("https", "sync", "HTTP API (sync)", "Escrita de pontos e consultas por janela de tempo", 300),
      opt("tcp", "sync", "TCP (sync)", "Protocolo nativo ou line protocol", 300),
    ];
  }
  if (targetType === "graph-db") {
    return [opt("tcp", "sync", "Bolt / TCP (sync)", "Protocolo nativo para consultas de grafo", 300), opt("https", "sync", "HTTPS (sync)", "API HTTP do banco de grafos", 300)];
  }
  if (targetType === "vector-db") {
    return [opt("grpc", "sync", "gRPC (sync)", "Busca por similaridade e upsert de vetores", 300), opt("https", "sync", "HTTPS (sync)", "API REST do banco vetorial", 300)];
  }
  if (targetType === "redis") return [opt("redis", "sync", "Redis (sync)", "Lookup ou escrita em cache/KV, timeout curto", 50)];
  if (targetType === "mqtt-broker") return [opt("mqtt", "async", "MQTT (publicar)", "Publica em tópico; não inclui o consumo na latência", 2000, 2)];
  if (targetType === "event-bus") return [opt("https", "async", "Publicar evento (async)", "Evento roteado por regras para vários consumidores", 1000, 5)];
  if (QUEUES.includes(targetType)) {
    return [
      opt("kafka", "async", "Publicar no log (async)", "Enqueue durável; não inclui o consumo na latência"),
      opt("amqp", "async", "Publicar na fila (async)", "Mensageria com ack; não inclui o consumo na latência"),
    ];
  }
  if (sourceType === "mqtt-broker") return [opt("mqtt", "async", "Assinatura MQTT (async)", "Consumidor assina o tópico", 2000, 2, false)];
  if (sourceType === "event-bus") return [opt("https", "async", "Entrega do evento (async)", "Regra do barramento aciona o consumidor", 1000, 5)];
  if (QUEUES.includes(sourceType)) {
    return [
      opt("kafka", "async", "Consumo (async)", "Consumer lê do log", 1000, 1, false),
      opt("amqp", "async", "Consumo com ack (async)", "Consumer confirma após processar", 1000, 1, false),
    ];
  }
  if (targetType === "object-storage") return [opt("https", "sync", "HTTPS (objeto)", "Upload/download de bytes; não conta como RPS de API")];
  if (targetType === "search-engine") return [opt("https", "sync", "HTTPS (busca)", "Consulta ou indexação")];
  if (targetType === "websocket") return [opt("websocket", "sync", "WebSocket", "Entrega a conexões abertas")];
  if (targetType === "observability") {
    return [
      opt("grpc", "async", "OTLP (async)", "Métricas, logs e traces enviados em segundo plano", 1000, 2, false),
      opt("https", "async", "HTTPS (async)", "Envio de telemetria por HTTP", 1000, 3),
    ];
  }
  if (targetType === "secrets-manager") return [opt("https", "sync", "HTTPS (sync)", "Busca de segredo, normalmente na inicialização e com cache", 200, 2)];
  if (targetType === "service-discovery") {
    return [opt("grpc", "sync", "gRPC (sync)", "Registro e consulta de instâncias", 100, 1, false), opt("dns", "sync", "DNS (sync)", "Descoberta por nome", 100, 1, false)];
  }
  if (EXTERNAL.includes(targetType)) return [opt("https", "sync", "HTTPS (API externa)", "Chamada a um provedor fora do seu controle; latência e falhas são dele", 3000, 25)];
  if (EXTERNAL.includes(sourceType)) return [opt("https", "async", "Webhook de retorno (async)", "O provedor avisa a conclusão chamando você de volta", 2000, 25)];
  if (sourceType === "cdn") return [opt("https", "sync", "HTTPS (origem)", "Busca na origem em caso de miss")];
  if (SERVICES.includes(sourceType) && SERVICES.includes(targetType)) {
    const out = [opt("https", "sync", "HTTPS (sync)", "Chamada síncrona entre serviços")];
    out.push(opt("grpc", "sync", "gRPC (sync)", "RPC binário sobre HTTP/2, baixa latência entre serviços", 300, 0.8));
    if (GRAPHQL_OK.has(targetType)) out.push(opt("graphql", "sync", "GraphQL (sync)", "Consulta flexível entre serviços ou federação"));
    out.push(opt("internal", "sync", "Chamada interna (sync)", "Dentro do mesmo processo ou rede confiável", 300, 0.5, false));
    return out;
  }
  const out = [
    opt("https", "sync", "HTTPS (sync)", "Chamada síncrona com resposta"),
    opt("tcp", "sync", "TCP (sync)", "Conexão direta"),
  ];
  if (GRPC_OK.has(targetType)) out.splice(1, 0, opt("grpc", "sync", "gRPC (sync)", "RPC binário sobre HTTP/2", 300, 0.8));
  return out;
}
