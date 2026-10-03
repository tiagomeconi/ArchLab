import Ajv2020 from "ajv/dist/2020.js";
import schema from "./architecture.schema.json";

export interface Diagnostic { code: string; path: string; message: string }

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);

/** Validação estrutural (JSON Schema) + integridade semântica mínima (spec §7.2). */
export function validateArchitecture(doc: unknown): Diagnostic[] {
  if (!validateSchema(doc)) {
    return (validateSchema.errors ?? []).map((e) => ({
      code: "schema", path: e.instancePath, message: e.message ?? "invalid",
    }));
  }
  const d = doc as any;
  const out: Diagnostic[] = [];
  const dup = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) out.push({ code: "duplicate-id", path: kind, message: `${kind}: id duplicado ${id}` });
      seen.add(id);
    }
  };
  dup("nodes", d.nodes.map((n: any) => n.id));
  dup("edges", d.edges.map((e: any) => e.id));
  const nodeIds = new Set<string>(d.nodes.map((n: any) => n.id));
  const edges = new Map<string, any>(d.edges.map((e: any) => [e.id, e]));
  for (const e of d.edges) {
    for (const end of ["source", "target"]) {
      if (!nodeIds.has(e[end])) out.push({ code: "dangling-edge", path: `edges/${e.id}`, message: `${end} inexistente: ${e[end]}` });
    }
  }
  for (const f of d.traffic.flows) {
    const steps = new Map<string, any>(f.steps.map((s: any) => [s.id, s]));
    for (const s of f.steps) {
      const p = `flows/${f.id}/${s.id}`;
      if (!nodeIds.has(s.nodeId)) out.push({ code: "dangling-node", path: p, message: `nó inexistente ${s.nodeId}` });
      if (s.parentStepId) {
        const parent = steps.get(s.parentStepId);
        const edge = edges.get(s.edgeId);
        if (!parent) out.push({ code: "dangling-parent", path: p, message: `parent inexistente ${s.parentStepId}` });
        else if (!edge) out.push({ code: "dangling-edge", path: p, message: `edgeId inexistente ${s.edgeId}` });
        else if (edge.source !== parent.nodeId || edge.target !== s.nodeId)
          out.push({ code: "edge-mismatch", path: p, message: `edge ${s.edgeId} não liga ${parent.nodeId}→${s.nodeId}` });
      }
    }
    // ciclos (parent + conditionStep)
    const state = new Map<string, number>();
    const visit = (id: string): boolean => {
      if (state.get(id) === 1) return true;
      if (state.get(id) === 2) return false;
      state.set(id, 1);
      const s = steps.get(id);
      for (const dep of [s?.parentStepId, s?.conditionStepId]) if (dep && steps.has(dep) && visit(dep)) return true;
      state.set(id, 2);
      return false;
    };
    for (const id of steps.keys()) if (visit(id)) { out.push({ code: "cycle", path: `flows/${f.id}`, message: "ciclo operacional no flow" }); break; }
  }
  return out;
}
