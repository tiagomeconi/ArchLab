/** Identidade visual de cada protocolo de conexão: mesma cor e ícone no desenho, no rótulo, na legenda e no diálogo. */
export interface ProtoStyle { name: string; color: string; icon: string; hint: string }

export const PROTO: Record<string, ProtoStyle> = {
  https: { name: "HTTPS", color: "#38bdf8", icon: "lock", hint: "Requisição e resposta pela web, com TLS" },
  tcp: { name: "TCP", color: "#94a3b8", icon: "settings_ethernet", hint: "Conexão direta de baixo nível" },
  sql: { name: "SQL", color: "#a78bfa", icon: "database", hint: "Consulta ao banco relacional" },
  redis: { name: "Redis", color: "#f87171", icon: "memory", hint: "Leitura e escrita em cache ou chave-valor" },
  kafka: { name: "Kafka", color: "#fb923c", icon: "swap_horiz", hint: "Log de eventos particionado e durável" },
  amqp: { name: "AMQP", color: "#fbbf24", icon: "stacks", hint: "Fila de mensagens com confirmação" },
  websocket: { name: "WebSocket", color: "#2dd4bf", icon: "bolt", hint: "Conexão aberta nos dois sentidos" },
  dns: { name: "DNS", color: "#4ade80", icon: "travel_explore", hint: "Resolução de nomes" },
  grpc: { name: "gRPC", color: "#818cf8", icon: "sync_alt", hint: "RPC binário sobre HTTP/2, baixa latência" },
  graphql: { name: "GraphQL", color: "#f472b6", icon: "schema", hint: "Consulta flexível: o cliente escolhe os campos" },
  mqtt: { name: "MQTT", color: "#a3e635", icon: "rss_feed", hint: "Publicar/assinar leve, feito para dispositivos IoT" },
  coap: { name: "CoAP", color: "#eab308", icon: "sensors", hint: "Requisição leve sobre UDP para dispositivos restritos" },
  http: { name: "HTTP", color: "#fb7185", icon: "no_encryption", hint: "HTTP sem TLS: só em rede isolada" },
  sse: { name: "SSE", color: "#06b6d4", icon: "campaign", hint: "Servidor empurra eventos por conexão HTTP aberta" },
  opcua: { name: "OPC UA", color: "#d6a35c", icon: "precision_manufacturing", hint: "Dados industriais com segurança e semântica" },
  modbus: { name: "Modbus", color: "#c08457", icon: "cable", hint: "Barramento industrial mestre/escravo" },
  lorawan: { name: "LoRaWAN", color: "#86efac", icon: "cell_tower", hint: "Longo alcance e banda mínima para sensores" },
  ble: { name: "Bluetooth LE", color: "#60a5fa", icon: "bluetooth", hint: "Curto alcance e baixo consumo" },
  smtp: { name: "SMTP", color: "#e5e7eb", icon: "mail", hint: "Envio de e-mail" },
  internal: { name: "Interno", color: "#cbd5e1", icon: "home_work", hint: "Chamada dentro da mesma rede confiável" },
};
export const protoOf = (p: string): ProtoStyle => PROTO[p] ?? { name: p.toUpperCase(), color: "#94a3b8", icon: "cable", hint: "" };
