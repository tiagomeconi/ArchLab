// Gera src/logos.generated.ts: logos vetoriais (SVG) dos provedores, extraídos de pacotes Iconify/Simple Icons.
// Rode: pnpm --filter @archlab/web gen:logos  (o arquivo gerado é versionado; o app não depende dos pacotes em runtime)
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as si from "simple-icons";
const require = createRequire(import.meta.url);
const pack = (n) => require(`@iconify-json/${n}/icons.json`);
const P = { logos: pack("logos"), devicon: pack("devicon") };
const SIMPLE = pack("simple-icons");

// id do provedor → [pacote, nome]. "si" = Simple Icons (monocromático, usa a cor oficial da marca).
const MAP = {
  chrome: ["logos", "chrome"], firefox: ["logos", "firefox"], safari: ["logos", "safari"], react: ["logos", "react"], vue: ["logos", "vue"],
  angular: ["logos", "angular-icon"], svelte: ["logos", "svelte-icon"], nextjs: ["logos", "nextjs-icon"], android: ["logos", "android-icon"],
  ios: ["logos", "ios"], flutter: ["logos", "flutter"], kong: ["logos", "kong-icon"], nginx: ["logos", "nginx"], envoy: ["logos", "envoy-icon"],
  traefik: ["devicon", "traefikproxy"], "aws-apigw": ["logos", "aws-api-gateway"], haproxy: ["devicon", "haproxy"], "aws-alb": ["logos", "aws-elb"],
  nodejs: ["logos", "nodejs-icon"], go: ["logos", "go"], "spring-boot": ["logos", "spring-icon"], fastapi: ["logos", "fastapi-icon"],
  python: ["logos", "python"], dotnet: ["logos", "dotnet"], rust: ["logos", "rust"], nestjs: ["logos", "nestjs"], laravel: ["logos", "laravel"],
  rails: ["logos", "rails"], express: ["logos", "express"], django: ["logos", "django-icon"], celery: ["si", "celery"], sidekiq: ["logos", "sidekiq-icon"],
  postgresql: ["logos", "postgresql"], mysql: ["logos", "mysql-icon"], mariadb: ["logos", "mariadb-icon"], sqlite: ["logos", "sqlite"],
  cockroachdb: ["si", "cockroachlabs"], neon: ["logos", "neon-icon"], supabase: ["logos", "supabase-icon"], mongodb: ["logos", "mongodb-icon"],
  dynamodb: ["logos", "aws-dynamodb"], cassandra: ["logos", "cassandra"], couchbase: ["logos", "couchbase"], neo4j: ["logos", "neo4j"],
  influxdb: ["logos", "influxdb-icon"], clickhouse: ["devicon", "clickhouse"], redis: ["logos", "redis"], valkey: ["logos", "valkey-icon"],
  memcached: ["logos", "memcached"], upstash: ["logos", "upstash-icon"], kafka: ["logos", "kafka-icon"], pulsar: ["devicon", "pulsar"],
  nats: ["logos", "nats-icon"], rabbitmq: ["logos", "rabbitmq-icon"], sqs: ["logos", "aws-sqs"], pubsub: ["si", "googlepubsub"],
  cloudflare: ["logos", "cloudflare-icon"], fastly: ["logos", "fastly"], akamai: ["logos", "akamai"], cloudfront: ["logos", "aws-cloudfront"],
  bunny: ["logos", "bunny-net-icon"], s3: ["logos", "aws-s3"], gcs: ["si", "googlecloudstorage"], minio: ["si", "minio"], backblaze: ["si", "backblaze"],
  wasabi: ["si", "wasabi"], elasticsearch: ["logos", "elasticsearch"], opensearch: ["logos", "opensearch-icon"], meilisearch: ["logos", "meilisearch"],
  solr: ["logos", "solr"], typesense: ["logos", "typesense-icon"], socketio: ["logos", "socket-io"], pusher: ["logos", "pusher-icon"],
  route53: ["logos", "aws-route53"], "gcloud-dns": ["logos", "google-cloud"], auth0: ["logos", "auth0-icon"], keycloak: ["si", "keycloak"],
  okta: ["logos", "okta-icon"], firebase: ["logos", "firebase-icon"], clerk: ["logos", "clerk-icon"], onesignal: ["logos", "onesignal"],
  // empresas dos casos de estudo: só o glifo da marca (Simple Icons), sem fundo. Marcas pretas usam currentColor e acompanham o tema.
  "co-netflix": ["si", "netflix"], "co-whatsapp": ["si", "whatsapp"], "co-instagram": ["si", "instagram"], "co-youtube": ["si", "youtube"],
  "co-spotify": ["si", "spotify"], "co-airbnb": ["si", "airbnb"], "co-discord": ["si", "discord"], "co-dropbox": ["si", "dropbox"],
  "co-stripe": ["si", "stripe"], "co-linkedin": ["si", "linkedin"], "co-tiktok": ["si", "tiktok"],
  "co-google": ["logos", "google-icon"], "co-googlemaps": ["logos", "google-maps"], "co-slack": ["logos", "slack-icon"], "co-zoom": ["logos", "zoom-icon"], "co-pinterest": ["si", "pinterest"],
  "co-reddit": ["si", "reddit"], "co-twitch": ["si", "twitch"], "co-wikipedia": ["si", "wikipedia"], "co-ifood": ["si", "ifood"], "co-nubank": ["si", "nubank"], "co-pix": ["si", "pix"],
  "co-uber": ["file", "co-uber.svg"], "co-ticketmaster": ["file", "co-ticketmaster.svg"], "co-shopee": ["si", "shopee"], "co-itau": ["file", "co-itau.svg"], "co-freefire": ["file", "co-freefire.svg"], "co-mercado-livre": ["file", "co-mercado-livre.svg"], "co-x": ["si", "x"], "co-amazon": ["si", "amazon"],
  // ampliação: IoT, contêineres, serverless, dados especializados e apoio
  esp32: ["si", "espressif"], raspberrypi: ["devicon", "raspberrypi"], arduino: ["logos", "arduino"], stm32: ["si", "stmicroelectronics"], nordic: ["si", "nordicsemiconductor"],
  salesforce: ["logos", "salesforce"], sap: ["logos", "sap"], oracle: ["logos", "oracle"], hubspot: ["logos", "hubspot"],
  nodered: ["devicon", "nodered"], kura: ["logos", "eclipse"], mosquitto: ["si", "eclipsemosquitto"], hivemq: ["si", "hivemq"], vernemq: ["logos", "vernemq"],
  "aws-iot": ["si", "amazonwebservices"], "azure-iot": ["si", "microsoftazure"], balena: ["logos", "balena"], k3s: ["devicon", "k3s"], "cf-workers": ["logos", "cloudflare-workers"],
  "aws-waf": ["logos", "aws-waf"], f5: ["si", "f5"], istio: ["devicon", "istio"], linkerd: ["logos", "linkerd"], consul: ["logos", "consul"],
  docker: ["logos", "docker-icon"], podman: ["devicon", "podman"], containerd: ["si", "containerd"], kubernetes: ["logos", "kubernetes"], eks: ["logos", "aws-eks"],
  gke: ["logos", "google-cloud"], aks: ["si", "microsoftazure"], openshift: ["logos", "openshift"], nomad: ["logos", "nomad"], ecs: ["logos", "aws-ecs"],
  lambda: ["logos", "aws-lambda"], "gcloud-functions": ["logos", "google-cloud-functions"], vercel: ["logos", "vercel-icon"], netlify: ["logos", "netlify-icon"],
  ec2: ["logos", "aws-ec2"], gce: ["devicon", "googlecloud"], "azure-vm": ["si", "microsoftazure"], vmware: ["logos", "vmware"], proxmox: ["devicon", "proxmox"], digitalocean: ["devicon", "digitalocean"],
  airflow: ["logos", "airflow-icon"], flink: ["si", "apacheflink"], spark: ["devicon", "apachespark"], hadoop: ["si", "apachehadoop"], "kafka-streams": ["devicon", "apachekafka"],
  kinesis: ["logos", "aws-kinesis"], dbt: ["logos", "dbt"], tensorflow: ["logos", "tensorflow"], pytorch: ["logos", "pytorch"], triton: ["logos", "nvidia"],
  vertex: ["devicon", "googlecloud"], openai: ["logos", "openai-icon"], huggingface: ["devicon", "huggingface"], mlflow: ["si", "mlflow"],
  temporal: ["logos", "temporal"], "step-functions": ["logos", "aws-step-functions"], camunda: ["si", "camunda"], argo: ["logos", "argo"], prefect: ["si", "prefect"],
  timescaledb: ["si", "timescale"], prometheus: ["logos", "prometheus"], victoriametrics: ["si", "victoriametrics"], neptune: ["logos", "aws-neptune"],
  arangodb: ["logos", "arangodb"], dgraph: ["logos", "dgraph"], pinecone: ["logos", "pinecone"], milvus: ["logos", "milvus"], qdrant: ["logos", "qdrant"], pgvector: ["logos", "postgresql"],
  chroma: ["logos", "chroma"], snowflake: ["logos", "snowflake"], bigquery: ["si", "googlebigquery"], redshift: ["logos", "aws-redshift"], databricks: ["logos", "databricks"],
  synapse: ["si", "microsoftazure"], eventbridge: ["logos", "aws-eventbridge"], "azure-event-grid": ["si", "microsoftazure"], eventarc: ["devicon", "googlecloud"],
  vault: ["logos", "vault-icon"], "aws-secrets": ["logos", "aws-secrets-manager"], "azure-keyvault": ["si", "microsoftazure"], "1password": ["si", "1password"],
  etcd: ["logos", "etcd"], eureka: ["logos", "spring-icon"], grafana: ["logos", "grafana"], datadog: ["logos", "datadog"], newrelic: ["devicon", "newrelic"],
  opentelemetry: ["logos", "opentelemetry"], sentry: ["logos", "sentry-icon"], splunk: ["logos", "splunk"], jaeger: ["si", "jaeger"],
  paypal: ["logos", "paypal"], adyen: ["logos", "adyen"], mercadopago: ["si", "mercadopago"], braintree: ["si", "braintree"], stripe: ["logos", "stripe"],
  github: ["logos", "github-icon"], slack: ["logos", "slack-icon"], googlemaps: ["si", "googlemaps"],
  // provedores sem logo nas bibliotecas principais: SVGs extraídos dos pacotes selfhst/theSVG (scripts/logos-extra) e marcas-mãe
  weaviate: ["file", "weaviate.svg"], emqx: ["file", "emqx.svg"], thingsboard: ["file", "thingsboard.svg"], questdb: ["file", "questdb.svg"],
  doppler: ["file", "doppler.svg"], coredns: ["file", "coredns.svg"], zookeeper: ["file", "zookeeper.svg"],
  "azure-functions": ["si", "azurefunctions"], greengrass: ["si", "amazonwebservices"], sagemaker: ["si", "amazonwebservices"],
  "azure-iot-edge": ["si", "microsoftazure"], "azure-sb": ["si", "microsoftazure"], activemq: ["si", "apache"], beam: ["si", "apache"],
  twilio: ["logos", "twilio-icon"], sendgrid: ["logos", "sendgrid-icon"], mailgun: ["logos", "mailgun-icon"], resend: ["logos", "resend-icon"],
};
const HEX = { linkedin: "#0A66C2", amazon: "#FF9900" }; // removidos/renomeados no pacote simple-icons: cor oficial fixa
const siHex = (name) => { if (HEX[name]) return HEX[name]; const k = Object.keys(si).find((x) => x.toLowerCase() === "si" + name.toLowerCase()); return k ? "#" + si[k].hex : "#888888"; };
const lum = (hex) => { let h = hex.replace("#", ""); if (h.length === 3) h = [...h].map((c) => c + c).join(""); const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const out = {}; const missing = [];
for (const [id, [src, name]] of Object.entries(MAP)) {
  let w = 24, h = 24, body, mono = false;
  if (src === "file") { // SVG colorido já pronto (scripts/logos-extra): usado quando nenhuma biblioteca tem a marca
    const raw = readFileSync(new URL(`./logos-extra/${name}`, import.meta.url), "utf8");
    const vb = /viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/.exec(raw); w = +vb[3]; h = +vb[4];
    body = raw.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
    if (+vb[1] || +vb[2]) body = `<g transform="translate(${-vb[1]} ${-vb[2]})">${body}</g>`; // viewBox recortado: desloca para a origem
  } else if (src === "si") {
    const ic = SIMPLE.icons[name]; if (!ic) { missing.push(id); continue; }
    let hex = siHex(name); if (id.startsWith("co-") && (lum(hex) < 0.03 || id === "co-instagram")) hex = "currentColor"; // marcas escuras (e o Instagram, que fica ilegível no tema escuro) acompanham a cor do texto
    body = ic.body.replace(/ fill="[^"]*"/g, "").replace(/<path /g, `<path fill="${hex}" `); mono = true; w = ic.width ?? SIMPLE.width ?? 24; h = ic.height ?? SIMPLE.height ?? 24;
  } else {
    const set = P[src]; const ic = set.icons[name] ?? set.icons[set.aliases?.[name]?.parent]; if (!ic) { missing.push(`${id} (${src}:${name})`); continue; }
    body = ic.body; w = ic.width ?? set.width ?? 256; h = ic.height ?? set.height ?? 256;
  }
  // prefixa ids internos (gradientes, máscaras) para não colidirem entre logos na mesma página
  const ids = [...body.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  for (const old of new Set(ids)) {
    const esc = old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); const nu = `lg-${id}-${old}`;
    body = body.replace(new RegExp(` id="${esc}"`, "g"), ` id="${nu}"`).replace(new RegExp(`url\\(#${esc}\\)`, "g"), `url(#${nu})`).replace(new RegExp(`href="#${esc}"`, "g"), `href="#${nu}"`);
  }
  const cols = [...body.matchAll(/(?:fill|stroke|stop-color)="(#[0-9a-fA-F]{3,6})"/g)].map((m) => m[1]);
  const named = /currentColor|fill="(?:black|#000)"/i.test(body) || (!/fill=|stop-color=|style=/.test(body));
  const ls = cols.map(lum); if (named) ls.push(0);
  const dark = ls.length > 0 && Math.max(...ls) < 0.2;   // some em fundo escuro some: usa silhueta clara no tema escuro
  const light = ls.length > 0 && Math.min(...ls) > 0.85; // some em fundo claro
  out[id] = { w, h, body: body.replace(/\s+/g, " ").trim(), ...(dark ? { dark: true } : {}), ...(light ? { light: true } : {}), ...(mono ? { mono: true } : {}) };
}
const ts = `// GERADO por scripts/gen-logos.mjs — não editar à mão.\n// Fontes: Iconify "logos" e "devicon", Simple Icons (marcas pertencem aos respectivos donos; uso ilustrativo).\nexport interface Logo { w: number; h: number; body: string; dark?: boolean; light?: boolean; mono?: boolean }\nexport const LOGOS: Record<string, Logo> = ${JSON.stringify(out)};\n`;
writeFileSync(new URL("../src/logos.generated.ts", import.meta.url), ts);
console.log("logos:", Object.keys(out).length, "| faltando:", missing.join(", ") || "—", "| tamanho:", (ts.length / 1024).toFixed(0) + " KB");
console.log("dark:", Object.entries(out).filter(([, v]) => v.dark).map(([k]) => k).join(", "));
console.log("light:", Object.entries(out).filter(([, v]) => v.light).map(([k]) => k).join(", "));
