import { type ReactNode } from "react";
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
  { to: "/start/estudo", icon: "school", label: "Casos", on: (p: string) => p.startsWith("/start/estudo") },
  { to: "/start/trilhas", icon: "route", label: "Trilhas", on: (p: string) => p.startsWith("/start/trilhas") },
  { to: "/start/livre", icon: "draw", label: "Modo livre", on: (p: string) => p.startsWith("/start/livre") },
  { to: "/desenhos", icon: "folder_open", label: "Meus desenhos", on: (p: string) => p === "/desenhos" },
  { to: "/turmas", icon: "groups", label: "Turmas", on: (p: string) => p === "/turmas", account: true },
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

      <nav aria-label={t("Navegação inferior")} className="fixed inset-x-0 bottom-0 z-40 grid border-t border-line bg-surface/90 backdrop-blur-xl lg:hidden" style={{ gridTemplateColumns: `repeat(${ITEMS.length}, minmax(0, 1fr))`, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {ITEMS.map((i) => {
          const on = i.on(path);
          return (
            <a key={i.to} {...link(i.to)} aria-current={on ? "page" : undefined} className={cn("relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors", on ? "text-accent" : "text-text-2")}>
              {on && <motion.span layoutId="tab-bar" className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-accent" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }} />}
              <Icon name={i.icon} size={22} /><span className="max-w-full truncate px-1">{t(i.label)}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
