import { useMemo } from "react";
import "./landing.css";
import { CASES, COMPANY_CASES } from "../cases";
import { Icon } from "../ui";
import { link } from "../nav";
import { t, useLang } from "../i18n";
import { useAuth } from "../auth";
import { PAYWALL, planOf } from "../plan";

const contact = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim();

/** Planos: gratuito (casos de nível Iniciante) e assinatura (todos os níveis). O pagamento ainda não está ligado: a assinatura é por lista de espera. */
export function Plans() {
  useLang();
  const auth = useAuth();
  const mine = planOf(auth.user);
  const counts = useMemo(() => {
    const all = [...COMPANY_CASES, ...CASES]; const n = (l: string) => all.filter((c) => c.level === l).length;
    return { ini: n("Iniciante"), inter: n("Intermediário"), adv: n("Avançado") };
  }, []);
  const Item = ({ children, on = true }: { children: string; on?: boolean }) => (
    <li className={`flex items-start gap-2 text-sm ${on ? "" : "text-text-2/70 line-through decoration-text-2/40"}`}><Icon name={on ? "check" : "close"} size={17} />{children}</li>
  );
  return (
    <>
      <h1 className="text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]">{t("Planos")}</h1>
      <p className="mt-2 max-w-2xl text-lg leading-snug text-text-2">{t("Comece de graça com os casos iniciais. Assine para treinar os casos intermediários e avançados que as entrevistas mais cobram.")}</p>
      {!PAYWALL && <p className="mt-4 max-w-2xl rounded-xl border border-line bg-surface p-3 text-sm text-text-2"><Icon name="info" size={16} />{" "}{t("Por enquanto todos os casos estão liberados para todo mundo.")}</p>}
      <div className="mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
        <section className="rounded-3xl border border-line bg-surface p-6" aria-label={t("Plano gratuito")}>
          <h2 className="text-xl font-semibold">{t("Gratuito")}</h2>
          <p className="mt-1 text-sm text-text-2">{t("Para começar e aprender os fundamentos.")}</p>
          <ul className="mt-5 grid gap-2.5">
            <Item>{t("{n} casos de nível Iniciante", { n: counts.ini })}</Item>
            <Item>{t("Modo livre e desenhos ilimitados")}</Item>
            <Item>{t("Revisão automática e cartões de conceito")}</Item>
            <Item>{t("Exportar documento, Mermaid e relatório")}</Item>
            <Item on={false}>{t("{n} casos Intermediários", { n: counts.inter })}</Item>
            <Item on={false}>{t("{n} casos Avançados", { n: counts.adv })}</Item>
          </ul>
          {mine === "free" && <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ok"><Icon name="check_circle" size={18} />{t("Seu plano atual")}</p>}
        </section>
        <section className="rounded-3xl border-2 border-accent bg-surface p-6" aria-label={t("Plano Pro")}>
          <h2 className="text-xl font-semibold">{t("Pro")}</h2>
          <p className="mt-1 text-sm text-text-2">{t("Para quem está se preparando para entrevistas ou projeta sistemas de verdade.")}</p>
          <ul className="mt-5 grid gap-2.5">
            <Item>{t("Tudo do plano gratuito")}</Item>
            <Item>{t("{n} casos Intermediários", { n: counts.inter })}</Item>
            <Item>{t("{n} casos Avançados", { n: counts.adv })}</Item>
            <Item>{t("Trilhas completas e modo entrevista")}</Item>
            <Item>{t("Novos casos assim que forem publicados")}</Item>
          </ul>
          {mine === "pro" ? <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ok"><Icon name="check_circle" size={18} />{t("Seu plano atual")}</p>
            : contact ? <a href={`mailto:${contact}?subject=${encodeURIComponent("ArchLab Pro")}`} className="mt-5 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90">{t("Quero ser avisado")}</a>
            : <button disabled className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent opacity-60">{t("Em breve")}</button>}
        </section>
      </div>
      <p className="mt-8"><a {...link("/start/estudo")} className="text-sm font-semibold text-accent hover:underline">{t("Voltar aos casos")}</a></p>
    </>
  );
}
