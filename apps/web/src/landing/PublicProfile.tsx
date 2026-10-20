import { useEffect, useMemo, useState } from "react";
import { authEnabled, avatarUrl, useAuth } from "../auth";
import { getPublicProfile, type PublicProfile as PP } from "../cloud";
import { link } from "../nav";
import { Icon } from "../ui";
import { t, useLang } from "../i18n";
import type { CaseProgress } from "../progress";
import { AuthShell } from "./AuthShell";
import { ProfileView } from "./ProfileView";

/** Perfil público compartilhável (/u/@usuário): a mesma vitrine do seu perfil, só leitura e só com o que a pessoa liberou. Visível sem login. */
export function PublicProfile({ handle }: { handle: string }) {
  const lang = useLang();
  const auth = useAuth();
  const [data, setData] = useState<PP | null | "loading">("loading");
  useEffect(() => { let alive = true; setData("loading"); getPublicProfile(handle).then((d) => { if (alive) setData(d); }); return () => { alive = false; }; }, [handle]);
  useEffect(() => { if (data && data !== "loading") document.title = `${data.name || data.handle} · ArchLab`; }, [data]);
  const progress = useMemo(() => {
    const out: Record<string, CaseProgress> = {};
    if (data && data !== "loading") for (const r of data.progress) out[r.case] = { met: r.met, total: r.total, stages: 0, status: r.status, updatedAt: 0, ovr: r.ovr ?? undefined };
    return out;
  }, [data]);
  const back = auth.status === "in" ? { to: "/start", label: t("Voltar ao sistema") } : { to: "/", label: t("Início") };

  return (
    <AuthShell back={back} xwide>
      {data === "loading" ? <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface" aria-busy="true" />
        : !data ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-line px-6 py-20 text-center">
            <span aria-hidden className="grid size-14 place-items-center rounded-2xl bg-track text-text-2"><Icon name="person_off" size={30} /></span>
            <h1 className="mt-4 text-2xl font-semibold">{authEnabled ? t("Perfil não encontrado") : t("Perfis públicos indisponíveis")}</h1>
            <p className="mt-1 max-w-md text-text-2">{t("O endereço pode estar errado ou a pessoa deixou o perfil privado.")}</p>
          </div>
        ) : (
          <ProfileView
            data={{
              name: data.name || `@${data.handle}`, handle: data.handle, photo: avatarUrl(data.uid, data.avatarV), bio: data.bio || undefined, progress, days: data.days, owner: false,
              since: data.since ? new Date(data.since).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { month: "long", year: "numeric" }) : undefined,
            }}
            actions={auth.status !== "in" ? <a {...link("/cadastro")} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90">{t("Criar minha conta")}</a> : undefined}
          />
        )}
    </AuthShell>
  );
}
