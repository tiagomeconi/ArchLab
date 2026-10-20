import { useEffect, useMemo, useState } from "react";
import { authEnabled, avatarOf, useAuth } from "../auth";
import { loadDays, streakOf } from "../activity";
import { fetchProfile, getMyRank, type MyRank, type Profile as ProfileData } from "../cloud";
import { ALL_CASES } from "../home";
import { go, link } from "../nav";
import { loadProgress } from "../progress";
import { renderSocialCard } from "../socialCard";
import { Icon } from "../ui";
import { t, useLang } from "../i18n";
import { journeyOf } from "./useJourney";
import { ProfileView } from "./ProfileView";
import { useMyDesigns } from "./useMyDesigns";

const chip = "inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-track disabled:opacity-60";

/** O seu perfil: foto, liga, contadores e painéis (visão geral, conquistas, casos, desenhos e atividade). As configurações ficam em /configuracoes. */
export function Profile() {
  const lang = useLang();
  const auth = useAuth(); const user = auth.user; const meta = user?.user_metadata ?? {};
  const [prof, setProf] = useState<ProfileData | null>(null);
  const [rank, setRank] = useState<MyRank | null>(null);
  const [designs] = useMyDesigns();
  const [cardBusy, setCardBusy] = useState(false);
  useEffect(() => { if (!authEnabled) go("/start"); }, []);
  useEffect(() => { let alive = true; fetchProfile().then((p) => { if (alive) setProf(p); }); getMyRank().then((r) => { if (alive) setRank(r); }); return () => { alive = false; }; }, [user?.id]);
  const progress = useMemo(loadProgress, []); const days = useMemo(loadDays, []);
  const name = prof?.fullName || String(meta.name ?? "") || t("Minha conta");
  const photo = avatarOf(user);
  const since = useMemo(() => { const d = user?.created_at ? new Date(user.created_at) : null; return d && !isNaN(+d) ? d.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { month: "long", year: "numeric" }) : ""; }, [user?.created_at, lang]);
  if (!user) return null;

  const downloadCard = async () => {
    if (cardBusy) return; setCardBusy(true);
    try {
      const j = journeyOf(progress, days);
      const blob = await renderSocialCard({
        kind: "profile", title: name, overall: j.overall, photoUrl: photo, memberSince: since || undefined, achievements: j.ach.filter((a) => a.unlocked).map((a) => ({ icon: a.icon, title: a.title })),
        stats: [{ label: t("Casos concluídos"), value: `${Object.values(progress).filter((p) => p.status === "done" && true).length}/${ALL_CASES.length}` }, { label: t("Conquistas"), value: `${j.unlocked}/${j.ach.length}` }, { label: t("Sequência"), value: t("{n} dias", { n: streakOf(days).current }) }],
        handle: prof?.isPublic && prof.handle ? prof.handle : undefined,
      });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "archlab-cartao-perfil.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch { /* sem imagem: nada a fazer */ } finally { setCardBusy(false); }
  };

  return (
    <ProfileView
      data={{ name, handle: prof?.handle || undefined, photo, since: since || undefined, bio: prof?.bio || undefined, progress, days, owner: true, rank, designs }}
      actions={
        <>
          <a {...link("/configuracoes")} className={chip}><Icon name="edit" size={18} />{t("Editar perfil")}</a>
          <button type="button" onClick={() => void downloadCard()} disabled={cardBusy} className={chip}><Icon name={cardBusy ? "hourglass_top" : "badge"} size={18} />{t("Cartão")}</button>
          {prof?.isPublic && prof.handle
            ? <a href={`/u/${prof.handle}`} target="_blank" rel="noopener" className={chip}><Icon name="public" size={18} />{t("Ver perfil público")}</a>
            : <a {...link("/configuracoes#publico")} className="inline-flex items-center gap-1.5 px-1 py-2 text-sm text-text-2 underline decoration-text-2/40 underline-offset-4 hover:text-text">{t("Perfil privado: tornar público")}</a>}
        </>
      }
    />
  );
}
