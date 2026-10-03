import { LOGOS } from "./logos.generated";
import { useEffect, useState, type CSSProperties, type InputHTMLAttributes } from "react";

export const Icon = ({ name, size = 18 }: { name: string; size?: number }) => (
  <span className="msr" aria-hidden style={{ fontSize: size }}>{name}</span>
);
export const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");

/** Preferência de interface guardada no navegador (por visualizador). Falha de armazenamento nunca quebra a tela. */
export function usePref<T>(key: string, initial: T) {
  const full = `archlab:pref:${key}`;
  const [v, setV] = useState<T>(() => {
    try { const raw = localStorage.getItem(full); return raw === null ? initial : (JSON.parse(raw) as T); } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(full, JSON.stringify(v)); } catch { /* modo privado ou bloqueado */ } }, [full, v]);
  return [v, setV] as const;
}

/** Slider com trilho preenchido até o ponteiro (a parte "ligada" fica na cor de destaque). */
export function Range({ value, min, max, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "min" | "max" | "type"> & { value: number; min: number; max: number }) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return <input type="range" value={value} min={min} max={max} {...rest} style={{ "--p": `${pct}%` } as CSSProperties} />;
}

/** Logo do ArchLab (PNG com transparência em /logo.png). */
export const Logo = ({ size = 32, className = "", alt = "" }: { size?: number; className?: string; alt?: string }) => (
  <img src="/logo-96.png" srcSet="/logo-96.png 1x, /logo.png 2x" width={size} height={size} alt={alt} className={className} draggable={false} style={{ display: "block", objectFit: "contain" }} />
);

/** Campo de busca padrão do sistema: lupa centralizada, botão de limpar e foco com anel de destaque. */
export function SearchField({ value, onChange, placeholder, label, hint, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder: string; label: string; hint?: string; className?: string;
}) {
  return (
    <label className={`sf ${className}`}>
      <span className="sf-ico"><Icon name="search" size={20} /></span>
      <input type="text" inputMode="search" autoComplete="off" spellCheck={false} placeholder={placeholder} value={value} aria-label={label}
        onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape" && value) { e.stopPropagation(); onChange(""); } }} />
      {value
        ? <button type="button" className="sf-clear" aria-label="Limpar busca" onClick={() => onChange("")}><Icon name="close" size={16} /></button>
        : hint ? <kbd className="sf-kbd">{hint}</kbd> : null}
    </label>
  );
}

/** Só o glifo da marca, sem tile: altura fixa e largura proporcional (wordmarks são mais largos). Acompanha o tema (cor do texto). */
export function BrandMark({ id, name, color, height = 44 }: { id: string; name: string; color?: string; height?: number }) {
  // marcas só com wordmark ilegível em tamanho pequeno usam um ícone genérico na cor da marca
  if (id.startsWith("icon:")) return <span style={{ color, display: "inline-grid", height, placeItems: "center" }}><Icon name={id.slice(5)} size={height} /></span>;
  const l = LOGOS[id];
  if (!l) return <span className="text-lg font-semibold">{name}</span>;
  const w = Math.min(Math.round(height * 3.4), Math.round((height * l.w) / l.h));
  return <svg viewBox={`0 0 ${l.w} ${l.h}`} width={w} height={height} role="img" aria-label={name} style={{ color: "var(--text)", flex: "none" }} dangerouslySetInnerHTML={{ __html: l.body }} />;
}
