import { useMemo } from "react";
import { countries } from "country-flag-icons";
import { localeOf, t, useLang } from "../i18n";
import { Dropdown } from "./Dropdown";
export function countryName(code: string, locale = localeOf()) { try { return new Intl.DisplayNames([locale], { type: "region" }).of(code) || code; } catch { return code; } }
export function CountrySelect({ value, onChange, all = false, disabled = false }: { value: string; onChange: (code: string) => void; all?: boolean; disabled?: boolean }) {
  const lang = useLang();
  const placeholder = all ? t("Todos os países") : t("Escolha seu país");
  const options = useMemo(() => [
    { value: "", label: placeholder },
    ...countries.filter((code) => /^[A-Z]{2}$/.test(code)).map((code) => ({ value: code, label: countryName(code, localeOf(lang)) })).sort((a, b) => a.label.localeCompare(b.label, localeOf(lang))),
  ], [lang, placeholder]);
  return <Dropdown label={t("País")} value={value} onChange={onChange} options={options} placeholder={placeholder} searchable searchLabel={t("Buscar país")} disabled={disabled} />;
}
