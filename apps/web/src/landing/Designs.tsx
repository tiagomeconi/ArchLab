import { useMemo, useState } from "react";
import { authEnabled, useAuth } from "../auth";
import { caseById, sessionFor } from "../cases";
import { deleteDesign, renameDesign } from "../cloud";
import { leagueOf } from "../leagues";
import { LeagueBadge } from "../LeagueBadge";
import { go, link } from "../nav";
import { loadProgress } from "../progress";
import { clearSession, newDesignId, saveSession } from "../session";
import { BrandMark, Icon } from "../ui";
import { localeOf, t, useLang } from "../i18n";
import { cn } from "./lib/utils";
import { DesignThumb } from "./DesignThumb";
import { DESIGN_PREFIX as PREFIX, useMyDesigns, type DesignItem as Item } from "./useMyDesigns";

/** Abre o desenho no laboratório: grava a cópia local que o laboratório já sabe restaurar e entra no caso certo. */
function openItem(it: Item) {
  try { localStorage.setItem(PREFIX + it.key, JSON.stringify({ v: 1, savedAt: Date.now(), snap: JSON.stringify(it.snap), title: it.key.startsWith("free") && it.title ? it.title : undefined })); } catch { /* bloqueado */ }
  const c = it.key === "free" ? undefined : caseById(it.key);
  if (c) { saveSession(sessionFor(c)); go("/app?blank=1&s=1"); }
  else { clearSession(); go(it.key.startsWith("free-") ? `/app?blank=1&d=${it.key.slice(5)}` : "/app?blank=1"); }
}

/** Meus desenhos: tudo o que a pessoa salvou, com miniatura, nota e atalho para continuar. */
export function Designs() {
  const lang = useLang();
  const auth = useAuth();
  const [items, setItems] = useMyDesigns();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null); const [draft, setDraft] = useState("");
  const progress = useMemo(loadProgress, []);
  const rtf = useMemo(() => new Intl.RelativeTimeFormat(localeOf(lang), { numeric: "auto" }), [lang]);

  const ago = (ts: number) => {
    if (!ts) return "";
    const s = Math.round((ts - Date.now()) / 1000), a = Math.abs(s);
    if (a < 60) return rtf.format(0, "second");
    if (a < 3600) return rtf.format(Math.round(s / 60), "minute");
    if (a < 86400) return rtf.format(Math.round(s / 3600), "hour");
    if (a < 86400 * 30) return rtf.format(Math.round(s / 86400), "day");
    return rtf.format(Math.round(s / (86400 * 30)), "month");
  };
  const nameOf = (it: Item) => { const c = it.key === "free" ? undefined : caseById(it.key); return c ? t(c.title) : it.title.trim() || (it.key === "free" ? t("Canvas livre") : t("Desenho sem nome")); };
  const commitName = async (it: Item) => {
    const v = draft.trim().replace(/\s+/g, " ").slice(0, 60); setRenaming(null);
    if (!v || v === nameOf(it)) return;
    try { const k = PREFIX + it.key; const raw = JSON.parse(localStorage.getItem(k) ?? "null"); if (raw) localStorage.setItem(k, JSON.stringify({ ...raw, title: v })); } catch { /* ignora */ }
    setItems((l) => (l ?? []).map((x) => (x.key === it.key ? { ...x, title: v } : x)));
    if (authEnabled && auth.status === "in") await renameDesign(it.key, v);
  };
  const remove = async (it: Item) => {
    try { localStorage.removeItem(PREFIX + it.key); } catch { /* ignora */ }
    if (authEnabled && auth.status === "in") await deleteDesign(it.key);
    setItems((l) => (l ?? []).filter((x) => x.key !== it.key)); setConfirm(null);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-balance text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.024em]">{t("Meus desenhos")}</h1>
        <button type="button" onClick={() => { clearSession(); go(`/app?blank=1&d=${newDesignId()}`); }} className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"><Icon name="add" size={18} />{t("Novo desenho")}</button>
      </div>
      <p className="mt-2 max-w-2xl text-lg leading-snug text-text-2">{authEnabled ? t("Tudo o que você salvou, sincronizado na sua conta. Abra para continuar de onde parou.") : t("Os desenhos guardados neste navegador. Abra para continuar de onde parou.")}</p>

      {items === null ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-3xl border border-line bg-surface" />)}</div>
      ) : items.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <span aria-hidden className="grid size-14 place-items-center rounded-2xl bg-track text-text-2"><Icon name="folder_open" size={30} /></span>
          <h2 className="mt-4 text-xl font-semibold">{t("Você ainda não tem desenhos salvos")}</h2>
          <p className="mt-1 max-w-md text-text-2">{t("Monte uma arquitetura no laboratório e ela aparece aqui automaticamente.")}</p>
          <a {...link("/start/estudo")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent">{t("Escolher um caso")}<Icon name="arrow_forward" size={18} /></a>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const c = it.key === "free" ? undefined : caseById(it.key);
            const title = nameOf(it); const free = it.key.startsWith("free");
            const ovr = progress[it.key]?.ovr;
            return (
              <li key={it.key} className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_24px_60px_-28px_var(--accent)]">
                <button type="button" onClick={() => openItem(it)} className="block border-b border-line bg-bg/40 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label={t("Abrir {nome}", { nome: title })}>
                  <DesignThumb snap={it.snap} />
                </button>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start gap-3">
                    {c?.company ? <BrandMark id={c.company.logo} name={c.company.name} color={c.company.brand} height={26} /> : <span aria-hidden className="grid size-[26px] place-items-center rounded-lg bg-track"><Icon name={c?.icon ?? "draw"} size={16} /></span>}
                    {renaming === it.key ? (
                      <input autoFocus value={draft} maxLength={60} aria-label={t("Nome do desenho")} onChange={(e) => setDraft(e.target.value)} onFocus={(e) => e.target.select()} onBlur={() => void commitName(it)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); } else if (e.key === "Escape") { setDraft(title); setRenaming(null); } }}
                        className="min-w-0 flex-1 rounded-lg border border-accent bg-surface px-2 py-0.5 text-base font-semibold tracking-tight outline-none" />
                    ) : (
                      <h2 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight" title={title}>{title}</h2>
                    )}
                    {free && renaming !== it.key && <button type="button" onClick={() => { setDraft(title); setRenaming(it.key); }} aria-label={t("Renomear {nome}", { nome: title })} title={t("Renomear")} className="grid size-7 shrink-0 place-items-center rounded-lg text-text-2 transition-colors hover:bg-track hover:text-text"><Icon name="edit" size={16} /></button>}
                    {ovr ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line py-0.5 pl-1 pr-2 text-xs tabular-nums text-text-2" title={t("Melhor nota: {n} ({liga})", { n: ovr, liga: t(leagueOf(ovr).name) })}><LeagueBadge league={leagueOf(ovr)} size={16} label={false} /><b className="text-text">{ovr}</b></span> : null}
                  </div>
                  <p className="mt-2 text-sm text-text-2">{t("{n} componentes · {m} conexões", { n: it.snap.n.length, m: it.snap.e.length })}</p>
                  <p className="text-sm text-text-2">{t("Editado {quando}", { quando: ago(it.updatedAt) })}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <button type="button" onClick={() => openItem(it)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">{t("Continuar")}<Icon name="arrow_forward" size={16} /></button>
                    {confirm === it.key ? (
                      <span className="flex items-center gap-2 text-sm">
                        <button type="button" onClick={() => void remove(it)} className="font-semibold text-danger hover:underline">{t("Excluir")}</button>
                        <button type="button" onClick={() => setConfirm(null)} className="text-text-2 hover:text-text">{t("Cancelar")}</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => setConfirm(it.key)} aria-label={t("Excluir {nome}", { nome: title })} className={cn("grid size-8 place-items-center rounded-lg text-text-2 transition-colors hover:bg-track hover:text-danger")}><Icon name="delete" size={18} /></button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
