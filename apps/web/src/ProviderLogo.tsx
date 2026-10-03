import { LOGOS } from "./logos.generated";

/** Logos que somem no tema escuro (traço preto/azul-marinho): ali viram silhueta clara. */
export const INVERT_ON_DARK = new Set(["ios", "rust", "express", "kafka", "pulsar", "auth0", "keycloak", "okta", "resend", "pusher", "typesense", "influxdb", "solr", "cassandra", "mysql", "thingsboard", "kura", "stm32", "mosquitto", "containerd", "vmware", "github", "vercel", "openai", "splunk", "temporal", "prefect", "pinecone", "braintree", "kafka-streams", "aws-iot", "istio"]);

/** Logos escuros com detalhes claros por dentro: no tema escuro basta inverter as cores (a silhueta toda branca viraria uma mancha). */
export const SOFT_INVERT_ON_DARK = new Set(["socketio"]);

/** Caixa do logo: quadrada, mas marcas de wordmark (bem mais largas que altas) ganham largura para não ficarem minúsculas. */
export function logoBox(id: string, size: number): { w: number; h: number } {
  const l = LOGOS[id]; if (!l) return { w: size, h: size };
  const ar = l.w / l.h;
  return { w: ar > 1.6 ? Math.round(Math.min(size * 1.9, size * ar)) : size, h: size };
}

/** Logo vetorial puro (SVG inline, sem fundo). Retorna null se a marca não tiver logo. */
export function ProviderLogo({ id, name, size = 32, className = "" }: { id: string; name: string; size?: number; className?: string }) {
  const logo = LOGOS[id];
  if (!logo) return null;
  return (
    <span className={`inline-grid shrink-0 place-items-center ${INVERT_ON_DARK.has(id) ? "logo-inv" : ""} ${className}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${logo.w} ${logo.h}`} width={size} height={size} role="img" aria-label={name} preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}
        dangerouslySetInnerHTML={{ __html: logo.body }} />
    </span>
  );
}
