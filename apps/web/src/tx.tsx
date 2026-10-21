import type { ReactNode } from "react";
import { t } from "./i18n";

/** Frase inteira traduzida de uma vez (a ordem das palavras muda de idioma para idioma): **negrito** e {espaços} preenchidos com elementos. */
export function tx(pt: string, slots: Record<string, ReactNode> = {}): ReactNode {
  const parts = t(pt).split(/(\*\*[^*]+\*\*|\{\w+\})/g).filter(Boolean);
  return <>{parts.map((p, i): ReactNode => {
    if (p.startsWith("**")) return <b key={i}>{p.slice(2, -2)}</b>;
    const m = /^\{(\w+)\}$/.exec(p);
    return m && m[1]! in slots ? <span key={i} style={{ display: "contents" }}>{slots[m[1]!]}</span> : p;
  })}</>;
}
