import type { Ach } from "../achievements";
import { Icon } from "../ui";
import { t } from "../i18n";
import { cn } from "./lib/utils";

/** Conquistas: as desbloqueadas em destaque e, nas demais, o quanto falta. */
export function AchievementGrid({ list }: { list: Ach[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2" aria-label={t("Conquistas")}>
      {[...list].sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.pct - a.pct).map((a) => (
        <li key={a.id} className={cn("flex items-start gap-3.5 rounded-2xl border p-4", a.unlocked ? "border-accent/40 bg-accent/5" : "border-line bg-surface")}>
          <span aria-hidden className={cn("grid size-11 shrink-0 place-items-center rounded-xl", a.unlocked ? "bg-accent text-on-accent" : "bg-track text-text-2")}><Icon name={a.unlocked ? a.icon : "lock"} size={22} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2"><b className={cn("text-[15px]", !a.unlocked && "text-text-2")}>{t(a.title)}</b>{a.unlocked && <span className="sr-only">{t("desbloqueada")}</span>}</div>
            <p className="mt-0.5 text-sm leading-snug text-text-2">{t(a.desc)}</p>
            {!a.unlocked && (
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-track" role="img" aria-label={`${a.have} / ${a.goal}`}><i className="block h-full rounded-full bg-accent/70" style={{ width: `${a.pct}%` }} /></div>
                <span className="text-xs tabular-nums text-text-2">{a.have}/{a.goal}</span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
