import { useMemo } from "react";
import { streakOf, weekStrip } from "../activity";
import { Icon } from "../ui";
import { localeOf, t, useLang } from "../i18n";
import { cn } from "./lib/utils";

/** Sequência de dias praticando: número grande, melhor marca e os últimos 7 dias. */
export function StreakCard({ days, compact = false }: { days: string[]; compact?: boolean }) {
  const lang = useLang();
  const s = useMemo(() => streakOf(days), [days]);
  const week = useMemo(() => weekStrip(days), [days]);
  const wd = useMemo(() => new Intl.DateTimeFormat(localeOf(lang), { weekday: "narrow" }), [lang]);
  const msg = s.practicedToday ? t("Você já praticou hoje.") : s.current > 0 ? t("Pratique hoje para manter a sequência.") : t("Pratique hoje para começar uma sequência.");
  return (
    <div>
      <div className="flex items-center gap-4">
        <span aria-hidden className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", s.current > 0 ? "bg-accent/15 text-accent" : "bg-track text-text-2")}><Icon name="local_fire_department" size={32} /></span>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2"><b className="text-4xl font-semibold tabular-nums tracking-tight">{s.current}</b><span className="text-text-2">{s.current === 1 ? t("dia seguido") : t("dias seguidos")}</span></div>
          <p className="text-sm text-text-2">{t("Melhor sequência: {n}", { n: s.best })}</p>
        </div>
      </div>
      <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label={t("Últimos 7 dias")}>
        {week.map((d) => (
          <li key={d.key} className="grid justify-items-center gap-1.5">
            <span aria-hidden className={cn("grid size-8 place-items-center rounded-full border text-xs transition-colors", d.on ? "border-accent bg-accent text-on-accent" : d.today ? "border-accent text-text-2" : "border-line text-text-2")}>{d.on ? <Icon name="check" size={16} /> : null}</span>
            <span className="text-[11px] text-text-2">{wd.format(new Date(2023, 0, 1 + d.weekday)).toUpperCase()}</span>
            <span className="sr-only">{d.on ? t("praticou") : t("não praticou")}</span>
          </li>
        ))}
      </ol>
      {!compact && <p className="mt-4 text-sm text-text-2">{msg}</p>}
    </div>
  );
}
