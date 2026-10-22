import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import "./landing.css";
import { link } from "../nav";
import { authEnabled } from "../auth";
import { Icon, Logo } from "../ui";
import { ThemeToggle } from "../ThemeToggle";
import { LangToggle } from "../LangToggle";
import { AccountMenu } from "../AccountMenu";
import { t, useLang } from "../i18n";
import { cn } from "./lib/utils";

const ITEMS = [
  { to: "/start", icon: "home", label: "Início", on: (p: string) => p === "/start" || p === "/start/" },
  { to: "/start/aulas", icon: "auto_stories", label: "Aulas", on: (p: string) => p.startsWith("/start/aulas") },
  { to: "/start/estudo", icon: "school", label: "Casos", on: (p: string) => p.startsWith("/start/estudo") },
  { to: "/start/livre", icon: "draw", label: "Modo livre", short: "Livre", on: (p: string) => p.startsWith("/start/livre") },
  { to: "/desenhos", icon: "folder_open", label: "Meus desenhos", short: "Desenhos", on: (p: string) => p === "/desenhos" },
  { to: "/ranking", icon: "leaderboard", label: "Ranking", on: (p: string) => p === "/ranking", account: true },
  { to: "/perfil", icon: "person", label: "Perfil", on: (p: string) => p === "/perfil" || p === "/configuracoes", account: true },
].filter((i) => authEnabled || !i.account);

/** Moldura do sistema logado: menu lateral (abas embaixo no celular) que fica parado enquanto só o conteúdo troca com uma entrada suave. */
export function AppLayout({ path, children }: { path: string; children: ReactNode }) {
  useLang();
  const reduced = useReducedMotion();
  return (
    <div className="lp relative min-h-screen">
      <a href="#conteudo" className="sr-only z-50 rounded-full bg-accent px-4 py-2 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4">{t("Pular para o conteúdo")}</a>

      <aside aria-label={t("Menu lateral")} className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface/60 px-3 py-5 backdrop-blur-xl lg:flex">
        <a {...link("/start")} className="mb-6 flex items-center gap-2.5 rounded-xl px-3 py-1.5 font-semibold tracking-tight"><Logo size={32} />{t("ArchLab")}</a>
        <nav aria-label={t("Navegação principal")} className="grid gap-1">
          {ITEMS.map((i) => {
            const on = i.on(path);
            return (
              <a key={i.to} {...link(i.to)} aria-current={on ? "page" : undefined}
                className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200", on ? "text-text" : "text-text-2 hover:text-text")}>
                {on && <motion.span layoutId="side-pill" className="absolute inset-0 -z-10 rounded-xl bg-track" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }} />}
                {on && <motion.span layoutId="side-bar" className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }} />}
                <Icon name={i.icon} size={20} />{t(i.label)}
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 bg-bg/70 px-5 py-3.5 backdrop-blur-xl sm:px-8">
          <a {...link("/start")} className="inline-flex items-center gap-2 font-semibold tracking-tight lg:invisible"><Logo size={28} />{t("ArchLab")}</a>
          <span className="flex items-center gap-2"><LangToggle /><ThemeToggle /><AccountMenu /></span>
        </header>
        <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-6xl px-5 pb-28 pt-4 outline-none sm:px-8 lg:pb-16">
          <motion.div key={path} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
            {children}
          </motion.div>
        </main>
      </div>

      <BottomBar path={path} reduced={!!reduced} />
    </div>
  );
}

const PRIMARY = ["/start", "/start/aulas", "/start/estudo", "/start/livre"];

/** Barra de baixo do celular: as quatro abas principais e "Mais" com o resto (oito abas lado a lado cortavam os nomes). */
function BottomBar({ path, reduced }: { path: string; reduced: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", key); return () => document.removeEventListener("keydown", key);
  }, [open]);
  const main = ITEMS.filter((i) => PRIMARY.includes(i.to)), more = ITEMS.filter((i) => !PRIMARY.includes(i.to));
  const moreOn = more.some((i) => i.on(path));
  const tab = "relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors";
  const mark = (on: boolean) => on && <motion.span layoutId="tab-bar" className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-accent" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }} />;
  return (
    <>
      {open && <button type="button" aria-label={t("Fechar")} tabIndex={-1} className="fixed inset-0 z-40 cursor-default bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
      {open && (
        <div role="menu" aria-label={t("Mais seções")} className="fixed bottom-[calc(4.4rem+env(safe-area-inset-bottom,0px))] right-3 z-50 grid min-w-52 gap-1 rounded-2xl border border-line bg-surface p-2 shadow-2xl lg:hidden">
          {more.map((i) => (
            <a key={i.to} role="menuitem" {...link(i.to)} aria-current={i.on(path) ? "page" : undefined}
              className={cn("flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium", i.on(path) ? "bg-accent-soft text-accent" : "text-text hover:bg-track")}>
              <Icon name={i.icon} size={22} />{t(i.label)}
            </a>
          ))}
        </div>
      )}
      <nav aria-label={t("Navegação inferior")} className="fixed inset-x-0 bottom-0 z-40 grid border-t border-line bg-surface/90 backdrop-blur-xl lg:hidden" style={{ gridTemplateColumns: `repeat(${main.length + (more.length ? 1 : 0)}, minmax(0, 1fr))`, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {main.map((i) => {
          const on = i.on(path);
          return (
            <a key={i.to} {...link(i.to)} aria-current={on ? "page" : undefined} className={cn(tab, on ? "text-accent" : "text-text-2")}>
              {mark(on)}<Icon name={i.icon} size={22} /><span className="max-w-full truncate px-1">{t(("short" in i && i.short) || i.label)}</span>
            </a>
          );
        })}
        {more.length > 0 && (
          <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={cn(tab, moreOn || open ? "text-accent" : "text-text-2")}>
            {mark(moreOn)}<Icon name="more_horiz" size={22} /><span className="max-w-full truncate px-1">{t("Mais")}</span>
          </button>
        )}
      </nav>
    </>
  );
}
