import { useEffect, useMemo, useState } from "react";
import { caseById } from "../cases";
import { leagueOf } from "../leagues";
import { LeagueBadge } from "../LeagueBadge";
import { go, link } from "../nav";
import { loadProgress } from "../progress";
import { loadSession } from "../session";
import { BrandMark, Icon } from "../ui";
import { t, useLang } from "../i18n";
import { ThemeToggle } from "../ThemeToggle";
import { LangToggle } from "../LangToggle";
import { DesignThumb } from "./DesignThumb";
import "./landing.css";

export const NARROW = "(max-width: 767px)";
const FORCE = "archlab:force-editor";
export const forceEditor = () => { try { sessionStorage.setItem(FORCE, "1"); } catch { /* ignora */ } };
export const editorForced = () => { try { return sessionStorage.getItem(FORCE) === "1"; } catch { return false; } };

/** Tela estreita demais para arrastar e soltar: true enquanto a janela tiver menos de 768 px. */
export function useNarrow() {
  const [n, setN] = useState(() => typeof matchMedia !== "undefined" && matchMedia(NARROW).matches);
  useEffect(() => { const m = matchMedia(NARROW); const on = () => setN(m.matches); m.addEventListener("change", on); return () => m.removeEventListener("change", on); }, []);
  return n;
}

/** No celular o editor (arrastar e soltar) não cabe: mostra o desenho, a nota e leva a pessoa para continuar no computador. */
export function MobileEditor({ onForce }: { onForce: () => void }) {
  useLang();
  const q = useMemo(() => new URLSearchParams(location.search), []);
  const session = useMemo(() => (q.has("s") ? loadSession() : null), [q]);
  const d = q.get("d");
  const key = q.has("blank") ? (session?.caseId ?? (d && /^[a-z0-9]{4,16}$/i.test(d) ? `free-${d.toLowerCase()}` : "free")) : "reference";
  const c = session?.caseId ? caseById(session.caseId) : undefined;
  const title = session?.title ?? (q.has("blank") ? t("Canvas livre") : t("Encurtador de links"));
  const snap = useMemo(() => { try { const r = JSON.parse(localStorage.getItem(`archlab:design:${key}`) ?? "null"); const s = typeof r?.snap === "string" ? JSON.parse(r.snap) : null; return s && Array.isArray(s.n) ? s : null; } catch { return null; } }, [key]);
  const p = session?.caseId ? loadProgress()[session.caseId] : undefined;

  return (
    <div className="lp relative min-h-screen">
      <header className="flex items-center justify-between px-5 py-4">
        <a {...link("/start")} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-2"><Icon name="arrow_back" size={18} />{t("Início")}</a>
        <span className="flex items-center gap-2"><LangToggle /><ThemeToggle /></span>
      </header>
      <main className="mx-auto w-full max-w-md px-5 pb-16 pt-2">
        <div className="flex items-center gap-3">
          {c?.company ? <BrandMark id={c.company.logo} name={c.company.name} color={c.company.brand} height={32} /> : <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-track"><Icon name={c?.icon ?? "draw"} size={20} /></span>}
          <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">{t(title)}</h1>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface p-3"><DesignThumb snap={snap} w={320} h={190} /></div>
        {p?.ovr ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
            <LeagueBadge league={leagueOf(p.ovr)} size={40} />
            <div className="min-w-0 flex-1"><b className="block">{t(leagueOf(p.ovr).name)} · OVR {p.ovr}</b><small className="text-text-2">{t("{met} de {total} verificações cumpridas", { met: p.met, total: p.total })}</small></div>
          </div>
        ) : null}
        <section className="mt-6 rounded-2xl border border-line bg-surface p-5" aria-label={t("Aviso")}>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Icon name="desktop_windows" size={22} />{t("Edite no computador")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-2">{t("O editor, com arrastar e soltar, foi feito para telas maiores. Aqui no celular você acompanha o desenho e a nota. Entre com a mesma conta no computador e continue de onde parou: os desenhos ficam em Meus desenhos.")}</p>
        </section>
        <div className="mt-5 grid gap-3">
          <a {...link("/desenhos")} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent"><Icon name="folder_open" size={18} />{t("Ver meus desenhos")}</a>
          <button type="button" onClick={() => { forceEditor(); onForce(); }} className="rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:bg-track">{t("Abrir o editor mesmo assim")}</button>
          <button type="button" onClick={() => go("/start")} className="px-6 py-2 text-sm text-text-2 hover:text-text">{t("Voltar ao início")}</button>
        </div>
      </main>
    </div>
  );
}
