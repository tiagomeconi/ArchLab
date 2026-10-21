/** Idiomas da interface. O português é o original (as chaves de tradução são os próprios textos em português); o inglês vem junto do código; os demais são carregados sob demanda. */
export type Lang = "pt" | "en" | "es" | "fr" | "de" | "it" | "ja" | "zh" | "ko" | "ru";
export interface LanguageInfo {
  code: Lang;
  /** nome no próprio idioma (é como a pessoa o reconhece na lista) */
  name: string;
  /** sigla curta mostrada ao lado da bandeira */
  short: string;
  /** código do país da bandeira (ISO 3166-1) */
  flag: string;
  /** BCP 47 para datas e números (Intl) */
  locale: string;
  /** valor do atributo lang do documento */
  html: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "pt", name: "Português", short: "PT", flag: "BR", locale: "pt-BR", html: "pt-BR" },
  { code: "en", name: "English", short: "EN", flag: "US", locale: "en-US", html: "en" },
  { code: "es", name: "Español", short: "ES", flag: "ES", locale: "es-ES", html: "es" },
  { code: "fr", name: "Français", short: "FR", flag: "FR", locale: "fr-FR", html: "fr" },
  { code: "de", name: "Deutsch", short: "DE", flag: "DE", locale: "de-DE", html: "de" },
  { code: "it", name: "Italiano", short: "IT", flag: "IT", locale: "it-IT", html: "it" },
  { code: "ja", name: "日本語", short: "JA", flag: "JP", locale: "ja-JP", html: "ja" },
  { code: "zh", name: "简体中文", short: "ZH", flag: "CN", locale: "zh-CN", html: "zh-CN" },
  { code: "ko", name: "한국어", short: "KO", flag: "KR", locale: "ko-KR", html: "ko" },
  { code: "ru", name: "Русский", short: "RU", flag: "RU", locale: "ru-RU", html: "ru" },
];
export const LANG_BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));
export const isLang = (v: unknown): v is Lang => typeof v === "string" && LANG_BY_CODE.has(v as Lang);

/** Escolhe o idioma a partir da lista de preferências do navegador (ex.: ["es-MX", "en"]); sem correspondência, inglês. */
export function pickLang(preferred: readonly string[] | undefined): Lang {
  for (const p of preferred ?? []) {
    const base = String(p).toLowerCase().split("-")[0]!;
    if (isLang(base)) return base;
  }
  return "en";
}
