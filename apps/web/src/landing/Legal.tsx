import { useEffect } from "react";
import { LEGAL, type LegalKind } from "../legal";
import { link } from "../nav";
import { t, useLang } from "../i18n";
import { AuthShell } from "./AuthShell";
import { useAuth } from "../auth";

/** Termos de uso e Política de privacidade (públicas, sem login). */
export function Legal({ kind }: { kind: LegalKind }) {
  const lang = useLang(); const auth = useAuth();
  const doc = LEGAL[kind][lang];
  const other: LegalKind = kind === "termos" ? "privacidade" : "termos";
  useEffect(() => { document.title = `${doc.title} · ArchLab`; }, [doc.title]);
  return (
    <AuthShell back={auth.status === "in" ? { to: "/perfil", label: t("Voltar") } : { to: "/", label: t("Início") }} wide>
      <article>
        <h1 className="text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]">{doc.title}</h1>
        <p className="mt-2 text-sm text-text-2">{doc.updated}</p>
        <p className="mt-6 text-lg leading-relaxed text-text-2">{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.h} className="mt-9">
            <h2 className="text-xl font-semibold tracking-tight">{s.h}</h2>
            {s.p?.map((x) => <p key={x} className="mt-3 leading-relaxed text-text-2">{x}</p>)}
            {s.ul && <ul className="mt-3 grid list-disc gap-2 pl-5 leading-relaxed text-text-2 marker:text-text-2/60">{s.ul.map((x) => <li key={x}>{x}</li>)}</ul>}
          </section>
        ))}
        <p className="mt-12 border-t border-line pt-6 text-sm text-text-2">{t("Leia também:")} <a {...link(`/${other}`)} className="font-semibold text-accent hover:underline">{LEGAL[other][lang].title}</a></p>
      </article>
    </AuthShell>
  );
}
