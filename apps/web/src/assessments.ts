import { getClient } from "./auth";
import type { SolutionSnap } from "./profileShowcase";
import type { Rating } from "./rating";
import type { Check } from "./requirements";
export { seasonOf } from "./assessmentRules";
export interface AssessmentAttempt {
  id: string; case_id: string; case_version: string; rules_version: string; country: string;
  status: "active" | "submitted" | "abandoned"; started_at: string; submitted_at?: string; season?: string;
  draft_updated_at?: string; draft?: SolutionSnap; snap?: SolutionSnap; score?: number; points: number; passed: boolean; published: boolean;
  report?: { rating: Rating; checks: Check[]; rulesVersion: string; caseVersion: string };
}
export interface AssessmentRecord { id: string; caseId: string; score: number; points: number; passed: boolean; season: string; country: string; submittedAt: string; rulesVersion: string; caseVersion: string; published: boolean; snap: SolutionSnap | null }
export interface AssessmentSeason { season: string; points: number; companies: number; country: string; worldRank: number | null; countryRank: number | null; closed: boolean; startsAt: string; endsAt: string }
export interface AssessmentProfile { points: number; companies: number; best: AssessmentRecord[]; deliveries: AssessmentRecord[]; seasons: AssessmentSeason[]; active: { id: string; caseId: string; startedAt: string }[]; currentSeason: string }
export interface AssessmentLeader { uid: string; handle: string; name: string; avatarV: number | null; country: string; points: number; companies: number; worldRank: number; countryRank: number }
async function rpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await (await getClient()).rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}
export const startAssessment = (caseId: string, country: string) => rpc<AssessmentAttempt>("start_assessment", { p_case: caseId, p_country: country });
export const getAssessmentAttempt = (id: string) => rpc<AssessmentAttempt | null>("get_assessment_attempt", { p_id: id });
export const saveAssessmentDraft = (id: string, snap: unknown) => rpc<boolean>("save_assessment_draft", { p_id: id, p_snap: snap });
export const abandonAssessment = (id: string) => rpc<boolean>("abandon_assessment", { p_id: id });
export const publishAssessment = (id: string, value: boolean) => rpc<boolean>("publish_assessment", { p_id: id, p_public: value });
export async function getAssessmentProfile(handle?: string): Promise<AssessmentProfile | null> {
  const p = await rpc<AssessmentProfile | null>("get_assessment_profile", { p_handle: handle ?? null });
  return p && typeof p.points === "number" && Array.isArray(p.best) && Array.isArray(p.deliveries) && Array.isArray(p.seasons) && Array.isArray(p.active) ? p : null;
}
export const getAssessmentBoard = (season: string, country?: string) => rpc<AssessmentLeader[]>("get_assessment_board", { p_season: season, p_country: country || null, p_limit: 100 });
export async function submitAssessment(id: string, snap: unknown): Promise<AssessmentAttempt> {
  const { data, error } = await (await getClient()).functions.invoke("assessment", { body: { attemptId: id, snap } });
  if (error) {
    let message = "Não foi possível registrar a entrega. Seu desenho foi preservado; tente novamente.";
    try { message = (await error.context?.json())?.message || message; } catch { /* non-JSON network response */ }
    throw new Error(message);
  }
  if (!data || data.status !== "submitted") throw new Error("O servidor não confirmou a entrega. Tente novamente.");
  return data;
}

export async function getAssessmentSeasons(): Promise<string[]> {
  const { data, error } = await (await getClient()).from("assessment_seasons").select("id").order("id", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((s: { id: string }) => s.id);
}
