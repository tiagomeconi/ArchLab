import { useEffect, useMemo, useRef } from "react";
import { heatmapWeeks, monthStarts } from "../heatmap";
import { t, useLang } from "../i18n";
import { cn } from "./lib/utils";

const GAP = 3, MIN = 12;
/** Calendário dos dias praticados: um quadradinho por dia, em colunas de semana; as colunas se esticam para ocupar a largura (e rolam no celular). */
export function ActivityHeatmap({ days, weeks = 26 }: { days: string[]; weeks?: number }) {
  const lang = useLang(); const loc = lang === "pt" ? "pt-BR" : "en-US";
  const grid = useMemo(() => heatmapWeeks(days, weeks), [days, weeks]);
  const months = useMemo(() => monthStarts(grid), [grid]);
  const fmtM = useMemo(() => new Intl.DateTimeFormat(loc, { month: "short" }), [loc]);
  const fmtD = useMemo(() => new Intl.DateTimeFormat(loc, { day: "numeric", month: "long" }), [loc]);
  const total = grid.flat().filter((c) => c.on).length;
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = box.current; if (el) el.scrollLeft = el.scrollWidth; }, [weeks]); // quando rola, abre nos dias mais recentes
  return (
    <figure className="m-0">
      <div ref={box} className="overflow-x-auto pb-1" tabIndex={0} aria-label={t("Calendário de atividade")}>
        <div className="relative" style={{ minWidth: weeks * (MIN + GAP) }}>
          <div className="relative mb-1.5 h-4 text-[11px] text-text-2" aria-hidden>
            {months.map((m) => <span key={m.col} className="absolute" style={{ left: `${(m.col / weeks) * 100}%` }}>{fmtM.format(new Date(2023, m.month, 1)).replace(".", "")}</span>)}
          </div>
          <div className="grid" style={{ gridAutoFlow: "column", gridTemplateRows: "repeat(7, auto)", gridAutoColumns: "minmax(0, 1fr)", gap: GAP }} role="img" aria-label={t("{n} dias praticados nas últimas {w} semanas", { n: total, w: weeks })}>
            {grid.flat().map((c) => (
              <span key={c.key} title={c.future ? undefined : `${fmtD.format(new Date(+c.key.slice(0, 4), +c.key.slice(5, 7) - 1, +c.key.slice(8)))}${c.on ? ` · ${t("praticou")}` : ""}`}
                className={cn("aspect-square rounded-[4px]", c.future ? "opacity-0" : c.on ? "bg-accent" : "bg-track", c.today && "ring-1 ring-text/50")} />
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-2 flex items-center justify-between gap-3 text-xs text-text-2">
        <span>{t("{n} dias praticados nas últimas {w} semanas", { n: total, w: weeks })}</span>
        <span className="inline-flex items-center gap-1.5" aria-hidden>{t("Menos")}<i className="size-3 rounded-[3px] bg-track" /><i className="size-3 rounded-[3px] bg-accent" />{t("Mais")}</span>
      </figcaption>
    </figure>
  );
}
