import { getClient } from "./auth";

export interface SolutionSnap {
  n: { id: string; x: number; y: number; w?: number; d: { name?: string; type?: string; replicas?: number; providerId?: string; hitRate?: number; note?: string } }[];
  e: { id: string; source: string; target: string; sourcePort?: string; targetPort?: string; configuration?: { protocol?: string; mode?: string; bidirectional?: boolean; [key: string]: unknown } }[];
  f: { id: string; steps: { nodeId: string; operationClass?: string; ordinal?: number; parentStepId?: string; id?: string; condition?: string; edgeId?: string }[] }[];
  g?: string;
  r?: unknown;
  m?: Record<string, { name: string; weight?: number }>;
}
export interface PublishedSolution { caseId: string; title: string; snap: SolutionSnap; publishedAt: string }
export interface SeasonResult { season: string; overall: number; cases: number; updatedAt: string }
export interface Showcase { solutions: PublishedSolution[]; seasons: SeasonResult[] }
export const validSolution = (s: unknown): s is SolutionSnap => {
  const v = s as SolutionSnap | null;
  return !!v && Array.isArray(v.n) && Array.isArray(v.e) && Array.isArray(v.f)
    && v.n.every((n) => n && typeof n.id === "string" && Number.isFinite(n.x) && Number.isFinite(n.y) && n.d && typeof n.d === "object")
    && v.e.every((e) => e && typeof e.source === "string" && typeof e.target === "string")
    && v.f.every((f) => f && typeof f.id === "string" && Array.isArray(f.steps) && f.steps.every((s) => s && typeof s.nodeId === "string"));
};
export async function fetchShowcase(handle?: string): Promise<Showcase | null> {
  try {
    const sb = await getClient();
    const { data, error } = await sb.rpc("get_profile_showcase", { p_handle: handle ?? null });
    return error || !data ? null : { solutions: (data.solutions ?? []).filter((s: PublishedSolution) => validSolution(s.snap)), seasons: data.seasons ?? [] };
  } catch { return null; }
}
export async function publishSolution(caseId: string, title: string, snap: SolutionSnap): Promise<boolean> {
  try {
    const sb = await getClient();
    const { error } = await sb.from("profile_solutions").upsert({ case_id: caseId, title: title.slice(0, 120), snap, published_at: new Date().toISOString() }, { onConflict: "user_id,case_id" });
    return !error;
  } catch { return false; }
}
export async function unpublishSolution(caseId: string): Promise<boolean> {
  try { const sb = await getClient(); const { error } = await sb.from("profile_solutions").delete().eq("case_id", caseId); return !error; } catch { return false; }
}
