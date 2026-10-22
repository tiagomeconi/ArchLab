import { getClient } from "./auth";
import { loadProgress, type CaseProgress } from "./progress";
import { loadDays, saveDays } from "./activity";
import type { SharePayload } from "./share";

/** Dados do usuário na nuvem (Supabase). Toda função falha em silêncio: o app continua valendo com o armazenamento local. */
const PKEY = "archlab:progress";

type Row = { case_id: string; met: number; total: number; stages: number; status: "started" | "done"; ovr: number | null; updated_at: string };
const toRow = (id: string, p: CaseProgress) => ({ case_id: id, met: p.met, total: p.total, stages: p.stages, status: p.status, ovr: p.ovr ?? null, updated_at: new Date(p.updatedAt).toISOString() });

/** Une o progresso local ao da nuvem (sempre o melhor de cada campo), grava o resultado nos dois lados e devolve o total. */
export async function syncProgress(): Promise<Record<string, CaseProgress> | null> {
  try {
    const sb = await getClient();
    const { data, error } = await sb.from("case_progress").select("case_id,met,total,stages,status,ovr,updated_at");
    if (error) throw error;
    const local = loadProgress(); const merged: Record<string, CaseProgress> = { ...local };
    for (const r of (data ?? []) as Row[]) {
      const m = merged[r.case_id];
      const remote: CaseProgress = { met: r.met, total: r.total, stages: r.stages, status: r.status, updatedAt: Date.parse(r.updated_at) || 0, ovr: r.ovr ?? undefined };
      merged[r.case_id] = !m ? remote : {
        met: Math.max(m.met, remote.met), total: Math.max(m.total, remote.total), stages: Math.max(m.stages, remote.stages),
        status: m.status === "done" || remote.status === "done" ? "done" : "started", updatedAt: Math.max(m.updatedAt, remote.updatedAt),
        ovr: Math.max(m.ovr ?? 0, remote.ovr ?? 0) || undefined,
      };
    }
    try { localStorage.setItem(PKEY, JSON.stringify(merged)); } catch { /* bloqueado */ }
    const up = Object.entries(merged).map(([id, p]) => toRow(id, p));
    if (up.length) { const { error: e2 } = await sb.from("case_progress").upsert(up, { onConflict: "user_id,case_id" }); if (e2) throw e2; }
    return merged;
  } catch { return null; }
}

export async function pushProgress(id: string, p: CaseProgress) {
  try { const sb = await getClient(); await sb.from("case_progress").upsert(toRow(id, p), { onConflict: "user_id,case_id" }); } catch { /* ignora */ }
}

export interface CloudDesign { snap: unknown; updatedAt: number; title: string }
export async function fetchDesign(caseKey: string): Promise<CloudDesign | null> {
  try {
    const sb = await getClient();
    const { data, error } = await sb.from("designs").select("snap,updated_at,title").eq("case_key", caseKey).maybeSingle();
    if (error || !data) return null;
    return { snap: data.snap, updatedAt: Date.parse(data.updated_at) || 0, title: data.title ?? "" };
  } catch { return null; }
}
export async function pushDesign(caseKey: string, title: string, snap: unknown): Promise<boolean> {
  try {
    const sb = await getClient();
    const { error } = await sb.from("designs").upsert({ case_key: caseKey, title: title.slice(0, 120), snap, updated_at: new Date().toISOString() }, { onConflict: "user_id,case_key" });
    return !error;
  } catch { return false; }
}

/** Cria o link curto; devolve o id (uuid) ou `null` se falhar. */
export async function createShare(p: SharePayload): Promise<string | null> {
  try {
    const sb = await getClient();
    const { data, error } = await sb.from("shared_designs").insert({ title: p.title.slice(0, 120), case_id: p.caseId ?? null, snap: p.snap }).select("id").single();
    return error ? null : (data.id as string);
  } catch { return null; }
}
export async function fetchShare(id: string): Promise<SharePayload | null> {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const sb = await getClient();
    const { data, error } = await sb.rpc("get_shared_design", { p_id: id });
    const r = Array.isArray(data) ? data[0] : null;
    const s = r?.snap;
    if (error || !r || !s || !Array.isArray(s.n) || !Array.isArray(s.e) || !Array.isArray(s.f) || !Array.isArray(s.w) || typeof s.m !== "object") return null;
    return { v: 1, title: String(r.title).slice(0, 80), caseId: typeof r.case_id === "string" ? r.case_id : undefined, snap: s };
  } catch { return null; }
}

export interface Profile { fullName: string; birthDate: string; createdAt: string; handle: string; isPublic: boolean; bio: string; country?: string }
export async function fetchProfile(): Promise<Profile | null> {
  try {
    const sb = await getClient();
    const { data, error } = await sb.from("profiles").select("full_name,birth_date,created_at,handle,is_public,bio,country").maybeSingle();
    if (error || !data) return null;
    return { fullName: data.full_name ?? "", birthDate: data.birth_date ?? "", createdAt: data.created_at ?? "", handle: data.handle ?? "", isPublic: !!data.is_public, bio: data.bio ?? "", country: data.country ?? "" };
  } catch { return null; }
}

/** Une os dias praticados locais com os da nuvem (união) e grava na nuvem o que só existia aqui. */
export async function syncActivity(): Promise<string[] | null> {
  try {
    const sb = await getClient();
    const { data, error } = await sb.from("activity_days").select("day").order("day", { ascending: false }).limit(400);
    if (error) throw error;
    const remote = new Set((data ?? []).map((r: { day: string }) => r.day));
    const local = loadDays(); const merged = new Set([...remote, ...local]);
    saveDays(merged);
    const fresh = local.filter((d) => !remote.has(d));
    if (fresh.length) await sb.from("activity_days").upsert(fresh.map((day) => ({ day })), { onConflict: "user_id,day", ignoreDuplicates: true });
    return [...merged].sort();
  } catch { return null; }
}
export async function pushDay(day: string) {
  try { const sb = await getClient(); await sb.from("activity_days").upsert({ day }, { onConflict: "user_id,day", ignoreDuplicates: true }); } catch { /* ignora */ }
}

export interface SavedDesign { caseKey: string; title: string; snap: any; updatedAt: number }
export async function listDesigns(): Promise<SavedDesign[] | null> {
  try {
    const sb = await getClient();
    const { data, error } = await sb.from("designs").select("case_key,title,snap,updated_at").order("updated_at", { ascending: false }).limit(60);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ caseKey: r.case_key, title: r.title ?? "", snap: r.snap, updatedAt: Date.parse(r.updated_at) || 0 }));
  } catch { return null; }
}
export async function deleteDesign(caseKey: string): Promise<boolean> {
  try { const sb = await getClient(); const { error } = await sb.from("designs").delete().eq("case_key", caseKey); return !error; } catch { return false; }
}

export type PublicSettingsResult = "ok" | "taken" | "invalid" | "error";
/** Liga/desliga o perfil público e define o @usuário. */
export async function savePublicSettings(handle: string, isPublic: boolean): Promise<PublicSettingsResult> {
  try {
    const sb = await getClient();
    const { data: u } = await sb.auth.getUser(); const id = u.user?.id; if (!id) return "error";
    const { error } = await sb.from("profiles").update({ handle: handle || null, is_public: isPublic && !!handle, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) return "ok";
    return error.code === "23505" ? "taken" : error.code === "23514" ? "invalid" : "error";
  } catch { return "error"; }
}

export interface PublicProfile { handle: string; name: string; bio?: string | null; uid: string; avatarV: number | null; since: string; progress: { case: string; met: number; total: number; status: "started" | "done"; ovr: number | null }[]; days: string[] }
export async function getPublicProfile(handle: string): Promise<PublicProfile | null> {
  try {
    if (!/^[a-z0-9_]{3,20}$/i.test(handle)) return null;
    const sb = await getClient();
    const { data, error } = await sb.rpc("get_public_profile", { p_handle: handle.toLowerCase() });
    if (error || !data || typeof data !== "object") return null;
    return data as PublicProfile;
  } catch { return null; }
}

export interface LeaderRow { handle: string; name: string; uid: string; avatarV: number | null; points: number; overall: number; done: number; cases: number }
export interface MyRank { rank: number; total: number; points: number }
export async function getLeaderboard(limit = 50): Promise<LeaderRow[] | null> {
  try { const sb = await getClient(); const { data, error } = await sb.rpc("get_leaderboard", { p_limit: limit }); return error || !Array.isArray(data) ? null : (data as LeaderRow[]); } catch { return null; }
}
export async function getMyRank(): Promise<MyRank | null> {
  try { const sb = await getClient(); const { data, error } = await sb.rpc("get_my_rank"); return error || !data || typeof data !== "object" ? null : (data as MyRank); } catch { return null; }
}

/** Cópia de todos os dados da pessoa (portabilidade, LGPD art. 18). */
export async function exportMyData(): Promise<Record<string, unknown> | null> {
  try {
    const sb = await getClient();
    const { data: u } = await sb.auth.getUser(); const user = u.user; if (!user) return null;
    const [profile, progress, designs, days, shares, assessments] = await Promise.all([
      sb.from("profiles").select("*").maybeSingle(), sb.from("case_progress").select("*"), sb.from("designs").select("*"),
      sb.from("activity_days").select("day").order("day"), sb.from("shared_designs").select("id,case_id,title,created_at,snap"), sb.from("assessment_attempts").select("*"),
    ]);
    if (profile.error || progress.error || designs.error) return null;
    return {
      format: "archlab-export", exportedAt: new Date().toISOString(),
      account: { id: user.id, email: user.email, createdAt: user.created_at, metadata: user.user_metadata },
      profile: profile.data, progress: progress.data, designs: designs.data, activityDays: (days.data ?? []).map((d: { day: string }) => d.day), sharedLinks: shares.data ?? [], assessments: assessments.data ?? [],
    };
  } catch { return null; }
}

/** Exclui a conta e todos os dados: a foto sai do Storage e a função do banco apaga o usuário (o resto cai em cascata). */
export async function deleteAccount(): Promise<boolean> {
  try {
    const sb = await getClient();
    const { data: u } = await sb.auth.getUser(); const id = u.user?.id; if (!id) return false;
    await sb.storage.from("avatars").remove([`${id}/avatar`]);
    const { error } = await sb.rpc("delete_my_account");
    return !error;
  } catch { return false; }
}

/** Renomeia um desenho já salvo (só o título, sem mexer na data de edição). */
export async function renameDesign(caseKey: string, title: string): Promise<boolean> {
  try { const sb = await getClient(); const { error } = await sb.from("designs").update({ title: title.slice(0, 120) }).eq("case_key", caseKey); return !error; } catch { return false; }
}


export async function saveCountry(country: string): Promise<boolean> {
  try { const sb = await getClient(); const { data: { user } } = await sb.auth.getUser(); if (!user) return false; const { error } = await sb.from("profiles").update({ country }).eq("id",user.id); return !error; } catch { return false; }
}
