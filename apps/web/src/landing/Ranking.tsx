import { useEffect, useState } from "react";
import { authEnabled, avatarUrl, useAuth } from "../auth";
import { getLeaderboard, getMyRank, type LeaderRow, type MyRank } from "../cloud";
import { leagueOf } from "../leagues";
import { LeagueBadge } from "../LeagueBadge";
import { Avatar } from "../AccountMenu";
import { link } from "../nav";
import { Icon } from "../ui";
import { t } from "../i18n";
import { cn } from "./lib/utils";

const card = "rounded-3xl border border-line bg-surface";

/** Ranking: só aparece quem ligou o perfil público. Pontos = soma das melhores notas de cada caso. */
export function Ranking() {
  const auth = useAuth();
  const [rows, setRows] = useState<LeaderRow[] | null | "error">(null);
  const [me, setMe] = useState<MyRank | null>(null);
  useEffect(() => {
    if (!authEnabled) { setRows("error"); return; }
    let alive = true;
    Promise.all([getLeaderboard(50), getMyRank()]).then(([r, m]) => { if (!alive) return; setRows(r ?? "error"); setMe(m); });
    return () => { alive = false; };
  }, []);
  const myRow = Array.isArray(rows) ? rows.find((r) => r.uid === auth.user?.id) : undefined;

  return (
    <>
      <h1 className="text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]">{t("Ranking")}</h1>
      <p className="mt-2 max-w-2xl text-lg leading-snug text-text-2">{t("Quem mais pontua entre os perfis públicos. Os pontos são a soma da melhor nota de cada caso: praticar mais casos conta.")}</p>

      <section aria-label={t("Sua posição")} className={cn(card, "mt-8 flex flex-wrap items-center gap-5 p-6")}>
        {me ? (
          <>
            <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent"><b className="text-2xl tabular-nums">#{me.rank}</b></span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">{t("Você está em {n}º lugar", { n: me.rank })}</h2>
              <p className="text-text-2">{t("de {total} pessoas no ranking · {pts} pontos", { total: me.total, pts: me.points })}</p>
            </div>
            {myRow && <span className="inline-flex items-center gap-2"><LeagueBadge league={leagueOf(myRow.overall)} size={36} /><b className="text-lg tabular-nums">{myRow.overall}</b></span>}
          </>
        ) : (
          <>
            <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-2xl bg-track text-text-2"><Icon name="leaderboard" size={28} /></span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">{t("Você ainda não está no ranking")}</h2>
              <p className="text-text-2">{t("Ligue o seu perfil público e termine ao menos um caso com nota para aparecer aqui. Você pode sair quando quiser.")}</p>
            </div>
            <a {...link("/configuracoes#publico")} className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent">{t("Ligar o perfil público")}<Icon name="arrow_forward" size={18} /></a>
          </>
        )}
      </section>

      {rows === null ? (
        <div className="mt-6 grid gap-3" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-[72px] animate-pulse rounded-2xl border border-line bg-surface" />)}</div>
      ) : rows === "error" ? (
        <p role="alert" className="mt-8 text-text-2">{authEnabled ? t("Não foi possível carregar o ranking. Tente de novo em instantes.") : t("O ranking precisa de uma conta e do servidor configurado.")}</p>
      ) : rows.length === 0 ? (
        <div className="mt-6 grid place-items-center rounded-3xl border border-dashed border-line px-6 py-14 text-center">
          <h2 className="text-xl font-semibold">{t("Ninguém no ranking ainda")}</h2>
          <p className="mt-1 max-w-md text-text-2">{t("Seja a primeira pessoa: ligue o perfil público e conclua um caso.")}</p>
        </div>
      ) : (
        <ol className="mt-6 grid gap-2.5" aria-label={t("Classificação")}>
          {rows.map((r, i) => {
            const mine = r.uid === auth.user?.id;
            return (
              <li key={r.uid} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 sm:gap-4", mine ? "border-accent/60 bg-accent/10" : "border-line bg-surface")} aria-current={mine ? "true" : undefined}>
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl text-sm font-semibold tabular-nums", i < 3 ? "bg-text text-bg" : "bg-track text-text-2")}><span className="sr-only">{t("Posição")} </span>{i + 1}</span>
                <Avatar name={r.name} src={avatarUrl(r.uid, r.avatarV)} size={40} />
                <div className="min-w-0 flex-1">
                  <a {...link(`/u/${r.handle}`)} className="block truncate font-semibold hover:underline">{r.name || `@${r.handle}`}</a>
                  <p className="truncate text-sm text-text-2">@{r.handle} · {t("{n} casos", { n: r.cases })}</p>
                </div>
                <span className="hidden items-center gap-1.5 sm:inline-flex" title={t(leagueOf(r.overall).name)}><LeagueBadge league={leagueOf(r.overall)} size={26} label={false} /><span className="text-sm tabular-nums text-text-2">OVR <b className="text-text">{r.overall}</b></span></span>
                <span className="w-20 text-right tabular-nums"><b className="text-lg">{r.points}</b><small className="block text-xs text-text-2">{t("pontos")}</small></span>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
