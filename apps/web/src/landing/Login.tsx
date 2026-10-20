import { useEffect, useState, type FormEvent } from "react";
import { authMessage, resetPassword, setNewPassword, signIn, signUp, useAuth } from "../auth";
import { birthError, fullNameOk, passwordOk } from "../account";
import { go } from "../nav";
import { DatePicker } from "./DatePicker";
import { t, useLang } from "../i18n";
import { AuthShell, field, PasswordChecklist, PasswordInput } from "./AuthShell";

type Mode = "signin" | "signup" | "forgot" | "recovery";

/** Entrar, criar conta e recuperar senha. Fica no lugar da página pedida (a URL não muda) até o login terminar. */
export function Login({ embedded = false, initial = "signin" }: { embedded?: boolean; initial?: "signin" | "signup" }) {
  useLang();
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>(initial);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [name, setName] = useState(""); const [birth, setBirth] = useState(""); const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [info, setInfo] = useState("");
  const recovering = auth.status === "recovery";
  const m: Mode = recovering ? "recovery" : mode;
  useEffect(() => { setErr(""); setInfo(""); setPassword(""); setConfirm(""); }, [m]);
  // acessou /login já autenticado: vai para a tela inicial
  useEffect(() => { if (!embedded && auth.status === "in") go("/start"); }, [embedded, auth.status]);

  /** Primeira regra quebrada (as mensagens ficam em um só lugar). */
  const validate = (): string | null => {
    if (m === "signup") {
      if (!fullNameOk(name)) return "Informe seu nome completo (nome e sobrenome)";
      const b = birthError(birth); if (b) return b;
    }
    if (m === "signup" || m === "recovery") {
      if (!passwordOk(password)) return "A senha não atende aos requisitos de segurança";
      if (password !== confirm) return "As senhas não coincidem";
    }
    if (m === "signup" && !accept) return "Aceite os Termos de uso e a Política de privacidade para criar a conta.";
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (busy) return;
    const bad = validate(); if (bad) { setErr(t(bad)); setInfo(""); return; }
    setBusy(true); setErr(""); setInfo("");
    try {
      if (m === "signin") await signIn(email.trim(), password);
      else if (m === "signup") { if (!(await signUp(email.trim(), password, name.trim().replace(/\s+/g, " "), birth))) { setMode("signin"); setTimeout(() => setInfo(t("Enviamos um link de confirmação para o seu e-mail. Abra-o e depois entre.")), 0); } }
      else if (m === "forgot") { await resetPassword(email.trim()); setInfo(t("Se o e-mail existir, enviamos um link para criar uma nova senha.")); }
      else await setNewPassword(password);
    } catch (x) { setErr(t(authMessage(x))); }
    finally { setBusy(false); }
  };

  const title = { signin: t("Entrar"), signup: t("Criar conta"), forgot: t("Recuperar senha"), recovery: t("Nova senha") }[m];
  const sub = { signin: t("Entre para salvar seus desenhos e sua nota em cada caso."), signup: t("Grátis. Seus desenhos e notas ficam salvos e acompanham você em qualquer dispositivo."), forgot: t("Informe seu e-mail e enviaremos um link para criar uma nova senha."), recovery: t("Escolha uma nova senha para a sua conta.") }[m];
  const strong = m === "signup" || m === "recovery";

  return (
    <AuthShell back={{ to: "/", label: t("Início") }}>
      <div key={m} className="route-fade">
      <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
      <p className="mt-2 text-text-2">{sub}</p>
      <form onSubmit={submit} className="mt-8 grid gap-4" noValidate>
        {m === "signup" && (
          <>
            <label className="grid gap-1.5 text-sm font-medium">{t("Nome completo")}
              <input className={field} type="text" autoComplete="name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="birth">{t("Data de nascimento")}</label>
              <DatePicker id="birth" autoComplete="bday" value={birth} onChange={setBirth} />
            </div>
          </>
        )}
        {m !== "recovery" && (
          <label className="grid gap-1.5 text-sm font-medium">{t("E-mail")}
            <input className={field} type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          </label>
        )}
        {m !== "forgot" && (
          <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="pw">{m === "recovery" ? t("Nova senha") : t("Senha")}</label>
            <PasswordInput id="pw" value={password} onChange={setPassword} autoComplete={m === "signin" ? "current-password" : "new-password"} />
            {strong && <PasswordChecklist value={password} />}
          </div>
        )}
        {strong && (
          <div className="grid gap-1.5 text-sm font-medium"><label htmlFor="pw2">{t("Confirmar senha")}</label>
            <PasswordInput id="pw2" value={confirm} onChange={setConfirm} autoComplete="new-password" invalid={confirm.length > 0 && confirm !== password} />
          </div>
        )}
        {m === "signup" && (
          <label className="flex items-start gap-2.5 text-sm text-text-2">
            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]" />
            <span>{t("Li e aceito os")} <a href="/termos" target="_blank" rel="noopener" className="font-semibold text-text underline">{t("Termos de uso")}</a> {t("e a")} <a href="/privacidade" target="_blank" rel="noopener" className="font-semibold text-text underline">{t("Política de privacidade")}</a>.</span>
          </label>
        )}
        <div aria-live="polite" className="min-h-5 text-sm">
          {err && <p role="alert" className="text-danger">{err}</p>}
          {info && <p className="text-text-2">{info}</p>}
        </div>
        <button type="submit" disabled={busy} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60">
          {busy ? t("Aguarde…") : m === "signin" ? t("Entrar") : m === "signup" ? t("Criar conta") : m === "forgot" ? t("Enviar link") : t("Salvar nova senha")}
        </button>
      </form>
      {m !== "recovery" && (
        <div className="mt-6 grid gap-2 text-sm text-text-2">
          {m === "signin" && <button type="button" className="justify-self-start hover:text-text" onClick={() => setMode("forgot")}>{t("Esqueci minha senha")}</button>}
          {m === "signin"
            ? <p>{t("Ainda não tem conta?")} <button type="button" className="font-semibold text-text hover:underline" onClick={() => setMode("signup")}>{t("Criar conta")}</button></p>
            : <p>{t("Já tem conta?")} <button type="button" className="font-semibold text-text hover:underline" onClick={() => setMode("signin")}>{t("Entrar")}</button></p>}
        </div>
      )}
      </div>
    </AuthShell>
  );
}
