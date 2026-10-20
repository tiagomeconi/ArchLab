import { useSyncExternalStore } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { LEGAL_VERSION } from "./legal";

/** Login com Supabase. Sem `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` o app roda em modo local, sem conta. */
const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
/** Endereço público do site, usado nos links dos e-mails. `VITE_SITE_URL` vence a origem atual (evita link para localhost quando o cadastro é feito de um endereço de teste). */
const SITE = ((import.meta.env.VITE_SITE_URL as string | undefined)?.trim().replace(/\/+$/, "")) || "";
const siteUrl = () => SITE || location.origin;
export const authEnabled = Boolean(URL_ && KEY_);

export type AuthState = { status: "disabled" | "loading" | "out" | "in" | "recovery"; user: User | null };
let state: AuthState = { status: authEnabled ? "loading" : "disabled", user: null };
const listeners = new Set<() => void>();
const set = (s: AuthState) => { state = s; listeners.forEach((f) => f()); };

let clientP: Promise<SupabaseClient> | null = null;
/** O cliente é carregado sob demanda para não pesar na landing. */
export function getClient(): Promise<SupabaseClient> {
  if (!authEnabled) return Promise.reject(new Error("supabase desligado"));
  clientP ??= import("@supabase/supabase-js").then(({ createClient }) => createClient(URL_!, KEY_!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" } }));
  return clientP;
}

const sessionListeners = new Set<(u: User | null) => void>();
/** Chamado quando o usuário entra ou sai (sincronização da nuvem). */
export const onUserChange = (f: (u: User | null) => void) => { sessionListeners.add(f); return () => { sessionListeners.delete(f); }; };

let started = false;
export function startAuth() {
  if (started || !authEnabled) return;
  started = true;
  getClient().then(async (sb) => {
    let last: string | null = null;
    const apply = (event: string, user: User | null) => {
      if (event === "PASSWORD_RECOVERY") { set({ status: "recovery", user }); return; }
      const id = user?.id ?? null;
      set({ status: user ? (state.status === "recovery" ? "recovery" : "in") : "out", user });
      if (id !== last) { last = id; sessionListeners.forEach((f) => f(user)); }
    };
    sb.auth.onAuthStateChange((event, s) => { setTimeout(() => apply(event, s?.user ?? null), 0); });
    const { data } = await sb.auth.getSession();
    if (state.status === "loading") apply("INITIAL_SESSION", data.session?.user ?? null);
  }).catch(() => set({ status: "out", user: null }));
}

export const getAuthState = (): AuthState => state;
export const useAuth = (): AuthState => {
  startAuth();
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => state, () => state);
};

/** Mensagem em português para os erros mais comuns (a chave é o próprio texto, como no resto da UI). */
export function authMessage(e: unknown): string {
  const m = String((e as { message?: string })?.message ?? e).toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos";
  if (m.includes("already registered") || m.includes("already been registered")) return "Já existe uma conta com este e-mail";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar (veja a caixa de entrada)";
  if (m.includes("same") && m.includes("password")) return "A nova senha precisa ser diferente da atual";
  if (m.includes("password") && (m.includes("least") || m.includes("weak") || m.includes("short") || m.includes("character"))) return "A senha não atende aos requisitos de segurança";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Aguarde um pouco e tente de novo";
  if (m.includes("fetch") || m.includes("network")) return "Sem conexão com o servidor. Tente de novo";
  return "Não foi possível concluir. Tente de novo";
}

export type OAuthProvider = "google" | "github";
/** Entra com Google/GitHub: o provedor já verifica o e-mail, então não há e-mail de confirmação. Volta para a página atual da área logada. */
export async function signInWithProvider(provider: OAuthProvider) {
  const inside = /^\/(start|app)(\/|$)/.test(location.pathname);
  const { error } = await (await getClient()).auth.signInWithOAuth({ provider, options: { redirectTo: `${siteUrl()}${inside ? location.pathname + location.search : "/start"}` } });
  if (error) throw error;
}
/** Completa o cadastro de quem entrou por login social: nome, nascimento e aceite dos termos. */
export async function completeProfile(name: string, birthDate: string) {
  const sb = await getClient();
  const uid = state.user?.id; if (!uid) throw new Error("sem sessão");
  const { data, error: e1 } = await sb.auth.updateUser({ data: { name, birth_date: birthDate, terms_version: LEGAL_VERSION, terms_accepted_at: new Date().toISOString() } });
  if (e1) throw e1;
  const { error } = await sb.from("profiles").upsert({ id: uid, full_name: name, birth_date: birthDate, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
  set({ status: state.status, user: data.user ?? state.user });
}
export async function signIn(email: string, password: string) {
  const { error } = await (await getClient()).auth.signInWithPassword({ email, password });
  if (error) throw error;
}
/** Retorna `true` quando a conta já entrou; `false` quando falta confirmar o e-mail. */
export async function signUp(email: string, password: string, name: string, birthDate: string): Promise<boolean> {
  const { data, error } = await (await getClient()).auth.signUp({ email, password, options: { data: { name, birth_date: birthDate, terms_version: LEGAL_VERSION, terms_accepted_at: new Date().toISOString() }, emailRedirectTo: `${siteUrl()}/confirmado` } });
  if (error) throw error;
  // e-mail já cadastrado: o Supabase devolve um usuário sem identidades (evita revelar quais e-mails existem)
  if (data.user && data.user.identities && data.user.identities.length === 0) throw new Error("already registered");
  return Boolean(data.session);
}
/** Confirma a senha de quem já está logado (usado antes de excluir a conta). */
export async function verifyPassword(password: string) {
  const email = state.user?.email; if (!email) throw new Error("sem sessão");
  const { error } = await (await getClient()).auth.signInWithPassword({ email, password });
  if (error) throw error;
}
export async function resetPassword(email: string) {
  const { error } = await (await getClient()).auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/login` });
  if (error) throw error;
}
export async function setNewPassword(password: string) {
  const { error } = await (await getClient()).auth.updateUser({ password });
  if (error) throw error;
  set({ status: "in", user: state.user });
}
/** Atualiza nome e nascimento (tabela `profiles` + metadados, que o menu lê). */
export async function updateAccount(name: string, birthDate: string, bio?: string) {
  const sb = await getClient();
  const uid = state.user?.id; if (!uid) throw new Error("sem sessão");
  const { error } = await sb.from("profiles").upsert({ id: uid, full_name: name, birth_date: birthDate || null, ...(bio !== undefined ? { bio: bio || null } : {}), updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
  const { error: e2 } = await sb.auth.updateUser({ data: { name, birth_date: birthDate } });
  if (e2) throw e2;
}
export async function signOut() {
  try { await (await getClient()).auth.signOut(); } catch { /* sai localmente mesmo assim */ }
  // dados locais pertencem à conta que saiu: não ficam para o próximo usuário do navegador
  try { for (const k of Object.keys(localStorage)) if (k === "archlab:progress" || k === "archlab:session" || k.startsWith("archlab:design:")) localStorage.removeItem(k); } catch { /* ignora */ }
  set({ status: "out", user: null });
}

/** Destino do logo: quem está logado vive dentro do sistema (a landing é só para visitantes). */
export const useHome = () => (useAuth().status === "in" ? "/start" : "/");

/** URL pública da foto de perfil (ou `null`). `avatar_v` nos metadados serve para furar o cache quando a foto muda. */
export const avatarUrl = (uid: string, v: unknown): string | null => (authEnabled && v ? `${URL_}/storage/v1/object/public/avatars/${uid}/avatar?v=${encodeURIComponent(String(v))}` : null);
export const avatarOf = (u: User | null): string | null => (u ? avatarUrl(u.id, u.user_metadata?.avatar_v) : null);
export async function uploadAvatar(blob: Blob) {
  const sb = await getClient(); const uid = state.user?.id; if (!uid) throw new Error("sem sessão");
  const { error } = await sb.storage.from("avatars").upload(`${uid}/avatar`, blob, { upsert: true, contentType: blob.type, cacheControl: "3600" });
  if (error) throw error;
  const v = Date.now();
  const { error: e2 } = await sb.auth.updateUser({ data: { avatar_v: v } });
  if (e2) throw e2;
  await sb.from("profiles").update({ avatar_v: v }).eq("id", uid); // a foto do perfil público usa esta versão
}
export async function removeAvatar() {
  const sb = await getClient(); const uid = state.user?.id; if (!uid) throw new Error("sem sessão");
  await sb.storage.from("avatars").remove([`${uid}/avatar`]);
  const { error } = await sb.auth.updateUser({ data: { avatar_v: null } });
  if (error) throw error;
  await sb.from("profiles").update({ avatar_v: null }).eq("id", uid);
}
