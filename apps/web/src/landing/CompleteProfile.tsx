import { useState, type FormEvent } from "react";
import { authMessage, completeProfile, signOut, useAuth } from "../auth";
import { birthError, fullNameOk, suggestedName } from "../account";
import { DatePicker } from "./DatePicker";
import { t } from "../i18n";
import { tx } from "../tx";
import { AuthShell, field } from "./AuthShell";

/** Quem entrou com Google/GitHub passa por aqui uma vez: o provedor não informa nascimento nem aceite dos termos. */
export function CompleteProfile() {
  const auth = useAuth();
  const [name, setName] = useState(() => suggestedName(auth.user?.user_metadata));
  const [birth, setBirth] = useState(""); const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (busy) return;
    const bad = !fullNameOk(name) ? "Informe seu nome completo (nome e sobrenome)" : birthError(birth) ?? (!accept ? "Aceite os Termos de uso e a Política de privacidade para criar a conta." : null);
    if (bad) { setErr(t(bad)); return; }
    setBusy(true); setErr("");
    try { await completeProfile(name.trim().replace(/\s+/g, " "), birth); } catch (x) { setErr(t(authMessage(x))); } finally { setBusy(false); }
  };
  return (
    <AuthShell back={{ to: "/", label: t("Início") }}>
      <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-tight tracking-[-0.02em]">{t("Complete seu cadastro")}</h1>
      <p className="mt-2 text-text-2">{t("Falta só confirmar alguns dados para liberar a sua conta.")}</p>
      <form onSubmit={submit} className="mt-8 grid gap-4" noValidate>
        <label className="grid gap-1.5 text-sm font-medium">{t("Nome completo")}
          <input className={field} type="text" autoComplete="name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="birth">{t("Data de nascimento")}</label>
          <DatePicker id="birth" autoComplete="bday" value={birth} onChange={setBirth} />
        </div>
        <label className="flex items-start gap-2.5 text-sm text-text-2">
          <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]" />
          <span>{tx("Li e aceito os {termos} e a {priv}.", { termos: <a href="/termos" target="_blank" rel="noopener" className="font-semibold text-text underline">{t("Termos de uso")}</a>, priv: <a href="/privacidade" target="_blank" rel="noopener" className="font-semibold text-text underline">{t("Política de privacidade")}</a> })}</span>
        </label>
        <div aria-live="polite" className="min-h-5 text-sm">{err && <p role="alert" className="text-danger">{err}</p>}</div>
        <button type="submit" disabled={busy} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60">{busy ? t("Aguarde…") : t("Continuar")}</button>
      </form>
      <p className="mt-6 text-sm text-text-2"><button type="button" className="font-semibold text-text hover:underline" onClick={() => void signOut()}>{t("Sair")}</button></p>
    </AuthShell>
  );
}
