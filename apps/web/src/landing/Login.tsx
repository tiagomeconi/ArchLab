import { useEffect, useState, type FormEvent } from "react";
import { authMessage, resetPassword, setNewPassword, signIn, signInWithProvider, signUp, useAuth, type OAuthProvider } from "../auth";
import { birthError, fullNameOk, passwordOk } from "../account";
import { go } from "../nav";
import { DatePicker } from "./DatePicker";
import { t, useLang } from "../i18n";
import { tx } from "../tx";
import { Icon } from "../ui";
import { AuthShell, field, PasswordChecklist, PasswordInput } from "./AuthShell";

const BTN = "inline-flex items-center justify-center gap-2.5 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent disabled:opacity-60";
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
);
const GithubLogo = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
);

type Mode = "signin" | "signup" | "forgot" | "recovery";

/** Entrar, criar conta e recuperar senha. Fica no lugar da página pedida (a URL não muda) até o login terminar. */
export function Login({ embedded = false, initial = "signin" }: { embedded?: boolean; initial?: "signin" | "signup" }) {
  useLang();
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>(initial);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [name, setName] = useState(""); const [birth, setBirth] = useState(""); const [accept, setAccept] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
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

  const social = async (p: OAuthProvider) => {
    if (busy) return; setBusy(true); setErr(""); setInfo("");
    try { await signInWithProvider(p); } catch (x) { setErr(t(authMessage(x))); setBusy(false); }
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
  const social_ = m === "signin" || m === "signup";
  // entrar/criar conta: Google e GitHub primeiro; o formulário de e-mail abre sob demanda
  const showForm = !social_ || emailOpen;
  const strong = m === "signup" || m === "recovery";

  return (
    <AuthShell back={{ to: "/", label: t("Início") }}>
      <div key={m} className="route-fade">
      <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
      <p className="mt-2 text-text-2">{sub}</p>
      {social_ && (
        <div className="mt-8">
          <div className={`grid gap-3 ${showForm ? "sm:grid-cols-2" : ""}`}>
            <button type="button" disabled={busy} onClick={() => void social("github")} className={BTN}><GithubLogo />{t("Continuar com GitHub")}</button>
            <button type="button" disabled={busy} onClick={() => void social("google")} className={BTN}><GoogleLogo />{t("Continuar com Google")}</button>
          </div>
          <p className="mt-4 flex items-center gap-3 text-xs text-text-2"><span className="h-px flex-1 bg-line" />{t("ou")}<span className="h-px flex-1 bg-line" /></p>
          {!showForm && (
            <button type="button" onClick={() => setEmailOpen(true)} className={`${BTN} mt-4 w-full`}>
              <Icon name="mail" size={18} />{m === "signup" ? t("Criar conta com e-mail") : t("Entrar com e-mail")}
            </button>
          )}
        </div>
      )}
      {showForm && (
      <form onSubmit={submit} className={`${social_ ? "mt-5" : "mt-8"} grid gap-4`} noValidate>
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
            <span>{tx("Li e aceito os {termos} e a {priv}.", { termos: <a href="/termos" target="_blank" rel="noopener" className="font-semibold text-text underline">{t("Termos de uso")}</a>, priv: <a href="/privacidade" target="_blank" rel="noopener" className="font-semibold text-text underline">{t("Política de privacidade")}</a> })}</span>
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
      )}
      {m !== "recovery" && (
        <div className="mt-6 grid gap-2 text-sm text-text-2">
          {m === "signin" && showForm && <button type="button" className="justify-self-start hover:text-text" onClick={() => setMode("forgot")}>{t("Esqueci minha senha")}</button>}
          {m === "signin"
            ? <p>{t("Ainda não tem conta?")} <button type="button" className="font-semibold text-text hover:underline" onClick={() => setMode("signup")}>{t("Criar conta")}</button></p>
            : <p>{t("Já tem conta?")} <button type="button" className="font-semibold text-text hover:underline" onClick={() => setMode("signin")}>{t("Entrar")}</button></p>}
        </div>
      )}
      </div>
    </AuthShell>
  );
}
