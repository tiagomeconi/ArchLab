import { useEffect, useId, useRef, useState } from "react";
import { LANGUAGES, setLang, useLang, type Lang } from "./i18n";
import { Flag } from "./flags";
import { Icon } from "./ui";

/** Seletor de idioma: botão com a bandeira e a sigla; ao abrir, uma lista com bandeira, nome no próprio idioma e sigla. Um clique troca. */
export function LangMenu({ className = "" }: { className?: string }) {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);
  const btn = useRef<HTMLButtonElement>(null); const list = useRef<HTMLUListElement>(null);
  const id = useId(); const cur = LANGUAGES.find((l) => l.code === lang)!;
  const [focus, setFocus] = useState(0);

  const toggle = () => {
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect(); const h = Math.min(LANGUAGES.length * 46 + 12, innerHeight - 24);
      const up = r.bottom + h + 12 > innerHeight && r.top > h;
      setPos({ top: up ? r.top - 8 : r.bottom + 8, left: Math.max(8, Math.min(r.right - 224, innerWidth - 232)), up });
      setFocus(Math.max(0, LANGUAGES.findIndex((l) => l.code === lang)));
    }
    setOpen((o) => !o);
  };
  const pick = async (code: Lang) => { setOpen(false); btn.current?.focus(); if (code === lang) return; setBusy(true); try { await setLang(code); } finally { setBusy(false); } };

  useEffect(() => {
    if (!open) return;
    list.current?.querySelectorAll<HTMLElement>("[role=option]")[focus]?.focus();
  }, [open, focus]);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { const n = e.target as Node; if (!btn.current?.contains(n) && !list.current?.contains(n)) setOpen(false); };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", down); window.addEventListener("resize", close); window.addEventListener("scroll", close, true);
    return () => { document.removeEventListener("mousedown", down); window.removeEventListener("resize", close); window.removeEventListener("scroll", close, true); };
  }, [open]);
  const onKey = (e: React.KeyboardEvent) => {
    const n = LANGUAGES.length;
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); btn.current?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setFocus((f) => (f + 1) % n); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setFocus((f) => (f - 1 + n) % n); }
    else if (e.key === "Home") { e.preventDefault(); setFocus(0); }
    else if (e.key === "End") { e.preventDefault(); setFocus(n - 1); }
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <>
      <button ref={btn} type="button" className={`lang-menu-btn ${className}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined}
        aria-label={`Language / Idioma: ${cur.name}`} title={cur.name} onClick={toggle}
        onKeyDown={(e) => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); toggle(); } }}>
        <Flag code={cur.flag} className="lm-flag" /><b className="lm-short">{cur.short}</b>
        <Icon name={busy ? "progress_activity" : "expand_more"} size={16} />
      </button>
      {open && pos && (
        <ul ref={list} id={id} role="listbox" aria-label="Language / Idioma" className="lang-menu-list" onKeyDown={onKey}
          style={{ top: pos.up ? undefined : pos.top, bottom: pos.up ? innerHeight - pos.top : undefined, left: pos.left }}>
          {LANGUAGES.map((l, i) => (
            <li key={l.code} role="option" aria-selected={l.code === lang} tabIndex={i === focus ? 0 : -1} lang={l.html} className={l.code === lang ? "on" : ""}
              onClick={() => pick(l.code)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void pick(l.code); } }} onMouseEnter={() => setFocus(i)}>
              <Flag code={l.flag} className="lm-flag" /><span className="lm-name">{l.name}</span><b className="lm-short">{l.short}</b>
              {l.code === lang && <Icon name="check" size={18} />}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
