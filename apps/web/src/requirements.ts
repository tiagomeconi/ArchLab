import type { NodeLoad } from "@archlab/domain";
import type { PathRule, Session } from "./session";
import { t } from "./i18n";

export type Status = "meets" | "partial" | "fails" | "unknown" | "manual";

/** Estado do desenho que as verificações automáticas leem. */
export interface Design { nodes: any[]; flows: any[]; loads: Map<string, NodeLoad>; p95Ms: number | null }

export interface Check { id: string; label: string; detail: string; status: Status }

export function evaluate(session: Session, d: Design): Check[] {
  const out: Check[] = [];
  const empty = d.nodes.length === 0;
  const inFlow = new Set<string>(d.flows.flatMap((f: any) => f.steps.map((s: any) => s.nodeId)));
  const loaded = [...d.loads.entries()].filter(([, l]) => !l.source && l.utilization !== null);
  const worst = loaded.reduce<[string, number] | null>((w, [id, l]) => (!w || (l.utilization ?? 0) > w[1] ? [id, l.utilization ?? 0] : w), null);
  const nameOf = (id: string) => d.nodes.find((n) => n.id === id)?.name ?? id;

  out.push({ id: "capacity", label: t("Capacidade no pico, sem componente saturado"),
    detail: worst ? t("Mais carregado: {nome} a {pct}%.", { nome: nameOf(worst[0]), pct: Math.round(worst[1] * 100) }) : t("Monte o desenho e defina um fluxo para medir."),
    status: !worst ? "unknown" : worst[1] > 1 ? "fails" : worst[1] > 0.8 ? "partial" : "meets" });

  const flowNodes = d.nodes.filter((n) => inFlow.has(n.id) && !n.properties?.source && !["client", "web-app", "mobile-app", "iot-device", "external-system"].includes(n.type));
  const single = flowNodes.filter((n) => (n.properties?.replicas ?? 1) < 2);
  out.push({ id: "spof", label: t("Sem ponto único de falha"),
    detail: !flowNodes.length ? t("Sem componentes em fluxos ainda.") : single.length ? t("Com 1 réplica: {lista}.", { lista: single.map((n) => n.name).join(", ") }) : t("Todo componente do fluxo tem 2 ou mais réplicas."),
    status: !flowNodes.length ? "unknown" : single.length ? "fails" : "meets" });

  const target = session.checks?.p95Ms;
  if (target) out.push({ id: "p95", label: t("Latência p95 ≤ {ms} ms", { ms: target }),
    detail: d.p95Ms === null ? t("Sem fluxo de leitura com carga.") : t("p95 proxy atual: {ms} ms.", { ms: Math.round(d.p95Ms) }),
    status: d.p95Ms === null ? "unknown" : d.p95Ms <= target ? "meets" : "fails" });

  for (const need of session.checks?.needs ?? []) {
    const has = d.nodes.some((n) => need.any.includes(n.type));
    out.push({ id: `need:${need.label}`, label: t(need.label), detail: t(need.why), status: empty ? "unknown" : has ? "meets" : "fails" });
  }

  for (const rule of session.checks?.paths ?? []) {
    const ok = pathMatches(d.flows, d.nodes, rule);
    out.push({ id: `path:${rule.label}`, label: t(rule.label), detail: t(rule.why), status: empty || !d.flows.length ? "unknown" : ok ? "meets" : "fails" });
  }
  const minHit = session.checks?.minHitRate;
  const caches = d.nodes.filter((n) => n.type === "redis");
  if (minHit && caches.length) {
    const hits = caches.map((n) => n.properties?.cache?.hitRate).filter((h): h is number => typeof h === "number");
    const best = hits.length ? Math.max(...hits) : null;
    out.push({ id: "hit", label: t("Taxa de acerto do cache ≥ {pct}%", { pct: Math.round(minHit * 100) }), detail: best === null ? t("Defina a taxa em Propriedades do cache.") : t("Taxa atual: {pct}%.", { pct: Math.round(best * 100) }),
      status: best === null ? "unknown" : best >= minHit ? "meets" : "fails" });
  }
  return out;
}

/** Algum passo de algum fluxo termina uma cadeia (da raiz, passando pelo lookup de cache quando é um miss) que contém `rule.seq` em ordem. */
export function pathMatches(flows: any[], nodes: any[], rule: PathRule): boolean {
  const typeOf = (id: string) => nodes.find((n) => n.id === id)?.type as string | undefined;
  for (const f of flows) {
    const byId = new Map<string, any>(f.steps.map((s: any) => [s.id, s]));
    for (const step of f.steps) {
      const chain: string[] = [];
      const up = (id: string | undefined) => { const s = id ? byId.get(id) : undefined; if (!s) return; up(s.parentStepId); chain.push(s.nodeId); };
      up(step.parentStepId);
      if (step.conditionStepId) { const c = byId.get(step.conditionStepId); if (c) chain.push(c.nodeId); }
      chain.push(step.nodeId);
      if (rule.op && step.operationClass !== rule.op) continue;
      let i = 0;
      for (const id of chain) { if (i < rule.seq.length && rule.seq[i]!.includes(typeOf(id) ?? "")) i++; }
      if (i === rule.seq.length) return true;
    }
  }
  return false;
}

