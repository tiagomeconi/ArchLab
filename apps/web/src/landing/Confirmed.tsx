import { useEffect, useState } from "react";
import { link } from "../nav";
import { t } from "../i18n";
import { Icon } from "../ui";
import { useAuth } from "../auth";
import { AuthShell } from "./AuthShell";

/** Página de destino do link do e-mail de confirmação. Funciona mesmo abrindo o link em outro aparelho/navegador. */
export function Confirmed() {
  const auth = useAuth();
  // o Supabase devolve `error`/`error_description` na URL quando o link expirou ou já foi usado
  const [failed] = useState(() => /(^|[?&#])error(_code|_description)?=/.test(location.search + location.hash));
  useEffect(() => { document.title = `${failed ? t("Link inválido") : t("E-mail confirmado")} · ArchLab`; }, [failed]);
  const cta = "inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90";
  return (
    <AuthShell back={{ to: "/", label: t("Início") }}>
      <div className="text-center" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-line bg-surface"><Icon name={failed ? "link_off" : "check"} size={28} /></span>
        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight">{failed ? t("Não foi possível confirmar") : t("E-mail confirmado")}</h1>
        <p className="mt-3 leading-relaxed text-text-2">
          {failed
            ? t("O link expirou ou já foi usado. Se você já consegue entrar, está tudo certo; senão, crie a conta de novo ou peça outro link.")
            : t("Sua conta foi validada. Já pode entrar no ArchLab com o e-mail e a senha que você cadastrou.")}
        </p>
        <div className="mt-8">
          {auth.status === "in"
            ? <a {...link("/start")} className={cta}>{t("Continuar")}</a>
            : <a {...link(failed ? "/cadastro" : "/login")} className={cta}>{failed ? t("Criar conta") : t("Entrar")}</a>}
        </div>
      </div>
    </AuthShell>
  );
}
