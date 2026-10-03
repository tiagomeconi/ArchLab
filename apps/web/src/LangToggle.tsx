import { setLang, useLang } from "./i18n";

/** Alternador PT/EN. */
export function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  const next = lang === "pt" ? "en" : "pt";
  return (
    <button type="button" className={`lang-btn ${className}`} onClick={() => setLang(next)} lang={next}
      aria-label={lang === "pt" ? "Mudar idioma para inglês (English)" : "Switch language to Portuguese"} title={lang === "pt" ? "English" : "Português"}>
      <span className={lang === "pt" ? "on" : ""}>PT</span><span aria-hidden>/</span><span className={lang === "en" ? "on" : ""}>EN</span>
    </button>
  );
}
