import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "../ui";
import { localeOf, t, useLang } from "../i18n";

/** Seletor de data no padrão do sistema (substitui o `<input type="date">` do navegador). Valor em `YYYY-MM-DD`; vazio = sem data válida. */
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (s: string): [number, number, number] | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); if (!m) return null;
  const y = +m[1]!, mo = +m[2]! - 1, d = +m[3]!; const dt = new Date(y, mo, d);
  return dt.getFullYear() === y && dt.getMonth() === mo && dt.getDate() === d ? [y, mo, d] : null;
};
const show = (s: string, en: boolean) => { const p = parse(s); return p ? (en ? `${pad(p[1] + 1)}/${pad(p[2])}/${p[0]}` : `${pad(p[2])}/${pad(p[1] + 1)}/${p[0]}`) : ""; };
const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

interface Props { id: string; value: string; onChange: (v: string) => void; min?: string; max?: string; autoComplete?: string; invalid?: boolean }

export function DatePicker({ id, value, onChange, min = "1900-01-01", max, autoComplete, invalid }: Props) {
  const lang = useLang(); const en = lang === "en"; const loc = localeOf(lang); // o formato digitado é mês/dia/ano em inglês e dia/mês/ano nos demais
  const today = useMemo(() => { const d = new Date(); return iso(d.getFullYear(), d.getMonth(), d.getDate()); }, []);
  const hi = max ?? today;
  const [text, setText] = useState(show(value, en));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"day" | "month" | "year">("day");
  const sel = parse(value);
  const base = sel ?? parse(hi)!;
  const [cur, setCur] = useState<[number, number]>([base[0], base[1]]); // ano e mês exibidos
  const [focus, setFocus] = useState<[number, number, number]>(sel ?? [base[0], base[1], Math.min(base[2], daysIn(base[0], base[1]))]);
  const box = useRef<HTMLDivElement>(null); const grid = useRef<HTMLDivElement>(null); const yearsRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  // só espelha datas válidas (vindas de fora ou do calendário); apagar/editar o texto não pode ser sobrescrito
  useEffect(() => { if (value) setText(show(value, en)); }, [value, en]);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);
  useEffect(() => { if (view === "year") yearsRef.current?.querySelector<HTMLElement>("[aria-current=true]")?.scrollIntoView({ block: "center" }); }, [view]);
  useEffect(() => { if (open && view === "day") grid.current?.querySelector<HTMLElement>("[tabindex='0']")?.focus({ preventScroll: true }); }, [open, view, focus]);

  const inRange = (s: string) => s >= min && s <= hi;
  const minY = +min.slice(0, 4), maxY = +hi.slice(0, 4);
  const openPicker = () => { const b = parse(value) ?? parse(hi)!; setCur([b[0], b[1]]); setFocus(parse(value) ?? [b[0], b[1], Math.min(b[2], daysIn(b[0], b[1]))]); setView("day"); setOpen(true); };
  const pick = (y: number, m: number, d: number) => { const s = iso(y, m, d); if (!inRange(s)) return; onChange(s); setOpen(false); (box.current?.querySelector("input") as HTMLInputElement | null)?.focus(); };

  const type = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const masked = digits.length > 4 ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}` : digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setText(masked);
    if (digits.length < 8) { if (value) onChange(""); return; }
    const a = +digits.slice(0, 2), b = +digits.slice(2, 4), y = +digits.slice(4);
    const [d, m] = en ? [b, a] : [a, b];
    const s = iso(y, m - 1, d);
    onChange(parse(s) && inRange(s) ? s : "");
  };

  const shift = (dy: number, dm: number) => { let y = cur[0] + dy, m = cur[1] + dm; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } if (y < minY || y > maxY) return; setCur([y, m]); };
  const move = (e: KeyboardEvent, [y, m, d]: [number, number, number]) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key === "Escape") { e.stopPropagation(); setOpen(false); return; }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(y, m, d); return; }
    let dt: Date | null = null;
    if (e.key in step) dt = new Date(y, m, d + step[e.key]!);
    else if (e.key === "PageUp") dt = new Date(y, m - 1, d); else if (e.key === "PageDown") dt = new Date(y, m + 1, d);
    else if (e.key === "Home") dt = new Date(y, m, d - new Date(y, m, d).getDay()); else if (e.key === "End") dt = new Date(y, m, d + 6 - new Date(y, m, d).getDay());
    if (!dt) return; e.preventDefault();
    const s = iso(dt.getFullYear(), dt.getMonth(), dt.getDate()); if (!inRange(s)) return;
    setFocus([dt.getFullYear(), dt.getMonth(), dt.getDate()]); setCur([dt.getFullYear(), dt.getMonth()]);
  };

  const monthName = (m: number, style: "long" | "short") => new Intl.DateTimeFormat(loc, { month: style }).format(new Date(2000, m, 1));
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(loc, { weekday: "narrow" }).format(new Date(2023, 0, 1 + i))), [loc]);
  const lead = new Date(cur[0], cur[1], 1).getDay();
  const cells = Array.from({ length: 42 }, (_, i) => { const dt = new Date(cur[0], cur[1], 1 - lead + i); return [dt.getFullYear(), dt.getMonth(), dt.getDate()] as [number, number, number]; });
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const nav = "grid size-8 place-items-center rounded-full text-text-2 transition-colors hover:bg-track hover:text-text disabled:opacity-35 disabled:hover:bg-transparent";
  const focusIn = focus;
  const hasFocusCell = cells.some((c) => c[0] === focusIn[0] && c[1] === focusIn[1] && c[2] === focusIn[2]) && focusIn[1] === cur[1];

  return (
    <div ref={box} className="relative">
      <input id={id} type="text" inputMode="numeric" autoComplete={autoComplete} required maxLength={10} placeholder={en ? "MM/DD/YYYY" : "DD/MM/AAAA"} value={text} aria-invalid={invalid || undefined}
        aria-haspopup="dialog" aria-expanded={open} className="w-full rounded-full border border-line bg-surface px-4 py-2.5 pr-11 text-sm outline-none transition-colors placeholder:text-text-2/60 focus:border-accent"
        onChange={(e) => type(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); openPicker(); } if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); } }} />
      <button type="button" onClick={() => (open ? setOpen(false) : openPicker())} aria-label={t("Abrir calendário")}
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-text-2 transition-colors hover:text-text"><Icon name="calendar_month" size={18} /></button>
      {open && (
        <div role="dialog" aria-label={t("Escolher data")} id={uid} className="absolute left-0 top-[calc(100%+8px)] z-[70] w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-line p-3 shadow-[var(--shadow-lg)]" style={{ background: "var(--surface-solid)" }}>
          <div className="mb-2 flex items-center justify-between gap-1">
            <button type="button" className={nav} aria-label={t("Mês anterior")} disabled={view !== "day" || (cur[0] === minY && cur[1] === 0)} onClick={() => shift(0, -1)}><Icon name="chevron_left" size={20} /></button>
            <span className="flex items-center gap-1">
              <button type="button" aria-pressed={view === "month"} onClick={() => setView(view === "month" ? "day" : "month")} className="rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors hover:bg-track">{cap(monthName(cur[1], "long"))}</button>
              <button type="button" aria-pressed={view === "year"} onClick={() => setView(view === "year" ? "day" : "year")} className="rounded-lg px-2.5 py-1.5 text-sm font-semibold tabular-nums transition-colors hover:bg-track">{cur[0]}</button>
            </span>
            <button type="button" className={nav} aria-label={t("Próximo mês")} disabled={view !== "day" || (cur[0] === maxY && cur[1] === 11)} onClick={() => shift(0, 1)}><Icon name="chevron_right" size={20} /></button>
          </div>
          {view === "day" && (
            <div ref={grid} role="grid" aria-label={`${cap(monthName(cur[1], "long"))} ${cur[0]}`}>
              <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-text-2" aria-hidden>{weekdays.map((w, i) => <span key={i} className="py-1">{w}</span>)}</div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map(([y, m, d], i) => {
                  const s = iso(y, m, d); const out = m !== cur[1]; const ok = inRange(s); const on = s === value; const isToday = s === today;
                  const tab = hasFocusCell ? (y === focusIn[0] && m === focusIn[1] && d === focusIn[2]) : (!out && d === 1);
                  return (
                    <button key={i} type="button" role="gridcell" aria-selected={on} aria-current={isToday ? "date" : undefined} disabled={!ok} tabIndex={tab ? 0 : -1}
                      onClick={() => pick(y, m, d)} onKeyDown={(e) => move(e, [y, m, d])}
                      className={`mx-auto grid size-9 place-items-center rounded-full text-sm tabular-nums transition-colors disabled:cursor-default disabled:opacity-30 ${on ? "bg-accent font-semibold text-on-accent" : out ? "text-text-2/50 hover:bg-track" : "hover:bg-track"} ${isToday && !on ? "ring-1 ring-inset ring-accent" : ""} focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {view === "month" && (
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 12 }, (_, m) => { const dis = (cur[0] === minY && iso(cur[0], m, daysIn(cur[0], m)) < min) || (cur[0] === maxY && iso(cur[0], m, 1) > hi); return (
                <button key={m} type="button" disabled={dis} aria-current={m === cur[1] || undefined} onClick={() => { setCur([cur[0], m]); setFocus([cur[0], m, 1]); setView("day"); }}
                  className={`rounded-xl px-2 py-2.5 text-sm transition-colors disabled:opacity-30 ${m === cur[1] ? "bg-accent font-semibold text-on-accent" : "hover:bg-track"}`}>{cap(monthName(m, "short").replace(".", ""))}</button>); })}
            </div>
          )}
          {view === "year" && (
            <div ref={yearsRef} className="grid max-h-56 grid-cols-4 gap-1.5 overflow-y-auto pr-1">
              {Array.from({ length: maxY - minY + 1 }, (_, i) => maxY - i).map((y) => (
                <button key={y} type="button" aria-current={y === cur[0] || undefined} onClick={() => { setCur([y, cur[1]]); setFocus([y, cur[1], 1]); setView("month"); }}
                  className={`rounded-xl px-1 py-2 text-sm tabular-nums transition-colors ${y === cur[0] ? "bg-accent font-semibold text-on-accent" : "hover:bg-track"}`}>{y}</button>
              ))}
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-line pt-2 text-sm">
            <button type="button" className="rounded-full px-3 py-1 text-text-2 transition-colors hover:text-text" onClick={() => { onChange(""); setText(""); setOpen(false); }}>{t("Limpar")}</button>
            {inRange(today) && <button type="button" className="rounded-full px-3 py-1 font-semibold text-accent transition-opacity hover:opacity-80" onClick={() => { const p = parse(today)!; pick(p[0], p[1], p[2]); }}>{t("Hoje")}</button>}
          </div>
        </div>
      )}
    </div>
  );
}
