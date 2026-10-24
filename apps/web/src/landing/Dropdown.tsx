import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { t } from "../i18n";
import { Icon } from "../ui";
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export interface DropdownOption { value: string; label: string }
/** Seletor do sistema no lugar do <select> nativo: botão em pílula e lista própria (portal no body) que acompanha o tema. Com `searchable`, ganha um campo de busca. */
export function Dropdown({ label, value, onChange, options, placeholder = "", searchable = false, searchLabel = "", disabled = false }: {
  label: string; value: string; onChange: (value: string) => void; options: DropdownOption[]; placeholder?: string; searchable?: boolean; searchLabel?: string; disabled?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; up: boolean } | null>(null);
  const btn = useRef<HTMLButtonElement>(null); const box = useRef<HTMLDivElement>(null); const list = useRef<HTMLUListElement>(null);
  const shown = useMemo(() => { const n = norm(q.trim()); return n ? options.filter((o) => o.value && (norm(o.label).includes(n) || o.value.toLowerCase() === n)) : options; }, [options, q]);
  const cur = options.find((o) => o.value === value);

  const toggle = () => {
    if (disabled) return;
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect(); const h = 340;
      const up = r.bottom + h + 12 > innerHeight && r.top > h;
      setPos({ top: up ? r.top - 8 : r.bottom + 8, left: r.left, width: r.width, up });
      setQ(""); setFocus(Math.max(0, options.findIndex((o) => o.value === value)));
    }
    setOpen((o) => !o);
  };
  const pick = (v: string) => { setOpen(false); btn.current?.focus(); if (v !== value) onChange(v); };

  useEffect(() => { if (open) list.current?.querySelector<HTMLElement>("[data-on=true]")?.scrollIntoView({ block: "nearest" }); }, [open, focus, shown]);
  useEffect(() => { if (open && searchable) box.current?.querySelector("input")?.focus(); }, [open, searchable]);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { const n = e.target as Node; if (!btn.current?.contains(n) && !box.current?.contains(n)) setOpen(false); };
    const close = (e: Event) => { if (e.type === "scroll" && box.current?.contains(e.target as Node)) return; setOpen(false); };
    document.addEventListener("mousedown", down); window.addEventListener("resize", close); window.addEventListener("scroll", close, true);
    return () => { document.removeEventListener("mousedown", down); window.removeEventListener("resize", close); window.removeEventListener("scroll", close, true); };
  }, [open]);
  const onKey = (e: React.KeyboardEvent) => {
    const n = shown.length;
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); btn.current?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setFocus((f) => (f + 1) % Math.max(1, n)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setFocus((f) => (f - 1 + n) % Math.max(1, n)); }
    else if (e.key === "Enter") { e.preventDefault(); const o = shown[Math.min(focus, n - 1)]; if (o) pick(o.value); }
    else if (e.key === "Tab") setOpen(false);
  };

  return <div className="grid gap-2 text-sm font-medium">
    <label htmlFor={id}>{label}</label>
    <button ref={btn} id={id} type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={toggle}
      onKeyDown={(e) => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); toggle(); } }}
      className="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-full border border-line bg-surface px-4 text-left text-text outline-none transition-colors hover:border-line-strong focus-visible:border-accent aria-expanded:border-accent disabled:opacity-50">
      <span className={`truncate ${cur?.value ? "" : "text-text-2"}`}>{cur?.label ?? placeholder}</span>
      <span className="text-text-2"><Icon name="expand_more" size={20} /></span>
    </button>
    {open && pos && createPortal(
      <div ref={box} onKeyDown={onKey} style={{ top: pos.up ? undefined : pos.top, bottom: pos.up ? innerHeight - pos.top : undefined, left: pos.left, width: pos.width }}
        className="lang-menu-list">
        {searchable && <input value={q} onChange={(e) => { setQ(e.target.value); setFocus(0); }} placeholder={searchLabel} aria-label={searchLabel} role="combobox" aria-expanded="true" aria-controls={`${id}-l`}
          className="mb-1.5 min-h-10 w-full rounded-full border border-line bg-track px-4 text-sm text-text outline-none focus:border-accent" />}
        <ul ref={list} id={`${id}-l`} role="listbox" aria-label={label} className="m-0 max-h-[260px] list-none overflow-auto p-0">
          {shown.length === 0 && <li className="px-3 py-3 text-sm text-text-2">{t("Nenhum resultado encontrado.")}</li>}
          {shown.map((o, i) => <li key={o.value || "all"} role="option" aria-selected={o.value === value} data-on={i === focus} onClick={() => pick(o.value)} onMouseEnter={() => setFocus(i)}
            className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3.5 text-sm ${i === focus ? "bg-accent-soft" : ""} ${o.value === value ? "font-semibold text-accent" : o.value ? "" : "text-text-2"}`}>
            <span className="min-w-0 flex-1 truncate">{o.label}</span>{o.value === value && o.value && <Icon name="check" size={18} />}
          </li>)}
        </ul>
      </div>, document.body)}
  </div>;
}
