import type { User } from "@supabase/supabase-js";
import { getAuthState } from "./auth";
import type { StudyCase } from "./cases";

/**
 * Planos do produto. `VITE_PAYWALL=on` liga a restrição: o plano gratuito abre os casos de nível Iniciante e a assinatura libera os demais.
 * Desligado (padrão), tudo fica liberado, como hoje. O plano vem de `app_metadata.plan`, que só o servidor consegue gravar
 * (o usuário não edita), por exemplo por um webhook do provedor de pagamento.
 * Atenção: enquanto os casos e a simulação rodarem no navegador, esta restrição é de produto (UX), não de segurança.
 */
export type Plan = "free" | "pro";
export const PAYWALL = (import.meta.env.VITE_PAYWALL as string | undefined) === "on";
export const FREE_LEVELS: StudyCase["level"][] = ["Iniciante"];

export const planOf = (user: User | null | undefined): Plan => (user?.app_metadata?.plan === "pro" ? "pro" : "free");
export const currentPlan = (): Plan => planOf(getAuthState().user);
/** Caso (pelo nível) fechado para este plano? */
export const isLocked = (level: StudyCase["level"], plan: Plan, paywall: boolean) => paywall && plan !== "pro" && !FREE_LEVELS.includes(level);
/** Aulas: a unidade 1 é gratuita; as demais são do plano Pro (quando a restrição está ligada). */
export const lessonLocked = (l: { unit: number }, plan: Plan = currentPlan()) => PAYWALL && plan !== "pro" && l.unit > 0;
export const levelLocked = (level: StudyCase["level"], plan: Plan = currentPlan()) => isLocked(level, plan, PAYWALL);
