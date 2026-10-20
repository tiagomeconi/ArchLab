import { LEAGUES, leagueProgress } from "../leagues";
import { LeagueBadge, LeagueLadder } from "../LeagueBadge";
import { t } from "../i18n";

/** Liga da pessoa: emblema, nota, barra até a próxima liga e (no perfil) a régua das 10 ligas. */
export function LeagueCard({ overall, ladder = false, badge = 84 }: { overall: number | null; ladder?: boolean; badge?: number }) {
  const lp = overall === null ? null : leagueProgress(overall);
  const lg = lp?.league ?? LEAGUES[0]!;
  return (
    <div>
      <div className="flex items-center gap-5">
        <LeagueBadge league={lg} size={badge} locked={!lp} />
        <div className="min-w-0 flex-1">
          {lp ? (
            <>
              <div className="flex items-baseline gap-2.5"><span className="text-2xl font-semibold tracking-tight" style={{ color: `color-mix(in srgb, ${lg.c1} 55%, var(--text))` }}>{t(lg.name)}</span>
                <span className="text-sm text-text-2 tabular-nums">OVR <b className="text-lg text-text">{overall}</b></span></div>
              {lp.next ? (
                <>
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-track" role="img" aria-label={t("{n} pontos para a liga {liga}", { n: lp.toNext, liga: t(lp.next.name) })}>
                      <i className="block h-full rounded-full transition-all duration-700" style={{ width: `${lp.pct}%`, background: `linear-gradient(90deg, ${lg.c1}, ${lg.c2})` }} />
                    </div>
                    <LeagueBadge league={lp.next} size={22} locked label={false} />
                  </div>
                  <p className="mt-1.5 text-sm text-text-2">{t("Faltam {n} pontos para a liga {liga}", { n: lp.toNext, liga: t(lp.next.name) })}</p>
                </>
              ) : <p className="mt-1.5 text-sm text-text-2">{t("Você chegou à liga mais alta.")}</p>}
            </>
          ) : (
            <>
              <span className="text-xl font-semibold tracking-tight">{t("Sem liga ainda")}</span>
              <p className="mt-1.5 text-sm text-text-2">{t("Monte e simule um caso para ganhar a sua primeira nota.")}</p>
            </>
          )}
        </div>
      </div>
      {ladder && <div className="mt-6 border-t border-line pt-5"><LeagueLadder index={lp ? lp.league.index : -1} /></div>}
    </div>
  );
}
