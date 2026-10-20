import { useEffect, useRef, useState } from "react";
import { authEnabled, avatarOf, signOut, useAuth } from "./auth";
import { initials } from "./account";
import { go, link } from "./nav";
import { Icon } from "./ui";
import { t } from "./i18n";

/** Foto da pessoa; sem foto (ou se ela falhar ao carregar), um círculo com as iniciais. */
export function Avatar({ name, email, src, size = 36 }: { name: string; email?: string; src?: string | null; size?: number }) {
  const [bad, setBad] = useState(false);
  useEffect(() => { setBad(false); }, [src]);
  if (src && !bad) return <img src={src} alt="" aria-hidden width={size} height={size} onError={() => setBad(true)} draggable={false} style={{ width: size, height: size, flex: "none", borderRadius: "50%", objectFit: "cover", display: "block" }} />;
  return (
    <span aria-hidden style={{ width: size, height: size, flex: "none", display: "grid", placeItems: "center", borderRadius: "50%", background: "var(--accent)", color: "var(--on-accent)", fontWeight: 600, fontSize: Math.round(size * 0.38), letterSpacing: ".02em" }}>{initials(name, email)}</span>
  );
}

/** Botão da conta no topo: avatar com menu (perfil e sair). Não aparece quando o Supabase não está configurado. */
export function AccountMenu({ onShortcuts, onTour }: { onShortcuts?: () => void; onTour?: () => void } = {}) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const down = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", key); document.addEventListener("mousedown", down);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("mousedown", down); };
  }, [open]);
  if (!authEnabled || auth.status !== "in" || !auth.user) return null;
  const email = auth.user.email ?? "";
  const name = String(auth.user.user_metadata?.name ?? "").trim();
  return (
    <div className="export-menu account-menu" ref={box}>
      <button className="acc-btn" aria-label={t("Conta")} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}><Avatar name={name} email={email} src={avatarOf(auth.user)} size={34} /></button>
      {open && (
        <div className="export-pop acc-pop" role="menu" aria-label={t("Conta")}>
          <div className="acc-head"><Avatar name={name} email={email} src={avatarOf(auth.user)} size={44} />
            <span><b>{name || t("Minha conta")}</b><small>{email}</small></span></div>
          <a role="menuitem" {...link("/perfil")} onClick={(e) => { link("/perfil").onClick(e); setOpen(false); }}>
            <Icon name="person" size={20} /><span><b>{t("Meu perfil")}</b><small>{t("Liga, conquistas, casos e atividade")}</small></span>
          </a>
          <a role="menuitem" {...link("/configuracoes")} onClick={(e) => { link("/configuracoes").onClick(e); setOpen(false); }}>
            <Icon name="settings" size={20} /><span><b>{t("Configurações")}</b><small>{t("Foto, dados, senha e privacidade")}</small></span>
          </a>
          {onTour && (
            <button role="menuitem" onClick={() => { setOpen(false); onTour(); }}>
              <Icon name="help" size={20} /><span><b>{t("Rever o tutorial")}</b><small>{t("Um passeio rápido pelo laboratório")}</small></span>
            </button>
          )}
          {onShortcuts && (
            <button role="menuitem" onClick={() => { setOpen(false); onShortcuts(); }}>
              <Icon name="keyboard" size={20} /><span><b>{t("Atalhos de teclado")}</b><small>{t("Pressione ? em qualquer lugar do laboratório")}</small></span>
            </button>
          )}
          <button role="menuitem" onClick={() => { setOpen(false); void signOut().then(() => go("/")); }}>
            <Icon name="logout" size={20} /><span><b>{t("Sair")}</b></span>
          </button>
        </div>
      )}
    </div>
  );
}
