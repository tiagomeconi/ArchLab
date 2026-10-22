import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "../ui";
import { t } from "../i18n";

/** Native modal: focus trap, Escape and return to the trigger are handled by the browser. */
export function ProfileDialog({ title, children, onClose, wide = false }: { wide?: boolean; title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); setReady(true); return () => { dialog?.close(); }; }, []);
  return <dialog ref={ref} aria-label={title} onClose={onClose} className={`profile-dialog rounded-2xl border border-line bg-surface p-0 text-text shadow-2xl ${wide ? "w-[calc(100vw-24px)] max-w-none h-[calc(100dvh-24px)] max-h-none overflow-hidden [&[open]]:flex [&[open]]:flex-col" : "w-[min(960px,calc(100vw-32px))] max-h-[90dvh] overflow-auto"}`}>
    <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-5 py-4"><h2 className="text-xl font-semibold">{title}</h2><button type="button" aria-label={t("Fechar")} onClick={() => ref.current?.close()} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-track"><Icon name="close" size={22} /></button></div>
    <div className={wide ? "min-h-0 flex-1" : "p-5 sm:p-6"}>{ready && children}</div>
  </dialog>;
}
