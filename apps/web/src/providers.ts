/** Provedores por tipo de componente. Os logos vetoriais ficam em logos.generated.ts (gerado por scripts/gen-logos.mjs). */
export interface Provider { id: string; name: string; note?: string; /** cor do monograma quando a marca não tem logo */ hex: string }
const P = (id: string, name: string, note?: string, hex = "#64748b"): Provider => ({ id, name, note, hex });

const SQL = [
  P("postgresql", "PostgreSQL", "Relacional, transações ACID, extensível"), P("mysql", "MySQL", "Relacional amplamente adotado"),
  P("mariadb", "MariaDB", "Fork comunitário do MySQL"), P("sqlite", "SQLite", "Embutido, arquivo único"),
  P("cockroachdb", "CockroachDB", "SQL distribuído com consistência forte"), P("neon", "Neon", "Postgres serverless"),
  P("supabase", "Supabase", "Postgres gerenciado com Auth e Storage"),
];
const NOSQL = [
  P("mongodb", "MongoDB", "Documentos"), P("cassandra", "Apache Cassandra", "Wide-column, escrita escalável"),
  P("dynamodb", "Amazon DynamoDB", "Chave-valor gerenciado"), P("couchbase", "Couchbase", "Documentos + cache"),
  P("neo4j", "Neo4j", "Grafos"), P("influxdb", "InfluxDB", "Séries temporais"), P("clickhouse", "ClickHouse", "Colunar analítico"),
];
const RUNTIMES = [
  P("nodejs", "Node.js"), P("go", "Go"), P("spring-boot", "Spring Boot"), P("fastapi", "FastAPI"), P("python", "Python"),
  P("dotnet", ".NET"), P("rust", "Rust"), P("nestjs", "NestJS"), P("laravel", "Laravel"), P("rails", "Ruby on Rails"),
  P("express", "Express"), P("django", "Django"),
];
const PROXIES = [
  P("nginx", "NGINX"), P("envoy", "Envoy Proxy"), P("traefik", "Traefik Proxy"),
];

const K8S = [
  P("kubernetes", "Kubernetes", "Orquestrador de contêineres"), P("eks", "Amazon EKS"), P("gke", "Google GKE", undefined, "#4285F4"),
  P("aks", "Azure AKS", undefined, "#0078D4"), P("openshift", "Red Hat OpenShift"), P("nomad", "HashiCorp Nomad"), P("ecs", "Amazon ECS"), P("k3s", "K3s", "Kubernetes leve para borda"),
];
const VECTOR = [
  P("pinecone", "Pinecone"), P("weaviate", "Weaviate", undefined, "#00B140"), P("milvus", "Milvus"), P("qdrant", "Qdrant"),
  P("pgvector", "pgvector", "Extensão vetorial do PostgreSQL"), P("chroma", "Chroma"), P("elasticsearch", "Elasticsearch (kNN)"),
];

export const PROVIDERS: Record<string, Provider[]> = {
  client: [P("chrome", "Google Chrome"), P("firefox", "Firefox"), P("safari", "Safari")],
  "web-app": [P("react", "React"), P("vue", "Vue.js"), P("angular", "Angular"), P("svelte", "Svelte"), P("nextjs", "Next.js")],
  "mobile-app": [P("android", "Android"), P("ios", "iOS"), P("flutter", "Flutter")],
  "api-gateway": [P("kong", "Kong"), ...PROXIES, P("aws-apigw", "Amazon API Gateway")],
  "load-balancer": [...PROXIES, P("haproxy", "HAProxy"), P("aws-alb", "AWS ALB")],
  backend: RUNTIMES, microservice: RUNTIMES,
  worker: [P("celery", "Celery"), P("bullmq", "BullMQ", undefined, "#E8453C"), P("nodejs", "Node.js"), P("python", "Python"), P("go", "Go"), P("sidekiq", "Sidekiq")],
  database: [...SQL, ...NOSQL],
  "sql-database": SQL, "nosql-database": NOSQL,
  redis: [P("redis", "Redis", "Cache e estruturas em memória"), P("valkey", "Valkey", "Fork aberto do Redis"),
    P("memcached", "Memcached", "Cache simples chave-valor"), P("upstash", "Upstash", "Redis serverless")],
  kafka: [P("kafka", "Apache Kafka", "Log distribuído particionado"), P("redpanda", "Redpanda", "API compatível com Kafka", "#E2401B"),
    P("pulsar", "Apache Pulsar"), P("nats", "NATS.io")],
  queue: [P("rabbitmq", "RabbitMQ"), P("sqs", "Amazon SQS"), P("nats", "NATS.io"), P("pubsub", "Google Pub/Sub"), P("activemq", "Apache ActiveMQ"), P("azure-sb", "Azure Service Bus", undefined, "#0078D4")],
  cdn: [P("cloudflare", "Cloudflare"), P("fastly", "Fastly"), P("akamai", "Akamai"), P("cloudfront", "Amazon CloudFront"), P("bunny", "bunny.net")],
  "object-storage": [P("s3", "Amazon S3"), P("gcs", "Google Cloud Storage"), P("minio", "MinIO"), P("backblaze", "Backblaze"), P("wasabi", "Wasabi")],
  "search-engine": [P("elasticsearch", "Elasticsearch"), P("opensearch", "OpenSearch"), P("meilisearch", "Meilisearch"),
    P("solr", "Apache Solr"), P("typesense", "Typesense")],
  websocket: [P("socketio", "Socket.io"), P("pusher", "Pusher"), P("ably", "Ably", undefined, "#FF5416")],
  dns: [P("cloudflare", "Cloudflare"), P("route53", "Amazon Route 53"), P("gcloud-dns", "Google Cloud")],
  "authentication-service": [P("auth0", "Auth0"), P("keycloak", "Keycloak"), P("okta", "Okta"), P("supabase", "Supabase"), P("firebase", "Firebase"), P("clerk", "Clerk")],
  "iot-device": [P("esp32", "ESP32", "Microcontrolador com Wi-Fi e Bluetooth"), P("raspberrypi", "Raspberry Pi"), P("arduino", "Arduino"),
    P("stm32", "STM32"), P("nordic", "Nordic nRF", "BLE e baixo consumo")],
  "external-system": [P("salesforce", "Salesforce"), P("sap", "SAP"), P("oracle", "Oracle"), P("hubspot", "HubSpot")],
  "iot-gateway": [P("nodered", "Node-RED"), P("greengrass", "AWS IoT Greengrass", undefined, "#FF9900"), P("azure-iot-edge", "Azure IoT Edge", undefined, "#0078D4"),
    P("kura", "Eclipse Kura"), P("balena", "balena")],
  "mqtt-broker": [P("mosquitto", "Eclipse Mosquitto"), P("emqx", "EMQX", undefined, "#00B173"), P("hivemq", "HiveMQ"), P("vernemq", "VerneMQ"), P("rabbitmq", "RabbitMQ (MQTT)")],
  "iot-platform": [P("aws-iot", "AWS IoT Core", undefined, "#FF9900"), P("azure-iot", "Azure IoT Hub", undefined, "#0078D4"), P("thingsboard", "ThingsBoard"),
    P("balena", "balena"), P("particle", "Particle")],
  "edge-compute": [P("greengrass", "AWS IoT Greengrass", undefined, "#FF9900"), P("azure-iot-edge", "Azure IoT Edge", undefined, "#0078D4"), P("k3s", "K3s"),
    P("cf-workers", "Cloudflare Workers"), P("nodered", "Node-RED")],
  waf: [P("cloudflare", "Cloudflare WAF"), P("aws-waf", "AWS WAF"), P("modsecurity", "ModSecurity"), P("imperva", "Imperva"), P("f5", "F5"), P("akamai", "Akamai")],
  "service-mesh": [P("istio", "Istio"), P("linkerd", "Linkerd"), P("consul", "Consul Connect"), P("envoy", "Envoy Proxy")],
  "rate-limiter": [P("redis", "Redis (token bucket)"), P("envoy", "Envoy Proxy"), P("kong", "Kong"), P("nginx", "NGINX"), P("cloudflare", "Cloudflare")],
  container: [P("docker", "Docker"), P("podman", "Podman"), P("containerd", "containerd")],
  kubernetes: K8S,
  serverless: [P("lambda", "AWS Lambda", undefined, "#FF9900"), P("gcloud-functions", "Google Cloud Functions"), P("azure-functions", "Azure Functions", undefined, "#0078D4"),
    P("cf-workers", "Cloudflare Workers"), P("vercel", "Vercel"), P("netlify", "Netlify")],
  vm: [P("ec2", "Amazon EC2"), P("gce", "Google Compute Engine"), P("azure-vm", "Azure Virtual Machines"), P("vmware", "VMware"), P("proxmox", "Proxmox"), P("digitalocean", "DigitalOcean")],
  scheduler: [P("cron", "cron", "Agendador do Unix", "#64748b"), P("airflow", "Apache Airflow"), P("quartz", "Quartz"), P("kubernetes", "Kubernetes CronJob"), P("eventbridge", "EventBridge Scheduler")],
  "workflow-engine": [P("temporal", "Temporal"), P("airflow", "Apache Airflow"), P("step-functions", "AWS Step Functions"), P("camunda", "Camunda"), P("argo", "Argo Workflows"), P("prefect", "Prefect")],
  "stream-processor": [P("flink", "Apache Flink"), P("spark", "Spark Streaming"), P("kafka-streams", "Kafka Streams"), P("kinesis", "Amazon Kinesis"), P("beam", "Apache Beam")],
  "batch-processor": [P("spark", "Apache Spark"), P("hadoop", "Hadoop MapReduce"), P("dbt", "dbt"), P("beam", "Apache Beam"), P("databricks", "Databricks")],
  "ml-service": [P("tensorflow", "TensorFlow Serving"), P("pytorch", "PyTorch / TorchServe"), P("triton", "NVIDIA Triton"), P("sagemaker", "Amazon SageMaker", undefined, "#FF9900"),
    P("vertex", "Vertex AI"), P("openai", "OpenAI API"), P("huggingface", "Hugging Face"), P("mlflow", "MLflow")],
  "timeseries-db": [P("influxdb", "InfluxDB"), P("timescaledb", "TimescaleDB"), P("prometheus", "Prometheus"), P("questdb", "QuestDB"), P("victoriametrics", "VictoriaMetrics"), P("clickhouse", "ClickHouse")],
  "graph-db": [P("neo4j", "Neo4j"), P("neptune", "Amazon Neptune"), P("arangodb", "ArangoDB"), P("janusgraph", "JanusGraph"), P("tigergraph", "TigerGraph"), P("dgraph", "Dgraph")],
  "vector-db": VECTOR,
  "data-warehouse": [P("snowflake", "Snowflake"), P("bigquery", "Google BigQuery"), P("redshift", "Amazon Redshift"), P("databricks", "Databricks"),
    P("clickhouse", "ClickHouse"), P("synapse", "Azure Synapse", undefined, "#0078D4")],
  "event-bus": [P("eventbridge", "Amazon EventBridge"), P("azure-event-grid", "Azure Event Grid", undefined, "#0078D4"), P("eventarc", "Google Eventarc"), P("kafka", "Apache Kafka"), P("solace", "Solace")],
  "secrets-manager": [P("vault", "HashiCorp Vault"), P("aws-secrets", "AWS Secrets Manager"), P("azure-keyvault", "Azure Key Vault", undefined, "#0078D4"), P("doppler", "Doppler"), P("1password", "1Password")],
  "service-discovery": [P("consul", "HashiCorp Consul"), P("etcd", "etcd"), P("zookeeper", "Apache ZooKeeper"), P("eureka", "Netflix Eureka"), P("coredns", "CoreDNS")],
  observability: [P("prometheus", "Prometheus"), P("grafana", "Grafana"), P("datadog", "Datadog"), P("newrelic", "New Relic"), P("opentelemetry", "OpenTelemetry"),
    P("sentry", "Sentry"), P("splunk", "Splunk"), P("jaeger", "Jaeger"), P("elasticsearch", "Elastic (ELK)")],
  "payment-gateway": [P("stripe", "Stripe"), P("paypal", "PayPal"), P("adyen", "Adyen"), P("mercadopago", "Mercado Pago"), P("braintree", "Braintree")],
  "third-party-api": [P("github", "GitHub API"), P("slack", "Slack API"), P("googlemaps", "Google Maps"), P("openai", "OpenAI API"), P("twilio", "Twilio")],
  "notification-service": [P("firebase", "Firebase"), P("onesignal", "OneSignal"), P("twilio", "Twilio"),
    P("sendgrid", "SendGrid"), P("mailgun", "Mailgun"), P("resend", "Resend")],
};

export const providerOf = (type: string, id?: string) => PROVIDERS[type]?.find((p) => p.id === id);

/** Marcas sem logo vetorial disponível: um ícone que lembra o papel da tecnologia, em vez de só a inicial. */
export const FALLBACK_ICON: Record<string, string> = {
  cron: "schedule", quartz: "schedule", modsecurity: "shield", imperva: "shield", bullmq: "stacks", redpanda: "swap_horiz", ably: "bolt",
  particle: "sensors", janusgraph: "hub", tigergraph: "hub", solace: "cable",
};
