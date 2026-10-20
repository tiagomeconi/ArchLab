import { getClient } from "./auth";

/** Turmas na nuvem (Supabase): criar, entrar por código, atribuir casos e acompanhar o progresso. Erros sobem para a tela mostrar. */
export interface ClassRow { id: string; name: string; joinCode: string; owner: boolean }
export interface Assignment { caseId: string; dueAt: string | null }
export interface StudentCell { caseId: string; status: "none" | "started" | "done"; met: number; total: number; ovr: number | null }
export interface Student { userId: string; name: string; cells: Record<string, StudentCell> }

export const JOIN_CODE = /^[A-Za-z0-9]{8}$/;
export const normalizeCode = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

export async function listClasses(uid: string): Promise<ClassRow[]> {
  const sb = await getClient();
  const { data, error } = await sb.from("classes").select("id,name,join_code,owner_id").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ id: r.id, name: r.name, joinCode: r.join_code, owner: r.owner_id === uid }));
}
export async function createClass(name: string): Promise<string> {
  const sb = await getClient();
  const { data, error } = await sb.from("classes").insert({ name: name.trim().slice(0, 80) }).select("id").single();
  if (error) throw error;
  return data.id as string;
}
export async function joinClass(code: string): Promise<string> {
  const sb = await getClient();
  const { data, error } = await sb.rpc("join_class", { code: normalizeCode(code) });
  if (error) throw error;
  return data as string;
}
export async function leaveClass(cid: string, uid: string) {
  const sb = await getClient();
  const { error } = await sb.from("class_members").delete().eq("class_id", cid).eq("user_id", uid);
  if (error) throw error;
}
export async function deleteClass(cid: string) {
  const sb = await getClient();
  const { error } = await sb.from("classes").delete().eq("id", cid);
  if (error) throw error;
}
export async function listAssignments(cid: string): Promise<Assignment[]> {
  const sb = await getClient();
  const { data, error } = await sb.from("class_assignments").select("case_id,due_at").eq("class_id", cid).order("created_at");
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ caseId: r.case_id, dueAt: r.due_at }));
}
export async function addAssignment(cid: string, caseId: string) {
  const sb = await getClient();
  const { error } = await sb.from("class_assignments").insert({ class_id: cid, case_id: caseId });
  if (error) throw error;
}
export async function removeAssignment(cid: string, caseId: string) {
  const sb = await getClient();
  const { error } = await sb.from("class_assignments").delete().eq("class_id", cid).eq("case_id", caseId);
  if (error) throw error;
}
export async function removeStudent(cid: string, uid: string) {
  const sb = await getClient();
  const { error } = await sb.from("class_members").delete().eq("class_id", cid).eq("user_id", uid);
  if (error) throw error;
}

/** Linhas (aluno × caso) vindas da função `class_progress` viram uma tabela por aluno. */
export function groupProgress(rows: { user_id: string; full_name: string; case_id: string; met: number; total: number; status: string; ovr: number | null }[]): Student[] {
  const by = new Map<string, Student>();
  for (const r of rows) {
    const s = by.get(r.user_id) ?? { userId: r.user_id, name: r.full_name, cells: {} };
    s.cells[r.case_id] = { caseId: r.case_id, status: r.status === "done" ? "done" : r.status === "started" ? "started" : "none", met: r.met, total: r.total, ovr: r.ovr };
    by.set(r.user_id, s);
  }
  return [...by.values()];
}
export async function classProgress(cid: string): Promise<Student[]> {
  const sb = await getClient();
  const { data, error } = await sb.rpc("class_progress", { cid });
  if (error) throw error;
  return groupProgress(data ?? []);
}
/** Estudantes sem nome no perfil aparecem como "Aluno 1", "Aluno 2"… */
export const studentLabel = (s: Student, i: number, fallback: string) => s.name.trim() || `${fallback} ${i + 1}`;
