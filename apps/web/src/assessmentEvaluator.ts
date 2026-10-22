import { connectionOptions, DEFAULT_PROFILE_BY_TYPE, solveDemand, validateArchitecture } from "@archlab/domain";
import { COMPANY_CASES, sessionFor } from "./cases";
import { buildAutoFlows, SOURCE_TYPES, type AutoFlow } from "./flowOps";
import { docOf, weightsOf, type Snapshot } from "./reference";
import { evaluate } from "./requirements";
import { errorOf, lossErrors, rate } from "./rating";
import { PROVIDERS } from "./providers";
import { ASSESSMENT_RULES, ASSESSMENT_MIN_SCORE, ASSESSMENT_MAX_NODES } from "./assessmentRules";
export { ASSESSMENT_RULES };
export const COMPANY_CONFIGS = Object.fromEntries(COMPANY_CASES.map((c) => [c.id, { title: c.title, level: c.level, version: `${ASSESSMENT_RULES}:${c.id}`, session: sessionFor(c) }]));

/** Ignore browser scores, loads, custom operations and weights. Rebuild from the submitted graph. */
export function evaluateAssessment(caseId: string, raw: unknown) {
  const config = Object.hasOwn(COMPANY_CONFIGS,caseId) ? COMPANY_CONFIGS[caseId] : undefined;
  if (!config) throw new Error("Somente casos de empresas podem ser avaliados.");
  const s = raw as any;
  if (!s || !Array.isArray(s.n) || !Array.isArray(s.e) || !s.n.length || s.n.length > ASSESSMENT_MAX_NODES || s.e.length > 240) throw new Error("Desenho inválido ou acima dos limites da avaliação.");
  const ids = new Set<string>();
  const n = s.n.map((v: any) => {
    if (!v || typeof v.id !== "string" || !/^[a-zA-Z0-9_.:-]{1,80}$/.test(v.id) || ids.has(v.id) || !v.d || typeof v.d.type !== "string" || (!Object.hasOwn(DEFAULT_PROFILE_BY_TYPE,v.d.type) && v.d.type !== "database")) throw new Error("Componente inválido.");
    ids.add(v.id);
    if (!Number.isInteger(v.d.replicas) || v.d.replicas < 1 || v.d.replicas > 100 || !Number.isFinite(v.x) || !Number.isFinite(v.y)) throw new Error("Propriedades de componente inválidas.");
    if (v.d.hitRate != null && (!Number.isFinite(v.d.hitRate) || v.d.hitRate < 0 || v.d.hitRate > 1)) throw new Error("Taxa de cache inválida.");
    if (v.d.providerId && !PROVIDERS[v.d.type]?.some((p) => p.id === v.d.providerId)) throw new Error("Provedor inválido.");
    return { id: v.id, x: v.x, y: v.y, w: Math.min(520, Math.max(176, Number(v.w) || 240)), d: { name: String(v.d.name || v.d.type).slice(0, 80), type: v.d.type, replicas: v.d.replicas, providerId: v.d.providerId, hitRate: v.d.hitRate, note: typeof v.d.note === "string" ? v.d.note.slice(0, 4000) : undefined } };
  });
  const edges = new Set<string>();
  const e = s.e.map((v: any) => {
    if (!v || typeof v.id !== "string" || edges.has(v.id) || !ids.has(v.source) || !ids.has(v.target) || v.source === v.target) throw new Error("Conexão inválida.");
    edges.add(v.id);
    const option = connectionOptions(n.find((x: any) => x.id === v.source)!.d.type, n.find((x: any) => x.id === v.target)!.d.type).find((o) => o.protocol === v.configuration?.protocol && o.mode === v.configuration?.mode);
    if (!option) throw new Error("Protocolo de conexão inválido.");
    return { id: v.id, source: v.source, target: v.target, sourcePort: ["top", "right", "bottom", "left"].includes(v.sourcePort) ? v.sourcePort : "right", targetPort: ["top", "right", "bottom", "left"].includes(v.targetPort) ? v.targetPort : "left", configuration: { mode: option.mode, protocol: option.protocol, required: true, timeoutMs: option.timeoutMs, networkLatencyMs: option.networkLatencyMs, maxAttempts: 1, backoffMs: 0, retryable: false, tls: option.tls, bidirectional: !!v.configuration.bidirectional } };
  });
  const an = n.map((v: any) => ({ id: v.id, type: v.d.type, name: v.d.name }));
  const hit = n.find((v: any) => v.d.type === "redis")?.d.hitRate ?? 0.8;
  const budget = { remaining: 4096 };
  const auto: AutoFlow[] = an.filter((v: any) => SOURCE_TYPES.has(v.type)).flatMap((v: any) => buildAutoFlows(v.id, an, e, hit, budget));
  if (auto.length > 256 || auto.reduce((count, a) => count + a.flow.steps.length, 0) > 4096) throw new Error("O desenho excede o limite de caminhos da avaliação.");
  const snap: Snapshot = { n, e, f: auto.map((a) => a.flow), w: auto.map((a) => a.workload), m: Object.fromEntries(auto.map((a) => [a.flow.id, { name: a.name, weight: a.weight }])) };
  if (!snap.f.length) throw new Error("A avaliação precisa de fluxos ligados a uma origem de carga.");
  const doc = docOf(snap) as any;
  const sql = new Set(PROVIDERS["sql-database"]!.map((p) => p.id));
  for (const v of doc.nodes) if (v.type === "database") { const provider = n.find((x: any) => x.id === v.id)!.d.providerId; v.properties.profileId = provider ? (sql.has(provider) ? "sql-standard-v1" : "nosql-standard-v1") : "unresolved"; }
  if (validateArchitecture(doc).length) throw new Error("O desenho possui conexões ou propriedades inválidas.");
  const load = config.session.load!;
  const weights = weightsOf(snap.f, snap.m, load.readPct);
  const res = solveDemand(doc, { rps: load.peakRps, weights });
  let p95: number | null = null, offered = 0, completed = 0;
  for (const flow of snap.f) {
    if (flow.steps.some((st) => st.operationClass === "write")) continue;
    const stat = res.flows.get(flow.id);
    if (!stat || stat.offered <= 0) continue;
    offered += stat.offered; completed += stat.completed;
    if (stat.p95Ms !== null) p95 = Math.max(p95 ?? 0, stat.p95Ms);
  }
  const checks = evaluate(config.session, { nodes: doc.nodes, flows: snap.f, loads: res.loads, p95Ms: p95, readSuccess: offered > 0 ? completed / offered : null });
  const err = errorOf(res);
  const rating = rate({ nodes: doc.nodes, edges: doc.edges, flows: snap.f, loads: res.loads, errFrac: err, p95Ms: p95, p95Target: config.session.checks?.p95Ms, lossErr: lossErrors(doc, load.peakRps, weights, err), checks, readPct: load.readPct });
  const score = rating.overall ?? 0;
  const passed = score >= ASSESSMENT_MIN_SCORE && checks.length > 0 && checks.every((c) => c.status === "meets");
  return { rulesVersion: ASSESSMENT_RULES, caseVersion: config.version, score, passed, points: passed ? score : 0, rating, checks, snap: { ...snap, g: typeof s.g === "string" ? s.g.slice(0, 4000) : undefined, r: Array.isArray(s.r) ? s.r.slice(0, 40) : undefined }, load };
}
