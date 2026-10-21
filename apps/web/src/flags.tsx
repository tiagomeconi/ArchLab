import { BR, CN, DE, ES, FR, IT, JP, KR, RU, US, type FlagComponent } from "country-flag-icons/react/3x2";

const FLAGS: Record<string, FlagComponent> = { BR, CN, DE, ES, FR, IT, JP, KR, RU, US };

/** Bandeira em SVG (os emojis de bandeira não aparecem no Windows). Decorativa: o nome do idioma vem escrito ao lado. */
export function Flag({ code, className = "" }: { code: string; className?: string }) {
  const F = FLAGS[code];
  return F ? <F className={`flag ${className}`} aria-hidden="true" focusable="false" /> : null;
}
