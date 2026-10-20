import { useState, type ReactNode } from "react";
import { PASSWORD_MAX, PASSWORD_RULES } from "../account";
import "./landing.css";
import { link } from "../nav";
import { Icon, Logo } from "../ui";
import { ThemeToggle } from "../ThemeToggle";
import { LangToggle } from "../LangToggle";
import { AccountMenu } from "../AccountMenu";
import { useHome } from "../auth";
import { t } from "../i18n";

export const field = "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-text-2/60 focus:border-accent";

/** Moldura das telas de conta (login, cadastro e perfil). */
export function AuthShell({ back, wide = false, xwide = false, children }: { back: { to: string; label: string }; wide?: boolean; xwide?: boolean; children: ReactNode }) {
  const home = useHome();
  return (
    <div className="lp relative min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a {...link(back.to)} className="inline-flex items-center gap-2 text-sm font-medium text-text-2 hover:text-text"><Icon name="arrow_back" size={18} />{back.label}</a>
        <a {...link(home)} className="inline-flex items-center gap-2 font-semibold tracking-tight"><Logo size={30} />{t("ArchLab")}</a>
        <span className="flex items-center gap-2"><LangToggle /><ThemeToggle /><AccountMenu /></span>
      </header>
      <main id="conteudo" tabIndex={-1} className={`mx-auto w-full px-5 pb-24 pt-10 outline-none ${xwide ? "max-w-5xl" : wide ? "max-w-3xl" : "max-w-md"}`}>{children}</main>
    </div>
  );
}

/** Campo de senha com botão de mostrar/ocultar. */
export function PasswordInput({ value, onChange, autoComplete, id, invalid }: { value: string; onChange: (v: string) => void; autoComplete: string; id?: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative block">
      <input id={id} className={`${field} pr-11`} type={show ? "text" : "password"} autoComplete={autoComplete} required maxLength={PASSWORD_MAX} value={value} aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t("Ocultar senha") : t("Mostrar senha")} aria-pressed={show}
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-text-2 hover:text-text"><Icon name={show ? "visibility_off" : "visibility"} size={18} /></button>
    </span>
  );
}

/** Lista de requisitos da senha, marcando o que já foi cumprido. */
export function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul className="mt-1 grid gap-1 text-xs font-normal" aria-label={t("Requisitos da senha")}>
      {PASSWORD_RULES.map((r) => { const ok = r.ok(value); return (
        <li key={r.id} className={`flex items-center gap-1.5 ${ok ? "text-text" : "text-text-2"}`}>
          <Icon name={ok ? "check_circle" : "radio_button_unchecked"} size={15} /><span>{t(r.label)}</span><span className="sr-only">{ok ? t("cumprido") : t("pendente")}</span>
        </li>); })}
    </ul>
  );
}
