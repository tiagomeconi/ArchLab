import { useId } from "react";
import { LEAGUES, type League } from "./leagues";
import { badgeInner } from "./leagueSvg";
import { t } from "./i18n";

/** Emblema da liga (SVG próprio): o formato evolui de escudo a cristal e a cor é o material. `locked` mostra a liga ainda não alcançada. */
export function LeagueBadge({ league, size = 40, locked = false, label = true }: { league: League; size?: number; locked?: boolean; label?: boolean }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 72" width={size} height={Math.round(size * 72 / 64)} role={label ? "img" : undefined} aria-label={label ? t(league.name) : undefined} aria-hidden={label ? undefined : true}
      style={{ flex: "none", filter: locked ? "grayscale(1)" : undefined, opacity: locked ? 0.4 : 1 }} dangerouslySetInnerHTML={{ __html: badgeInner(league, uid) }} />
  );
}

/** Régua das 10 ligas: as alcançadas coloridas e as demais apagadas. */
export function LeagueLadder({ index, size = 34 }: { index: number; size?: number }) {
  return (
    <ol className="flex flex-wrap items-end gap-x-3 gap-y-4" aria-label={t("Todas as ligas")}>
      {LEAGUES.map((l) => (
        <li key={l.id} className="grid justify-items-center gap-1" aria-current={l.index === index ? "true" : undefined}>
          <LeagueBadge league={l} size={l.index === index ? Math.round(size * 1.3) : size} locked={l.index > index} />
          <span className={`text-[11px] font-medium ${l.index === index ? "text-text" : "text-text-2"}`}>{t(l.name)}</span>
        </li>
      ))}
    </ol>
  );
}
