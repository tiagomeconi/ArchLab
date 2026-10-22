import { useId, useMemo } from "react";
import { countries } from "country-flag-icons";
import { localeOf, t, useLang } from "../i18n";
export function countryName(code: string, locale = localeOf()) { try { return new Intl.DisplayNames([locale], { type: "region" }).of(code) || code; } catch { return code; } }
export function CountrySelect({ value, onChange, all = false, disabled = false }: { value: string; onChange: (code: string) => void; all?: boolean; disabled?: boolean }) {
  const lang = useLang();
  const id = useId();
  const options = useMemo(() => countries.filter((code) => /^[A-Z]{2}$/.test(code)).map((code) => ({ code, name: countryName(code, localeOf(lang)) })).sort((a, b) => a.name.localeCompare(b.name, localeOf(lang))), [lang]);
  return <div className="grid gap-2 text-sm font-medium"><label htmlFor={id}>{t("País")}</label><select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-text outline-none focus:border-accent"><option value="">{all ? t("Todos os países") : t("Escolha seu país")}</option>{options.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}</select></div>;
}
